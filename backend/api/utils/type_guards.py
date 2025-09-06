"""
Type Validators Module for Astrology Data

This module provides type validation functions for astrology data types.
It implements runtime type checking with descriptive error messages.
"""

import json
from dataclasses import dataclass
from typing import (
    Any,
    Dict,
    List,
    Literal,
    Optional,
    Protocol,
    TypedDict,
    TypeGuard,
    TypeVar,
    Union,
    cast,
)

# Type alias for unknown types in runtime validation
Unknown = Union[None, bool, int, float, str, List[Any], Dict[str, Any]]

# Type variables for generic type checking
T = TypeVar("T")

# Literal type for discriminating between astrology data types
AstrologyDataType = Literal[
    "AstrologyChart", "UserProfile", "NumerologyData", "Unknown"
]


# TypedDict definitions for astrology data structures
class Planet(TypedDict, total=False):
    """Type definition for Planet objects"""

    name: str  # Could be restricted to planet names
    sign: str  # Could be restricted to zodiac signs
    degree: float
    position: float
    house: str
    retrograde: Optional[bool]
    aspects: Optional[List[Dict[str, Unknown]]]


class House(TypedDict):
    """Type definition for House objects"""

    house: int
    number: int
    sign: str  # Could be restricted to zodiac signs
    degree: float
    cusp: float
    ruler: str  # Could be restricted to planet names


class Aspect(TypedDict):
    """Type definition for Aspect objects"""

    planet1: str  # Could be restricted to planet names
    planet2: str  # Could be restricted to planet names
    type: str  # Could be restricted to aspect types
    orb: float
    applying: str


class Asteroid(TypedDict):
    """Type definition for Asteroid objects"""

    name: str
    sign: str  # Could be restricted to zodiac signs
    degree: float
    house: str


class Angle(TypedDict):
    """Type definition for Angle objects"""

    name: str  # Could be restricted to angle names
    sign: str  # Could be restricted to zodiac signs
    degree: float
    position: float


# Protocol class for chart-like objects (structural typing)
class ChartLike(Protocol):
    """Protocol for any chart-like object with celestial bodies"""

    planets: List[Planet]
    houses: List[House]
    aspects: List[Aspect]


class BirthData(TypedDict):
    """Type definition for birth data"""

    date: str
    time: str
    location: str


class UserProfile(TypedDict, total=False):
    """Type definition for user profile"""

    userId: str
    birthData: BirthData
    preferences: Optional[Dict[str, Unknown]]


class NumerologyData(TypedDict):
    """Type definition for numerology data"""

    lifePath: int
    destiny: int
    personalYear: int


class AstrologyChart(TypedDict, total=False):
    """Type definition for astrology chart"""

    planets: List[Planet]
    houses: List[House]
    aspects: List[Aspect]
    asteroids: List[Asteroid]
    angles: List[Angle]
    name: Optional[str]
    date: Optional[str]
    userId: Optional[str]


def is_planet(value: object) -> TypeGuard[Planet]:
    """Type guard for Planet objects"""
    if not isinstance(value, dict):
        return False

    # Cast to dict for type checking
    obj = cast(Dict[str, Unknown], value)

    return (
        isinstance(obj.get("name"), str)
        and isinstance(obj.get("sign"), str)
        and isinstance(obj.get("degree"), (int, float))
        and isinstance(obj.get("position"), (int, float))
        and isinstance(obj.get("house"), str)
        and (
            obj.get("retrograde") is None
            or isinstance(obj.get("retrograde"), bool)
        )
        and (
            obj.get("aspects") is None or isinstance(obj.get("aspects"), list)
        )
    )


def is_house(value: object) -> TypeGuard[House]:
    """Type guard for House objects"""
    if not isinstance(value, dict):
        return False

    # Cast to dict for type checking
    obj = cast(Dict[str, Unknown], value)

    return (
        isinstance(obj.get("house"), int)
        and isinstance(obj.get("number"), int)
        and isinstance(obj.get("sign"), str)
        and isinstance(obj.get("degree"), (int, float))
        and isinstance(obj.get("cusp"), (int, float))
        and isinstance(obj.get("ruler"), str)
    )


def is_aspect(value: object) -> TypeGuard[Aspect]:
    """Type guard for Aspect objects"""
    if not isinstance(value, dict):
        return False

    # Cast to dict for type checking
    obj = cast(Dict[str, Unknown], value)

    return (
        isinstance(obj.get("planet1"), str)
        and isinstance(obj.get("planet2"), str)
        and isinstance(obj.get("type"), str)
        and isinstance(obj.get("orb"), (int, float))
        and isinstance(obj.get("applying"), str)
    )


def is_asteroid(value: object) -> TypeGuard[Asteroid]:
    """Type guard for Asteroid objects"""
    if not isinstance(value, dict):
        return False

    # Cast to dict for type checking
    obj = cast(Dict[str, Unknown], value)

    return (
        isinstance(obj.get("name"), str)
        and isinstance(obj.get("sign"), str)
        and isinstance(obj.get("degree"), (int, float))
        and isinstance(obj.get("house"), str)
    )


def is_angle(value: object) -> TypeGuard[Angle]:
    """Type guard for Angle objects"""
    if not isinstance(value, dict):
        return False

    # Cast to dict for type checking
    obj = cast(Dict[str, Unknown], value)

    return (
        isinstance(obj.get("name"), str)
        and isinstance(obj.get("sign"), str)
        and isinstance(obj.get("degree"), (int, float))
        and isinstance(obj.get("position"), (int, float))
    )


