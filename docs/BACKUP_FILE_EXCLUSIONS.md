# Backup File Linting Exclusions

## Overview

Backup files, temporary files, and deprecated files are now properly excluded from linting tools to reduce noise and focus on active code quality.

## Files Excluded from Linting

### Patterns Automatically Excluded

**MyPy (Python Type Checking):**

- `*_backup.py`
- `*.backup.py`
- `*_temp.py`
- `*.temp.py`
- `*_old.py`
- `*.old.py`
- `*_deprecated.py`
- `*.deprecated.py`
- `tcm_type_bridge_backup.py` (specific file)
- `*_test_backup.py`
- `*.bak.py`
- `*_copy.py`
- `*.copy.py`

**ESLint (JavaScript/TypeScript):**

- `**/*_backup.*`
- `**/*.backup.*`
- `**/*_old.*`
- `**/*.old.*`
- `**/*_temp.*`
- `**/*.temp.*`
- `**/*_deprecated.*`
- `**/*.deprecated.*`
- `**/tcm_type_bridge_backup.py`

### Backup Directories Excluded

- `**/CODE-001-backup-*/**`
- `**/*-backup-20*/**`
- `**/cleanup-backup-*/**`
- `**/tree-shaking-backup/**`

## Impact on Error Counts

**Before Backup Exclusions:**

- MyPy errors: ~88 errors
- Many errors from backup files with outdated type annotations

**After Backup Exclusions:**

- MyPy errors: 24 errors  
- **70% reduction** in reported errors
- Focus on active, maintainable code

## How to Use

### Command Line Scripts

**Bash Script (Unix/macOS):**

```bash
# Run mypy with backup exclusions
./scripts/mypy-check.sh

# With additional options
./scripts/mypy-check.sh --show-error-codes --verbose
```

**Python Script (Cross-platform):**

```bash
# Basic usage
python3 scripts/mypy_check_with_exclusions.py

# Show excluded patterns
python3 scripts/mypy_check_with_exclusions.py --show-excluded

# Count errors only
python3 scripts/mypy_check_with_exclusions.py --count-only

# With additional mypy args
python3 scripts/mypy_check_with_exclusions.py --show-error-codes --pretty
```

### Package.json Scripts

**Updated scripts in package.json:**

```json
{
  "scripts": {
    "type-bridge-check": "bash scripts/mypy-check.sh",
    "mypy-check": "bash scripts/mypy-check.sh", 
    "mypy-check:verbose": "bash scripts/mypy-check.sh --show-error-codes --show-error-context"
  }
}
```

**Usage:**

```bash
# Quick type check (excludes backups)
pnpm run mypy-check

# Verbose output
pnpm run mypy-check:verbose

# Part of QA pipeline
pnpm run qa  # Includes type-bridge-check
```

## Configuration Files

### MyPy Configuration (`backend/mypy.ini`)

The mypy.ini file includes specific module exclusions:

```ini
[mypy-backend.api.bridges.tcm_type_bridge_backup]
ignore_errors = True
```

### ESLint Configuration (`eslint.config.js`)

Global ignores section includes backup patterns:

```javascript
{
  ignores: [
    // Backup files
    '**/*_backup.*',
    '**/*.backup.*',
    // ... other patterns
  ]
}
```

## Adding New Backup Patterns

### For MyPy (Python)

1. **Edit scripts/mypy_check_with_exclusions.py:**

   ```python
   BACKUP_PATTERNS = [
       # Existing patterns...
       r'your_new_pattern\.py$',
   ]
   ```

2. **Or add module-specific exclusion in mypy.ini:**

   ```ini
   [mypy-your.module.name]
   ignore_errors = True
   ```

### For ESLint (JavaScript/TypeScript)

**Edit eslint.config.js:**

```javascript
{
  ignores: [
    // Existing patterns...
    '**/your_new_pattern.*',
  ]
}
```

## Benefits

1. **Reduced Noise**: Focus on active code, not legacy backups
2. **Faster CI/CD**: Skip type-checking files that won't be fixed
3. **Better Developer Experience**: Clear signal vs noise ratio
4. **Maintainability**: Easy to add new exclusion patterns

## Best Practices

### For Creating Backup Files

Use these naming conventions for automatic exclusion:

- `module_backup.py` or `module.backup.py`
- `temp_fix_old.py` or `temp_fix.old.py`
- `deprecated_feature.py` or `feature.deprecated.py`

### For Backup Directories

Use these patterns for automatic exclusion:

- `backup-YYYYMMDD/`
- `old-implementation/`
- `deprecated-FEATURE/`

### When to Clean Up Backups

- After confirming new implementation works
- Before major releases
- During maintenance cycles
- When backup patterns are clearly obsolete

## Integration with CI/CD

The exclusion patterns ensure that:

- Pull requests focus on active code changes
- CI builds don't fail due to backup file issues
- Type checking performance is optimized
- Code quality metrics reflect maintainable code

## Troubleshooting

**If a file is unexpectedly excluded:**

1. Check if filename matches exclusion patterns
2. Use `--show-excluded` flag to see patterns
3. Rename file to avoid backup patterns
4. Or add specific inclusion if needed

**If backup files still show errors:**

1. Verify script is being used instead of direct mypy
2. Check pattern matching in script
3. Add specific module exclusion in mypy.ini

This backup exclusion strategy provides clean separation between active code quality and legacy file preservation.
