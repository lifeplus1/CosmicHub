#!/bin/bash

# CosmicHub Documentation Organization Script - Proper Version
# Organizes docs/*.md files into logical subfolders

cd /Users/Chris/Projects/CosmicHub/docs || exit 1

echo "🗂️  Organizing CosmicHub documentation in docs/ folder..."

# Create subdirectories
echo "📁 Creating subdirectories..."
mkdir -p implementation-summaries
mkdir -p feature-guides
mkdir -p development-guides  
mkdir -p architecture-and-planning
mkdir -p system-optimization
mkdir -p project-management

# Move implementation completion summaries
echo "📝 Moving implementation summaries..."
mv IMPLEMENTATION_COMPLETE.md implementation-summaries/ 2>/dev/null || true
mv IMPLEMENTATION_SUMMARY.md implementation-summaries/ 2>/dev/null || true
mv GROK_IMPLEMENTATION_COMPLETE.md implementation-summaries/ 2>/dev/null || true  
mv STRIPE_INTEGRATION_COMPLETE.md implementation-summaries/ 2>/dev/null || true
mv SYNASTRY_IMPLEMENTATION_SUMMARY.md implementation-summaries/ 2>/dev/null || true
mv MULTISYSTEM_CHART_MODULAR_COMPLETE.md implementation-summaries/ 2>/dev/null || true
mv DOCUMENTATION_UPDATES_SUMMARY.md implementation-summaries/ 2>/dev/null || true

# Move feature and component guides
echo "🔧 Moving feature guides..."
mv AUTHENTICATION_IMPLEMENTATION_PLAN.md feature-guides/ 2>/dev/null || true
mv ENHANCED_USER_REGISTRATION.md feature-guides/ 2>/dev/null || true
mv FIREBASE_AUTH_FIX.md feature-guides/ 2>/dev/null || true
mv FREEMIUM_STRATEGY.md feature-guides/ 2>/dev/null || true
mv MOCK_LOGIN_GUIDE.md feature-guides/ 2>/dev/null || true
mv STRIPE_TESTING_GUIDE.md feature-guides/ 2>/dev/null || true
mv GROK_PROMPTS_READY_TO_USE.md feature-guides/ 2>/dev/null || true

# Move development and architecture guides  
echo "🏗️ Moving development guides..."
mv AI_INTERPRETATION_REFACTORING.md development-guides/ 2>/dev/null || true
mv AI_MODEL_RECOMMENDATIONS.md development-guides/ 2>/dev/null || true
mv COMPONENT_ARCHITECTURE_GUIDE.md development-guides/ 2>/dev/null || true
mv ERROR_HANDLING_IMPLEMENTATION.md development-guides/ 2>/dev/null || true
mv PERFORMANCE_MONITORING_GUIDE.md development-guides/ 2>/dev/null || true
mv REACT_PERFORMANCE_GUIDE.md development-guides/ 2>/dev/null || true
mv SECURITY_GUIDE.md development-guides/ 2>/dev/null || true
mv GITHUB_COPILOT_CHAT_MODEL_USE_CASES.md development-guides/ 2>/dev/null || true

# Move architecture and planning docs
echo "📐 Moving architecture and planning docs..."
mv CONSOLIDATION_PLAN.md architecture-and-planning/ 2>/dev/null || true
mv PROJECT_STRUCTURE.md architecture-and-planning/ 2>/dev/null || true
mv PROJECT_SUMMARY.md architecture-and-planning/ 2>/dev/null || true
mv STRUCTURE_CLEANUP_PLAN.md architecture-and-planning/ 2>/dev/null || true
mv DEPLOYMENT_VALIDATION_REPORT.md architecture-and-planning/ 2>/dev/null || true
mv ENVIRONMENT.md architecture-and-planning/ 2>/dev/null || true

# Move system optimization docs
echo "⚡ Moving system optimization docs..."
mv GENE_KEYS_OPTIMIZATION.md system-optimization/ 2>/dev/null || true
mv NUMEROLOGY_CALCULATOR_REFACTORING.md system-optimization/ 2>/dev/null || true
mv PEARL_SEQUENCE_RENAME.md system-optimization/ 2>/dev/null || true
mv PHASE_4_PRODUCTION_OPTIMIZATION.md system-optimization/ 2>/dev/null || true
mv SYNASTRY_ANALYSIS_OPTIMIZATION.md system-optimization/ 2>/dev/null || true
mv FRONTEND_FUNCTIONALITY_GAPS.md system-optimization/ 2>/dev/null || true

# Move project management docs
echo "📋 Moving project management docs..."
mv AGENT_CHANGELOG.md project-management/ 2>/dev/null || true
mv BUDGET_OPTIMIZATION.md project-management/ 2>/dev/null || true

echo ""
echo "✅ Documentation organization complete!"
echo ""
echo "📁 New structure:"
echo "   📝 implementation-summaries/ - Feature implementation completion docs"
echo "   🔧 feature-guides/ - Feature-specific implementation guides"
echo "   🏗️ development-guides/ - Development best practices and architecture"
echo "   📐 architecture-and-planning/ - Project structure and planning docs"
echo "   ⚡ system-optimization/ - Performance and optimization guides"
echo "   📋 project-management/ - Project management and changelog docs"
echo ""
echo "🏠 Remaining in docs root:"
ls -la *.md 2>/dev/null | head -10
echo ""
echo "📊 Organization summary:"
echo "   $(find implementation-summaries/ -name "*.md" 2>/dev/null | wc -l | tr -d ' ') files in implementation-summaries/"
echo "   $(find feature-guides/ -name "*.md" 2>/dev/null | wc -l | tr -d ' ') files in feature-guides/"
echo "   $(find development-guides/ -name "*.md" 2>/dev/null | wc -l | tr -d ' ') files in development-guides/"
echo "   $(find architecture-and-planning/ -name "*.md" 2>/dev/null | wc -l | tr -d ' ') files in architecture-and-planning/"
echo "   $(find system-optimization/ -name "*.md" 2>/dev/null | wc -l | tr -d ' ') files in system-optimization/"
echo "   $(find project-management/ -name "*.md" 2>/dev/null | wc -l | tr -d ' ') files in project-management/"
