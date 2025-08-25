"""
Enhanced rate limiting middleware for CosmicHub API
Implements multi-tier rate limiting with IP and user-based limits
Part of SEC-006: Threat Model Mitigation (Batch 1)
"""

import hashlib
import os
import time
from collections import defaultdict
from typing import Any, Dict, List, Optional

from fastapi import HTTPException, Request, status

# Redis configuration with fallback
redis_client: Optional["redis.Redis"] = None
redis_available = False

try:
    import redis  # type: ignore
    redis_url = os.getenv("REDIS_URL", "redis://localhost:6379")
    redis_client = redis.Redis.from_url(redis_url, decode_responses=True)  # type: ignore[misc]
    redis_client.ping()  # type: ignore[misc]
    redis_available = True
except Exception:
    redis_client = None
    redis_available = False

# In-memory fallback
_rate_limit_store: Dict[str, List[float]] = defaultdict(list)


class EnhancedRateLimiter:
    """
    Multi-tier rate limiting with different limits for different endpoint types
    Implements sliding window algorithm with Redis backing
    """

    def __init__(self):
        # Rate limits per endpoint type (requests per minute)
        self.limits = {
            "auth": {"requests": 10, "window": 900},      # 10 requests per 15 minutes  # noqa: E501
            "heavy": {"requests": 20, "window": 3600},    # 20 requests per hour (calculations)  # noqa: E501
            "medium": {"requests": 100, "window": 3600},   # 100 requests per hour (API calls)  # noqa: E501
            "light": {"requests": 1000, "window": 3600},  # 1000 requests per hour (health checks)  # noqa: E501
        }

    def get_endpoint_category(self, path: str) -> str:
        """Categorize endpoint based on path for different rate limits"""
        if any(auth_path in path for auth_path in ["/auth", "/login", "/register", "/reset-password"]):  # noqa: E501
            return "auth"
        elif any(heavy_path in path for heavy_path in ["/calculate", "/synastry", "/transits"]):  # noqa: E501
            return "heavy"
        elif any(medium_path in path for medium_path in ["/api", "/charts", "/interpretations"]):  # noqa: E501
            return "medium"
        else:
            return "light"

    def get_rate_limit_key(self, request: Request, user_id: Optional[str] = None) -> str:  # noqa: E501
        """Create rate limiting key with IP and user context"""
        ip = self._get_client_ip(request)
  # noqa: E114, W293
        if user_id:
            # Hash user ID for privacy
            user_hash = hashlib.sha256(user_id.encode()).hexdigest()[:16]
            return f"rate_limit:user:{user_hash}:{ip}"
  # noqa: E114, W293
        return f"rate_limit:ip:{ip}"

    def _get_client_ip(self, request: Request) -> str:
        """Extract client IP considering proxy headers"""
        # Check for common proxy headers
        forwarded_for = request.headers.get("X-Forwarded-For")
        if forwarded_for:
            return forwarded_for.split(",")[0].strip()
  # noqa: E114, W293
        real_ip = request.headers.get("X-Real-IP")
        if real_ip:
            return real_ip
  # noqa: E114, W293
        # Fallback to direct connection
        return request.client.host if request.client else "unknown"

    async def check_rate_limit(self, request: Request, user_id: Optional[str] = None) -> None:  # noqa: E501
        """Check if request is within rate limits"""
        category = self.get_endpoint_category(request.url.path)
        limit_config = self.limits[category]
  # noqa: E114, W293
        key = self.get_rate_limit_key(request, user_id)
  # noqa: E114, W293
        if redis_available and redis_client:
            await self._redis_rate_limit(key, limit_config, category)
        else:
            await self._memory_rate_limit(key, limit_config, category)

    async def _redis_rate_limit(self, key: str, limit_config: Dict[str, int], category: str) -> None:  # noqa: E501
        """Redis-based rate limiting with sliding window"""
        if not redis_client:
            await self._memory_rate_limit(key, limit_config, category)
            return
  # noqa: E114, W293
        try:
            current_time = int(time.time())
            window_start = current_time - limit_config["window"]
  # noqa: E114, W293
            # Remove old entries
            redis_client.zremrangebyscore(key, "-inf", window_start)  # type: ignore  # noqa: E501
  # noqa: E114, W293
            # Count current requests
            current_count = int(redis_client.zcard(key))  # type: ignore
  # noqa: E114, W293
            if current_count >= limit_config["requests"]:
                remaining_time = redis_client.zrange(key, 0, 0, withscores=True)  # type: ignore  # noqa: E501
                reset_time = current_time + limit_config["window"]
                if remaining_time:
                    try:
                        reset_time = int(remaining_time[0][1]) + limit_config["window"]  # type: ignore  # noqa: E501
                    except (IndexError, ValueError, TypeError):
                        pass
  # noqa: E114, W293
                retry_after = max(reset_time - current_time, 1)
  # noqa: E114, W293
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail=f"Rate limit exceeded for {category} endpoints. Try again in {retry_after} seconds.",  # noqa: E501
                    headers={
                        "Retry-After": str(retry_after),
                        "X-RateLimit-Limit": str(limit_config["requests"]),
                        "X-RateLimit-Remaining": "0",
                        "X-RateLimit-Reset": str(reset_time),
                    },
                )
  # noqa: E114, W293
            # Add current request
            redis_client.zadd(key, {f"{current_time}:{hash(key)}": current_time})  # type: ignore  # noqa: E501
            redis_client.expire(key, limit_config["window"])  # type: ignore
  # noqa: E114, W293
        except Exception:
            # Fallback to memory-based limiting if Redis fails
            await self._memory_rate_limit(key, limit_config, category)

    async def _memory_rate_limit(self, key: str, limit_config: Dict[str, int], category: str) -> None:  # noqa: E501
        """In-memory rate limiting fallback"""
        current_time = time.time()
        window_start = current_time - limit_config["window"]
  # noqa: E114, W293
        # Clean old entries
        _rate_limit_store[key] = [
            timestamp for timestamp in _rate_limit_store[key]  # noqa: W291
            if timestamp > window_start
        ]
  # noqa: E114, W293
        if len(_rate_limit_store[key]) >= limit_config["requests"]:
            oldest_request = min(_rate_limit_store[key]) if _rate_limit_store[key] else current_time  # noqa: E501
            retry_after = int(oldest_request + limit_config["window"] - current_time)  # noqa: E501
            retry_after = max(retry_after, 1)
  # noqa: E114, W293
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Rate limit exceeded for {category} endpoints. Try again in {retry_after} seconds.",  # noqa: E501
                headers={
                    "Retry-After": str(retry_after),
                    "X-RateLimit-Limit": str(limit_config["requests"]),
                    "X-RateLimit-Remaining": "0",
                    "X-RateLimit-Reset": str(int(oldest_request + limit_config["window"])),  # noqa: E501
                },
            )
  # noqa: E114, W293
        # Add current request
        _rate_limit_store[key].append(current_time)

    def get_rate_limit_status(self, request: Request, user_id: Optional[str] = None) -> Dict[str, Any]:  # noqa: E501
        """Get current rate limit status for debugging/monitoring"""
        category = self.get_endpoint_category(request.url.path)
        limit_config = self.limits[category]
        key = self.get_rate_limit_key(request, user_id)
  # noqa: E114, W293
        if redis_available and redis_client:
            try:
                current_time = int(time.time())
                window_start = current_time - limit_config["window"]
  # noqa: E114, W293
                # Clean and count
                redis_client.zremrangebyscore(key, "-inf", window_start)  # type: ignore  # noqa: E501
                current_count = redis_client.zcard(key)  # type: ignore
  # noqa: E114, W293
                return {
                    "limit": limit_config["requests"],
                    "remaining": max(limit_config["requests"] - int(current_count), 0),  # type: ignore  # noqa: E501
                    "reset": current_time + limit_config["window"],
                    "category": category,
                }
            except Exception:
                pass
  # noqa: E114, W293
        # Memory fallback
        current_time = time.time()
        window_start = current_time - limit_config["window"]
  # noqa: E114, W293
        current_requests = [
            timestamp for timestamp in _rate_limit_store[key]  # noqa: W291
            if timestamp > window_start
        ]
  # noqa: E114, W293
        return {
            "limit": limit_config["requests"],
            "remaining": max(limit_config["requests"] - len(current_requests), 0),  # noqa: E501
            "reset": int(current_time + limit_config["window"]),
            "category": category,
        }


# Global rate limiter instance
rate_limiter = EnhancedRateLimiter()
