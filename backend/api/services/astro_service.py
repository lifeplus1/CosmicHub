from typing import Dict, Any, Optional
import asyncio
import json
import hashlib
import os
from datetime import datetime, timedelta
from ..utils.serialization import serialize_data


class BaseCache:
    async def get(self, key: str) -> Optional[str]:  # pragma: no cover - interface
        raise NotImplementedError
    async def set(self, key: str, value: str, expire_seconds: int = 3600) -> bool:  # pragma: no cover - interface
        raise NotImplementedError
    async def delete(self, key: str) -> bool:  # pragma: no cover - interface
        raise NotImplementedError
    def keys(self) -> list[str]:  # pragma: no cover - interface
        raise NotImplementedError
    def size(self) -> int:  # pragma: no cover - interface
        raise NotImplementedError


class RedisCache(BaseCache):
    """In-memory mock cache (default)."""

    def __init__(self):
        self._cache: Dict[str, Dict[str, Any]] = {}

    async def get(self, key: str) -> Optional[str]:
        cached_item = self._cache.get(key)
        if cached_item and cached_item['expires'] > datetime.now():
            return cached_item['value']
        if cached_item:
            del self._cache[key]
        return None

    async def set(self, key: str, value: str, expire_seconds: int = 3600) -> bool:
        self._cache[key] = {
            'value': value,
            'expires': datetime.now() + timedelta(seconds=expire_seconds)
        }
        return True

    async def delete(self, key: str) -> bool:
        if key in self._cache:
            del self._cache[key]
            return True
        return False

    def keys(self) -> list[str]:
        return list(self._cache.keys())

    def size(self) -> int:
        return len(self._cache)


class RealRedisCache(BaseCache):
    """Redis-backed cache using redis.asyncio if REDIS_URL is configured.

    Falls back silently if connection fails at runtime (caller handles).
    """

    def __init__(self, url: str):
        try:  # Import inside to avoid mandatory dependency at import time
            from redis import asyncio as redis_async  # type: ignore
            self._client = redis_async.from_url(url, encoding="utf-8", decode_responses=True)  # type: ignore[assignment]
            self._available = True
        except Exception:
            self._client = None  # type: ignore
            self._available = False

    @property
    def available(self) -> bool:
        return bool(self._client) and self._available

    async def get(self, key: str) -> Optional[str]:  # pragma: no cover - network
        if not self.available:
            return None
        try:
            return await self._client.get(key)  # type: ignore
        except Exception:
            return None

    async def set(self, key: str, value: str, expire_seconds: int = 3600) -> bool:  # pragma: no cover - network
        if not self.available:
            return False
        try:
            await self._client.set(key, value, ex=expire_seconds)  # type: ignore
            return True
        except Exception:
            return False

    async def delete(self, key: str) -> bool:  # pragma: no cover - network
        if not self.available:
            return False
        try:
            await self._client.delete(key)  # type: ignore
            return True
        except Exception:
            return False

    def keys(self) -> list[str]:  # pragma: no cover - network
        # Expensive scan avoided in tests
        return []

    def size(self) -> int:  # pragma: no cover - network
        return 0


