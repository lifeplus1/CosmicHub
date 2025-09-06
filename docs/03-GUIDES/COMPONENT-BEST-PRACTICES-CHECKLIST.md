---
title: Component Best Practices Checklist
category: guides
status: active
last_reviewed: 2025-09-04
---

## Component Best Practices Checklist

## Performance & Optimization

### Virtualization

- [ ] **Large Lists** - Use `VirtualizedList` for >100 items
- [ ] **Data Tables** - Use `VirtualizedDataTable` for >1000 rows
- [ ] **Chart Data** - Virtualize when >40 planets, >60 asteroids
- [ ] **Infinite Scroll** - Implement for paginated data
- [ ] **Window-based Rendering** - Only render visible items

### Memoization

- [ ] **React.memo** - Wrap pure components with stable props
- [ ] **useMemo** - Cache expensive calculations (>16ms)
- [ ] **useCallback** - Stable function references for child props
- [ ] **Component Splitting** - Break heavy components into smaller ones
- [ ] **Prop Drilling** - Avoid unnecessary re-renders

### Lazy Loading & Code Splitting

- [ ] **Route-based Splitting** - All pages lazy loaded via `lazy-routes.tsx`
- [ ] **Component Splitting** - Heavy components (charts, modals, forms)
- [ ] **Suspense Boundaries** - Proper fallbacks with loading states
- [ ] **Error Boundaries** - Wrap lazy components with error handling
- [ ] **Preloading** - Smart preload on hover/intersection
- [ ] **Progressive Loading** - Load data in batches for large datasets

### Bundle Optimization

- [ ] **Tree Shaking** - Named imports only (`import { Component }`)
- [ ] **Dynamic Imports** - Use `import()` for conditional features
- [ ] **External Dependencies** - Minimize bundle size impact
- [ ] **Chunk Splitting** - Separate vendor, UI, and feature chunks
- [ ] **Asset Optimization** - Lazy load images, optimize sizes

## Accessibility (WCAG 2.1 AA)

### 🎯 Core Requirements

- [ ] **Semantic HTML** - Proper heading hierarchy, landmarks
- [ ] **ARIA Labels** - All interactive elements properly labeled
- [ ] **ARIA Roles** - Correct roles for custom components
- [ ] **Keyboard Navigation** - Full keyboard accessibility (Tab, Enter, Escape)
- [ ] **Focus Management** - Visible focus indicators, logical tab order
- [ ] **Screen Reader** - Compatible with assistive technologies

### 🎨 Visual Accessibility

- [ ] **Color Contrast** - Minimum 4.5:1 ratio for text
- [ ] **Focus Indicators** - Visible focus rings (not removed)
- [ ] **Reduced Motion** - Respect `prefers-reduced-motion`
- [ ] **Text Scaling** - Support 200% zoom without horizontal scroll
- [ ] **Color Independence** - Don't rely solely on color for meaning

### 📱 Interactive Accessibility

- [ ] **Touch Targets** - Minimum 44px touch targets on mobile
- [ ] **Error Messages** - Descriptive, linked to form fields
- [ ] **Loading States** - Announce dynamic content changes
- [ ] **Skip Links** - Navigation bypass for keyboard users

## Type Safety & Validation

### 📝 TypeScript Strict Mode

- [ ] **Strict Configuration** - Enable all strict mode options
- [ ] **No Any Types** - Use proper typing or unknown/object
- [ ] **Prop Types** - Interface definitions for all props
- [ ] **Generic Components** - Type-safe reusable components
- [ ] **Type Guards** - Runtime type validation where needed
- [ ] **Branded Types** - Use nominal typing for domain types

### 🔍 Zod Validation

- [ ] **Input Validation** - All form inputs validated with Zod schemas
- [ ] **API Response** - Validate external data with Zod
- [ ] **Chart Data** - Validate astrology data integrity
- [ ] **User Input** - Sanitize and validate all user input
- [ ] **Error Handling** - Proper error messages for validation failures

### 🐍 Pylance (Python)

