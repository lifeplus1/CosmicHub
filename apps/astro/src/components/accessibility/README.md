# Accessibility Components

## VisuallyHidden

A reusable component for rendering content that is available to assistive technologies but hidden
visually.

### Usage

```tsx
import { VisuallyHidden } from '@/components/accessibility/VisuallyHidden';

<button aria-label='Save' onClick={handleSave}>
  <IconSave />
  <VisuallyHidden>Save chart</VisuallyHidden>
</button>;
```

For live regions:

```tsx
<VisuallyHidden as='div' role='status' aria-live='polite'>
  Updated at {timestamp}
</VisuallyHidden>
```

Focusable (e.g., skip link):

```tsx
<a href='#main' className='skip-link'>
  <VisuallyHidden focusable>Skip to main content</VisuallyHidden>
</a>
```

### CSS Utilities

Add these utilities globally (e.g., in a base CSS / Tailwind layer):

```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
  border: 0;
}
.sr-only-focusable:focus,
.sr-only-focusable:active {
  position: static;
  width: auto;
  height: auto;
  margin: 0;
  overflow: visible;
  clip: auto;
  white-space: normal;
}
```

If using Tailwind, extend via `@layer utilities`.

### When to Use

- Live updates not needed visually
- Descriptive text for icon-only controls
- Status announcements (`role="status"`, `aria-live`)
- Skip navigation links

### When Not to Use

- Hiding interactive or focusable elements permanently
- Purely decorative content (instead add `aria-hidden="true"`)

### Testing

Use a screen reader (VoiceOver, NVDA, JAWS) to confirm content is announced.
