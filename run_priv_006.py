#!/usr/bin/env python3
"""
PRIV-006 Execution Wrapper

Properly sets up Python path and runs the PRIV-006 implementation.
"""

import os
import sys

# Add the project root to the Python path
project_root = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, project_root)

# Now import and run the PRIV-006 implementation
if __name__ == "__main__":
    try:
        from backend.priv_006_implementation import main
        main()
    except ImportError as e:
        print(f"Import error: {e}")
        print("Available modules in backend.privacy:")
        
        # Try direct execution instead
        import subprocess
        result = subprocess.run([
            sys.executable, 
            os.path.join(project_root, "backend", "priv_006_implementation.py"),
            "--help"
        ], capture_output=True, text=True, cwd=project_root)
        
        if result.returncode == 0:
            print(result.stdout)
        else:
            print(f"Error running PRIV-006: {result.stderr}")
