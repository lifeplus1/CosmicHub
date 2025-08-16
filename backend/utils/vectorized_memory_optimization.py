"""
Phase 3: Memory Optimization for Vectorized Operations

This module provides memory-efficient implementations and optimization strategies
for vectorized astrological calculations, focusing on large-scale batch processing
and memory usage minimization.
"""

import numpy as np
from typing import Dict, List, Any, Optional, Tuple, Union, Iterator
import gc
import threading
from dataclasses import dataclass
from contextlib import contextmanager
from queue import Queue, Empty
import weakref
import logging

try:
    import psutil
    psutil_available = True
except ImportError:
    psutil_available = False

logger = logging.getLogger(__name__)

@dataclass
class SimpleArrayPool:
    """Simple thread-safe array pooling with basic memory management."""
    
    def __init__(self, max_arrays: int = 100):
        self.max_arrays = max_arrays
        self.pools: Dict[str, Queue] = {}
        self.lock = threading.Lock()
        self.stats = {
            'arrays_allocated': 0,
            'arrays_reused': 0,
            'pools_created': 0,
            'memory_saved_mb': 0.0
        }
    
    def get_array(self, shape: Tuple[int, ...], dtype=np.float64) -> np.ndarray:
        """Get an array from the pool or create a new one."""
        # Use dtype.type for consistent key generation
        key = f"{shape}_{dtype if isinstance(dtype, type) else dtype.type}"
        
        with self.lock:
            if key not in self.pools:
                self.pools[key] = Queue(maxsize=self.max_arrays)
                self.stats['pools_created'] += 1
            
            pool = self.pools[key]
            
            try:
                array = pool.get_nowait()
                array.fill(0)  # Clear the array
                self.stats['arrays_reused'] += 1
                array_size_mb = array.nbytes / (1024 * 1024)
                self.stats['memory_saved_mb'] += array_size_mb
                return array
            except Empty:
                # Create new array if pool is empty
                array = np.zeros(shape, dtype=dtype)
                self.stats['arrays_allocated'] += 1
                return array
    
    def return_array(self, array: np.ndarray) -> bool:
        """Return an array to the pool for reuse."""
        if array is None:
            return False
            
        # Use the same key format as get_array: use dtype type, not instance
        key = f"{array.shape}_{array.dtype.type}"
        
        with self.lock:
            if key in self.pools:
                pool = self.pools[key]
                try:
                    pool.put_nowait(array)
                    return True
                except:
                    return False
        return False
    
    def get_stats(self) -> Dict[str, Any]:
        """Get current pool statistics."""
        with self.lock:
            return self.stats.copy()
    
    def force_cleanup(self):
        """Force cleanup of all pools."""
        with self.lock:
            for pool in self.pools.values():
                while not pool.empty():
                    try:
                        pool.get_nowait()
                    except Empty:
                        break
            self.pools.clear()
            gc.collect()


class ArrayMemoryPool:
    """Memory pool manager for numpy arrays with context manager support."""
    
    def __init__(self, max_arrays: int = 100):
        self.pool = SimpleArrayPool(max_arrays)
        self._active_arrays: List[np.ndarray] = []  # Track arrays instead of WeakSet
    
    def get_array(self, shape: Tuple[int, ...], dtype=np.float64) -> np.ndarray:
        """Get an array from the pool."""
        return self.pool.get_array(shape, dtype)
    
    def return_array(self, array: np.ndarray) -> bool:
        """Return an array to the pool."""
        # Remove from active arrays if present
        if array in self._active_arrays:
            self._active_arrays.remove(array)
        return self.pool.return_array(array)
    
    @contextmanager
    def get_temp_array(self, shape: Tuple[int, ...], dtype=np.float64):
        """Context manager for temporary arrays that are automatically returned."""
        array = self.get_array(shape, dtype)
        self._active_arrays.append(array)
        try:
            yield array
        finally:
            self.return_array(array)
    
    def force_cleanup(self):
        """Force cleanup of all pools and active arrays."""
        # Clean up active arrays
        for array in self._active_arrays[:]:  # Copy list to avoid modification during iteration
            self.return_array(array)
        self._active_arrays.clear()
        self.pool.force_cleanup()


