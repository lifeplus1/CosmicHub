# CosmicHub Lint Configuration & Guidelines

## Overview

This document consolidates all linting configurations, guidelines, and best practices for the
CosmicHub project.

## Current Lint Configuration

### Frontend (TypeScript/React)

**Configuration File**: `eslint.config.js` **Type**: ESLint Flat Config (Modern)

#### Core Rules Enabled

```javascript
// Key rule categories
{
  // Type Safety
  '@typescript-eslint/no-explicit-any': 'error',
  '@typescript-eslint/no-unsafe-assignment': 'error',
  '@typescript-eslint/no-unsafe-member-access': 'error',
  '@typescript-eslint/no-unsafe-call': 'error',

  // Boolean Expressions
  '@typescript-eslint/strict-boolean-expressions': 'error',

  // Promise Handling
  '@typescript-eslint/no-floating-promises': 'error',
  '@typescript-eslint/no-misused-promises': 'error',

  // React
  'react-hooks/rules-of-hooks': 'error',
  'react-hooks/exhaustive-deps': 'warn',

  // Accessibility
  'jsx-a11y/alt-text': 'error',
  'jsx-a11y/label-has-associated-control': 'error',
}
```

#### Test File Overrides

Test files have relaxed rules for better developer experience:

```javascript
{
  files: [
    '**/*.spec.{ts,tsx,js,jsx}',
    '**/*.test.{ts,tsx,js,jsx}',
    '**/tests/**/*.{ts,tsx,js,jsx}',
    '**/__tests__/**/*.{ts,tsx,js,jsx}'
  ],
  rules: {
    'no-console': 'off',
    'no-undef': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/strict-boolean-expressions': 'off',
    '@typescript-eslint/no-unused-vars': 'off'
  }
}
```

### Backend (Python)

**Configuration File**: `backend/pyproject.toml`

#### Flake8 Configuration

```toml
[tool.flake8]
max-line-length = 100
ignore = ["E203", "E266", "E501", "W503"]
```

#### MyPy Configuration

```toml
[tool.mypy]
python_version = "3.10"
warn_return_any = true
warn_unused_configs = true
disallow_untyped_defs = true
disallow_incomplete_defs = true
check_untyped_defs = true
```

## Lint Scripts

### Frontend Scripts

```json
{
  "lint": "pnpm run lint:astro && pnpm run lint:healwave && pnpm run lint:types",
  "lint:astro": "eslint apps/astro/src --ext .ts,.tsx --max-warnings=0",
  "lint:healwave": "cd apps/healwave && pnpm run lint",
  "lint:types": "eslint packages/types/src --ext .ts --max-warnings=0",

  "format": "pnpm run format:astro && pnpm run format:healwave",
  "format:astro": "cd apps/astro && pnpm run format",
  "format:healwave": "cd apps/healwave && pnpm run format"
}
```

### Backend Scripts

```json
{
  "lint:backend": "cd backend && python3 -m flake8 . --count --select=E9,F63,F7,F82",
  "format:backend": "cd backend && python3 -m black . && python3 -m isort ."
}
```

## Best Practices & Patterns

### TypeScript/React Best Practices

#### 1. Type Safety Patterns

**❌ Avoid**:

```typescript
const data: any = response.data;
const name = data.user.name; // Unsafe
```

**✅ Prefer**:

```typescript
interface UserResponse {
  user: {
    name: string;
  };
}

function isUserResponse(data: unknown): data is UserResponse {
  return (
    typeof data === 'object' &&
    data !== null &&
    'user' in data &&
    typeof (data as any).user === 'object' &&
    'name' in (data as any).user &&
    typeof (data as any).user.name === 'string'
  );
}

const data = response.data;
if (isUserResponse(data)) {
  const name = data.user.name; // Safe!
}
```

#### 2. Boolean Expression Patterns

**❌ Avoid**:

```typescript
if (str) {
  /* ... */
}
if (obj) {
  /* ... */
}
if (data?.property) {
  /* ... */
}
```

