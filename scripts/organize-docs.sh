#!/bin/bash

# CosmicHub Documentation Organization Script
# Organizes scattered .md files into proper docs/ structure

echo "🗂️  Organizing CosmicHub documentation..."

# Create subdirectories if they don't exist
mkdir -p docs/implementation-summaries
mkdir -p docs/phase-completions
mkdir -p docs/environment-status

# Move implementation summaries
echo "📝 Moving implementation summaries..."
mv AI_INTERPRETATION_IMPLEMENTATION_SUMMARY.md docs/implementation-summaries/ 2>/dev/null || true
mv CLEANUP_IMPLEMENTATION_SUMMARY.md docs/implementation-summaries/ 2>/dev/null || true
mv ENHANCED_PROFILE_IMPLEMENTATION_SUMMARY.md docs/implementation-summaries/ 2>/dev/null || true
mv TRANSIT_IMPLEMENTATION_SUMMARY.md docs/implementation-summaries/ 2>/dev/null || true
mv XAI_INTEGRATION_SUMMARY.md docs/implementation-summaries/ 2>/dev/null || true
mv FINAL_TODO_COMPLETION_SUMMARY.md docs/implementation-summaries/ 2>/dev/null || true

# Move phase completion docs
echo "🚀 Moving phase completion documents..."
mv PHASE_1_5_COMPLETION_SUMMARY.md docs/phase-completions/ 2>/dev/null || true
mv PHASE_2_COMPLETION_SUMMARY.md docs/phase-completions/ 2>/dev/null || true
mv PHASE_2_VECTORIZATION_COMPLETE.md docs/phase-completions/ 2>/dev/null || true
mv PHASE_3_IMPLEMENTATION_COMPLETE.md docs/phase-completions/ 2>/dev/null || true
mv PHASE_3_MEMORY_OPTIMIZATION_STATUS.md docs/phase-completions/ 2>/dev/null || true
mv PHASE_3_OPTIMIZATION_PLAN.md docs/phase-completions/ 2>/dev/null || true

# Move environment and status docs
echo "🔧 Moving environment and status documents..."
mv ENVIRONMENT_CLEANUP_COMPLETE.md docs/environment-status/ 2>/dev/null || true
mv ERROR_BOUNDARIES_STATUS.md docs/environment-status/ 2>/dev/null || true

# Move operational docs to appropriate locations
echo "🐳 Moving operational documents..."
mv docker-commands.md docs/deployment/ 2>/dev/null || true

echo "✅ Documentation organization complete!"
echo ""
echo "📁 New structure:"
echo "   docs/implementation-summaries/ - Feature implementation summaries"
echo "   docs/phase-completions/ - Development phase completions" 
echo "   docs/environment-status/ - Environment and status reports"
echo "   docs/deployment/docker-commands.md - Docker operational guide"
echo ""
echo "🏠 Remaining in root:"
ls -la *.md 2>/dev/null || echo "   (no .md files - perfect!)"
