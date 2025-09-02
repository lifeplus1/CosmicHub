#!/usr/bin/env python3
"""
Micro-benchmark framework for CosmicHub vectorized operations.
Tracks performance regressions in core astronomical calculations.
"""

import time
import numpy as np
from typing import Dict, List, Any, Callable
from dataclasses import dataclass
from pathlib import Path
import json
import sys
import os

# Add backend to path for imports
backend_path = Path(__file__).parent.parent / "backend"
sys.path.insert(0, str(backend_path))


@dataclass
class BenchmarkResult:
    """Single benchmark run result."""
    name: str
    duration_ms: float
    iterations: int
    memory_mb: float
    operations_per_second: float
    metadata: Dict[str, Any]


class MicroBenchmark:
    """Lightweight benchmark runner for vectorized operations."""
    
    def __init__(self, warmup_iterations: int = 3, test_iterations: int = 10):
        self.warmup_iterations = warmup_iterations
        self.test_iterations = test_iterations
        self.results: List[BenchmarkResult] = []
    
    def run_benchmark(self, 
                     name: str, 
                     func: Callable, 
                     *args,
                     operations_count: int = 1,
                     **kwargs) -> BenchmarkResult:
        """Run a single benchmark."""
        # Warmup
        for _ in range(self.warmup_iterations):
            func(*args, **kwargs)
        
        # Actual timing
        times = []
        for _ in range(self.test_iterations):
            start_time = time.perf_counter()
            func(*args, **kwargs)
            end_time = time.perf_counter()
            times.append((end_time - start_time) * 1000)  # Convert to ms
        
        # Calculate stats
        avg_duration = sum(times) / len(times)
        ops_per_second = (operations_count / avg_duration) * 1000 if avg_duration > 0 else 0
        
        result = BenchmarkResult(
            name=name,
            duration_ms=avg_duration,
            iterations=self.test_iterations,
            memory_mb=0.0,  # TODO: Add memory tracking
            operations_per_second=ops_per_second,
            metadata={
                'min_duration_ms': min(times),
                'max_duration_ms': max(times),
                'std_dev_ms': np.std(times).item(),
                'operations_count': operations_count
            }
        )
        
        self.results.append(result)
        return result


def benchmark_aspect_calculations():
    """Benchmark core aspect calculation functions."""
    benchmark = MicroBenchmark()
    
    # Generate test data
    chart1 = {
        'Sun': 15.5, 'Moon': 87.3, 'Mercury': 45.8, 'Venus': 123.2,
        'Mars': 200.1, 'Jupiter': 305.7, 'Saturn': 45.9
    }
    chart2 = {
        'Sun': 95.2, 'Moon': 187.8, 'Mercury': 245.1, 'Venus': 23.4,
        'Mars': 156.7, 'Jupiter': 289.3, 'Saturn': 78.5
    }
    
    try:
        # Import vectorized functions
        from utils.vectorized_aspect_utils import VectorizedAspectCalculator
        
        calculator = VectorizedAspectCalculator()
        
        # Benchmark single chart aspect calculation
        benchmark.run_benchmark(
            "single_aspect_matrix",
            calculator.build_aspect_matrix_vectorized,
            chart1, chart2,
            operations_count=len(chart1) * len(chart2)
        )
        
        # Benchmark batch processing
        charts = [chart1, chart2] * 10  # 20 charts
        chart_pairs = [(charts[i], charts[i+1]) for i in range(0, len(charts)-1, 2)]
        
        benchmark.run_benchmark(
            "batch_aspect_calculation",
            lambda pairs: [calculator.build_aspect_matrix_vectorized(c1, c2) for c1, c2 in pairs],
            chart_pairs,
            operations_count=len(chart_pairs)
        )
        
    except ImportError as e:
        print(f"Could not import vectorized functions: {e}")
        return []
    
    return benchmark.results


def benchmark_memory_operations():
    """Benchmark memory optimization functions."""
    benchmark = MicroBenchmark()
    
    try:
        from utils.vectorized_memory_optimization import ArrayMemoryPool
        
        pool = ArrayMemoryPool()
        
        # Benchmark array allocation/return
        def allocate_and_return():
            array = pool.get_array((1000, 10))
            array.fill(1.0)
            pool.return_array(array)
        
        benchmark.run_benchmark(
            "memory_pool_allocation",
            allocate_and_return,
            operations_count=1
        )
        
        # Benchmark context manager usage
        def context_manager_test():
            with pool.get_temp_array((500, 20)) as temp_array:
                temp_array += 1.0
        
        benchmark.run_benchmark(
            "memory_pool_context",
            context_manager_test,
            operations_count=1
        )
        
    except ImportError as e:
        print(f"Could not import memory functions: {e}")
        return []
    
    return benchmark.results


def save_benchmark_results(results: List[BenchmarkResult], output_file: Path):
    """Save benchmark results to JSON file."""
    data = {
        'timestamp': time.time(),
        'benchmarks': [
            {
                'name': r.name,
                'duration_ms': r.duration_ms,
                'operations_per_second': r.operations_per_second,
                'iterations': r.iterations,
                'metadata': r.metadata
            }
            for r in results
        ]
    }
    
    with open(output_file, 'w') as f:
        json.dump(data, f, indent=2)


def main():
    """Run all benchmarks and save results."""
    print("Running CosmicHub micro-benchmarks...")
    
    all_results = []
    
    # Run aspect calculation benchmarks
    print("Benchmarking aspect calculations...")
    aspect_results = benchmark_aspect_calculations()
    all_results.extend(aspect_results)
    
    # Run memory operation benchmarks
    print("Benchmarking memory operations...")
    memory_results = benchmark_memory_operations()
    all_results.extend(memory_results)
    
    # Print results
    print("\nBenchmark Results:")
    print("-" * 60)
    for result in all_results:
        print(f"{result.name:30} {result.duration_ms:8.2f}ms {result.operations_per_second:10.0f} ops/sec")
    
    # Save results
    output_file = Path(__file__).parent.parent / "metrics" / "benchmark-results.json"
    output_file.parent.mkdir(exist_ok=True)
    save_benchmark_results(all_results, output_file)
    print(f"\nResults saved to {output_file}")


if __name__ == "__main__":
    main()
