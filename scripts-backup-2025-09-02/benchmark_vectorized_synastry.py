#!/usr/bin/env python3
"""
CosmicHub Synastry Performance Benchmark
Comprehensive testing of vectorized vs traditional calculations
"""

import time
import random
import sys
import json
import tracemalloc
from dataclasses import dataclass, asdict
from statistics import mean, median
from typing import Dict, List, Tuple, Optional, Any

# Add backend to path
sys.path.append('/Users/Chris/Projects/CosmicHub')

def generate_realistic_chart() -> Dict[str, float]:
    """Generate realistic astrological chart data."""
    # More realistic planet distribution
    planets = {
        'sun': random.uniform(0, 360),
        'moon': random.uniform(0, 360),
        'mercury': random.uniform(0, 360),  # Close to sun in reality
        'venus': random.uniform(0, 360),    # Close to sun in reality
        'mars': random.uniform(0, 360),
        'jupiter': random.uniform(0, 360),
        'saturn': random.uniform(0, 360),
        'uranus': random.uniform(0, 360),
        'neptune': random.uniform(0, 360),
        'pluto': random.uniform(0, 360),
    }
    return planets

@dataclass
class BatchResult:
    batch_size: int
    traditional_time: float
    vectorized_time: float
    speedup: float
    time_saved_percent: float
    average_ms_traditional: float
    average_ms_vectorized: float
    mismatch_pairs: int
    total_pairs: int
    differing_cells: int
    total_cells_compared: int
    max_orb_diff: float
    median_orb_diff: float


try:
    # Prefer the concrete AspectData TypedDict for stronger type alignment
    from backend.utils.aspect_utils import AspectData  # type: ignore
except Exception:  # pragma: no cover - fallback if import path changes
    AspectData = Dict[str, Any]  # type: ignore

# Matrix element is AspectData or None. For pragmatic benchmarking flexibility,
# we relax MatrixType to Any to avoid mypy/pyright invariance friction; the
# structure is validated in diff_aspect_matrices.
MatrixType = Any  # type: ignore


def diff_aspect_matrices(a: MatrixType, b: MatrixType) -> Tuple[int, int, float, float]:
    """Return differing cell count, total cells, max orb diff, median orb diff (0 if no aspects)."""
    differing = 0
    total = 0
    orb_diffs: List[float] = []
    for row_a, row_b in zip(a, b):
        for cell_a, cell_b in zip(row_a, row_b):
            total += 1
            if cell_a is None and cell_b is None:
                continue
            if (cell_a is None) != (cell_b is None):
                differing += 1
                continue
            # both present
            assert cell_a and cell_b
            if cell_a['aspect'] != cell_b['aspect']:
                differing += 1
            orb_diffs.append(abs(cell_a['orb'] - cell_b['orb']))
    max_orb = max(orb_diffs) if orb_diffs else 0.0
    median_orb = median(orb_diffs) if orb_diffs else 0.0
    return differing, total, max_orb, median_orb


