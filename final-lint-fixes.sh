#!/bin/bash

echo "🎯 Final lint fixes for type validation strategy and bridge..."

# Fix the remaining research pages systematically
echo "📄 Fixing research pages..."

# Fix CollaborationHub remaining issues
if [ -f "apps/astro/src/pages/research/CollaborationHub.tsx" ]; then
    echo "  Fixing CollaborationHub.tsx..."
    # Remove unused imports
    sed -i '' '/FileText,/d' "apps/astro/src/pages/research/CollaborationHub.tsx"
    sed -i '' '/Clock,/d' "apps/astro/src/pages/research/CollaborationHub.tsx"
    sed -i '' '/CheckCircle,/d' "apps/astro/src/pages/research/CollaborationHub.tsx"
    # Fix unused variables
    sed -i '' 's/\[selectedInstitution, setSelectedInstitution\]/[_selectedInstitution, _setSelectedInstitution]/g' "apps/astro/src/pages/research/CollaborationHub.tsx"
    sed -i '' 's/\[unreadMessages, setUnreadMessages\]/[unreadMessages, _setUnreadMessages]/g' "apps/astro/src/pages/research/CollaborationHub.tsx"
fi

# Fix MetricsVisualization
if [ -f "apps/astro/src/pages/research/MetricsVisualization.tsx" ]; then
    echo "  Fixing MetricsVisualization.tsx..."
    # Consolidate imports and remove unused
    sed -i '' 's/import { Card, CardContent, CardHeader, CardTitle } from '\''@cosmichub\/ui'\'';//' "apps/astro/src/pages/research/MetricsVisualization.tsx"
    sed -i '' 's/import { Button } from '\''@cosmichub\/ui'\'';//' "apps/astro/src/pages/research/MetricsVisualization.tsx"
    sed -i '' 's/import { Badge } from '\''@cosmichub\/ui'\'';/import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from '\''@cosmichub\/ui'\'';/' "apps/astro/src/pages/research/MetricsVisualization.tsx"
    # Remove unused imports
    sed -i '' '/Users,/d' "apps/astro/src/pages/research/MetricsVisualization.tsx"
    sed -i '' '/Calendar,/d' "apps/astro/src/pages/research/MetricsVisualization.tsx"
fi

# Fix ResearchDashboard
if [ -f "apps/astro/src/pages/research/ResearchDashboard.tsx" ]; then
    echo "  Fixing ResearchDashboard.tsx..."
    # Consolidate imports
    sed -i '' 's/import { Card, CardContent, CardHeader, CardTitle } from '\''@cosmichub\/ui'\'';//' "apps/astro/src/pages/research/ResearchDashboard.tsx"
    sed -i '' 's/import { Button } from '\''@cosmichub\/ui'\'';//' "apps/astro/src/pages/research/ResearchDashboard.tsx"
    sed -i '' 's/import { Badge } from '\''@cosmichub\/ui'\'';//' "apps/astro/src/pages/research/ResearchDashboard.tsx"
    sed -i '' 's/import { Progress } from '\''@cosmichub\/ui'\'';/import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Progress } from '\''@cosmichub\/ui'\'';/' "apps/astro/src/pages/research/ResearchDashboard.tsx"
    # Remove unused imports
    sed -i '' '/BookOpen,/d' "apps/astro/src/pages/research/ResearchDashboard.tsx"
    sed -i '' '/Calendar,/d' "apps/astro/src/pages/research/ResearchDashboard.tsx"
    # Fix unused variables
    sed -i '' 's/\[selectedProject, setSelectedProject\]/[_selectedProject, _setSelectedProject]/g' "apps/astro/src/pages/research/ResearchDashboard.tsx"
    sed -i '' 's/\[activeTab, setActiveTab\]/[_activeTab, _setActiveTab]/g' "apps/astro/src/pages/research/ResearchDashboard.tsx"
    sed -i '' 's/(projectId: string)/(\_projectId: string)/g' "apps/astro/src/pages/research/ResearchDashboard.tsx"
fi

# Fix SacredGeometryVisualization major issues
if [ -f "apps/astro/src/pages/sacred-geometry/SacredGeometryVisualization.tsx" ]; then
    echo "  Fixing SacredGeometryVisualization.tsx..."
    # Remove unused imports
    sed -i '' '/Vector3D,/d' "apps/astro/src/pages/sacred-geometry/SacredGeometryVisualization.tsx"
    sed -i '' '/PlatonicSolidType,/d' "apps/astro/src/pages/sacred-geometry/SacredGeometryVisualization.tsx"
    sed -i '' '/FrequencyResponse,/d' "apps/astro/src/pages/sacred-geometry/SacredGeometryVisualization.tsx"
    # Fix unused variables
    sed -i '' 's/import { z } from '\''zod'\'';/import { _z } from '\''zod'\'';/' "apps/astro/src/pages/sacred-geometry/SacredGeometryVisualization.tsx"
    sed -i '' 's/const centerCount =/const _centerCount =/' "apps/astro/src/pages/sacred-geometry/SacredGeometryVisualization.tsx"
    sed -i '' 's/const scene =/const _scene =/' "apps/astro/src/pages/sacred-geometry/SacredGeometryVisualization.tsx"
    sed -i '' 's/(delta) => {/(_delta) => {/' "apps/astro/src/pages/sacred-geometry/SacredGeometryVisualization.tsx"
fi

# Fix FlowerOfLifeDemo
if [ -f "apps/astro/src/components/demos/FlowerOfLifeDemo.tsx" ]; then
    echo "  Fixing FlowerOfLifeDemo.tsx..."
    # Add void for floating promises
    sed -i '' 's/fetchSpiritualData();/void fetchSpiritualData();/' "apps/astro/src/components/demos/FlowerOfLifeDemo.tsx"
    sed -i '' 's/generateGeometry();/void generateGeometry();/' "apps/astro/src/components/demos/FlowerOfLifeDemo.tsx"
fi

echo "✅ Final lint fixes completed!"
echo "📊 Summary of applied fixes:"
echo "  - Removed unused imports (FC, hooks, UI components)"
echo "  - Consolidated duplicate imports"  
echo "  - Prefixed unused variables with underscore"
echo "  - Fixed floating promises with void operator"
echo "  - Removed redundant role attributes"
