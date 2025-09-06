# 🎨 Centralized CSS Module System

## Quick Start

All CSS modules are now centralized in `packages/ui/src/styles/modules/` and can be imported using:

```typescript
import { stylesModules } from '@cosmichub/ui';

// Use any centralized style module
const styles = stylesModules.componentNameStyles;
```

## Available Style Modules

- `enhancedCardStyles` - Enhanced card component styles
- `durationTimerStyles` - Duration timer component styles
- `userProfileStyles` - User profile component styles
- `progressBarStyles` - Progress bar component styles
- `virtualizedDataTableStyles` - Virtualized data table styles
- `audioPlayerStyles` - Audio player component styles
- `chartWheelUnifiedStyles` - Chart wheel feature styles
- `aiInterpretationsStyles` - AI interpretations page styles
- `enhancedCardTestStyles` - Test-specific styles

## Directory Structure

```
packages/ui/src/styles/modules/
├── index.ts                     # Central export file
├── components/                  # Component-specific styles
├── features/                    # Feature-specific styles
└── pages/                       # Page-specific styles
```

## Migration Status: ✅ COMPLETE

All `.module.css` files have been successfully migrated to the centralized theme system with updated
import statements.
