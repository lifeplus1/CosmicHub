import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PARENT = ROOT.parent
if str(PARENT) not in sys.path:
    sys.path.insert(0, str(PARENT))

from backend.main import app  # type: ignore


def test_app_routes_present() -> None:
    paths = {getattr(r, "path", "") for r in app.routes}  # type: ignore[arg-type]
    assert any(p.startswith("/api/astro") for p in paths)
    assert "/calculate-gene-keys" in paths
