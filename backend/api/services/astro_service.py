from typing import Dict, Any
import asyncio


class AstroService:
    """Stub astro service implementation."""

    async def some_chart_helper(self, chart_data: Dict[str, Any]) -> Dict[str, Any]:
        await asyncio.sleep(0)
        return {"normalized": True}
