import types
import pytest
from typing import Any, Dict


@pytest.mark.asyncio
async def test_ai_service_methods():
    from backend.api.services.ai_service import AIService
    svc = AIService()
    chart: Dict[str, Any] = {"planets": {"Sun": {"sign": "Aries"}}}
    section_result = await svc.generate_section_interpretation(chart, "overview", "user123")
    assert section_result["section"] == "overview"
    comp = await svc.analyze_chart_comprehensive(chart, "full", None)
    assert comp["type"] == "full" and comp["confidence"] >= 0


@pytest.mark.asyncio
async def test_astro_service_helper():
    from backend.api.services.astro_service import AstroService
    svc = AstroService()
    res = await svc.some_chart_helper({"dummy": 1})
    assert res == {"normalized": True}


def test_stripe_service_session(monkeypatch: pytest.MonkeyPatch) -> None:
    from backend.api.services import stripe_service

    created = {}
    def fake_create(**kwargs: Any):
        created.update(kwargs)  # type: ignore[arg-type]
        return types.SimpleNamespace(id="sess_test", url="https://stripe.test/sess_test")

    class FakeCheckout(types.SimpleNamespace):
        pass

    fake_checkout = FakeCheckout(Session=types.SimpleNamespace(create=lambda **k: fake_create(**k)))  # type: ignore[arg-type]
    monkeypatch.setattr(stripe_service, "stripe", types.SimpleNamespace(checkout=fake_checkout))

    result = stripe_service.create_stripe_session("user@example.com", "price_123")
    assert result.id == "sess_test"
    assert created["customer_email"] == "user@example.com"
    assert created["line_items"][0]["price"] == "price_123"
