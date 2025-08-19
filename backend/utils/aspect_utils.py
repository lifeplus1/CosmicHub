# apps/backend/src/utils/aspect_utils.py
from typing import Dict, List, Literal, Optional, Sequence, TypedDict

from pydantic import BaseModel, Field


class Aspect(BaseModel):
    aspect: Optional[str] = Field(
        None, description="Aspect type (e.g., 'conjunction')"
    )
    orb: float = Field(..., description="Orb in degrees")
    type: str = Field(..., description="harmonious/challenging/neutral")


class AspectData(TypedDict):
    aspect: str
    orb: float
    type: str


class KeyAspectData(TypedDict):
    person1_planet: str
    person2_planet: str
    aspect: str
    orb: float
    strength: Literal["strong", "moderate"]
    interpretation: str


# Read-only synastry aspect matrix type (10x10 planet grid). Each cell is either
# an AspectData for a detected aspect or None if no aspect within allowed orbs.
Matrix = Sequence[Sequence[Optional[AspectData]]]

PLANETS = [
    "sun",
    "moon",
    "mercury",
    "venus",
    "mars",
    "jupiter",
    "saturn",
    "uranus",
    "neptune",
    "pluto",
]

ASPECT_DEGREES = {
    "conjunction": 0,
    "sextile": 60,
    "square": 90,
    "trine": 120,
    "opposition": 180,
    "quincunx": 150,  # Modern
    "semi_sextile": 30,  # Modern
}

ORBS = {
    "conjunction": 10,
    "opposition": 10,
    "trine": 8,
    "square": 8,
    "sextile": 6,
    "quincunx": 3,
    "semi_sextile": 2,
}


def calculate_aspect(sep: float) -> Optional[AspectData]:
    """Calculate aspect between two planetary positions."""
    for aspect, deg in ASPECT_DEGREES.items():
        orb_max = ORBS[aspect]
        orb = min(abs(sep - deg), abs(sep - (360 - deg)))
        if orb <= orb_max:
            aspect_type = (
                "harmonious"
                if aspect in ["conjunction", "trine", "sextile"]
                else (
                    "challenging"
                    if aspect in ["square", "opposition", "quincunx"]
                    else "neutral"
                )
            )
            return {"aspect": aspect, "orb": orb, "type": aspect_type}
    return None


def build_aspect_matrix(
    long1: Dict[str, float],
    long2: Dict[str, float],
    planets: Optional[List[str]] = None,
) -> List[List[Optional[AspectData]]]:
    """Build the mutable aspect matrix for two charts.

    This function is backward-compatible: callers may pass an explicit
    list of planet keys as the third argument; if omitted the module-level
    ``PLANETS`` list is used.

    Returns a list of rows (one per planet in ``planets``). Each row is a
    list of AspectData or None entries corresponding to aspects from the
    row planet (person1) to the column planet (person2).
    """
    planets = planets or PLANETS

    matrix: List[List[Optional[AspectData]]] = []
    for p1 in planets:
        row: List[Optional[AspectData]] = []
        lon1 = long1.get(p1, 0.0)
        for p2 in planets:
            lon2 = long2.get(p2, 0.0)
            sep = abs(lon1 - lon2) % 360
            if sep > 180:
                sep = 360 - sep
            aspect_data = calculate_aspect(sep)
            row.append(aspect_data)
        matrix.append(row)
    return matrix


def get_key_aspects(
    matrix: Matrix, max_orb: float = 3.0
) -> List[KeyAspectData]:
    """Extract key/tight aspects from an aspect matrix.

    Parameters:
        matrix: Matrix alias (Sequence of rows) produced by build_aspect_matrix
                 or vectorized variant.
        max_orb: Maximum orb (degrees) for an aspect to be considered "key".
    """
    key_aspects: List[KeyAspectData] = []
    for i, row in enumerate(matrix):
        p1 = PLANETS[i]
        for j, aspect in enumerate(row):
            if aspect and aspect["orb"] <= max_orb:
                p2 = PLANETS[j]
                key_aspects.append(
                    {
                        "person1_planet": p1,
                        "person2_planet": p2,
                        "aspect": aspect["aspect"],
                        "orb": aspect["orb"],
                        "strength": (
                            "strong" if aspect["orb"] <= 1.5 else "moderate"
                        ),
                        "interpretation": get_aspect_interpretation(
                            p1, p2, aspect["aspect"]
                        ),
                    }
                )
    return key_aspects


def get_aspect_interpretation(planet1: str, planet2: str, aspect: str) -> str:
    """Get interpretation for planet-aspect combination."""
    # Basic interpretation templates - can be expanded
    interpretations = {
        ("sun", "moon"): {
            "conjunction": "Deep emotional harmony and understanding between core selves.",
            "trine": "Natural flow between ego and emotions, supportive partnership.",
            "square": "Creative tension between will and feelings, growth through challenges.",
            "opposition": "Complementary but opposing needs, balance required.",
        },
        ("venus", "mars"): {
            "conjunction": "Strong romantic and sexual attraction, passionate connection.",
            "trine": "Harmonious blend of love and desire, natural chemistry.",
            "square": "Intense attraction with potential conflicts over affection styles.",
            "opposition": "Magnetic pull with contrasting approaches to love and action.",
        },
    }

    # Try both planet orders
    key = (planet1, planet2)
    reverse_key = (planet2, planet1)

    if key in interpretations and aspect in interpretations[key]:
        return interpretations[key][aspect]
    elif (
        reverse_key in interpretations
        and aspect in interpretations[reverse_key]
    ):
        return interpretations[reverse_key][aspect]
    else:
        return f"{planet1.title()} {aspect} {planet2.title()}: This aspect brings unique dynamics to the relationship."
