from _pytest.monkeypatch import MonkeyPatch
from fastapi.testclient import TestClient

from main import app


def test_interpretation_metrics_exposed(monkeypatch: MonkeyPatch):
    monkeypatch.setenv("TEST_MODE", "1")
    monkeypatch.setenv("ENABLE_TRACING", "false")
    monkeypatch.setenv("ENABLE_METRICS", "true")
    client = TestClient(app)

    # Save chart first
    save_resp = client.post(
        "/api/charts/save",
        json={
            "planets": [
                {
                    "name": "Sun",
                    "sign": "Leo",
                    "degree": 10.5,
                    "house": 5,
                    "aspects": [],
                }
            ],
            "asteroids": [],
            "angles": [
                {"name": "Ascendant", "sign": "Aries", "degree": 12.33}
            ],
            "houses": [
                {
                    "number": 1,
                    "sign": "Aries",
                    "cusp": 12.33,
                    "planets": ["Sun"],
                }
            ],
            "aspects": [],
        },
        headers={"Authorization": "Bearer test"},
    )
    assert save_resp.status_code == 200
    chart_id = save_resp.json()["chart_id"]

    # Generate interpretation to increment counters
    interp_resp = client.post(
        "/api/interpretations/generate",
        json={
            "chartId": chart_id,
            "userId": "dev-user",
            "type": "natal",
            "interpretation_level": "advanced",
        },
        headers={"Authorization": "Bearer test"},
    )
    assert interp_resp.status_code == 200

    # Fetch metrics
    metrics_resp = client.get("/metrics")
    assert metrics_resp.status_code == 200
    body = metrics_resp.text
    # Basic presence checks
    assert "http_requests_total" in body
    # Interpretation counters (may appear after generation)
    assert (
        "interpretations_total" in body
        or "interpretation_generation_seconds" in body
    )
