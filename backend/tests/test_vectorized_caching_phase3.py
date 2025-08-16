"""
Test suite for Phase 3 Intelligent Caching System.
"""

import pytest
import numpy as np
import tempfile
import shutil
import time
from pathlib import Path

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from utils.vectorized_caching import (
    ChartDataHasher, InMemoryCache, PersistentCache, TieredCacheManager,
    cached_calculation, get_global_cache_manager, CacheKey, CacheStats
)

class TestChartDataHasher:
    """Test chart data hashing functionality."""
    
    def test_consistent_chart_hashing(self):
        """Test that identical chart data produces identical hashes."""
        chart1 = {'Sun': 0.0, 'Moon': 90.0, 'Mercury': 180.0}
        chart2 = {'Sun': 0.0, 'Moon': 90.0, 'Mercury': 180.0}
        
        hash1 = ChartDataHasher.hash_chart(chart1)
        hash2 = ChartDataHasher.hash_chart(chart2)
        
        assert hash1 == hash2
        assert isinstance(hash1, str)
        assert len(hash1) == 16  # MD5 truncated to 16 chars
    
    def test_different_charts_different_hashes(self):
        """Test that different chart data produces different hashes."""
        chart1 = {'Sun': 0.0, 'Moon': 90.0, 'Mercury': 180.0}
        chart2 = {'Sun': 1.0, 'Moon': 90.0, 'Mercury': 180.0}  # Different Sun position
        
        hash1 = ChartDataHasher.hash_chart(chart1)
        hash2 = ChartDataHasher.hash_chart(chart2)
        
        assert hash1 != hash2
    
    def test_order_independence(self):
        """Test that key order doesn't affect hash."""
        chart1 = {'Sun': 0.0, 'Moon': 90.0, 'Mercury': 180.0}
        chart2 = {'Mercury': 180.0, 'Sun': 0.0, 'Moon': 90.0}  # Different order
        
        hash1 = ChartDataHasher.hash_chart(chart1)
        hash2 = ChartDataHasher.hash_chart(chart2)
        
        assert hash1 == hash2
    
    def test_parameter_hashing(self):
        """Test parameter hashing with various data types."""
        params1 = {'orb': 8.0, 'aspects': ['conjunction', 'opposition'], 'exact': True}
        params2 = {'orb': 8.0, 'aspects': ['conjunction', 'opposition'], 'exact': True}
        
        hash1 = ChartDataHasher.hash_parameters(**params1)
        hash2 = ChartDataHasher.hash_parameters(**params2)
        
        assert hash1 == hash2
        assert isinstance(hash1, str)
        assert len(hash1) == 16
    
    def test_numpy_array_parameter_hashing(self):
        """Test hashing with numpy arrays in parameters."""
        array1 = np.array([1, 2, 3, 4])
        array2 = np.array([1, 2, 3, 4])
        
        hash1 = ChartDataHasher.hash_parameters(data=array1)
        hash2 = ChartDataHasher.hash_parameters(data=array2)
        
        assert hash1 == hash2

class TestInMemoryCache:
    """Test in-memory caching functionality."""
    
    def setup_method(self):
        """Set up test cache."""
        self.cache = InMemoryCache(max_size=5, max_memory_mb=1.0)
    
    def test_basic_cache_operations(self):
        """Test basic put and get operations."""
        # Test miss
        result = self.cache.get('test_key')
        assert result is None
        
        # Test put and hit
        self.cache.put('test_key', 'test_value')
        result = self.cache.get('test_key')
        assert result == 'test_value'
    
    def test_cache_stats(self):
        """Test cache statistics tracking."""
        # Initial stats
        stats = self.cache.get_stats()
        assert stats['hits'] == 0
        assert stats['misses'] == 0
        
        # Generate some hits and misses
        self.cache.get('nonexistent')  # Miss
        self.cache.put('key1', 'value1')
        self.cache.get('key1')  # Hit
        self.cache.get('nonexistent2')  # Miss
        
        stats = self.cache.get_stats()
        assert stats['hits'] == 1
        assert stats['misses'] == 2
        assert stats['hit_rate'] == 33.33333333333333  # 1/3 * 100
    
    def test_lru_eviction_by_size(self):
        """Test LRU eviction when size limit is exceeded."""
        # Fill cache to capacity
        for i in range(5):
            self.cache.put(f'key{i}', f'value{i}')
        
        assert len(self.cache.cache) == 5
        
        # Add one more item to trigger eviction
        self.cache.put('key5', 'value5')
        
        # Should still be at capacity
        assert len(self.cache.cache) == 5
        
        # First item should be evicted (LRU)
        assert self.cache.get('key0') is None
        assert self.cache.get('key5') == 'value5'  # New item should be present
    
    def test_access_time_updates(self):
        """Test that access updates LRU ordering."""
        # Add items
        self.cache.put('key1', 'value1')
        self.cache.put('key2', 'value2')
        self.cache.put('key3', 'value3')
        
        # Access key1 to make it more recently used
        self.cache.get('key1')
        
        # Fill to capacity
        self.cache.put('key4', 'value4')
        self.cache.put('key5', 'value5')
        
        # Add one more to trigger eviction
        self.cache.put('key6', 'value6')
        
        # key1 should still be present (was accessed recently)
        assert self.cache.get('key1') == 'value1'
        # key2 should be evicted (least recently used)
        assert self.cache.get('key2') is None
    
    def test_cache_clear(self):
        """Test cache clearing."""
        self.cache.put('key1', 'value1')
        self.cache.put('key2', 'value2')
        
        assert len(self.cache.cache) == 2
        
        self.cache.clear()
        
        assert len(self.cache.cache) == 0
        assert self.cache.get('key1') is None
        
        # Stats should be reset
        stats = self.cache.get_stats()
        assert stats['hits'] == 0
        assert stats['misses'] == 0

