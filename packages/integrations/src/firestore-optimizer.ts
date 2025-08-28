/**
 * Firestore Performance Optimizer - PERF-001 Implementation
 *
 * Analyzes and optimizes Firestore read patterns, implements intelligent
 * caching, and provides adaptive query optimization.
 */

// Simple console wrapper for development logging
const isDev = process.env.NODE_ENV === 'development';
const devConsole = {
  log: isDev
    ? console.log.bind(console)
    : (): void => {
        /* no-op */
      },
  warn: isDev
    ? console.warn.bind(console)
    : (): void => {
        /* no-op */
      },
  error: console.error.bind(console),
};

interface FirestoreReadMetrics {
  queryCount: number;
  totalReads: number;
  cacheHits: number;
  averageLatency: number;
  hotspotQueries: string[];
  inefficientPatterns: string[];
}

interface QueryOptimization {
  original: string;
  optimized: string;
  improvement: string;
  estimatedSavings: number;
}

interface ReadPattern {
  query: string;
  frequency: number;
  averageReads: number;
  cacheability: 'high' | 'medium' | 'low';
  optimization: QueryOptimization | null;
}

class FirestorePerformanceOptimizer {
  private readMetrics = new Map<string, ReadPattern>();
  private cacheStats = {
    hits: 0,
    misses: 0,
    invalidations: 0,
    size: 0,
  };

  private readCounter = 0;
  private totalLatency = 0;

  /**
   * Track a Firestore read operation for analysis
   */
  trackRead(
    querySignature: string,
    readCount: number,
    latency: number,
    cacheHit: boolean = false
  ): void {
    this.readCounter++;
    this.totalLatency += latency;

    if (cacheHit) {
      this.cacheStats.hits++;
    } else {
      this.cacheStats.misses++;
    }

    // Update read pattern metrics
    const existing = this.readMetrics.get(querySignature);
    if (existing) {
      existing.frequency++;
      existing.averageReads = (existing.averageReads + readCount) / 2;
    } else {
      this.readMetrics.set(querySignature, {
        query: querySignature,
        frequency: 1,
        averageReads: readCount,
        cacheability: this.assessCacheability(querySignature),
        optimization: this.suggestOptimization(querySignature, readCount),
      });
    }

    // Log inefficient patterns in development
    if (readCount > 100 && !cacheHit) {
      devConsole.warn?.(
        `🔥 High-read query detected: ${querySignature} (${readCount} reads, ${latency}ms)`
      );
    }
  }

  /**
   * Generate comprehensive read pattern analysis
   */
  getReadAnalysis(): {
    metrics: FirestoreReadMetrics;
    patterns: ReadPattern[];
    recommendations: string[];
    optimizations: QueryOptimization[];
  } {
    const patterns = Array.from(this.readMetrics.values()).sort(
      (a, b) => b.frequency - a.frequency
    );

    const hotspotQueries = patterns
      .filter(p => p.frequency > 10 || p.averageReads > 50)
      .map(p => p.query)
      .slice(0, 10);

    const inefficientPatterns = patterns
      .filter(p => p.averageReads > 100 && p.cacheability !== 'high')
      .map(p => p.query);

    const metrics: FirestoreReadMetrics = {
      queryCount: this.readCounter,
      totalReads: patterns.reduce(
        (sum, p) => sum + p.frequency * p.averageReads,
        0
      ),
      cacheHits: this.cacheStats.hits,
      averageLatency:
        this.readCounter > 0 ? this.totalLatency / this.readCounter : 0,
      hotspotQueries,
      inefficientPatterns,
    };

    const optimizations = patterns
      .map(p => p.optimization)
      .filter(Boolean) as QueryOptimization[];

    const recommendations = this.generateRecommendations(metrics, patterns);

    return { metrics, patterns, recommendations, optimizations };
  }

  /**
   * Assess how cacheable a query pattern is
   */
  private assessCacheability(
    querySignature: string
  ): 'high' | 'medium' | 'low' {
    // Static data queries are highly cacheable
    if (
      querySignature.includes('user_charts') ||
      querySignature.includes('interpretations')
    ) {
      return 'high';
    }

    // Ephemeris data is moderately cacheable (changes daily)
    if (
      querySignature.includes('ephemeris') ||
      querySignature.includes('positions')
    ) {
      return 'medium';
    }

    // Real-time data is less cacheable
    if (
      querySignature.includes('realtime') ||
      querySignature.includes('notifications')
    ) {
      return 'low';
    }

    return 'medium';
  }

