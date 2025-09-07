#!/usr/bin/env python3
"""
mypy_check_with_exclusions.py - Run mypy with backup file exclusions

This script provides a more robust way to run mypy while excluding backup files,
temporary files, and other files that shouldn't be type-checked.
"""

import os
import sys
import subprocess
import argparse
from pathlib import Path

# Backup file patterns to exclude
BACKUP_PATTERNS = [
    r'.*_backup\.py$',
    r'.*\.backup\.py$', 
    r'.*_temp\.py$',
    r'.*\.temp\.py$',
    r'.*_old\.py$',
    r'.*\.old\.py$',
    r'.*_deprecated\.py$',
    r'.*\.deprecated\.py$',
    r'tcm_type_bridge_backup\.py$',
    r'.*_test_backup\.py$',
    r'.*\.bak\.py$',
    r'.*_copy\.py$',
    r'.*\.copy\.py$',
    # Test file patterns
    r'.*/tests/.*\.py$',
    r'.*test_.*\.py$',
    r'.*_test\.py$',
]

def main():
    parser = argparse.ArgumentParser(description='Run mypy with backup file exclusions')
    parser.add_argument('--config-file', default='backend/mypy.ini', 
                       help='Path to mypy config file')
    parser.add_argument('--target', default='backend/', 
                       help='Target directory to check')
    parser.add_argument('--show-excluded', action='store_true',
                       help='Show which files would be excluded')
    parser.add_argument('--count-only', action='store_true',
                       help='Only show error count')
    parser.add_argument('mypy_args', nargs='*', 
                       help='Additional arguments to pass to mypy')
    
    args = parser.parse_args()
    
    # Get script directory and project root
    script_dir = Path(__file__).parent
    project_root = script_dir.parent
    
    # Change to project root
    os.chdir(project_root)
    
    # Build mypy command
    cmd = [
        'mypy',
        '--config-file', args.config_file,
        '--ignore-missing-imports'
    ]
    
    # Add exclusion patterns
    for pattern in BACKUP_PATTERNS:
        cmd.extend(['--exclude', pattern])
    
    # Add additional mypy arguments
    if args.mypy_args:
        cmd.extend(args.mypy_args)
    
    # Add target directory
    cmd.append(args.target)
    
    if args.show_excluded:
        print("MyPy will exclude files matching these patterns:")
        for pattern in BACKUP_PATTERNS:
            print(f"  {pattern}")
        print()
    
    if args.show_excluded or args.count_only:
        print(f"Running: {' '.join(cmd)}")
        print()
    
    # Run mypy
    try:
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        if args.count_only:
            # Count errors
            error_lines = [line for line in result.stdout.split('\n') if 'error:' in line]
            print(f"Total mypy errors: {len(error_lines)}")
            return 0
        else:
            # Print full output
            if result.stdout:
                print(result.stdout)
            if result.stderr:
                print(result.stderr, file=sys.stderr)
            
            return result.returncode
            
    except FileNotFoundError:
        print("Error: mypy not found. Please install mypy first.", file=sys.stderr)
        return 1
    except Exception as e:
        print(f"Error running mypy: {e}", file=sys.stderr)
        return 1

if __name__ == '__main__':
    sys.exit(main())