class TestPersistentCache:
    """Test persistent disk-based caching."""
    
    def setup_method(self):
        """Set up test cache with temporary directory."""
        self.temp_dir = tempfile.mkdtemp()
        self.cache = PersistentCache(self.temp_dir, max_age_hours=0.1)  # Short expiry for testing
    
    def teardown_method(self):
        """Clean up temporary directory."""
        shutil.rmtree(self.temp_dir, ignore_errors=True)
    
    def test_persistent_storage(self):
        """Test basic persistent storage and retrieval."""
        # Test miss
        result = self.cache.get('test_key')
        assert result is None
        
        # Test put and get
        test_data = {'test': 'data', 'number': 42}
        self.cache.put('test_key', test_data)
        result = self.cache.get('test_key')
        assert result == test_data
    
    def test_file_creation(self):
        """Test that cache files are created."""
        self.cache.put('test_key', 'test_value')
        
        # Check that file was created
        cache_files = list(Path(self.temp_dir).glob("*.cache"))
        assert len(cache_files) == 1
    
    def test_cache_expiration(self):
        """Test that expired cache entries are not returned."""
        # Put data
        self.cache.put('test_key', 'test_value')
        
        # Should be retrievable immediately
        result = self.cache.get('test_key')
        assert result == 'test_value'
        
        # Wait for expiration (longer than max_age_hours)
        time.sleep(0.4)  # 0.4 seconds > 0.1 hours
        
        # Should now be expired
        result = self.cache.get('test_key')
        assert result is None
    
    def test_clear_expired(self):
        """Test clearing of expired cache files."""
        # Create some cache files
        self.cache.put('key1', 'value1')
        self.cache.put('key2', 'value2')
        
        assert len(list(Path(self.temp_dir).glob("*.cache"))) == 2
        
        # Wait for expiration
        time.sleep(0.4)
        
        # Clear expired
        self.cache.clear_expired()
        
        # Files should be removed
        assert len(list(Path(self.temp_dir).glob("*.cache"))) == 0

class TestTieredCacheManager:
    """Test the tiered cache manager."""
    
    def setup_method(self):
        """Set up test cache manager."""
        self.temp_dir = tempfile.mkdtemp()
        self.cache_manager = TieredCacheManager(
            memory_cache_size=5,
            memory_limit_mb=1.0,
            persistent_cache_dir=self.temp_dir,
            persistent_max_age_hours=1.0
        )
    
    def teardown_method(self):
        """Clean up temporary directory."""
        shutil.rmtree(self.temp_dir, ignore_errors=True)
    
    def test_memory_cache_priority(self):
        """Test that memory cache is checked first."""
        chart_data = {'Sun': 0.0, 'Moon': 90.0}
        
        # Put in cache
        self.cache_manager.put('test_value', 'aspect_calculation', chart_data=chart_data, orb=8.0)
        
        # Should hit memory cache
        result = self.cache_manager.get('aspect_calculation', chart_data=chart_data, orb=8.0)
        assert result == 'test_value'
        
        # Memory cache should have recorded hit
        stats = self.cache_manager.get_stats()
        assert stats['memory_cache']['hits'] == 1
    
    def test_persistent_cache_fallback(self):
        """Test fallback to persistent cache when memory cache misses."""
        chart_data = {'Sun': 0.0, 'Moon': 90.0}
        
        # Put directly in persistent cache
        if self.cache_manager.persistent_cache:
            key = self.cache_manager._create_cache_key('aspect_calculation', chart_data=chart_data, orb=8.0)
            self.cache_manager.persistent_cache.put(key, 'persistent_value')
        
        # Should find in persistent cache and promote to memory
        result = self.cache_manager.get('aspect_calculation', chart_data=chart_data, orb=8.0)
        assert result == 'persistent_value'
        
        # Second access should hit memory cache
        result2 = self.cache_manager.get('aspect_calculation', chart_data=chart_data, orb=8.0)
        assert result2 == 'persistent_value'
        
        # Memory cache should now have a hit
        stats = self.cache_manager.get_stats()
        assert stats['memory_cache']['hits'] >= 1
    
    def test_cache_key_generation(self):
        """Test consistent cache key generation."""
        chart1 = {'Sun': 0.0, 'Moon': 90.0}
        chart2 = {'Sun': 0.0, 'Moon': 90.0}  # Same data
        
        key1 = self.cache_manager._create_cache_key('test_calc', chart_data=chart1, orb=8.0)
        key2 = self.cache_manager._create_cache_key('test_calc', chart_data=chart2, orb=8.0)
        
        assert key1 == key2
    
    def test_different_parameters_different_keys(self):
        """Test that different parameters create different cache keys."""
        chart_data = {'Sun': 0.0, 'Moon': 90.0}
        
        key1 = self.cache_manager._create_cache_key('test_calc', chart_data=chart_data, orb=8.0)
        key2 = self.cache_manager._create_cache_key('test_calc', chart_data=chart_data, orb=10.0)
        
        assert key1 != key2