class GlobalArrayMemoryPool:
    """Global singleton array memory pool for NumPy arrays."""
    
    _instance: Optional['GlobalArrayMemoryPool'] = None
    _lock = threading.Lock()
    
    def __new__(cls):
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = super().__new__(cls)
        return cls._instance
    
    def __init__(self):
        if hasattr(self, '_initialized'):
            return
        self._initialized = True
        
        self.pool = SimpleArrayPool()
        self._active_arrays: List[np.ndarray] = []
    
    @contextmanager
    def get_temp_array(self, shape: Tuple[int, ...], dtype: np.dtype = np.float64):
        """Context manager for temporary arrays that are automatically returned to pool."""
        array = self.pool.get_array(shape, dtype)
        self._active_arrays.add(array)
        try:
            yield array
        finally:
            if array in self._active_arrays:
                self._active_arrays.discard(array)
            self.pool.return_array(array)
    
    def get_array(self, shape: Tuple[int, ...], dtype: np.dtype = np.float64) -> np.ndarray:
        """Get a pooled array - caller is responsible for returning it."""
        return self.pool.get_array(shape, dtype)
    
    def return_array(self, array: np.ndarray) -> bool:
        """Return array to pool."""
        return self.pool.return_array(array)
    
    def force_cleanup(self):
        """Force cleanup of all arrays and pools."""
        self._active_arrays.clear()
        self.pool.force_cleanup()

