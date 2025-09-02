// Simple verification that the import fix worked
const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying import fix for AIChat test...');

// Read the test file
const testFile = path.join(
  __dirname,
  'apps/astro/src/__tests__/AIChat.test.tsx'
);
const testContent = fs.readFileSync(testFile, 'utf8');

// Check for correct import
const hasCorrectApiImport = testContent.includes(
  "import * as apiModule from '../services/api';"
);
const hasGetAuthTokenMock = testContent.includes('getAuthToken: vi.fn()');
const hasCorrectMockedCall = testContent.includes(
  'const mockGetAuthToken = vi.mocked(apiModule.getAuthToken);'
);

console.log('✅ Import verification results:');
console.log(
  `   - Correct API module import: ${hasCorrectApiImport ? '✅' : '❌'}`
);
console.log(
  `   - getAuthToken mock setup: ${hasGetAuthTokenMock ? '✅' : '❌'}`
);
console.log(
  `   - Correct mocked reference: ${hasCorrectMockedCall ? '✅' : '❌'}`
);

// Read the actual API file to verify getAuthToken exists
const apiFile = path.join(__dirname, 'apps/astro/src/services/api.ts');
const apiContent = fs.readFileSync(apiFile, 'utf8');
const hasGetAuthTokenExport = apiContent.includes('export const getAuthToken');

console.log(
  `   - getAuthToken exists in API module: ${hasGetAuthTokenExport ? '✅' : '❌'}`
);

if (
  hasCorrectApiImport &&
  hasGetAuthTokenMock &&
  hasCorrectMockedCall &&
  hasGetAuthTokenExport
) {
  console.log(
    '\n🎉 Import fix successful! The test should now be able to import getAuthToken correctly.'
  );
} else {
  console.log('\n❌ Some issues remain with the import fix.');
}
