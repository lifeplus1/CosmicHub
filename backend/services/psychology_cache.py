"""
Psychology Cache Service following UNIFIED-TYPE-VALIDATION-STRATEGY.md

This module provides Redis-based caching for psychology analysis results
with strict type safety and error handling.
"""

from __future__ import annotations

import hashlib
import json
import logging
import os
import time
from datetime import datetime, timedelta
from typing import Any, Dict, Optional, Union, cast

try:
    import redis
    REDIS_AVAILABLE = True
except ImportError:
    REDIS_AVAILABLE = False
    redis = None  # type: ignore

logger = logging.getLogger(__name__)

# Type alias for cache data following best practices
CacheData = Union[None, bool, int, float, str, list[Any], dict[str, Any]]


class PsychologyCache:
    """
    Redis-based caching service for psychology analysis results.
    
    Provides type-safe caching with automatic TTL management and
    graceful fallback when Redis is unavailable.
    """
    
    def __init__(self) -> None:
        """Initialize cache with connection configuration."""
        self.client: Any = None  # Redis client when available
        self.default_ttl: int = 3600  # 1 hour default
        self.connected: bool = False
        self.connect()
    
    def connect(self) -> None:
        """
        Establish Redis connection with error handling.
        
        Uses environment variables for configuration with sensible defaults.
        """
        if not REDIS_AVAILABLE:
            logger.warning("[PsychologyCache] Redis not available - using fallback mode")
            return
            
        try:
            # Use environment variables for Redis configuration
            redis_url = os.getenv('REDIS_URL', 'redis://localhost:6379')
            
            self.client = redis.from_url(  # type: ignore
                redis_url,
                decode_responses=True,
                retry_on_timeout=True,
                socket_connect_timeout=5,
                socket_timeout=5
            )
            
            # Test connection
            if self.client:
                self.client.ping()
            self.connected = True
            logger.info("[PsychologyCache] Redis connected successfully")
            
        except Exception as error:
            logger.warning(f"[PsychologyCache] Redis connection failed: {error}")
            self.connected = False
            self.client = None
    
    def _generate_cache_key(self, prefix: str, data: Dict[str, CacheData]) -> str:
        """
        Generate consistent cache key from data.
        
        Args:
            prefix: Cache prefix for categorization
            data: Data to hash for key generation
            
        Returns:
            Consistent cache key string
        """
        # Sort keys for consistent hashing
        sorted_data = json.dumps(data, sort_keys=True, separators=(',', ':'))
        hash_object = hashlib.md5(sorted_data.encode())
        hash_hex = hash_object.hexdigest()
        return f"psychology:{prefix}:{hash_hex}"
    
    def get(self, prefix: str, key_data: Dict[str, CacheData]) -> Optional[Dict[str, Any]]:
        """
        Retrieve cached data with type safety.
        
        Args:
            prefix: Cache category prefix
            key_data: Data to generate cache key
            
        Returns:
            Cached data if found and valid, None otherwise
        """
        if not self.connected or not self.client:
            return None
        
        try:
            key = self._generate_cache_key(prefix, key_data)
            cached = self.client.get(key)
            
            if not cached:
                return None
            
            # Ensure cached data is a string for JSON parsing
            if isinstance(cached, bytes):
                cached_str = cached.decode('utf-8')
            elif isinstance(cached, str):
                cached_str = cached
            else:
                logger.warning(f"[PsychologyCache] Unexpected cache data type: {type(cached)}")
                return None
            
            cache_data = json.loads(cached_str)
            
            # Check if cache is expired (additional safety check)
            now = time.time()
            age = now - cache_data['timestamp']
            max_age = self.default_ttl
            
            if age > max_age:
                # Remove expired cache
                self.client.delete(key)
                return None
            
            # Type-safe return of cached data
            return cast(Dict[str, Any], cache_data['data'])
            
        except Exception as error:
            logger.warning(f"[PsychologyCache] Cache get error: {error}")
            return None
    
    def set(
        self, 
        prefix: str, 
        key_data: Dict[str, CacheData], 
        value: Dict[str, Any], 
        ttl: Optional[int] = None
    ) -> None:
        """
        Store data in cache with automatic expiration.
        
        Args:
            prefix: Cache category prefix
            key_data: Data to generate cache key
            value: Data to cache
            ttl: Time to live in seconds (uses default if None)
        """
        if not self.connected or not self.client:
            return
        
        try:
            key = self._generate_cache_key(prefix, key_data)
            cache_ttl = ttl or self.default_ttl
            
            cache_data = {
                'data': value,
                'timestamp': time.time(),
                'prefix': prefix,
                'ttl': cache_ttl
            }
            
            serialized = json.dumps(cache_data, default=str)
            
            self.client.setex(key, cache_ttl, serialized)
            
            logger.info(f"[PsychologyCache] Cached data for key: {key} (TTL: {cache_ttl}s)")
            
        except Exception as error:
            logger.warning(f"[PsychologyCache] Cache set error: {error}")
    
    def invalidate(self, prefix: str, key_data: Dict[str, CacheData]) -> None:
        """
        Remove specific cache entry.
        
        Args:
            prefix: Cache category prefix
            key_data: Data to generate cache key for removal
        """
        if not self.connected or not self.client:
            return
        
        try:
            key = self._generate_cache_key(prefix, key_data)
            self.client.delete(key)
            logger.info(f"[PsychologyCache] Invalidated cache for key: {key}")
            
        except Exception as error:
            logger.warning(f"[PsychologyCache] Cache invalidate error: {error}")
    
    def invalidate_pattern(self, pattern: str) -> None:
        """
        Remove cache entries matching pattern.
        
        Args:
            pattern: Pattern to match for bulk deletion
        """
        if not self.connected or not self.client:
            return
        
        try:
            keys = self.client.keys(f"psychology:{pattern}:*")
            if keys and isinstance(keys, list):
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
            if keys and isinstance(keys, list):
                self.client.delete(*keys)
                logger.info(f"[PsychologyCache] Flushed {len(keys)} psychology cache keys")
                
        except Exception as error:
            logger.warning(f"[PsychologyCache] Cache flush error: {error}")
    
    def is_connected(self) -> bool:
        """Check if Redis is connected."""
        return self.connected and REDIS_AVAILABLE
    
    def disconnect(self) -> None:
        """Close Redis connection gracefully."""
        if self.client:
            try:
                self.client.close()
            except Exception as error:
                logger.warning(f"[PsychologyCache] Error closing Redis connection: {error}")
            finally:
                self.connected = False
                logger.info("[PsychologyCache] Redis disconnected")