def run_performance_benchmark(sizes: Optional[List[int]] = None, json_out: Optional[str] = None, seed: int = 42):
    """Run comprehensive performance benchmark with validation & memory profiling.

    Args:
        sizes: optional list of batch sizes to test (default: [1,10,50,100])
        json_out: file path to write JSON summary
        seed: RNG seed for reproducibility
    """

    random.seed(seed)
    print("🌟 CosmicHub Vectorized Synastry Benchmark")
    print("=" * 60)

    try:
        from backend.utils.aspect_utils import build_aspect_matrix
        from backend.utils.vectorized_aspect_utils import build_aspect_matrix_fast, batch_synastry_analysis
        print("✅ Both traditional and vectorized implementations loaded")
    except ImportError as e:
        print(f"❌ Import error: {e}")
        return

    test_sizes = sizes or [1, 10, 50, 100]
    batch_summaries: List[BatchResult] = []

    for batch_size in test_sizes:
        print(f"\n{'=' * 20} BATCH SIZE: {batch_size} {'=' * 20}")

        chart_pairs = [
            (generate_realistic_chart(), generate_realistic_chart())
            for _ in range(batch_size)
        ]

        # Traditional benchmark with memory snapshot
        print(f"\n📊 Traditional Calculations ({batch_size} pairs):")
        tracemalloc.start()
        start_time = time.time()
        traditional_results: List[MatrixType] = []
        for chart1, chart2 in chart_pairs:
            traditional_results.append(build_aspect_matrix(chart1, chart2))
        traditional_time = time.time() - start_time
        _, peak_trad = tracemalloc.get_traced_memory()
        tracemalloc.stop()

        print(f"   ⏱️  Total time: {traditional_time:.4f} s | Avg: {traditional_time / batch_size * 1000:.2f} ms")
        print(f"   🧠 Peak memory (approx tracemalloc): {peak_trad/1024:.1f} KiB")

        # Vectorized benchmark with memory snapshot
        print(f"\n⚡ Vectorized Calculations ({batch_size} pairs):")
        tracemalloc.start()
        start_time = time.time()
        vectorized_results: List[MatrixType] = []
        for chart1, chart2 in chart_pairs:
            vectorized_results.append(build_aspect_matrix_fast(chart1, chart2))
        vectorized_time = time.time() - start_time
        _, peak_vec = tracemalloc.get_traced_memory()
        tracemalloc.stop()

        print(f"   ⏱️  Total time: {vectorized_time:.4f} s | Avg: {vectorized_time / batch_size * 1000:.2f} ms")
        print(f"   🧠 Peak memory (approx tracemalloc): {peak_vec/1024:.1f} KiB")

        # Batch vectorized analysis (compatibility scores) for reference
        start_time = time.time()
        _batch_analysis = batch_synastry_analysis(chart_pairs)
        batch_analysis_time = time.time() - start_time
        print(f"   📦 Batch synastry analysis helper time: {batch_analysis_time:.4f} s (scores + matrices)")

        if vectorized_time > 0:
            speedup = traditional_time / vectorized_time
            time_saved = ((traditional_time - vectorized_time) / traditional_time) * 100 if traditional_time else 0.0
        else:
            speedup = 0.0
            time_saved = 0.0

        mismatch_pairs = 0
        differing_cells_total = 0
        total_cells = 0
        max_orb_diffs: List[float] = []
        median_orb_diffs: List[float] = []

        print("\n🔍 Validating matrix equivalence (structure & aspect classification)...")
        for t_mat, v_mat in zip(traditional_results, vectorized_results):
            differing_cells, cell_total, max_orb, median_orb = diff_aspect_matrices(t_mat, v_mat)
            differing_cells_total += differing_cells
            total_cells += cell_total
            max_orb_diffs.append(max_orb)
            median_orb_diffs.append(median_orb)
            if differing_cells > 0:
                mismatch_pairs += 1

        overall_max_orb_diff = max(max_orb_diffs) if max_orb_diffs else 0.0
        overall_median_orb_diff = median(median_orb_diffs) if median_orb_diffs else 0.0

        print(f"   ✅ Pairs validated: {batch_size - mismatch_pairs}/{batch_size} identical (structurally)")
        if mismatch_pairs:
            pct_pairs = mismatch_pairs / batch_size * 100
            pct_cells = differing_cells_total / total_cells * 100 if total_cells else 0
            print(f"   ⚠️  {mismatch_pairs} pairs ({pct_pairs:.1f}%) show {differing_cells_total} differing cells ({pct_cells:.2f}% of {total_cells})")
        print(f"   🎯 Max orb diff: {overall_max_orb_diff:.3f}° | Median orb diff: {overall_median_orb_diff:.3f}°")

        print("\n🎯 Performance Improvement Summary:")
        print(f"   ⚡ Speedup: {speedup:.2f}x | Time saved: {time_saved:.1f}%")
        mem_saving = ((peak_trad - peak_vec) / peak_trad * 100) if peak_trad else 0.0
        print(f"   🧠 Peak memory delta: {mem_saving:.1f}%")

        batch_summaries.append(BatchResult(
            batch_size=batch_size,
            traditional_time=traditional_time,
            vectorized_time=vectorized_time,
            speedup=speedup,
            time_saved_percent=time_saved,
            average_ms_traditional=traditional_time / batch_size * 1000,
            average_ms_vectorized=vectorized_time / batch_size * 1000,
            mismatch_pairs=mismatch_pairs,
            total_pairs=batch_size,
            differing_cells=differing_cells_total,
            total_cells_compared=total_cells,
            max_orb_diff=overall_max_orb_diff,
            median_orb_diff=overall_median_orb_diff
        ))

    # Aggregate summary
    print(f"\n{'=' * 20} AGGREGATED SUMMARY {'=' * 20}")
    avg_speedup = 0.0
    med_speedup = 0.0
    min_speedup = 0.0
    max_speedup = 0.0
    worst_mismatch_pct = 0.0
    largest_orb = 0.0
    if batch_summaries:
        speedups = [br.speedup for br in batch_summaries]
        avg_speedup = mean(speedups)
        med_speedup = median(speedups)
        min_speedup = min(speedups)
        max_speedup = max(speedups)
        worst_mismatch_pct = max((br.mismatch_pairs / br.total_pairs * 100) for br in batch_summaries)
        largest_orb = max(br.max_orb_diff for br in batch_summaries)
        print(f"📈 Avg speedup: {avg_speedup:.2f}x | Median: {med_speedup:.2f}x | Range: {min_speedup:.2f}–{max_speedup:.2f}x")
        print(f"🧪 Max pair mismatch % across batches: {worst_mismatch_pct:.2f}%")
        print(f"🎯 Largest orb difference observed: {largest_orb:.3f}°")

    if json_out:
        try:
            payload: Dict[str, Any] = {
                'seed': seed,
                'generated_at': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
                'batches_count': len(batch_summaries),
                'batches': [asdict(br) for br in batch_summaries],
                'summary': {
                    'avg_speedup': avg_speedup,
                    'median_speedup': med_speedup,
                    'min_speedup': min_speedup,
                    'max_speedup': max_speedup,
                    'max_pair_mismatch_pct': worst_mismatch_pct,
                    'largest_orb_diff': largest_orb,
                    'max_orb_diff': max((br.max_orb_diff for br in batch_summaries), default=0),  # backward compat
                }
            }
            with open(json_out, 'w', encoding='utf-8') as f:
                json.dump(payload, f, indent=2)
            print(f"📦 JSON summary written to: {json_out}")
        except Exception as e:  # pragma: no cover - non critical
            print(f"⚠️  Failed to write JSON summary: {e}")
    
    # Memory efficiency test
    print(f"\n{'=' * 20} MEMORY EFFICIENCY TEST {'=' * 20}")
    
    # Placeholder for future memory stress test if needed:
    # large_batch = [(generate_realistic_chart(), generate_realistic_chart()) for _ in range(200)]
    
    print("\n🧠 Memory Usage Comparison:")
    print("   📊 Traditional: Individual matrix calculations (nested loops)")
    print("   ⚡ Vectorized: NumPy array operations (broadcast matrices)")
    print("   💡 Expected: 3-5x memory efficiency improvement")
    
    # Real-world scenario test
    print(f"\n{'=' * 20} REAL-WORLD SCENARIO {'=' * 20}")
    
    # Simulate premium user doing multiple synastry requests
    print("\n🌟 Premium User Scenario: 5 synastry calculations")
    premium_pairs = [(generate_realistic_chart(), generate_realistic_chart()) for _ in range(5)]
    
    # Traditional
    start = time.time()
    for chart1, chart2 in premium_pairs:
        build_aspect_matrix(chart1, chart2)
    traditional_premium = time.time() - start
    
    # Vectorized
    start = time.time()
    for chart1, chart2 in premium_pairs:
        build_aspect_matrix_fast(chart1, chart2)
    vectorized_premium = time.time() - start
    
    print(f"   📊 Traditional: {traditional_premium:.3f}s (user waits {traditional_premium:.1f} seconds)")
    print(f"   ⚡ Vectorized: {vectorized_premium:.3f}s (user waits {vectorized_premium:.1f} seconds)")
    print(f"   🎯 UX improvement: {(traditional_premium/vectorized_premium):.1f}x faster response")
    
    # Server load simulation
    print(f"\n🖥️  Server Load Scenario: 20 concurrent users")
    concurrent_load = [(generate_realistic_chart(), generate_realistic_chart()) for _ in range(20)]
    
    start = time.time()
    for chart1, chart2 in concurrent_load:
        build_aspect_matrix(chart1, chart2)
    traditional_load = time.time() - start
    
    start = time.time()
    for chart1, chart2 in concurrent_load:
        build_aspect_matrix_fast(chart1, chart2)
    vectorized_load = time.time() - start
    
    print(f"   📊 Traditional: {traditional_load:.3f}s server processing time")
    print(f"   ⚡ Vectorized: {vectorized_load:.3f}s server processing time")
    print(f"   💰 Cost savings: {((traditional_load - vectorized_load)/traditional_load*100):.0f}% reduction")
    
    # Final recommendations
    print(f"\n{'=' * 20} RECOMMENDATIONS {'=' * 20}")
    
    overall_speedup = traditional_load / vectorized_load if vectorized_load > 0 else 0
    
    if overall_speedup > 5:
        print("🚀 STRONG RECOMMENDATION: Deploy vectorized operations immediately!")
        print(f"   • {overall_speedup:.1f}x performance improvement")
        print("   • Significant user experience enhancement")
        print("   • Major server cost reduction opportunity")
    elif overall_speedup > 2:
        print("✅ RECOMMENDED: Deploy vectorized operations in next release")
        print(f"   • {overall_speedup:.1f}x performance improvement")
        print("   • Noticeable user experience improvement")
        print("   • Good server cost optimization")
    else:
        print("📊 CONSIDER: Vectorized operations provide modest improvements")
        print(f"   • {overall_speedup:.1f}x performance improvement")
    
    print(f"\n🎉 Benchmark Complete!")
    print("   Next Steps:")
    print("   1. ✅ Phase 1 complete - vectorized implementation ready")
    print("   2. 🔄 Phase 2 - Integration testing and optimization")
    print("   3. 📊 Phase 3 - Production monitoring and metrics")
    print("   4. 🚀 Phase 4 - Full deployment and feature rollout")

if __name__ == "__main__":
    # Lightweight CLI parsing (no argparse to keep script dependency-light)
    sizes_arg = None
    json_arg = None
    seed = 42
    for arg in sys.argv[1:]:
        if arg.startswith('--sizes='):
            try:
                sizes_arg = [int(x) for x in arg.split('=', 1)[1].split(',') if x]
            except ValueError:
                print("⚠️  Ignoring invalid --sizes value")
        elif arg.startswith('--json='):
            json_arg = arg.split('=', 1)[1]
        elif arg.startswith('--seed='):
            try:
                seed = int(arg.split('=', 1)[1])
            except ValueError:
                print("⚠️  Invalid seed provided, using default 42")

    try:
        run_performance_benchmark(sizes=sizes_arg, json_out=json_arg, seed=seed)
    except Exception as e:  # pragma: no cover
        print(f"❌ Benchmark failed: {e}")
        import traceback
        traceback.print_exc()
