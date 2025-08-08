# Ensure backend root is on sys.path for tests so 'astro' and other top-level packages resolve.
import sys
from pathlib import Path
root = Path(__file__).resolve().parent.parent
if str(root) not in sys.path:
    sys.path.insert(0, str(root))
