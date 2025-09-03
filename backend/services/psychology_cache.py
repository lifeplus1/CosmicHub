import redis
import json
import hashlib
import time
import logging
from typing import Dict, Any, Optional, Union
from datetime import datetime, timedelta
import os

logger = logging.getLogger(__name__)

class PsychologyCache:
    """Redis-based caching service for psychology analysis results."""
    
    def __init__(self):
        self.client: Optional[redis.Redis] = None
        self.default_ttl = 3600  # 1 hour default
        self.connected = False
        self.connect()
    
    def connect(self):
        """Establish Redis connection with error handling."""
        try:
            # Use environment variables for Redis configuration
            redis_url = os.getenv('REDIS_URL', 'redis://localhost:6379')
            
            self.client = redis.from_url(
                redis_url,
                decode_responses=True,
                retry_on_timeout=True,
                socket_connect_timeout=5,
                socket_timeout=5
            )
            
            # Test connection
            self.client.ping()
            self.connected = True
            logger.info("[PsychologyCache] Redis connected successfully")
            
        except Exception as error:
            logger.warning(f"[PsychologyCache] Redis connection failed: {error}")
            self.connected = False
            self.client = None
    
    def _generate_cache_key(self, prefix: str, data: Dict[str, Any]) -> str:
        """Generate consistent cache key from data."""
        # Sort keys for consistent hashing
        sorted_data = json.dumps(data, sort_keys=True, separators=(',', ':'))
        hash_object = hashlib.md5(sorted_data.encode())
        hash_hex = hash_object.hexdigest()
        return f"psychology:{prefix}:{hash_hex}"
    
    def get(self, prefix: str, key_data: Dict[str, Any]) -> Optional[Any]:
        """Retrieve cached data."""
        if not self.connected or not self.client:
            return None
        
        try:
            key = self._generate_cache_key(prefix, key_data)
            cached = self.client.get(key)
            
            if not cached:
                return None
            
            cache_data = json.loads(cached)
            
            # Check if cache is expired (additional safety check)
            now = time.time()
            age = now - cache_data['timestamp']
            max_age = self.default_ttl
            
            if age > max_age:
                # Remove expired cache
                self.client.delete(key)
                return None
            
            return cache_data['data']
            
        except Exception as error:
            logger.warning(f"[PsychologyCache] Cache get error: {error}")
            return None
    
    def set(self, prefix: str, key_data: Dict[str, Any], value: Any, ttl: Optional[int] = None) -> None:
        """Store data in cache."""
        if not self.connected or not self.client:
            return
        
        try:
            key = self._generate_cache_key(prefix, key_data)
            cache_ttl = ttl or self.default_ttl
            
            cache_data = {
                'data': value,
                'timestamp': time.time()
            }
            
            serialized = json.dumps(cache_data, default=str)
            
            self.client.setex(key, cache_ttl, serialized)
            
            logger.info(f"[PsychologyCache] Cached data for key: {key} (TTL: {cache_ttl}s)")
            
        except Exception as error:
            logger.warning(f"[PsychologyCache] Cache set error: {error}")
    
    def invalidate(self, prefix: str, key_data: Dict[str, Any]) -> None:
        """Remove specific cache entry."""
        if not self.connected or not self.client:
            return
        
        try:
            key = self._generate_cache_key(prefix, key_data)
            self.client.delete(key)
            logger.info(f"[PsychologyCache] Invalidated cache for key: {key}")
            
        except Exception as error:
            logger.warning(f"[PsychologyCache] Cache invalidate error: {error}")
    
    def invalidate_pattern(self, pattern: str) -> None:
        """Remove cache entries matching pattern."""
        if not self.connected or not self.client:
            return
        
        try:
            keys = self.client.keys(f"psychology:{pattern}:*")
            if keys:
                self.client.delete(*keys)
                logger.info(f"[PsychologyCache] Invalidated {len(keys)} cache keys matching pattern: {pattern}")
                
        except Exception as error:
            logger.warning(f"[PsychologyCache] Cache pattern invalidate error: {error}")
    
    def flush(self) -> None:
        """Remove all psychology cache entries."""
        if not self.connected or not self.client:
            return
        
        try:
            keys = self.client.keys('psychology:*')
            if keys:
                self.client.delete(*keys)
                logger.info(f"[PsychologyCache] Flushed {len(keys)} psychology cache keys")
                
        except Exception as error:
            logger.warning(f"[PsychologyCache] Cache flush error: {error}")
    
    def is_connected(self) -> bool:
        """Check if Redis is connected."""
        return self.connected
    
    def disconnect(self) -> None:
        """Close Redis connection."""
        if self.client:
            self.client.close()
            self.connected = False


