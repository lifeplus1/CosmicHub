import asyncio
from typing import Any, Dict


class AIService:
    """Stub AI service implementation."""

    async def generate_section_interpretation(
        self, chart_data: Dict[str, Any], section: str, user_id: str
    ) -> Dict[str, Any]:
        await asyncio.sleep(0)  # simulate async
        return {
            "section": section,
            "summary": f"Interpretation for {section}",
            "details": [],
        }

    async def analyze_chart_comprehensive(
        self,
        chart_data: Dict[str, Any],
        analysis_type: str,
        user_preferences: Dict[str, Any] | None,
    ) -> Dict[str, Any]:
        await asyncio.sleep(0)
        return {
            "overview": "Comprehensive analysis",
            "confidence": 0.85,
            "type": analysis_type,
        }