class MemoryOptimizedVectorizedCalculator:
    """
    Memory-optimized version of VectorizedAspectCalculator.
    
    Features:
    - Chunked processing for large datasets
    - Memory pool usage for temporary arrays
    - Garbage collection optimization
    - Memory usage monitoring
    """
    
    def __init__(self, 
                 chunk_size: int = 1000, 
                 enable_memory_pooling: bool = True,
                 max_memory_mb: float = 1000.0):
        self.chunk_size = chunk_size
        self.enable_memory_pooling = enable_memory_pooling
        self.max_memory_mb = max_memory_mb
        
        if enable_memory_pooling:
            self.memory_pool = ArrayMemoryPool()
        else:
            self.memory_pool = None
            
        # Load aspect configuration
        from utils.aspect_utils import PLANETS, ASPECT_DEGREES, ORBS
        self.planets = np.array(PLANETS)
        self.aspect_degrees = np.array(list(ASPECT_DEGREES.values()))
        self.aspect_names = list(ASPECT_DEGREES.keys())
        self.orbs = np.array([ORBS[name] for name in self.aspect_names])
    
    def calculate_separation_matrix_chunked(self, 
                                          longitudes1: List[Dict[str, float]], 
                                          longitudes2: List[Dict[str, float]]) -> Iterator[np.ndarray]:
        """
        Calculate separation matrices in chunks to manage memory usage.
        
        Args:
            longitudes1: List of first chart longitudes
            longitudes2: List of second chart longitudes
            
        Yields:
            Separation matrices for each chunk
        """
        total_pairs = len(longitudes1) * len(longitudes2)
        
        # Process in chunks to manage memory
        for i in range(0, len(longitudes1), self.chunk_size):
            chunk1 = longitudes1[i:i + self.chunk_size]
            
            for j in range(0, len(longitudes2), self.chunk_size):
                chunk2 = longitudes2[j:j + self.chunk_size]
                
                # Calculate separation matrix for this chunk
                chunk_matrix = self._calculate_chunk_separations(chunk1, chunk2)
                yield chunk_matrix
                
                # Force garbage collection periodically
                if (i * len(longitudes2) + j) % (self.chunk_size * 10) == 0:
                    gc.collect()
    
    def _calculate_chunk_separations(self, 
                                   chunk1: List[Dict[str, float]], 
                                   chunk2: List[Dict[str, float]]) -> np.ndarray:
        """Calculate separation matrix for a chunk of charts."""
        n_charts1, n_charts2 = len(chunk1), len(chunk2)
        n_planets = len(self.planets)
        
        if self.memory_pool:
            with self.memory_pool.get_temp_array((n_charts1, n_planets)) as lons1_array:
                with self.memory_pool.get_temp_array((n_charts2, n_planets)) as lons2_array:
                    # Fill longitude arrays
                    for i, chart in enumerate(chunk1):
                        for j, planet in enumerate(self.planets):
                            lons1_array[i, j] = chart.get(planet, 0.0)
                    
                    for i, chart in enumerate(chunk2):
                        for j, planet in enumerate(self.planets):
                            lons2_array[i, j] = chart.get(planet, 0.0)
                    
                    # Calculate separations using broadcasting
                    with self.memory_pool.get_temp_array((n_charts1, n_charts2, n_planets, n_planets)) as separations:
                        for i in range(n_charts1):
                            for j in range(n_charts2):
                                diff_matrix = np.abs(lons1_array[i, :, np.newaxis] - lons2_array[j, np.newaxis, :])
                                separations[i, j] = np.minimum(diff_matrix, 360 - diff_matrix)
                        
                        return separations.copy()  # Return copy as original will be recycled
        else:
            # Standard implementation without memory pooling
            lons1_array = np.zeros((n_charts1, n_planets))
            lons2_array = np.zeros((n_charts2, n_planets))
            
            # Fill arrays
            for i, chart in enumerate(chunk1):
                for j, planet in enumerate(self.planets):
                    lons1_array[i, j] = chart.get(planet, 0.0)
            
            for i, chart in enumerate(chunk2):
                for j, planet in enumerate(self.planets):
                    lons2_array[i, j] = chart.get(planet, 0.0)
            
            # Calculate separations
            separations = np.zeros((n_charts1, n_charts2, n_planets, n_planets))
            for i in range(n_charts1):
                for j in range(n_charts2):
                    diff_matrix = np.abs(lons1_array[i, :, np.newaxis] - lons2_array[j, np.newaxis, :])
                    separations[i, j] = np.minimum(diff_matrix, 360 - diff_matrix)
            
            return separations
    
    def calculate_large_batch_aspects(self, 
                                    chart_pairs: List[Tuple[Dict[str, float], Dict[str, float]]],
                                    progress_callback: Optional[callable] = None) -> List[np.ndarray]:
        """
        Calculate aspects for a large batch of chart pairs with memory optimization.
        
        Args:
            chart_pairs: List of (chart1, chart2) tuples
            progress_callback: Optional callback for progress updates
            
        Returns:
            List of aspect matrices
        """
        results = []
        total_pairs = len(chart_pairs)
        
        # Process in chunks to manage memory
        for start_idx in range(0, total_pairs, self.chunk_size):
            end_idx = min(start_idx + self.chunk_size, total_pairs)
            chunk = chart_pairs[start_idx:end_idx]
            
            # Process chunk
            chunk_results = self._process_chunk(chunk)
            results.extend(chunk_results)
            
            # Progress callback
            if progress_callback:
                progress = (end_idx / total_pairs) * 100
                progress_callback(progress, end_idx, total_pairs)
            
            # Memory management
            if end_idx % (self.chunk_size * 5) == 0:
                gc.collect()
        
        return results
    
    def _process_chunk(self, chunk: List[Tuple[Dict[str, float], Dict[str, float]]]) -> List[np.ndarray]:
        """Process a chunk of chart pairs."""
        from utils.vectorized_aspect_utils import VectorizedAspectCalculator
        
        calculator = VectorizedAspectCalculator()
        chunk_results = []
        
        for chart1, chart2 in chunk:
            # Calculate aspects for this pair
            aspects = calculator.build_aspect_matrix_vectorized(chart1, chart2)
            chunk_results.append(aspects)
        
        return chunk_results
    
    def estimate_memory_usage(self, 
                            num_charts1: int, 
                            num_charts2: int, 
                            num_planets: int = 10) -> Dict[str, float]:
        """
        Estimate memory usage for batch processing.
        
        Args:
            num_charts1: Number of charts in first set
            num_charts2: Number of charts in second set
            num_planets: Number of planets per chart
            
        Returns:
            Memory usage estimates in MB
        """
        # Array sizes
        longitudes_size = num_charts1 * num_planets * 8  # float64
        separations_size = num_charts1 * num_charts2 * num_planets * num_planets * 8
        aspects_size = separations_size  # Roughly same size for aspect matrices
        
        # Total memory estimates
        base_memory_mb = (longitudes_size * 2 + separations_size + aspects_size) / (1024 * 1024)
        
        # Chunked memory (processing chunk_size at a time)
        effective_charts1 = min(num_charts1, self.chunk_size)
        effective_charts2 = min(num_charts2, self.chunk_size)
        
        chunked_longitudes = effective_charts1 * num_planets * 8 + effective_charts2 * num_planets * 8
        chunked_separations = effective_charts1 * effective_charts2 * num_planets * num_planets * 8
        chunked_memory_mb = (chunked_longitudes + chunked_separations) / (1024 * 1024)
        
        return {
            'base_memory_mb': base_memory_mb,
            'chunked_memory_mb': chunked_memory_mb,
            'memory_savings_mb': base_memory_mb - chunked_memory_mb,
            'memory_savings_percent': ((base_memory_mb - chunked_memory_mb) / base_memory_mb) * 100
        }
    
    def cleanup(self):
        """Clean up memory pools and force garbage collection."""
        if self.memory_pool:
            self.memory_pool.force_cleanup()
        gc.collect()