- [ ] **Type Annotations** - All functions have return type hints
- [ ] **Strict Mode** - Enable strict type checking
- [ ] **Import Resolution** - Proper module imports and exports
- [ ] **Pydantic Models** - Use for data validation and serialization

## Tailwind CSS & Radix UI Integration

### 🎨 Design System & Theming

- [ ] **Cosmic Theme Tokens** - Use shared theme from `tailwind.config.shared.ts`
- [ ] **Design Token Consistency** - Colors, spacing, typography from design system
- [ ] **Dark Mode Support** - Implement cosmic dark theme (`cosmic-dark`, `cosmic-blue`)
- [ ] **Semantic Color Usage** - Use `cosmic.*` and `chart.*` color palette
- [ ] **Typography Scale** - Use font families: `cinzel`, `playfair`, `inter`, `source-sans`
- [ ] **Consistent Spacing** - Use Tailwind spacing scale (4, 8, 12, 16, 24, 32px)

### 🧩 Radix UI Component Integration

- [ ] **Accessible Primitives** - Use Radix UI for complex interactions
  - `@radix-ui/react-dialog` for modals and overlays
  - `@radix-ui/react-tabs` for navigation and content organization
  - `@radix-ui/react-accordion` for collapsible content
  - `@radix-ui/react-slider` for range inputs
  - `@radix-ui/react-tooltip` for contextual information
  - `@radix-ui/react-switch` for toggle controls
- [ ] **Custom Styling** - Apply Tailwind classes to Radix components
- [ ] **State-based Styling** - Use `data-*` attributes for component states
- [ ] **Theme Integration** - Ensure Radix components match cosmic theme
- [ ] **Compound Components** - Proper composition of Radix primitives

### 🚀 Advanced Tailwind Patterns

- [ ] **Custom Animations** - Use cosmic-specific animations:
  - `animate-float` for floating elements
  - `animate-shimmer` for loading states
  - `animate-planet-hover` for chart interactions
  - `animate-aspect-draw` for line drawing effects
  - `animate-chart-zoom` for zoom transitions
- [ ] **Gradient Backgrounds** - Use chart gradient patterns for visual hierarchy
- [ ] **Backdrop Blur Effects** - Use `backdrop-blur-lg` for glass morphism
- [ ] **Custom CSS Properties** - Extend with CSS variables for dynamic theming
- [ ] **Responsive Design** - Mobile-first with cosmic breakpoints

### 🎯 Cosmic-Specific UI Patterns

- [ ] **Chart Color Consistency** - Use `chart.*` colors for astrology elements:
  - Planet colors (`chart.sun`, `chart.moon`, etc.)
  - Aspect colors (`chart.conjunction`, `chart.opposition`, etc.)
  - Background gradients (`chart.bg-start`, `chart.bg-end`)
- [ ] **Progress Components** - Use cosmic progress color scheme
- [ ] **Interactive States** - Hover, focus, active states with cosmic colors
- [ ] **Glass Morphism** - Use backdrop blur with cosmic transparency
- [ ] **Floating Elements** - Apply cosmic float animation for ambient effects

### 🔧 Tailwind Optimization

- [ ] **Purge Unused Styles** - Configure content paths correctly
- [ ] **Component Classes** - Extract common patterns to `@apply` directives
- [ ] **Utility-First** - Prefer utilities over custom CSS
- [ ] **Performance** - Monitor bundle size impact
- [ ] **JIT Mode** - Use Just-In-Time compilation for faster builds

### 📱 Responsive & Adaptive Design

- [ ] **Breakpoint Strategy** - Mobile-first responsive design
- [ ] **Container Queries** - Use when appropriate for component-based sizing
- [ ] **Touch-Friendly** - Ensure touch targets meet accessibility standards
- [ ] **Viewport Adaptation** - Handle different screen sizes gracefully
- [ ] **Print Styles** - Consider print-friendly versions when applicable

### 🌙 Dark Mode & Theme Switching

