#!/usr/bin/env python3
"""
Performance benchmark for vectorized vs traditional synastry calculations.
Run this to see the performance improvements with vectorized operations.
"""

import time
import random
from typing import Dict, Optional, Union

# Mock data for testing
PLANETS = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto']

def generate_mock_chart() -> Dict[str, float]:
    """Generate a mock birth chart for testing."""
    return {planet: random.uniform(0, 360) for planet in PLANETS}

def benchmark_synastry_calculations() -> Optional[Dict[str, Union[float, int]]]:
    """Benchmark traditional vs vectorized synastry calculations."""
    
    # Import both versions
    from backend.utils.aspect_utils import build_aspect_matrix
    
    try:
        from backend.utils.vectorized_aspect_utils import build_aspect_matrix_fast
        print("✅ Vectorized operations available")
    except ImportError:
        print("❌ Vectorized operations not available")
        return
    
    # Generate test data
    num_pairs = 100
    chart_pairs = [(generate_mock_chart(), generate_mock_chart()) for _ in range(num_pairs)]
    
    print(f"\n🧪 Testing {num_pairs} synastry calculations...")
    
    # Benchmark traditional approach
    print("\n📊 Traditional Calculations:")
    start_time = time.time()
    from typing import List, Any
    traditional_results: List[List[Any]] = []
    for long1, long2 in chart_pairs:
        matrix = build_aspect_matrix(long1, long2)
        traditional_results.append(matrix)
    traditional_time = time.time() - start_time
    print(f"   Time: {traditional_time:.3f} seconds")
    print(f"   Rate: {num_pairs / traditional_time:.1f} calculations/second")
    
    # Benchmark vectorized approach
    print("\n⚡ Vectorized Calculations:")
    start_time = time.time()
    vectorized_results: List[List[Any]] = []
    for long1, long2 in chart_pairs:
        matrix = build_aspect_matrix_fast(long1, long2)
        vectorized_results.append(matrix)
    vectorized_time = time.time() - start_time
    print(f"   Time: {vectorized_time:.3f} seconds")
    print(f"   Rate: {num_pairs / vectorized_time:.1f} calculations/second")
    
    # Performance improvement
    speedup = traditional_time / vectorized_time
    print(f"\n🚀 Performance Improvement:")
    print(f"   Speedup: {speedup:.2f}x faster")
    print(f"   Time saved: {((traditional_time - vectorized_time) / traditional_time * 100):.1f}%")
    
    # Memory usage comparison
    print(f"\n💾 Memory Efficiency:")
    print(f"   Traditional: Individual calculations with nested loops")
    print(f"   Vectorized: Batch matrix operations with NumPy")
    
    return {
        'traditional_time': traditional_time,
        'vectorized_time': vectorized_time,
        'speedup': speedup,
        'num_pairs': num_pairs
    }

if __name__ == "__main__":
    print("🌟 CosmicHub Synastry Performance Benchmark")
    print("=" * 50)
    
    try:
        results = benchmark_synastry_calculations()
        if results is not None:
            print(f"\n✨ Summary:")
            print(f"   With {results['num_pairs']} synastry calculations:")
            print(f"   • Traditional approach: {results['traditional_time']:.3f}s")
            print(f"   • Vectorized approach: {results['vectorized_time']:.3f}s")
            print(f"   • Performance gain: {results['speedup']:.2f}x faster")
            if results['speedup'] > 2:
                print(f"\n🎯 Recommendation: Implement vectorized operations NOW!")
                print(f"   • Significant performance improvement ({results['speedup']:.1f}x)")
                print(f"   • Better user experience with faster calculations")
                print(f"   • Reduced server load and costs")
        else:
            print("No results to summarize. Vectorized operations may not be available.")
    except Exception as e:
        print(f"❌ Benchmark failed: {e}")
        print("💡 Make sure NumPy is installed: pip install numpy")
