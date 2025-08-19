import importlib
import sys
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parent.parent
PARENT = ROOT.parent
if str(PARENT) not in sys.path:
    sys.path.insert(0, str(PARENT))


def _reload_settings():  # noqa: D401
    if "backend.settings" in sys.modules:
        del sys.modules["backend.settings"]
    import backend.settings as s  # type: ignore

    importlib.reload(s)
    return s


def test_log_level_normalization(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("LOG_LEVEL", "debug")
    s = _reload_settings()
    assert s.settings.log_level == "DEBUG"  # type: ignore[attr-defined]


def test_invalid_port(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("PORT", "900")  # below 1024
    with pytest.raises(Exception):
        _reload_settings()


def test_ephe_path_auto_created(
    monkeypatch: pytest.MonkeyPatch, tmp_path: Path
) -> None:
    new_dir = tmp_path / "ephe_sub"
    monkeypatch.setenv("EPHE_PATH", str(new_dir))
    s = _reload_settings()
    assert Path(s.settings.ephe_path).exists()  # type: ignore[attr-defined]