- [ ] **System Preference** - Respect `prefers-color-scheme`
- [ ] **Manual Toggle** - Provide theme switching capability
- [ ] **Persistent State** - Remember user theme preference
- [ ] **Smooth Transitions** - Animate theme changes
- [ ] **Color Contrast** - Maintain accessibility in both themes

## Caching & Data Management

### 🗄️ Redis Caching

- [ ] **Psychology Cache** - Cache AI analysis results (1h TTL)
- [ ] **Chart Data** - Cache calculated charts (30m TTL)
- [ ] **User Sessions** - Cache user preferences and state
- [ ] **API Responses** - Cache expensive computations
- [ ] **Fallback Strategy** - In-memory cache when Redis unavailable
- [ ] **Cache Invalidation** - Proper cache key management

### 💾 Data Serialization

- [ ] **Parquet Export** - Dual-format capability (JSON + Parquet)
- [ ] **Size Optimization** - Remove undefined/null fields (30-40% reduction)
- [ ] **Type-Safe Serialization** - Zod/Pydantic schema validation
- [ ] **Compression** - Use gzip for network transfers
- [ ] **Backward Compatibility** - Version-aware serialization

## Error Handling & Resilience

### 🛡️ Error Boundaries

- [ ] **Component Level** - Wrap lazy-loaded components
- [ ] **Page Level** - Global error boundary for unhandled errors
- [ ] **Fallback UI** - User-friendly error displays
- [ ] **Error Recovery** - Reset/retry mechanisms
- [ ] **Error Reporting** - Log errors with context

### 🚨 Error States

- [ ] **Loading States** - Show meaningful progress indicators
- [ ] **Empty States** - Handle no-data scenarios gracefully
- [ ] **Network Errors** - Offline support and retry logic
- [ ] **Form Validation** - Clear, actionable error messages
- [ ] **API Errors** - Proper HTTP status handling

## Testing Coverage

### 🧪 Unit Tests

- [ ] **Component Logic** - Test component behavior and state
- [ ] **Utility Functions** - Test pure functions and calculations
- [ ] **Hooks** - Test custom React hooks
- [ ] **95%+ Coverage** - Aim for high test coverage
- [ ] **Edge Cases** - Test error conditions and boundaries

### 🔗 Integration Tests

- [ ] **API Integration** - Test backend/frontend communication
- [ ] **Database Operations** - Test data persistence
- [ ] **User Flows** - Test complete user journeys
- [ ] **Cross-System** - Test astrology calculation pipelines

### 🎭 Accessibility Tests

- [ ] **vitest-axe** - Automated a11y testing
- [ ] **Keyboard Testing** - Manual keyboard navigation tests
- [ ] **Screen Reader** - Test with assistive technologies
- [ ] **WCAG Compliance** - Validate against standards

### 📊 Visual Regression

- [ ] **Component Snapshots** - Visual consistency tests
- [ ] **Storybook** - Component documentation and testing
- [ ] **Cross-browser** - Test on different browsers/devices

## Logging & Monitoring

### 📝 Structured Logging

- [ ] **Component Lifecycle** - Log component mount/unmount
- [ ] **User Interactions** - Track button clicks, form submissions
- [ ] **Performance Metrics** - Log render times, API calls
- [ ] **Error Context** - Include component stack and props
- [ ] **Debug Information** - Development vs production logging

### 📈 Analytics & Metrics

- [ ] **User Behavior** - Track feature usage
- [ ] **Performance Monitoring** - Core Web Vitals tracking
- [ ] **Error Rates** - Monitor error frequency
- [ ] **Chart Calculations** - Track astrology computation metrics
- [ ] **AI Interactions** - Monitor AI-001 feature usage

## Security & Privacy

### 🔒 Data Protection

- [ ] **Input Sanitization** - Prevent XSS attacks
- [ ] **Authentication** - Secure Firebase Auth integration
- [ ] **Authorization** - Role-based access control
- [ ] **Sensitive Data** - Never log personal information
- [ ] **HTTPS Only** - Secure data transmission

