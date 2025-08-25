# Ensure backend root is on sys.path for tests so 'astro' and other top-level packages resolve.  # noqa: E501
import os
import sys
from pathlib import Path

# Set test mode environment variable
os.environ["TEST_MODE"] = "1"

root = Path(__file__).resolve().parent.parent
if str(root) not in sys.path:
    sys.path.insert(0, str(root))
