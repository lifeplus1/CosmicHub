# UI Components Guide - CosmicHub Design System

## Overview

CosmicHub uses a comprehensive design system built on **Tailwind CSS 3.4.17** and **Radix UI** components, with a custom cosmic theme that creates an immersive astrological experience.

## Design System Architecture

### 1. Tailwind CSS Configuration

- **Version**: 3.4.17
- **Custom Theme**: Cosmic color palette with space-themed styling
- **Responsive Design**: Mobile-first approach with breakpoints
- **Dark Mode**: Full dark mode support with cosmic aesthetics

### 2. Component Library Structure

```text
packages/ui/
├── src/
│   ├── components/
│   │   ├── Button.tsx       # Enhanced button with 7 variants
│   │   ├── Modal.tsx        # Accessible modal dialogs
│   │   ├── Dropdown.tsx     # Enhanced dropdowns with keyboard nav
│   │   ├── Card.tsx         # Content containers
│   │   └── Input.tsx        # Form inputs
│   └── index.ts
└── package.json
```

## Component Documentation

### Button Component

**Location**: `packages/ui/src/components/Button.tsx`

#### Variants (7 total)

- `default` - Primary cosmic gold styling
- `destructive` - Red warning/danger actions
- `outline` - Outlined border style
- `secondary` - Muted secondary actions
- `ghost` - Minimal hover-only styling
- `link` - Link-style button
- `cosmic` - Special cosmic gradient effect

#### Sizes (4 total)

- `sm` - Small buttons (32px height)
- `default` - Standard buttons (40px height)
- `lg` - Large buttons (44px height)
- `icon` - Square icon buttons

#### Button Usage Example

```tsx
import { Button } from '@cosmichub/ui';

<Button variant="cosmic" size="lg">
  🚀 Generate Analysis
</Button>
```

#### Enhanced Features

- ✅ Full TypeScript support
- ✅ Accessibility compliant (ARIA attributes)
- ✅ Loading states with spinners
- ✅ Icon support
- ✅ Custom cosmic theme integration
- ✅ Responsive behavior

### Modal Component

**Location**: `packages/ui/src/components/Modal.tsx`

#### Dropdown Features

- **Accessibility**: Full ARIA support, focus trap, escape key handling
- **Size Variants**: sm, md, lg, xl for different content needs
- **Backdrop**: Blur effect with cosmic styling
- **Animation**: Smooth enter/exit transitions

#### Modal Usage Example

```tsx
import { Modal } from '@cosmichub/ui';

<Modal 
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  size="lg"
  title="Chart Analysis"
>
  <p>Your cosmic insights await...</p>
</Modal>
```

### Dropdown Component

**Location**: `packages/ui/src/components/Dropdown.tsx`

#### Features

- **Keyboard Navigation**: Arrow keys, Enter, Escape support
- **Accessibility**: Proper ARIA labeling and roles
- **Error States**: Visual error indicators
- **Custom Styling**: Cosmic theme integration

#### Usage Example

```tsx
import { Dropdown } from '@cosmichub/ui';

<Dropdown
  options={['Option 1', 'Option 2']}
  value={selectedValue}
  onChange={setSelectedValue}
  placeholder="Select an option"
/>
```

## Cosmic Theme Colors

### Primary Palette

- `cosmic-dark`: #0a0a0f (Deep space background)
- `cosmic-purple`: #6366f1 (Primary accent color)
- `cosmic-gold`: #fbbf24 (Highlight/emphasis color)
- `cosmic-silver`: #e5e7eb (Primary text color)
- `cosmic-blue`: #3b82f6 (Secondary accent)
- `cosmic-green`: #10b981 (Success/growth states)

### Usage in Components

```css
/* Glass morphism effect */
.cosmic-glass {
  @apply bg-black/20 backdrop-blur-md border border-white/10;
}

/* Gradient backgrounds */
.cosmic-gradient {
  background: linear-gradient(135deg, 
    theme('colors.cosmic-purple'), 
    theme('colors.cosmic-blue')
  );
}
```

## Advanced Components

### AI001Dashboard Component ✅ COMPLETE

**Location**: `apps/astro/src/components/AI001/AI001Dashboard.tsx`

#### Component Overview

The AI001Dashboard is CosmicHub's flagship advanced AI component, featuring a comprehensive multi-tab interface for Next-Generation AI Features. This production-ready component demonstrates enterprise-level best practices for:

- **Advanced AI Integration**: 5 distinct AI-powered analysis features
- **Tab Navigation**: Dynamic content switching with cosmic theming
- **Loading States**: Sophisticated skeleton screens and progress indicators
- **Error Handling**: Graceful error boundaries with user-friendly messaging
- **Data Visualization**: Progress bars and interactive status indicators
- **Responsive Design**: Mobile-optimized layouts with touch-friendly controls
- **Performance**: React Query caching and optimistic UI updates

#### Architecture & Features

**🔮 Five Core AI-001 Features:**

1. **Predictive Transit Analysis**
   - AI-powered timing recommendations
   - Interactive timeline visualization
   - Confidence scoring and uncertainty indicators

2. **AI Question Answering System**
   - Natural language astrology consultations
   - Context-aware responses with chart integration
   - Conversation history and follow-up suggestions