**✅ Prefer**:

```typescript
if (typeof str === 'string' && str.length > 0) {
  /* ... */
}
if (obj !== null && obj !== undefined) {
  /* ... */
}
if (data?.property !== undefined && data.property !== null) {
  /* ... */
}
```

#### 3. Promise Handling Patterns

**❌ Avoid**:

```typescript
fetchData(); // Floating promise
onClick={async () => await someFunction()} // Misused in JSX
```

**✅ Prefer**:

```typescript
void fetchData().catch(error => {
  console.error('Failed to fetch data:', error);
});

onClick={() => {
  void someFunction().catch(handleError);
}}
```

#### 4. React Hook Patterns

**❌ Avoid**:

```typescript
useEffect(() => {
  fetchData(userId);
}, []); // Missing dependency
```

**✅ Prefer**:

```typescript
useEffect(() => {
  if (userId) {
    void fetchData(userId);
  }
}, [userId]); // Include dependencies
```

### Python Best Practices

#### 1. Import Organization

```python
# Standard library imports
import json
import logging
from typing import Dict, List, Optional

# Third-party imports
import numpy as np
import pandas as pd

# Local imports
from .utils import helper_function
from ..models import ChartData
```

#### 2. Type Hints

```python
def calculate_aspects(
    chart1: Dict[str, float],
    chart2: Dict[str, float]
) -> List[AspectData]:
    """Calculate aspects between two charts."""
    pass
```

#### 3. Error Handling

**❌ Avoid**:

```python
try:
    result = risky_operation()
except:  # Bare except
    pass
```

**✅ Prefer**:

```python
try:
    result = risky_operation()
except SpecificException as e:
    logger.error(f"Operation failed: {e}")
    raise
```

## IDE Configuration

### VSCode Settings

Create `.vscode/settings.json`:

```json
{
  "eslint.validate": ["javascript", "javascriptreact", "typescript", "typescriptreact"],
  "eslint.format.enable": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "python.linting.enabled": true,
  "python.linting.flake8Enabled": true,
  "python.formatting.provider": "black",
  "[python]": {
    "editor.formatOnSave": true
  }
}
```

### VSCode Extensions

**Frontend**:

- ESLint
- TypeScript Importer
- Auto Rename Tag
- Bracket Pair Colorizer

**Backend**:

- Python
- Python Docstring Generator
- Python Type Hint

**General**:

- Prettier - Code formatter
- GitLens
- Error Lens

## Git Hooks Integration

### Pre-commit Configuration

Create `.pre-commit-config.yaml`:

```yaml
repos:
  - repo: local
    hooks:
      - id: eslint-fix
        name: ESLint (with fix)
        entry: bash -c 'cd apps/astro && pnpm run lint --fix'
        language: system
        files: apps/astro/.*\.(ts|tsx)$
        pass_filenames: false

      - id: typescript-check
        name: TypeScript Check
        entry: bash -c 'cd apps/astro && pnpm run type-check'
        language: system
        files: apps/astro/.*\.(ts|tsx)$
        pass_filenames: false

      - id: python-black
        name: Black Python formatter
        entry: black
        language: python
        files: backend/.*\.py$

      - id: python-flake8
        name: Flake8 Python linter
        entry: flake8
        language: python
        files: backend/.*\.py$
```

### Lint-staged Configuration

In `package.json`:

```json
{
  "lint-staged": {
    "*.{ts,tsx,js,jsx}": ["eslint --max-warnings=0 --fix", "prettier --write"],
    "*.{md,json,yml,yaml}": ["prettier --write"],
    "backend/**/*.py": ["black", "flake8"]
  }
}
```

## Continuous Integration

### GitHub Actions Lint Check

Create `.github/workflows/lint.yml`:

