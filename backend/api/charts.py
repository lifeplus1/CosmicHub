"""Chart endpoints.

Enhancements:
 - Adds explicit type annotation for the injected AstroService dependency.
 - Integrates unified serialization (api.utils.serialization.serialize_data) so
     saved charts use the same compact, consistent JSON representation leveraged  # noqa: E501
     elsewhere (caching, downstream interpretation engine).
"""

from __future__ import annotations

from typing import Any, Dict, List, Literal

import swisseph as swe
from fastapi import APIRouter, Depends, Header, HTTPException
from firebase_admin import auth
from pydantic import BaseModel

from api.utils.serialization import ChartData as SerializedChartData
from api.utils.serialization import (
    serialize_data,
)
from settings import settings

from .services.astro_service import AstroService, get_astro_service

# Example usage after all class definitions:

router = APIRouter(prefix="/charts")

# ----- Typed models to avoid 'Unknown' types -----


class PlanetAspect(BaseModel):
    type: str
    target: str
    orb: float


class Planet(BaseModel):
    name: str
    sign: str
    degree: float
    house: int | None = None
    aspects: List[PlanetAspect] = []


class Asteroid(BaseModel):
    name: str
    sign: str
    degree: float
    house: int | None = None
    aspects: List[PlanetAspect] = []


class Angle(BaseModel):
    name: str
    sign: str
    degree: float


class House(BaseModel):
    number: int
    sign: str
    cusp: float
    planets: List[str] = []


class Aspect(BaseModel):
    planet1: str
    planet2: str
    type: str
    orb: float
    applying: bool | None = None


class ChartData(BaseModel):
    planets: List[Planet]
    asteroids: List[Asteroid]
    angles: List[Angle]
    houses: List[House]
    aspects: List[Aspect]


# ----- Dependencies -----
def verify_id_token_dependency(
    authorization: str | None = Header(default=None, alias="Authorization")
) -> Dict[str, Any]:
    import os

    if (
        os.environ.get("TEST_MODE") == "1"
    ):  # Lightweight bypass for test environment
        return {"uid": "dev-user"}
    if not authorization:
        raise HTTPException(
            status_code=401, detail="Missing Authorization header"
        )
    token_str = (
        authorization.split("Bearer ")[-1]
        if "Bearer " in authorization
        else authorization
    )
    try:
        return auth.verify_id_token(token_str)  # type: ignore[no-any-return]
    except Exception as e:  # pragma: no cover - passthrough
        raise HTTPException(status_code=401, detail=f"Invalid token: {e}")


@router.get("/{chart_type}/{user_id}", response_model=ChartData)
async def get_chart(
    chart_type: Literal["natal", "transit", "synastry"],
    user_id: str,
    token: Dict[str, Any] = Depends(verify_id_token_dependency),
) -> ChartData:
    try:
        swe.set_ephe_path(settings.ephe_path)  # type: ignore[attr-defined]
        # Placeholder: Implement PySwissEph calculations for planets, asteroids, angles, houses, aspects  # noqa: E501
        # Example: swe.calc_ut(julian_day, swe.SUN) for Sun position
        chart_data = ChartData(
            planets=[
                Planet(
                    name="Sun",
                    sign="Leo",
                    house=5,
                    degree=15.25,
                    aspects=[
                        PlanetAspect(
                            type="Conjunction", target="Mercury", orb=2.5
                        )
                    ],
                )
            ],
            asteroids=[
                Asteroid(
                    name="Ceres",
                    sign="Virgo",
                    house=6,
                    degree=10.75,
                    aspects=[],
                )
            ],
            angles=[Angle(name="Ascendant", sign="Aries", degree=12.33)],
            houses=[
                House(number=1, sign="Aries", cusp=12.33, planets=["Sun"])
            ],
            aspects=[
                Aspect(
                    planet1="Sun",
                    planet2="Mercury",
                    type="Conjunction",
                    orb=2.5,
                    applying=True,
                )
            ],
        )
        return chart_data
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Chart calculation failed: {str(e)}"
        )


@router.post("/save", response_model=Dict[str, Any])
async def save_chart(
    chart_data: ChartData,
    token: Dict[str, Any] = Depends(verify_id_token_dependency),
    astro_service: AstroService = Depends(get_astro_service),
) -> Dict[str, Any]:
    """
    Save chart data to Firestore with serialization for optimization
    """
    try:
        from os import getenv as _getenv  # local import to avoid top-level pollution
        trace_enabled = _getenv("DEBUG_REQUEST_TRACE") in ("1", "true", "yes")
        if trace_enabled:  # pragma: no cover - debug only
            print(f"[TRACE] save_chart:enter uid={token.get('uid')} planets={len(chart_data.planets)}")
        # Convert incoming detailed model into the unified serialization model.
        # The serialization model is looser (dict[str, str|float]) so we map fields.  # noqa: E501
        serialized_model = SerializedChartData(
            planets=[
                {
                    "name": p.name,
                    "sign": p.sign,
                    "degree": p.degree,
                    "position": p.degree,  # placeholder; real calc should supply ecliptic position  # noqa: E501
                    "house": p.house if p.house is not None else "",
                }
                for p in chart_data.planets
            ],
            houses=[
                {
                    "number": h.number,
                    "sign": h.sign,
                    "cusp": h.cusp,
                }
                for h in chart_data.houses
            ],
            aspects=[
                {
                    "planet1": a.planet1,
                    "planet2": a.planet2,
                    "type": a.type,
                    "orb": a.orb,
                    "applying": (
                        str(a.applying).lower()
                        if a.applying is not None
                        else ""
                    ),
                }
                for a in chart_data.aspects
            ],
            asteroids=(
                [
                    {
                        "name": a.name,
                        "sign": a.sign,
                        "degree": a.degree,
                        "house": a.house if a.house is not None else "",
                    }
                    for a in chart_data.asteroids
                ]
                if chart_data.asteroids
                else None
            ),
            angles=(
                [
                    {
                        "name": ang.name,
                        "sign": ang.sign,
                        "degree": ang.degree,
                        "position": ang.degree,  # placeholder for full 360° value  # noqa: E501
                    }
                    for ang in chart_data.angles
                ]
                if chart_data.angles
                else None
            ),
        )

        # Produce serialized JSON (compact, validated)
        serialized_json = serialize_data(serialized_model)

        # Generate chart ID (stable hash of serialized payload for dedup potential)  # noqa: E501
        chart_id = f"chart_{token.get('uid', 'unknown')}_{hash(serialized_json) % 1000000}"  # noqa: E501

        # Cache by passing the Pydantic model so astro_service uses serialize_data internally  # noqa: E501
        cache_success = await astro_service.cache_chart_data(
            chart_id, serialized_model.model_dump()
        )

        # Log the operation
        print(
            f"Chart cached: {cache_success}. Chart ID: {chart_id} (size={len(serialized_json)} chars)"  # noqa: E501
        )
        if trace_enabled:  # pragma: no cover - debug only
            print(f"[TRACE] save_chart:exit chart_id={chart_id} cached={cache_success}")

        return {
            "status": "success",
            "chart_id": chart_id,
            "cached": cache_success,
            "message": "Chart saved successfully with unified serialization",
            "serialized_size": len(serialized_json),
            "version": "1.0.0",
            "schemaVersion": "1.0.0",
        }

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to save chart: {str(e)}"
        )
