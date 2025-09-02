# CosmicHub Development Tools

## Directory Structure

### `development/` - Development & Code Quality Tools

- Linting coordination and AI-assisted code quality tools
- Script consolidation and enhancement utilities
- Environment validation and configuration tools

### `build/` - Build System Tools

- Bundle analysis and optimization tools
- Mobile app and PWA build scripts
- Docker and containerization utilities

### `testing/` - Testing & Quality Assurance

- Test runners and integration testing tools
- Accessibility auditing and fixes
- TypeScript checking and validation

### `deployment/` - Deployment & Release Tools

- Mobile app deployment and store submission
- Git worktree management
- Release automation scripts

### `maintenance/` - Maintenance & Monitoring

- Metrics collection and reporting
- Cleanup and housekeeping scripts
- Documentation maintenance tools

### `performance/` - Performance & Benchmarking

- Benchmarking and performance testing
- Performance monitoring and dashboards
- Optimization analysis tools

## Usage

All tools maintain their original functionality and can be run from their new locations:

```bash
# Example: Run linting coordination
node tools/development/ai-agent-lint-coordinator.mjs

# Example: Analyze bundle size
node tools/build/bundle-analyzer.mjs

# Example: Run performance benchmark
python tools/performance/benchmark_vectorized_synastry.py
```

## Migration Information

- Original files backed up to: ./scripts-backup-2025-09-02
- All npm scripts automatically updated to use new paths
- Total files organized: 66
- Migration completed: 9/2/2025
