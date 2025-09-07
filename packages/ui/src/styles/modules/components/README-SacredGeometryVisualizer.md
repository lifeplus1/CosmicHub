# Sacred Geometry Visualizer - CSS Module Documentation

## Overview

The `SacredGeometryVisualizer` component has been refactored to use CSS modules instead of inline styles, following the central styles approach with Tailwind/Radix UI theme integration.

## Files Structure

```text
packages/ui/src/
├── components/
│   └── SacredGeometryVisualizer.tsx          # Main component
└── styles/
    └── modules/
        └── components/
            ├── SacredGeometryVisualizer.module.css      # CSS module
            └── SacredGeometryVisualizer.module.css.d.ts # TypeScript types
```

## CSS Classes Available

### Layout Classes

- `visualizerContainer` - Main container wrapper
- `canvasContainer` - 3D canvas container with cosmic gradient background

### Height Variations

- `canvasContainerDefault` - 500px height
- `canvasContainerSmall` - 300px height
- `canvasContainerMedium` - 400px height
- `canvasContainerLarge` - 600px height
- `canvasContainerFull` - 100vh height

### Control Elements

- `expertControls` - Expert mode controls panel
- `controlsTitle` - Controls section title
- `controlGroup` - Control input group wrapper
- `controlLabel` - Input labels
- `animationSpeedSlider` - Range input for animation speed
- `checkboxGroup` - Checkbox container
- `checkboxInput` - Checkbox input styling
- `checkboxLabel` - Checkbox label styling

### Display Elements

- `goldenRatioDisplay` - Golden ratio analysis panel
- `goldenRatioTitle` - Analysis section title
- `goldenRatioValue` - Phi ratio value display
- `resonanceText` - Resonance percentage text

## Theme Integration

The CSS module uses Tailwind's `theme()` function to access cosmic theme colors:

- `theme('colors.cosmic.dark')` - #0f0f23
- `theme('colors.cosmic.blue')` - #1a202c
- `theme('colors.cosmic.purple')` - #553c9a
- `theme('colors.cosmic.silver')` - #e2e8f0

## Responsive Design

Mobile breakpoints are included with adjusted spacing and sizing for screens < 768px width.

## Accessibility Features

- Focus states for interactive elements
- Proper contrast ratios
- Screen reader friendly structure

## Browser Compatibility

Includes `-webkit-backdrop-filter` prefixes for Safari support on backdrop blur effects.

## Usage Example

```tsx
import { SacredGeometryVisualizer } from './SacredGeometryVisualizer';
import styles from '../styles/modules/components/SacredGeometryVisualizer.module.css';

// Component automatically applies appropriate classes
<SacredGeometryVisualizer 
  data={geometryData}
  height="600px"           // Uses canvasContainerLarge class
  expertMode={true}
  showControls={true}
  className="custom-class"
/>
```

## Benefits

1. **Performance**: No runtime style calculations
2. **Type Safety**: TypeScript definitions for all classes
3. **Maintainability**: Centralized styling approach
4. **Theme Consistency**: Integrated with cosmic design system
5. **Responsive**: Mobile-optimized layouts
6. **Accessibility**: Built-in focus and contrast management
