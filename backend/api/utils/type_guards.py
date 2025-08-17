"""
Type Validators Module for Astrology Data

This module provides type validation functions for astrology data types.
It implements runtime type checking with descriptive error messages.
"""

from typing import Any, Dict, List, TypeVar, cast, TypeGuard, Optional, TypedDict, Literal, Protocol
import json
from dataclasses import dataclass

# Type variables for generic type checking
T = TypeVar('T')

# Literal type for discriminating between astrology data types
AstrologyDataType = Literal['AstrologyChart', 'UserProfile', 'NumerologyData', 'Unknown']

# TypedDict definitions for astrology data structures
class Planet(TypedDict, total=False):
    """Type definition for Planet objects"""
    name: str  # Could be restricted to planet names
    sign: str  # Could be restricted to zodiac signs
    degree: float
    position: float
    house: str
    retrograde: Optional[bool]
    aspects: Optional[List[Dict[str, Any]]]

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
    type: str     # Could be restricted to aspect types
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
    preferences: Optional[Dict[str, Any]]

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


def is_planet(value: Any) -> TypeGuard[Planet]:
    """Type guard for Planet objects"""
    if not isinstance(value, dict):
        return False
    
    # Cast to dict for type checking
    obj = cast(Dict[str, Any], value)
    
    return (
        isinstance(obj.get('name'), str) and
        isinstance(obj.get('sign'), str) and
        isinstance(obj.get('degree'), (int, float)) and
        isinstance(obj.get('position'), (int, float)) and
        isinstance(obj.get('house'), str) and
        (obj.get('retrograde') is None or isinstance(obj.get('retrograde'), bool)) and
        (obj.get('aspects') is None or isinstance(obj.get('aspects'), list))
    )


def is_house(value: Any) -> TypeGuard[House]:
    """Type guard for House objects"""
    if not isinstance(value, dict):
        return False
    
    # Cast to dict for type checking
    obj = cast(Dict[str, Any], value)
    
    return (
        isinstance(obj.get('house'), int) and
        isinstance(obj.get('number'), int) and
        isinstance(obj.get('sign'), str) and
        isinstance(obj.get('degree'), (int, float)) and
        isinstance(obj.get('cusp'), (int, float)) and
        isinstance(obj.get('ruler'), str)
    )


def is_aspect(value: Any) -> TypeGuard[Aspect]:
    """Type guard for Aspect objects"""
    if not isinstance(value, dict):
        return False
    
    # Cast to dict for type checking
    obj = cast(Dict[str, Any], value)
    
    return (
        isinstance(obj.get('planet1'), str) and
        isinstance(obj.get('planet2'), str) and
        isinstance(obj.get('type'), str) and
        isinstance(obj.get('orb'), (int, float)) and
        isinstance(obj.get('applying'), str)
    )


def is_asteroid(value: Any) -> TypeGuard[Asteroid]:
    """Type guard for Asteroid objects"""
    if not isinstance(value, dict):
        return False
    
    # Cast to dict for type checking
    obj = cast(Dict[str, Any], value)
    
    return (
        isinstance(obj.get('name'), str) and
        isinstance(obj.get('sign'), str) and
        isinstance(obj.get('degree'), (int, float)) and
        isinstance(obj.get('house'), str)
    )


def is_angle(value: Any) -> TypeGuard[Angle]:
    """Type guard for Angle objects"""
    if not isinstance(value, dict):
        return False
    
    # Cast to dict for type checking
    obj = cast(Dict[str, Any], value)
    
    return (
        isinstance(obj.get('name'), str) and
        isinstance(obj.get('sign'), str) and
        isinstance(obj.get('degree'), (int, float)) and
        isinstance(obj.get('position'), (int, float))
    )


def is_astrology_chart(value: Any) -> TypeGuard[AstrologyChart]:
    """Type guard for AstrologyChart objects with deep validation"""
    if not isinstance(value, dict):
        return False
    
    # Cast to dict for type checking
    obj = cast(Dict[str, Any], value)
    
    # Check for required arrays
    if not all(isinstance(obj.get(key), list) for key in ['planets', 'houses', 'aspects', 'asteroids', 'angles']):
        return False
    
    # Validate each array item
    return (
        all(is_planet(p) for p in obj.get('planets', [])) and
        all(is_house(h) for h in obj.get('houses', [])) and
        all(is_aspect(a) for a in obj.get('aspects', [])) and
        all(is_asteroid(a) for a in obj.get('asteroids', [])) and
        all(is_angle(a) for a in obj.get('angles', []))
    )


