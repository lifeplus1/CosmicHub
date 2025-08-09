// Test script to verify module resolution
import { 
  describe,
  it,
  expect,
  renderWithEnhancements 
} from '@cosmichub/config/enhanced-testing';

import { 
  useAccessibilityAuditor 
} from '@cosmichub/config/accessibility-testing';

import { 
  ComponentProvider 
} from '@cosmichub/config/component-architecture';

console.log('✅ All imports resolved successfully!');
console.log('Available enhanced testing utilities:', { describe, it, expect, renderWithEnhancements });
console.log('Available accessibility utilities:', { useAccessibilityAuditor });
console.log('Available component architecture utilities:', { ComponentProvider });