3. **Multi-System Synthesis**
   - Cross-cultural interpretation fusion (Western, Vedic, Chinese)
   - Universal themes identification
   - Cultural context explanations

4. **Personal Growth Coaching**
   - AI-driven developmental insights
   - Actionable recommendations with progress tracking
   - Goal-setting and milestone celebration

5. **Pattern Recognition**
   - Advanced chart pattern detection
   - Historical correlation analysis
   - Predictive pattern matching

#### Technical Implementation

```tsx
// State management with TypeScript strict mode
const [activeTab, setActiveTab] = useState<'overview' | 'transits' | 'growth' | 'synthesis' | 'patterns'>('overview');

// AI-001 service integration
const {
  data: analysisData,
  isLoading,
  error
} = useAI001Analysis(chartData);

// Enhanced button navigation with cosmic styling
<Button
  key={tab.id}
  onClick={() => setActiveTab(tab.id)}
  className={`${
    activeTab === tab.id
      ? 'bg-cosmic-gold text-cosmic-dark'
      : 'bg-cosmic-purple/20 text-cosmic-silver hover:bg-cosmic-purple/30'
  } transition-colors duration-200`}
>
  {tab.icon} {tab.label}
</Button>

// Progress visualization with existing ProgressBar component
<ProgressBar 
  progress={insight.metrics.progress}
  className="w-full"
/>
```

#### Integration Points

- **ChartDisplay**: Toggle visibility with "Show AI-001" button
- **AIChat**: Enhanced mode switcher for AI-001 features
- **ai-001-enhanced.ts**: Service layer with React hooks
- **Backend**: ai_001_enhanced.py API endpoints

#### Performance Features

- **React Query**: Intelligent caching and background updates
- **Skeleton Loading**: Non-blocking UI during AI processing
- **Error Boundaries**: Graceful degradation with retry mechanisms
- **Optimistic Updates**: Immediate UI feedback for better UX
</Button>

```text

#### Sub-components:
- **OverviewTab**: Executive summary with key metrics
- **TransitsTab**: Predictive analysis with expandable cards
- **GrowthTab**: Personal development insights
- **TransitCard**: Individual transit predictions
- **GrowthInsightCard**: Growth milestone tracking

## Implementation Standards

### 1. TypeScript Usage
- All components use strict TypeScript
- Comprehensive prop interfaces
- Generic type support where appropriate

### 2. Accessibility Requirements
- ARIA labels and roles
- Keyboard navigation support
- Screen reader compatibility
- Focus management
- Color contrast compliance

### 3. Performance Optimization
- Lazy loading for large components
- Memoization for expensive calculations
- Efficient re-render patterns
- Bundle size optimization

### 4. Testing Standards
- Component unit tests
- Accessibility testing
- Visual regression testing
- Cross-browser compatibility

## Migration Status

### ✅ Completed Enhancements:
- Enhanced Button component with 7 variants and 4 sizes
- Improved Modal with full accessibility and size variants
- Enhanced Dropdown with keyboard navigation
- AI001Dashboard syntax fixes and optimization
- Comprehensive TypeScript typing

### ⚠️ In Progress:
- Class-variance-authority dependency resolution
- Radix UI component integration
- Cross-app component sharing optimization

### 🔄 Next Steps:
1. Complete Radix UI integration for enhanced accessibility
2. Create Storybook documentation for visual component testing
3. Implement component performance monitoring
4. Expand cosmic theme variations for different app sections

## Dependencies

### Core Dependencies:
```json
{
  "@radix-ui/react-dialog": "^1.1.2",
  "@radix-ui/react-dropdown-menu": "^2.1.2",
  "@radix-ui/react-select": "^2.1.2",
  "clsx": "^2.1.1",
  "tailwind-merge": "^2.5.4",
  "class-variance-authority": "^0.7.0"
}
```

### Development Dependencies

```json
{
  "tailwindcss": "^3.4.17",
  "@types/react": "^18.3.12",
  "typescript": "^5.6.3"
}
```

## Usage Guidelines

### 1. Component Import Pattern

```tsx
import { Button, Modal, Dropdown, Card } from '@cosmichub/ui';
```

### 2. Styling Approach

- Use Tailwind utility classes
- Leverage cosmic theme variables
- Apply glass morphism effects for depth
- Maintain consistent spacing with space scale

### 3. State Management

- Use React hooks for component state
- Implement proper loading and error states
- Handle edge cases gracefully

### 4. Responsive Design

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Responsive grid layout */}
</div>
```

## Troubleshooting

### Common Issues

1. **Import Resolution Errors**:
   - Ensure `@cosmichub/ui` is properly installed
   - Check TypeScript path mapping in tsconfig.json

2. **Styling Not Applied**:
   - Verify Tailwind CSS is configured
   - Check cosmic theme variables are loaded

3. **Accessibility Warnings**:
   - Ensure ARIA labels are provided
   - Test keyboard navigation
   - Verify color contrast ratios

### Support

- Review component source code in `packages/ui/src/components/`
- Check console for runtime warnings
- Test with screen readers for accessibility compliance

---

**Last Updated**: August 25, 2025
**Version**: 2.1.0
**Maintainer**: CosmicHub Development Team