def is_user_profile(value: Any) -> TypeGuard[UserProfile]:
    """Type guard for UserProfile objects"""
    if not isinstance(value, dict):
        return False
    
    # Cast to dict for type checking
    obj = cast(Dict[str, Any], value)
    
    if not isinstance(obj.get('userId'), str):
        return False
    
    birth_data = obj.get('birthData')
    if not isinstance(birth_data, dict):
        return False
    
    # Cast birth_data for type checking
    birth_dict = cast(Dict[str, Any], birth_data)
    
    return (
        isinstance(birth_dict.get('date'), str) and
        isinstance(birth_dict.get('time'), str) and
        isinstance(birth_dict.get('location'), str)
    )


def is_numerology_data(value: Any) -> TypeGuard[NumerologyData]:
    """Type guard for NumerologyData objects"""
    if not isinstance(value, dict):
        return False
    
    # Cast to dict for type checking
    obj = cast(Dict[str, Any], value)
    
    return (
        isinstance(obj.get('lifePath'), int) and
        isinstance(obj.get('destiny'), int) and
        isinstance(obj.get('personalYear'), int)
    )


def get_astrology_data_type(data: Any) -> str:
    """
    Type-safe data discriminator
    Returns the specific type name of the astrology-related data
    """
    if is_astrology_chart(data):
        return 'AstrologyChart'
    elif is_user_profile(data):
        return 'UserProfile'
    elif is_numerology_data(data):
        return 'NumerologyData'
    else:
        return 'Unknown'


def validate_astrology_chart(chart: Any) -> List[str]:
    """
    Validates an astrology chart structure and reports specific validation errors
    Returns an array of validation errors, empty if valid
    """
    errors: List[str] = []
    
    if not isinstance(chart, dict):
        return ['Chart must be a dictionary']
    
    # Cast to dict for type checking
    obj = cast(Dict[str, Any], chart)
    
    # Check required properties
    if not isinstance(obj.get('planets'), list):
        errors.append('Chart is missing planets array')
    elif len(obj.get('planets', [])) == 0:
        errors.append('Chart must have at least one planet')
    else:
        # Validate each planet
        for i, planet in enumerate(obj.get('planets', [])):
            if not is_planet(planet):
                errors.append(f'Invalid planet at index {i}')
    
    if not isinstance(obj.get('houses'), list):
        errors.append('Chart is missing houses array')
    elif len(obj.get('houses', [])) != 12:
        errors.append('Chart must have exactly 12 houses')
    else:
        # Validate each house
        for i, house in enumerate(obj.get('houses', [])):
            if not is_house(house):
                errors.append(f'Invalid house at index {i}')
    
    if not isinstance(obj.get('aspects'), list):
        errors.append('Chart is missing aspects array')
    else:
        # Validate each aspect
        for i, aspect in enumerate(obj.get('aspects', [])):
            if not is_aspect(aspect):
                errors.append(f'Invalid aspect at index {i}')
    
    if not isinstance(obj.get('asteroids'), list):
        errors.append('Chart is missing asteroids array')
    else:
        # Validate each asteroid
        for i, asteroid in enumerate(obj.get('asteroids', [])):
            if not is_asteroid(asteroid):
                errors.append(f'Invalid asteroid at index {i}')
    
    if not isinstance(obj.get('angles'), list):
        errors.append('Chart is missing angles array')
    else:
        # Validate each angle
        for i, angle in enumerate(obj.get('angles', [])):
            if not is_angle(angle):
                errors.append(f'Invalid angle at index {i}')
    
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
    Returns a ChartValidationResult with the parsed chart (or None if invalid) and any validation errors
    """
    try:
        parsed = json.loads(json_string)
        validation_errors = validate_astrology_chart(parsed)
        
        if validation_errors:
            return ChartValidationResult(
                chart=None,
                errors=validation_errors,
                is_valid=False
            )
        
        # We've validated that it's an AstrologyChart
        return ChartValidationResult(
            chart=cast(AstrologyChart, parsed),
            errors=[],
            is_valid=True
        )
    except json.JSONDecodeError as e:
        return ChartValidationResult(
            chart=None,
            errors=[str(e)],
            is_valid=False
        )
    except Exception as e:
        return ChartValidationResult(
            chart=None,
            errors=[f"Unknown parsing error: {str(e)}"],
            is_valid=False
        )


def is_astrology_data(value: Any) -> bool:
    """
    Type guard to check if the value is any valid astrology data type
    """
    return is_astrology_chart(value) or is_user_profile(value) or is_numerology_data(value)