```yaml
name: Lint Check

on: [push, pull_request]

jobs:
  frontend-lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install -g pnpm
      - run: pnpm install
      - run: pnpm run lint
      - run: pnpm run type-check

  backend-lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: '3.10'
      - run: |
          cd backend
          pip install -r requirements.txt
          pip install flake8 black mypy
          black --check .
          flake8 .
          mypy .
```

## Rule Customization Guidelines

### When to Disable Rules

1. **Temporarily**: Use inline comments for complex refactoring

```typescript
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const legacyData: any = getLegacyApiResponse();
```

2. **File-level**: For generated or legacy files

```typescript
/* eslint-disable @typescript-eslint/no-explicit-any */
// Generated file - do not edit
```

3. **Configuration**: For consistent project-wide exceptions

```javascript
// In eslint.config.js
rules: {
  '@typescript-eslint/no-explicit-any': ['error', {
    fixToUnknown: true,
    ignoreRestArgs: false
  }]
}
```

### Rule Severity Levels

- **error**: Fails CI/CD, blocks commits
- **warn**: Shows in editor, doesn't fail builds
- **off**: Completely disabled

### Custom Rule Configuration Examples

```javascript
// Specific to astrology domain
rules: {
  'no-restricted-imports': [
    'error',
    {
      'paths': [
        {
          'name': 'shared',
          'message': 'Use @cosmichub/types instead'
        }
      ],
      'patterns': ['shared/*']
    }
  ],

  // Relaxed for component library
  '@typescript-eslint/no-explicit-any': [
    'warn', // Instead of 'error'
    { fixToUnknown: false }
  ]
}
```

## Maintenance & Updates

### Monthly Audit Process

1. **Run Comprehensive Audit**:

```bash
# Full project lint check
pnpm run lint 2>&1 | tee lint-audit-$(date +%Y%m%d).log

# Backend lint check
cd backend && python -m flake8 . --statistics
```

2. **Analyze Results**:

- Count errors by category
- Identify new patterns
- Check for regressions

3. **Update Documentation**:

- Update this guide with new patterns
- Document any rule changes
- Share learnings with team

### Rule Updates

1. **Test rule changes** in a separate branch
2. **Get team consensus** on strict rules
3. **Update gradually** to avoid massive diffs
4. **Document rationale** for changes

### Team Training

1. **Onboarding checklist** includes lint setup
2. **Monthly code review** of lint patterns
3. **Share common fixes** in team docs
4. **Celebrate clean code** achievements

## Troubleshooting

### Common Issues

#### "Parsing error: 'from' expected"

- **Cause**: Missing imports or syntax error
- **Fix**: Check import statements and TypeScript syntax

#### "Rule 'x' is not defined"

- **Cause**: Missing plugin or incorrect rule name
- **Fix**: Verify plugin installation and rule name

#### Python "No module named 'flake8'"

- **Cause**: Missing Python dependencies
- **Fix**: `pip install flake8` in backend directory

### Performance Issues

If linting is slow:

1. **Use caching**: ESLint `--cache` flag
2. **Limit scope**: Lint only changed files
3. **Parallel execution**: Use `--max-parallel` option
4. **Exclude unnecessary files**: Update `.eslintignore`

### Configuration Conflicts

1. **Check override order** in ESLint config
2. **Verify extends order** matters
3. **Use debug mode**: `eslint --debug`
4. **Test specific files**: `eslint path/to/file.ts`

## Migration Guide

### From Legacy ESLint Config

If migrating from old `.eslintrc.js`:

1. **Convert to flat config**:

```bash
npx @eslint/migrate-config .eslintrc.js
```

2. **Update scripts**:

```json
"lint": "ESLINT_USE_FLAT_CONFIG=true eslint ."
```

3. **Test thoroughly** with existing codebase

### Adding New Rules

1. **Start with 'warn'** severity
2. **Monitor impact** on development
3. **Gradually increase** to 'error'
4. **Document exceptions** and rationale

---

_Last Updated_: August 19, 2025 _Configuration Version_: ESLint 9.x Flat Config, Flake8 7.x
_Status_: Production Ready
