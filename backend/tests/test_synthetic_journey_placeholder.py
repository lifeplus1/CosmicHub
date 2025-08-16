import importlib.util
import pathlib

SCRIPT_PATH = pathlib.Path(__file__).resolve().parents[2] / "scripts" / "observability" / "synthetic_journey.py"

def test_synthetic_script_importable():
    spec = importlib.util.spec_from_file_location("synthetic_journey", SCRIPT_PATH)
    assert spec and spec.loader
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)  # type: ignore
    assert hasattr(module, "main")