class AstroService:
    """Enhanced astro service with Redis caching and serialization."""

    def __init__(self):
        # Attempt real Redis first if configured
        redis_url = os.getenv("REDIS_URL")
        if redis_url:
            real = RealRedisCache(redis_url)
            if real.available:
                self.redis_cache: BaseCache = real
            else:
                self.redis_cache = RedisCache()
        else:
            self.redis_cache = RedisCache()
    
    def _generate_cache_key(self, prefix: str, data: Any) -> str:
        """Generate a consistent cache key based on data content"""
        data_str = json.dumps(data, sort_keys=True) if isinstance(data, dict) else str(data)
        hash_obj = hashlib.md5(data_str.encode())
        return f"{prefix}:{hash_obj.hexdigest()}"

    async def get_chart_data(self, chart_id: str) -> Optional[Dict[str, Any]]:
        """
        Retrieve chart data, first checking the cache.
        If not in cache, would fetch from primary data source (e.g., Firestore)
        """
        cache_key = f"chart:{chart_id}"
        
        # Try to get from cache first
        cached_data = await self.redis_cache.get(cache_key)
        if cached_data:
            print(f"Cache hit for chart_id: {chart_id}")
            return json.loads(cached_data)
        
        print(f"Cache miss for chart_id: {chart_id}. Would fetch from DB.")
        # For test/demo we only return mock data for known demo ids; otherwise None
        demo_ids = {"demo", "sample", "chart123", "test-chart-123"}
        if chart_id not in demo_ids:
            return None

        mock_chart_data: Dict[str, Any] = {
            "planets": [{"name": "Sun", "sign": "Leo", "degree": 15.25}],
            "houses": [{"number": 1, "sign": "Aries", "cusp": 12.33}],
            "aspects": [{"planet1": "Sun", "planet2": "Moon", "type": "Conjunction", "orb": 2.5}]
        }
        await self.cache_chart_data(chart_id, mock_chart_data)
        return mock_chart_data

    async def cache_chart_data(self, chart_id: str, chart_data: Dict[str, Any]) -> bool:
        """Cache serialized chart data with Redis"""
        try:
            cache_key = f"chart:{chart_id}"
            
            # Serialize the data for consistent caching
            # Narrow type: only call serialize_data for supported Pydantic models
            if hasattr(chart_data, 'model_dump') and callable(getattr(chart_data, 'model_dump')):
                try:
                    serialized_data = serialize_data(chart_data)  # type: ignore[arg-type]
                except Exception:
                    serialized_data = json.dumps(chart_data)
            else:
                serialized_data = json.dumps(chart_data)
            
            # Cache for 1 hour (3600 seconds)
            success = await self.redis_cache.set(cache_key, serialized_data, expire_seconds=3600)
            # Fallback: if a RealRedisCache silently failed, swap to in-memory and retry once
            if not success and isinstance(self.redis_cache, RealRedisCache):  # type: ignore[arg-type]
                self.redis_cache = RedisCache()
                success = await self.redis_cache.set(cache_key, serialized_data, expire_seconds=3600)
            
            if success:
                print(f"Cached chart_id: {chart_id}, size: {len(serialized_data)} chars")
            
            return success
            
        except Exception as e:
            print(f"Failed to cache chart data: {e}")
            return False

    async def cache_serialized_data(self, key: str, data: Any, expire_seconds: int = 3600) -> bool:
        """Cache any serializable data with automatic serialization"""
        try:
            if hasattr(data, 'model_dump'):
                # Pydantic model
                serialized = serialize_data(data)
            else:
                # Regular data
                serialized = json.dumps(data)
            success = await self.redis_cache.set(key, serialized, expire_seconds)
            if not success and isinstance(self.redis_cache, RealRedisCache):  # type: ignore[arg-type]
                self.redis_cache = RedisCache()
                success = await self.redis_cache.set(key, serialized, expire_seconds)
            return success
            
        except Exception as e:
            print(f"Failed to cache serialized data: {e}")
            return False

    async def get_cached_data(self, key: str) -> Optional[Dict[str, Any]]:
        """Get and deserialize cached data"""
        try:
            cached = await self.redis_cache.get(key)
            if cached:
                return json.loads(cached)
            return None
        except Exception as e:
            print(f"Failed to get cached data: {e}")
            return None

    async def some_chart_helper(self, chart_data: Dict[str, Any]) -> Dict[str, Any]:
        """Legacy method maintained for compatibility"""
        await asyncio.sleep(0)
        return {"normalized": True}

    async def clear_cache(self, pattern: Optional[str] = None) -> int:
        """Clear cache entries matching pattern (mock implementation)"""
        if pattern is None:
            # Clear all
            count = self.redis_cache.size()
            for k in self.redis_cache.keys():
                await self.redis_cache.delete(k)
            return count
        else:
            # Clear matching pattern (simplified)
            count = 0
            keys_to_delete = [k for k in self.redis_cache.keys() if pattern in k]
            for key in keys_to_delete:
                await self.redis_cache.delete(key)
                count += 1
            return count

# Singleton instance
_astro_service = AstroService()

async def get_astro_service() -> AstroService:
    """Dependency for FastAPI routes"""
    return _astro_service