# Singleton instance
psychology_cache = PsychologyCache()


class PsychologyCacheService:
    """High-level cache service for psychology analysis data."""
    
    @staticmethod
    def get_mbti_analysis(birth_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Get cached MBTI analysis."""
        return psychology_cache.get('mbti', birth_data)
    
    @staticmethod
    def set_mbti_analysis(birth_data: Dict[str, Any], analysis: Dict[str, Any], ttl: int = 3600) -> None:
        """Cache MBTI analysis."""
        psychology_cache.set('mbti', birth_data, analysis, ttl)
    
    @staticmethod
    def get_enneagram_analysis(birth_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Get cached Enneagram analysis."""
        return psychology_cache.get('enneagram', birth_data)
    
    @staticmethod
    def set_enneagram_analysis(birth_data: Dict[str, Any], analysis: Dict[str, Any], ttl: int = 3600) -> None:
        """Cache Enneagram analysis."""
        psychology_cache.set('enneagram', birth_data, analysis, ttl)
    
    @staticmethod
    def get_synthesis_analysis(birth_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Get cached synthesis analysis."""
        return psychology_cache.get('synthesis', birth_data)
    
    @staticmethod
    def set_synthesis_analysis(birth_data: Dict[str, Any], analysis: Dict[str, Any], ttl: int = 7200) -> None:
        """Cache synthesis analysis (longer TTL for complex analysis)."""
        psychology_cache.set('synthesis', birth_data, analysis, ttl)
    
    @staticmethod
    def get_complete_analysis(birth_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Get cached complete psychology analysis."""
        return psychology_cache.get('complete', birth_data)
    
    @staticmethod
    def set_complete_analysis(birth_data: Dict[str, Any], analysis: Dict[str, Any], ttl: int = 3600) -> None:
        """Cache complete psychology analysis."""
        psychology_cache.set('complete', birth_data, analysis, ttl)
    
    @staticmethod
    def invalidate_user_analysis(birth_data: Dict[str, Any]) -> None:
        """Invalidate all cached analysis for a user."""
        psychology_cache.invalidate('mbti', birth_data)
        psychology_cache.invalidate('enneagram', birth_data)
        psychology_cache.invalidate('synthesis', birth_data)
        psychology_cache.invalidate('complete', birth_data)
    
    @staticmethod
    def invalidate_all_mbti() -> None:
        """Invalidate all MBTI cache entries."""
        psychology_cache.invalidate_pattern('mbti')
    
    @staticmethod
    def invalidate_all_enneagram() -> None:
        """Invalidate all Enneagram cache entries."""
        psychology_cache.invalidate_pattern('enneagram')
    
    @staticmethod
    def invalidate_all_synthesis() -> None:
        """Invalidate all synthesis cache entries."""
        psychology_cache.invalidate_pattern('synthesis')
    
    @staticmethod
    def is_connected() -> bool:
        """Check if cache service is connected."""
        return psychology_cache.is_connected()
    
    @staticmethod
    def flush_all() -> None:
        """Flush all psychology cache entries."""
        psychology_cache.flush()
    
    @staticmethod
    def disconnect() -> None:
        """Disconnect cache service."""
        psychology_cache.disconnect()