# Singleton instance
psychology_cache = PsychologyCache()


class PsychologyCacheService:
    """
    High-level cache service for psychology analysis data.
    
    Provides typed methods for specific psychology analysis types
    following the service pattern.
    """
    
    @staticmethod
    def get_mbti_analysis(birth_data: Dict[str, CacheData]) -> Optional[Dict[str, Any]]:
        """
        Get cached MBTI analysis.
        
        Args:
            birth_data: Birth data for cache key generation
            
        Returns:
            Cached MBTI analysis if found
        """
        return psychology_cache.get('mbti', birth_data)
    
    @staticmethod
    def set_mbti_analysis(
        birth_data: Dict[str, CacheData], 
        analysis: Dict[str, Any], 
        ttl: int = 3600
    ) -> None:
        """
        Cache MBTI analysis.
        
        Args:
            birth_data: Birth data for cache key generation
            analysis: MBTI analysis data
            ttl: Time to live in seconds
        """
        psychology_cache.set('mbti', birth_data, analysis, ttl)
    
    @staticmethod
    def get_enneagram_analysis(birth_data: Dict[str, CacheData]) -> Optional[Dict[str, Any]]:
        """
        Get cached Enneagram analysis.
        
        Args:
            birth_data: Birth data for cache key generation
            
        Returns:
            Cached Enneagram analysis if found
        """
        return psychology_cache.get('enneagram', birth_data)
    
    @staticmethod
    def set_enneagram_analysis(
        birth_data: Dict[str, CacheData], 
        analysis: Dict[str, Any], 
        ttl: int = 3600
    ) -> None:
        """
        Cache Enneagram analysis.
        
        Args:
            birth_data: Birth data for cache key generation
            analysis: Enneagram analysis data
            ttl: Time to live in seconds
        """
        psychology_cache.set('enneagram', birth_data, analysis, ttl)
    
    @staticmethod
    def get_synthesis_analysis(birth_data: Dict[str, CacheData]) -> Optional[Dict[str, Any]]:
        """
        Get cached synthesis analysis.
        
        Args:
            birth_data: Birth data for cache key generation
            
        Returns:
            Cached synthesis analysis if found
        """
        return psychology_cache.get('synthesis', birth_data)
    
    @staticmethod
    def set_synthesis_analysis(
        birth_data: Dict[str, CacheData], 
        analysis: Dict[str, Any], 
        ttl: int = 7200
    ) -> None:
        """
        Cache synthesis analysis with longer TTL for complex analysis.
        
        Args:
            birth_data: Birth data for cache key generation
            analysis: Synthesis analysis data
            ttl: Time to live in seconds (default 2 hours for complex analysis)
        """
        psychology_cache.set('synthesis', birth_data, analysis, ttl)
    
    @staticmethod
    def get_complete_analysis(birth_data: Dict[str, CacheData]) -> Optional[Dict[str, Any]]:
        """
        Get cached complete analysis.
        
        Args:
            birth_data: Birth data for cache key generation
            
        Returns:
            Cached complete analysis if found
        """
        return psychology_cache.get('complete', birth_data)
    
    @staticmethod
    def set_complete_analysis(
        birth_data: Dict[str, CacheData], 
        analysis: Dict[str, Any], 
        ttl: int = 3600
    ) -> None:
        """
        Cache complete psychology analysis.
        
        Args:
            birth_data: Birth data for cache key generation
            analysis: Complete analysis data
            ttl: Time to live in seconds
        """
        psychology_cache.set('complete', birth_data, analysis, ttl)
    
    @staticmethod
    def invalidate_user_analysis(birth_data: Dict[str, CacheData]) -> None:
        """
        Invalidate all cached analysis for a user.
        
        Args:
            birth_data: Birth data for cache key generation
        """
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


# Export public interface
__all__ = ["PsychologyCacheService", "PsychologyCache", "CacheData"]