class TestCachingDecorator:
    """Test the caching decorator functionality."""
    
    def setup_method(self):
        """Set up test cache manager and decorated function."""
        self.temp_dir = tempfile.mkdtemp()
        self.cache_manager = TieredCacheManager(
            memory_cache_size=10,
            persistent_cache_dir=self.temp_dir,
            enable_persistent=False  # Disable for simpler testing
        )
        
        self.call_count = 0
        
        @cached_calculation(self.cache_manager, 'test_calculation')
        def test_function(chart1, orb=8.0):
            self.call_count += 1
            return f"result_for_{chart1['Sun']}_{orb}"
        
        self.test_function = test_function
    
    def teardown_method(self):
        """Clean up temporary directory."""
        shutil.rmtree(self.temp_dir, ignore_errors=True)
    
    def test_decorator_caching(self):
        """Test that decorator properly caches function results."""
        chart = {'Sun': 0.0, 'Moon': 90.0}
        
        # First call should execute function
        result1 = self.test_function(chart, orb=8.0)
        assert self.call_count == 1
        assert result1 == "result_for_0.0_8.0"
        
        # Second call with same parameters should use cache
        result2 = self.test_function(chart, orb=8.0)
        assert self.call_count == 1  # Should not increment
        assert result2 == result1
    
    def test_decorator_different_parameters(self):
        """Test that different parameters bypass cache."""
        chart = {'Sun': 0.0, 'Moon': 90.0}
        
        # First call
        result1 = self.test_function(chart, orb=8.0)
        assert self.call_count == 1
        
        # Different orb should not use cache
        result2 = self.test_function(chart, orb=10.0)
        assert self.call_count == 2  # Should increment
        assert result2 != result1

class TestIntegrationWithVectorizedCalculations:
    """Test integration of caching with vectorized calculations."""
    
    def test_aspect_calculation_caching_simulation(self):
        """Simulate caching of aspect calculations."""
        cache_manager = TieredCacheManager(enable_persistent=False)
        
        # Simulate aspect calculation data
        chart1 = {
            'Sun': 0.0, 'Moon': 90.0, 'Mercury': 180.0, 'Venus': 270.0,
            'Mars': 45.0, 'Jupiter': 135.0, 'Saturn': 225.0, 
            'Uranus': 315.0, 'Neptune': 60.0, 'Pluto': 240.0
        }
        
        chart2 = {
            'Sun': 5.0, 'Moon': 95.0, 'Mercury': 185.0, 'Venus': 275.0,
            'Mars': 50.0, 'Jupiter': 140.0, 'Saturn': 230.0, 
            'Uranus': 320.0, 'Neptune': 65.0, 'Pluto': 245.0
        }
        
        # Simulate aspect matrix (would come from vectorized calculation)
        aspect_matrix = np.random.rand(10, 10)
        
        # Cache the result
        cache_manager.put(
            aspect_matrix,
            'synastry_aspects',
            chart_data=chart1,  # Primary chart for key generation
            chart2_hash=ChartDataHasher.hash_chart(chart2),
            orb=8.0,
            aspects=['conjunction', 'opposition', 'trine', 'square', 'sextile']
        )
        
        # Retrieve from cache
        cached_result = cache_manager.get(
            'synastry_aspects',
            chart_data=chart1,
            chart2_hash=ChartDataHasher.hash_chart(chart2),
            orb=8.0,
            aspects=['conjunction', 'opposition', 'trine', 'square', 'sextile']
        )
        
        assert cached_result is not None
        np.testing.assert_array_equal(cached_result, aspect_matrix)
        
        # Check cache stats
        stats = cache_manager.get_stats()
        assert stats['memory_cache']['hits'] == 1

if __name__ == "__main__":
    pytest.main([__file__, "-v"])
