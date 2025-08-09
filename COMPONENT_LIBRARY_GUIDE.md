# CosmicHub UI Component Library

A comprehensive, accessible React component library built with TypeScript and TailwindCSS.

## 🎨 Components Overview

### Form Components

- **Button** - Accessible button with variants (primary, secondary, outline)
- **Input** - Form input with validation states and ARIA attributes
- **Dropdown** - Select component with keyboard navigation

### Layout Components  

- **Card** - Flexible container with header, content, and footer sections
- **Modal** - WCAG-compliant modal with focus management

### Feedback Components

- **Alert** - Notification component with variants (info, success, warning, error)
- **Loading** - Configurable loading spinner with accessibility labels
- **Spinner** - Advanced loading indicator with multiple sizes
- **Tooltip** - Contextual help component with positioning

### Interactive Components

- **Badge** - Status indicators with color variants and sizes

## 🚀 Usage Examples

### Button Component

```tsx
import { Button } from '@cosmichub/ui';

<Button variant="primary" onClick={handleClick}>
  Click me
</Button>
```

### Form with Input and Dropdown

```tsx
import { Input, Dropdown } from '@cosmichub/ui';

const options = [
  { value: 'option1', label: 'Option 1' },
  { value: 'option2', label: 'Option 2' }
];

<form>
  <Input 
    label="Name" 
    value={name} 
    onChange={setName}
    required 
  />
  <Dropdown 
    options={options}
    value={selected}
    onChange={setSelected}
    placeholder="Choose an option"
  />
</form>
```

### Alert Notifications

```tsx
import { Alert } from '@cosmichub/ui';

<Alert variant="success" title="Success!">
  Your changes have been saved.
</Alert>
```

### Tooltip for Help Text

```tsx
import { Tooltip } from '@cosmichub/ui';

<Tooltip content="This explains the feature" position="top">
  <Button>Hover for help</Button>
</Tooltip>
```

## ♿ Accessibility Features

All components follow WCAG 2.1 AA guidelines:

- **Keyboard Navigation** - Full keyboard support
- **Screen Reader Support** - Proper ARIA labels and roles
- **Focus Management** - Logical focus order and indicators
- **Color Contrast** - Meets contrast requirements
- **Semantic HTML** - Proper element usage

## 🎯 Design System

### Color Variants

- **Primary** - Blue theme for main actions
- **Secondary** - Gray theme for secondary actions  
- **Success** - Green for positive feedback
- **Warning** - Yellow for cautionary messages
- **Error** - Red for error states

### Size System

- **sm** - Small components
- **md** - Medium (default) components
- **lg** - Large components
- **xl** - Extra large components

## 📦 Installation

```bash
npm install @cosmichub/ui
```

## 🔧 Development

```bash

# Build the library

cd packages/ui && npm run build

# Watch for changes during development

npm run dev
```

## 🧪 Testing

Components include comprehensive test coverage:

- Unit tests for functionality
- Accessibility tests with @testing-library
- Visual regression tests
- Keyboard interaction tests

## 📱 Responsive Design

All components are responsive by default:

- Mobile-first approach
- Flexible layouts
- Touch-friendly interactions
- Adaptive typography

Built with ❤️ for the CosmicHub ecosystem.
