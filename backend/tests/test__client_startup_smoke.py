import os
os.environ.setdefault("TEST_MODE", "1")
os.environ.setdefault("ENABLE_TRACING", "false")

from fastapi.testclient import TestClient  # noqa: E402
from main import app  # noqa: E402

def test_client_startup_smoke():
    client = TestClient(app)
    r = client.get("/health")
    assert r.status_code == 200, r.text