### 🛡️ Component Security

- [ ] **Prop Validation** - Validate all props at runtime
- [ ] **Content Security** - Safe rendering of dynamic content
- [ ] **External Links** - Use `rel="noopener noreferrer"`
- [ ] **File Uploads** - Validate file types and sizes

## Mobile & Responsive Design

### 📱 Mobile Optimization

- [ ] **Touch Targets** - 44px minimum size
- [ ] **Responsive Breakpoints** - xs/sm/md/lg/xl/2xl support
- [ ] **Performance** - Smooth 60fps on mobile devices
- [ ] **Reduced Animations** - Performance-conscious mobile animations
- [ ] **Offline Support** - PWA capabilities for core features

### 🎨 Progressive Enhancement

- [ ] **Core Functionality** - Works without JavaScript
- [ ] **Feature Detection** - CSS @supports queries
- [ ] **Graceful Degradation** - Fallbacks for unsupported features

## Component Architecture

### 🏗️ Design System Compliance

- [ ] **Atomic Design** - Follow atoms → molecules → organisms → templates pattern
- [ ] **Component Composition** - Use compound component patterns with Radix UI
- [ ] **Style Consistency** - Maintain visual consistency across all components
- [ ] **Reusable Patterns** - Create reusable UI patterns and document them
- [ ] **Brand Alignment** - Ensure all components reflect cosmic/astrology branding

### 🔧 Component Structure

- [ ] **Single Responsibility** - One purpose per component
- [ ] **Composition over Inheritance** - Use composition with Radix primitives
- [ ] **Prop Interface** - Clear, documented prop interfaces with TypeScript
- [ ] **Default Props** - Sensible defaults for optional props
- [ ] **Forward Refs** - When component wraps DOM elements or Radix primitives
- [ ] **Polymorphic Components** - Support `as` prop for flexible element types

## Development Experience

### 🛠️ Developer Tools

- [ ] **ESLint Rules** - Zero warnings policy
- [ ] **Prettier Config** - Consistent code formatting
- [ ] **TypeScript Strict** - All strict mode options enabled
- [ ] **Import Organization** - Consistent import ordering
- [ ] **Documentation** - JSDoc comments for complex components

### 🔍 Code Quality

- [ ] **Meaningful Names** - Clear variable and function names
- [ ] **Small Functions** - Functions under 20 lines when possible
- [ ] **No Magic Numbers** - Use named constants
- [ ] **Consistent Patterns** - Follow established conventions
- [ ] **Remove Dead Code** - Clean up unused imports/variables

## Astrology-Specific Patterns

### 📊 Chart Components

- [ ] **Data Validation** - Validate birth data and coordinates
- [ ] **Calculation Caching** - Cache expensive ephemeris calculations
- [ ] **Multi-System Support** - Handle different astrology systems
- [ ] **Precision Handling** - Proper degree/minute formatting
- [ ] **Error Recovery** - Graceful handling of calculation failures

### 🔮 AI Integration

- [ ] **Prompt Engineering** - Structured prompts for AI analysis
- [ ] **Context Management** - Maintain conversation context
- [ ] **Rate Limiting** - Prevent API abuse
- [ ] **Fallback Responses** - Handle AI service failures
- [ ] **Privacy** - Don't log personal birth data in AI requests

---

## Quick Checklist Commands

```bash
# Run quality checks
pnpm run qa

# Type checking
pnpm run type-check

# Accessibility testing
pnpm run test:a11y

# Performance profiling
pnpm run test:ui

# Coverage reporting
pnpm run coverage:report
```

## Priority Levels

🔴 **Critical** - Security, Accessibility, Type Safety  
🟡 **High** - Performance, Testing, Error Handling  
🟢 **Medium** - Logging, Code Quality, Documentation  
🔵 **Low** - Advanced Optimizations, Nice-to-have Features

---

**Remember**: This checklist should be used during code reviews and component development. Focus on
critical and high-priority items first, then gradually implement medium and low-priority
improvements.