  /**
   * Suggest optimization for a query pattern
   */
  private suggestOptimization(
    querySignature: string,
    readCount: number
  ): QueryOptimization | null {
    // Suggest batching for multiple single-document reads
    if (querySignature.includes('where_id_==') && readCount > 10) {
      return {
        original: querySignature,
        optimized: querySignature.replace('where_id_==', 'where_id_in'),
        improvement: 'Batch multiple document reads into single query',
        estimatedSavings: Math.floor(readCount * 0.8), // ~80% reduction in reads
      };
    }

    // Suggest composite indexes for complex queries
    if (
      querySignature.includes('where_') &&
      querySignature.includes('order_by')
    ) {
      return {
        original: querySignature,
        optimized: `${querySignature} [composite_index_recommended]`,
        improvement: 'Add composite index to improve query performance',
        estimatedSavings: readCount / 2, // ~50% performance improvement
      };
    }

    // Suggest pagination for large result sets
    if (readCount > 100) {
      return {
        original: querySignature,
        optimized: `${querySignature}.limit(25).startAfter(cursor)`,
        improvement: 'Implement pagination to reduce read count',
        estimatedSavings: Math.floor(readCount * 0.75), // ~75% reduction
      };
    }

    return null;
  }

  /**
   * Generate specific recommendations based on analysis
   */
  private generateRecommendations(
    metrics: FirestoreReadMetrics,
    patterns: ReadPattern[]
  ): string[] {
    const recommendations: string[] = [];

    // Cache hit rate recommendations
    const cacheHitRate =
      (metrics.cacheHits / (metrics.cacheHits + this.cacheStats.misses)) * 100;
    if (cacheHitRate < 60) {
      recommendations.push(
        `Cache hit rate is ${cacheHitRate.toFixed(1)}% - implement more aggressive caching for frequently accessed data`
      );
    }

    // High-frequency query recommendations
    const highFrequencyPatterns = patterns.filter(p => p.frequency > 20);
    if (highFrequencyPatterns.length > 0) {
      recommendations.push(
        `${highFrequencyPatterns.length} high-frequency queries detected - consider caching or batching`
      );
    }

    // Large read count recommendations
    const highReadPatterns = patterns.filter(p => p.averageReads > 50);
    if (highReadPatterns.length > 0) {
      recommendations.push(
        `${highReadPatterns.length} queries with high read counts - implement pagination or filtering`
      );
    }

    // Specific pattern recommendations
    const userChartQueries = patterns.filter(p =>
      p.query.includes('user_charts')
    );
    if (
      userChartQueries.length > 0 &&
      userChartQueries.some(q => q.cacheability === 'low')
    ) {
      recommendations.push(
        'User chart queries should be cached aggressively - implement local storage with TTL'
      );
    }

    const ephemerisQueries = patterns.filter(p =>
      p.query.includes('ephemeris')
    );
    if (ephemerisQueries.length > 0) {
      recommendations.push(
        'Ephemeris queries are frequent - implement daily batch caching for planetary positions'
      );
    }

    // General performance recommendations
    if (metrics.averageLatency > 200) {
      recommendations.push(
        `Average query latency is ${metrics.averageLatency.toFixed(0)}ms - consider geographic database distribution`
      );
    }

    return recommendations;
  }

  /**
   * Get current cache statistics
   */
  getCacheStats() {
    const total = this.cacheStats.hits + this.cacheStats.misses;
    return {
      ...this.cacheStats,
      hitRate: total > 0 ? (this.cacheStats.hits / total) * 100 : 0,
    };
  }

  /**
   * Reset all metrics (useful for testing or periodic analysis)
   */
  reset(): void {
    this.readMetrics.clear();
    this.cacheStats = { hits: 0, misses: 0, invalidations: 0, size: 0 };
    this.readCounter = 0;
    this.totalLatency = 0;
  }

  /**
   * Log analysis summary
   */
  logAnalysis(): void {
    const analysis = this.getReadAnalysis();

    devConsole.log?.('\n📊 Firestore Performance Analysis:');
    devConsole.log?.('=====================================');
    devConsole.log?.(`Total queries: ${analysis.metrics.queryCount}`);
    devConsole.log?.(`Total reads: ${analysis.metrics.totalReads}`);
    devConsole.log?.(`Cache hits: ${analysis.metrics.cacheHits}`);
    devConsole.log?.(
      `Average latency: ${analysis.metrics.averageLatency.toFixed(1)}ms`
    );

    if (analysis.metrics.hotspotQueries.length > 0) {
      devConsole.log?.('\n🔥 Hotspot queries:');
      analysis.metrics.hotspotQueries.forEach(query => {
        devConsole.log?.(`  • ${query}`);
      });
    }

    if (analysis.recommendations.length > 0) {
      devConsole.log?.('\n💡 Recommendations:');
      analysis.recommendations.forEach(rec => {
        devConsole.log?.(`  • ${rec}`);
      });
    }

    if (analysis.optimizations.length > 0) {
      devConsole.log?.('\n⚡ Optimization opportunities:');
      analysis.optimizations.forEach(opt => {
        devConsole.log?.(
          `  • ${opt.improvement} (Save ~${opt.estimatedSavings} reads)`
        );
      });
    }
  }
}

// Singleton instance for global tracking
export const firestoreOptimizer = new FirestorePerformanceOptimizer();

/**
 * Higher-order function to wrap Firestore operations with performance tracking
 */

/**
 * Firestore query builder with automatic optimization suggestions
 */