class MemoryMonitor:
    """Monitor memory usage during vectorized operations."""
    
    def __init__(self):
        self.peak_memory_mb = 0.0
        self.start_memory_mb = 0.0
    
    def start_monitoring(self):
        """Start memory monitoring."""
        self.start_memory_mb = self._get_memory_usage()
        self.peak_memory_mb = self.start_memory_mb
    
    def update_peak(self):
        """Update peak memory usage."""
        current_memory = self._get_memory_usage()
        self.peak_memory_mb = max(self.peak_memory_mb, current_memory)
    
    def get_memory_stats(self) -> Dict[str, float]:
        """Get memory usage statistics."""
        current_memory = self._get_memory_usage()
        return {
            'start_memory_mb': self.start_memory_mb,
            'current_memory_mb': current_memory,
            'peak_memory_mb': self.peak_memory_mb,
            'memory_increase_mb': current_memory - self.start_memory_mb,
            'peak_increase_mb': self.peak_memory_mb - self.start_memory_mb
        }
    
    def _get_memory_usage(self) -> float:
        """Get current memory usage in MB."""
        try:
            import psutil
            process = psutil.Process()
            return process.memory_info().rss / (1024 * 1024)
        except ImportError:
            return 0.0

@contextmanager
def memory_optimized_processing(chunk_size: int = 1000, 
                               enable_pooling: bool = True,
                               max_memory_mb: float = 1000.0):
    """
    Context manager for memory-optimized vectorized processing.
    
    Args:
        chunk_size: Size of processing chunks
        enable_pooling: Whether to use memory pooling
        max_memory_mb: Maximum memory usage limit
    """
    calculator = MemoryOptimizedVectorizedCalculator(
        chunk_size=chunk_size,
        enable_memory_pooling=enable_pooling,
        max_memory_mb=max_memory_mb
    )
    
    monitor = MemoryMonitor()
    monitor.start_monitoring()
    
    try:
        yield calculator, monitor
    finally:
        # Cleanup and report
        final_stats = monitor.get_memory_stats()
        
        if calculator.memory_pool:
            pool_stats = calculator.memory_pool.pool.get_stats()
            logger.info(f"Memory pool stats: {pool_stats}")
        
        logger.info(f"Memory usage stats: {final_stats}")
        calculator.cleanup()

# Global memory pool instance
_global_memory_pool: Optional[ArrayMemoryPool] = None

def get_global_memory_pool() -> ArrayMemoryPool:
    """Get the global memory pool instance."""
    global _global_memory_pool
    if _global_memory_pool is None:
        _global_memory_pool = ArrayMemoryPool()
    return _global_memory_pool
