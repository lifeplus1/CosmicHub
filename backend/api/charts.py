# backend/api/charts.py

from fastapi import APIRouter, Depends, HTTPException, Header
from firebase_admin import auth
from pydantic import BaseModel
from typing import Literal, Dict, List, Any
import swisseph as swe
from ..settings import settings

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
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing Authorization header")
    token_str = authorization.split("Bearer ")[-1] if "Bearer " in authorization else authorization
    try:
        # Call into firebase_admin; type is unknown at stub level but runtime is valid.
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
        # Placeholder: Implement PySwissEph calculations for planets, asteroids, angles, houses, aspects
        # Example: swe.calc_ut(julian_day, swe.SUN) for Sun position
        chart_data = ChartData(
            planets=[
                Planet(
                    name="Sun",
                    sign="Leo",
                    house=5,
                    degree=15.25,
                    aspects=[PlanetAspect(type="Conjunction", target="Mercury", orb=2.5)],
                )
            ],
            asteroids=[
                Asteroid(name="Ceres", sign="Virgo", house=6, degree=10.75, aspects=[])
            ],
            angles=[Angle(name="Ascendant", sign="Aries", degree=12.33)],
            houses=[House(number=1, sign="Aries", cusp=12.33, planets=["Sun"])],
            aspects=[
                Aspect(planet1="Sun", planet2="Mercury", type="Conjunction", orb=2.5, applying=True)
            ],
        )
        return chart_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chart calculation failed: {str(e)}")