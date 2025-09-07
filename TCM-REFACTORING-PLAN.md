# TCMChart Component Refactoring Plan

## 🎯 **Split Strategy: 7 Focused Components**

### **1. Main Container: `TCMChart.tsx` (100-150 lines)**

```tsx
// Core navigation and state management
- Tab navigation logic
- Loading/error states  
- Data prop handling
- Layout structure
```

### **2. Educational System: `TCMEducationDialog.tsx` (100-120 lines)**

```tsx
// Reusable educational content system
- Dialog state management
- Educational content rendering
- Topic-based content switching
- Keyboard accessibility
```

### **3. Tab Components: (50-80 lines each)**

#### `TCMConstitutionTab.tsx`

```tsx
// Constitutional analysis display
- Constitution type rendering
- Personality trait mapping
- Health tendencies
```

#### `TCMElementsTab.tsx`

```tsx
// Five Elements analysis
- Element balance visualization
- Element relationship diagrams
- Seasonal recommendations
```

#### `TCMMeridiansTab.tsx`

```tsx
// Meridian system display
- Meridian mapping
- Energy flow visualization
- Acupuncture point highlights
```

#### `TCMHealthTab.tsx`

```tsx
// Health recommendations
- Lifestyle suggestions
- Dietary recommendations
- Exercise guidance
```

#### `TCMSynthesisTab.tsx`

```tsx
// Integrated analysis
- Combined insights
- Holistic recommendations
- Chart correlations
```

### **4. Shared Utilities: `tcm-utils/` directory**

#### `educationalContent.ts` (200 lines)

```tsx
// Static educational content
- Educational content constants
- Topic mappings
- Type definitions
```

#### `tcmHelpers.ts` (50 lines)

```tsx
// Utility functions
- Element color mapping
- Balance level calculations
- Chart data processing
```

## 📊 **Benefits of This Split:**

### **Performance Improvements:**

- **Lazy loading** - Only load active tab components
- **Focused re-renders** - Educational dialog changes don't affect chart data
- **Better memoization** - Smaller components = more effective React.memo
- **Code splitting** - Reduce initial bundle size

### **Development Benefits:**

- **Easier testing** - Test each tab independently
- **Parallel development** - Multiple developers can work on different tabs
- **Clearer responsibilities** - Each component has one clear purpose
- **Better debugging** - Isolate issues to specific functionality

### **Maintainability:**

- **Single Responsibility** - Each component does one thing well
- **Easier refactoring** - Changes are localized
- **Better type safety** - More specific prop interfaces
- **Reduced cognitive load** - Developers can focus on smaller pieces

## 🚀 **Implementation Strategy:**

### **Phase 1: Extract Utilities** (30 minutes)

1. Move educational content to separate file
2. Extract helper functions
3. Create shared types

### **Phase 2: Educational Dialog** (45 minutes)

1. Create reusable dialog component
2. Implement proper focus management
3. Add keyboard navigation

### **Phase 3: Tab Components** (2-3 hours)

1. Extract each tab to separate component
2. Implement proper memoization
3. Add individual prop interfaces

### **Phase 4: Main Container** (30 minutes)

1. Simplify main component to orchestration
2. Implement lazy loading for tabs
3. Add error boundaries

## 📋 **File Structure:**

```text
components/MultiSystemChart/
├── TCMChart/
│   ├── index.tsx              # Main container (100 lines)
│   ├── TCMEducationDialog.tsx # Educational system (120 lines)
│   ├── tabs/
│   │   ├── ConstitutionTab.tsx (80 lines)
│   │   ├── ElementsTab.tsx     (80 lines)
│   │   ├── MeridiansTab.tsx    (80 lines)
│   │   ├── HealthTab.tsx       (70 lines)
│   │   └── SynthesisTab.tsx    (90 lines)
│   ├── utils/
│   │   ├── educationalContent.ts (200 lines)
│   │   ├── tcmHelpers.ts         (50 lines)
│   │   └── types.ts              (30 lines)
│   └── TCMChart.stories.tsx      # Storybook stories
```

## ⚡ **Expected Outcomes:**

- **60% smaller** individual files (50-120 lines each vs 836)
- **Better performance** through focused memoization
- **Easier testing** with isolated components  
- **Improved developer experience** with clearer code organization
- **Future-proof** for adding new TCM features

---

**Recommendation: Proceed with the split immediately.** The current monolithic structure is technical debt that will only get worse over time.
