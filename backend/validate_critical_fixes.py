#!/usr/bin/env python3
"""
Quick validation script for critical backend fixes
"""

import subprocess
import sys
from pathlib import Path

def run_flake8_check():
    """Run flake8 on critical error codes"""
    cmd = [
        "python3", "-m", "flake8", ".", 
        "--select=F401,E712,F811", 
        "--count", 
        "--statistics"
    ]
    
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, cwd="/Users/Chris/Projects/CosmicHub/backend")
        return result.returncode == 0, result.stdout, result.stderr
    except Exception as e:
        return False, "", str(e)

def main():
    print("🔍 Validating Critical Backend Fixes")
    print("=" * 50)
    
    success, stdout, stderr = run_flake8_check()
    
    if success:
        print("✅ All critical issues resolved!")
        print("No F401 (unused imports), E712 (boolean comparisons), or F811 (redefinitions) found.")
        return 0
    else:
        print("⚠️  Remaining issues found:")
        print(stdout)
        if stderr:
            print("Errors:", stderr)
        
        # Count remaining issues
        lines = stdout.strip().split('\n')
        issue_count = len([l for l in lines if l.strip() and not l.startswith('.') and ':' in l])
        print(f"\n📊 Issues remaining: {issue_count}")
        return 1

if __name__ == "__main__":
    sys.exit(main())