def is_astrology_chart(value: object) -> TypeGuard[AstrologyChart]:
    """Type guard for AstrologyChart objects with deep validation"""
    if not isinstance(value, dict):
        return False

    # Cast to dict for type checking
    obj = cast(Dict[str, Unknown], value)

    # Check for required arrays
    if not all(
        isinstance(obj.get(key), list)
        for key in ["planets", "houses", "aspects", "asteroids", "angles"]
    ):
        return False

    # Validate each array item with safe type checking
    planets = obj.get("planets", [])
    houses = obj.get("houses", [])
    aspects = obj.get("aspects", [])
    asteroids = obj.get("asteroids", [])
    angles = obj.get("angles", [])
    
    return (
        isinstance(planets, list) and all(is_planet(p) for p in planets)
        and isinstance(houses, list) and all(is_house(h) for h in houses)
        and isinstance(aspects, list) and all(is_aspect(a) for a in aspects)
        and isinstance(asteroids, list) and all(is_asteroid(a) for a in asteroids)
        and isinstance(angles, list) and all(is_angle(a) for a in angles)
    )


def is_user_profile(value: object) -> TypeGuard[UserProfile]:
    """Type guard for UserProfile objects"""
    if not isinstance(value, dict):
        return False

    # Cast to dict for type checking
    obj = cast(Dict[str, Unknown], value)

    if not isinstance(obj.get("userId"), str):
        return False

    birth_data = obj.get("birthData")
    if not isinstance(birth_data, dict):
        return False

    # Cast birth_data for type checking
    birth_dict = cast(Dict[str, Unknown], birth_data)

    return (
        isinstance(birth_dict.get("date"), str)
        and isinstance(birth_dict.get("time"), str)
        and isinstance(birth_dict.get("location"), str)
    )


def is_numerology_data(value: object) -> TypeGuard[NumerologyData]:
    """Type guard for NumerologyData objects"""
    if not isinstance(value, dict):
        return False

    # Cast to dict for type checking
    obj = cast(Dict[str, Unknown], value)

    return (
        isinstance(obj.get("lifePath"), int)
        and isinstance(obj.get("destiny"), int)
        and isinstance(obj.get("personalYear"), int)
    )


def get_astrology_data_type(data: object) -> str:
    """
    Type-safe data discriminator
    Returns the specific type name of the astrology-related data
    """
    if is_astrology_chart(data):
        return "AstrologyChart"
    elif is_user_profile(data):
        return "UserProfile"
    elif is_numerology_data(data):
        return "NumerologyData"
    else:
        return "Unknown"


def validate_astrology_chart(chart: object) -> List[str]:
    """
    Validates an astrology chart structure and reports specific validation errors  # noqa: E501
    Returns an array of validation errors, empty if valid
    """
    errors: List[str] = []

    if not isinstance(chart, dict):
        return ["Chart must be a dictionary"]

    # Cast to dict for type checking
    obj = cast(Dict[str, Unknown], chart)

    # Check required properties
    planets = obj.get("planets")
    if not isinstance(planets, list):
        errors.append("Chart is missing planets array")
    elif len(planets) == 0:
        errors.append("Chart must have at least one planet")
    else:
        # Validate each planet
        for i, planet in enumerate(planets):
            if not is_planet(planet):
                errors.append(f"Invalid planet at index {i}")

    houses = obj.get("houses")
    if not isinstance(houses, list):
        errors.append("Chart is missing houses array")
    elif len(houses) != 12:
        errors.append("Chart must have exactly 12 houses")
    else:
        # Validate each house
        for i, house in enumerate(houses):
            if not is_house(house):
                errors.append(f"Invalid house at index {i}")

    aspects = obj.get("aspects")
    if not isinstance(aspects, list):
        errors.append("Chart is missing aspects array")
    else:
        # Validate each aspect
        for i, aspect in enumerate(aspects):
            if not is_aspect(aspect):
                errors.append(f"Invalid aspect at index {i}")

    asteroids = obj.get("asteroids")
    if not isinstance(asteroids, list):
        errors.append("Chart is missing asteroids array")
    else:
        # Validate each asteroid
        for i, asteroid in enumerate(asteroids):
            if not is_asteroid(asteroid):
                errors.append(f"Invalid asteroid at index {i}")

    angles = obj.get("angles")
    if not isinstance(angles, list):
        errors.append("Chart is missing angles array")
    else:
        # Validate each angle
        for i, angle in enumerate(angles):
            if not is_angle(angle):
                errors.append(f"Invalid angle at index {i}")

    return errors


@dataclass
class ChartValidationResult:
    """Result of chart validation and parsing"""

    chart: Optional[AstrologyChart]
    errors: List[str]
    is_valid: bool


def safe_parse_astrology_chart(json_string: str) -> ChartValidationResult:
    """
    Safely attempts to parse a JSON string into an AstrologyChart
    Returns a ChartValidationResult with the parsed chart (or None if invalid) and any validation errors  # noqa: E501
    """
    try:
        parsed = json.loads(json_string)
        validation_errors = validate_astrology_chart(parsed)

        if validation_errors:
            return ChartValidationResult(
                chart=None, errors=validation_errors, is_valid=False
            )

        # We've validated that it's an AstrologyChart
        return ChartValidationResult(
            chart=cast(AstrologyChart, parsed), errors=[], is_valid=True
        )
    except json.JSONDecodeError as e:
        return ChartValidationResult(
            chart=None, errors=[str(e)], is_valid=False
        )
    except Exception as e:
        return ChartValidationResult(
            chart=None,
            errors=[f"Unknown parsing error: {str(e)}"],
            is_valid=False,
        )


def is_astrology_data(value: object) -> bool:
    """
    Type guard to check if the value is any valid astrology data type
    """
    return (
        is_astrology_chart(value)
        or is_user_profile(value)
        or is_numerology_data(value)
    )
