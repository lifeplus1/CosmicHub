from _pytest.monkeypatch import MonkeyPatch
from fastapi.testclient import TestClient

from main import app


def test_interpretation_backward_compat(monkeypatch: MonkeyPatch):
    monkeypatch.setenv("TEST_MODE", "1")
    monkeypatch.setenv("ENABLE_METRICS", "false")
    monkeypatch.setenv("ENABLE_TRACING", "false")
    client = TestClient(app)

    save_resp = client.post(
        "/api/charts/save",
        json={
            "planets": [
                {
                    "name": "Sun",
                    "sign": "Leo",
                    "degree": 5.0,
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

    interp_resp = client.post(
        "/api/interpretations/generate",
        json={"chartId": chart_id, "userId": "dev-user", "type": "natal"},
        headers={"Authorization": "Bearer test"},
    )
    assert interp_resp.status_code == 200

    from api.services.astro_service import _astro_service  # type: ignore

    cache_key = f"interpretation:{chart_id}:dev-user:natal"
    raw_cached = _astro_service.redis_cache._cache.get(cache_key)  # type: ignore[attr-defined]
    if raw_cached:
        import json

        val = json.loads(raw_cached["value"])  # type: ignore[arg-type]
        val.pop("version", None)
        val.pop("schemaVersion", None)
        raw_cached["value"] = json.dumps(val)

    interp_resp2 = client.post(
        "/api/interpretations/generate",
        json={"chartId": chart_id, "userId": "dev-user", "type": "natal"},
        headers={"Authorization": "Bearer test"},
    )
    assert interp_resp2.status_code == 200
    payload = interp_resp2.json()["data"][0]
    assert payload["version"] == "1.0.0"
    assert payload["schemaVersion"] == "1.0.0"
