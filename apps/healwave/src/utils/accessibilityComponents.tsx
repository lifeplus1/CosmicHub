// Re-export specific components from the canonical filename to prevent
// import path drift (both kebab-case and camelCase variants work), while
// satisfying lint rules that discourage wildcard re-exports in React files.
export {
	AccessibilityLiveRegion,
	AccessibleButton,
	AccessibleSlider,
} from './accessibility-components';
