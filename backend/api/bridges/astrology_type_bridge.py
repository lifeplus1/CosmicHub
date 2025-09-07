# backend/api/bridges/astrology_type_bridge.py
"""
Astrology Type Bridge - Safe conversion between astrological engine data and API types
Handles Western, Vedic, Uranian and other astrological system data
"""

import logging
from typing import Any, Dict, List, Optional, Union, cast
from datetime import datetime

# Import astrology types from centralized location
from backend_types.astrology_systems import (
    Planet, House, Aspect,
    BirthData, 
    ChartResponse, MultiSystemChartResponse,
    AstrologyHealthCheck
)

logger = logging.getLogger(__name__)

class AstrologyTypeBridge:
    """
    Type-safe bridge for astrological calculation data
    """
    
    # Zodiac sign validation
    VALID_SIGNS = {
        'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
        'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'
    }
    
    # Valid planets for validation
    VALID_PLANETS = {
        'sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn',
        'uranus', 'neptune', 'pluto', 'chiron', 'north_node', 'south_node'
    }
    
    # Valid house systems
    VALID_HOUSE_SYSTEMS = {
        'placidus', 'koch', 'equal', 'whole-sign', 'campanus', 'regiomontanus'
    }
    
    @staticmethod
    def validate_zodiac_sign(sign: str) -> str:
        """Validate and normalize zodiac sign"""
        normalized = sign.lower().strip() if sign else ''
        if normalized in AstrologyTypeBridge.VALID_SIGNS:
            return normalized
        else:
            logger.warning(f"Invalid zodiac sign '{sign}', defaulting to 'aries'")
            return 'aries'
    
    @staticmethod
    def validate_planet_name(planet: str) -> str:
        """Validate and normalize planet name"""
        normalized = planet.lower().strip() if planet else ''
        if normalized in AstrologyTypeBridge.VALID_PLANETS:
            return normalized
        else:
            logger.warning(f"Invalid planet '{planet}', defaulting to 'sun'")
            return 'sun'
    
    @staticmethod
    def validate_house_number(house: Union[int, str, float]) -> int:
        """Validate house number (1-12)"""
        try:
            house_num = int(float(str(house)))
            if 1 <= house_num <= 12:
                return house_num
            else:
                logger.warning(f"Invalid house number '{house}', defaulting to 1")
                return 1
        except (ValueError, TypeError):
            logger.warning(f"Could not parse house number '{house}', defaulting to 1")
            return 1
    
    @staticmethod
    def validate_degree(degree: Union[int, float, str]) -> float:
        """Validate degree (0-360)"""
        try:
            deg = float(degree)
            # Normalize to 0-360 range
            deg = deg % 360
            if deg < 0:
                deg += 360
            return deg
        except (ValueError, TypeError):
            logger.warning(f"Invalid degree '{degree}', defaulting to 0.0")
            return 0.0
    
    @staticmethod
    def safe_extract_planet_data(raw_planet: Dict[str, Any], planet_name: str) -> Planet:
        """Safely extract planet data with type validation"""
        try:
            return Planet(
                name=AstrologyTypeBridge.validate_planet_name(planet_name),
                position=AstrologyTypeBridge.validate_degree(raw_planet.get('position', 0)),
                sign=AstrologyTypeBridge._degree_to_sign(raw_planet.get('position', 0)),
                degree=raw_planet.get('position', 0) % 30,
                house=str(raw_planet.get('house', 1)),
                retrograde=bool(raw_planet.get('retrograde', False))
            )
        except (ValueError, TypeError, KeyError) as e:
            logger.warning(f"Failed to extract planet data for {planet_name}: {e}")
            return Planet(
                name=planet_name,
                position=0.0,
                sign='aries',
                degree=0.0,
                house='1',
                retrograde=False
            )
    
    @staticmethod
    def safe_extract_house_data(raw_house: Dict[str, Any], house_number: int) -> House:
        """Extract house data safely with type conversion"""
        try:
            cusp_position = float(raw_house.get('cusp', raw_house.get('degree', 0.0)))
            sign = str(raw_house.get('sign', 'aries'))
            
            return House(
                house=house_number,
                number=house_number,
                sign=sign,
                degree=cusp_position,
                cusp=cusp_position,
                ruler=str(raw_house.get('ruler', AstrologyTypeBridge._get_sign_ruler(sign)))
            )
        except Exception as e:
            logger.error(f"Error extracting house data: {e}")
            return House(
                house=house_number,
                number=house_number,
                sign='aries',
                degree=0.0,
                cusp=0.0,
                ruler='mars'
            )

    @staticmethod
    def _get_sign_ruler(sign: str) -> str:
        """Get the traditional ruler of a zodiac sign"""
        rulers = {
            'aries': 'mars', 'taurus': 'venus', 'gemini': 'mercury',
            'cancer': 'moon', 'leo': 'sun', 'virgo': 'mercury',
            'libra': 'venus', 'scorpio': 'mars', 'sagittarius': 'jupiter',
            'capricorn': 'saturn', 'aquarius': 'saturn', 'pisces': 'jupiter'
        }
        return rulers.get(sign.lower(), 'sun')
    
    @staticmethod
    def safe_extract_aspect_data(raw_aspect: Dict[str, Any]) -> Optional[Aspect]:
        """Safely extract and validate aspect data"""
        try:
            planet1 = raw_aspect.get('planet1', '')
            planet2 = raw_aspect.get('planet2', '')
            aspect_type = raw_aspect.get('type', 'conjunction')
            orb = float(raw_aspect.get('orb', 0))
            
            if not planet1 or not planet2:
                return None
                
            return Aspect(
                planet1=AstrologyTypeBridge.validate_planet_name(planet1),
                planet2=AstrologyTypeBridge.validate_planet_name(planet2),
                type=aspect_type.lower(),
                orb=abs(orb),  # Ensure positive orb
                applying="applying" if bool(raw_aspect.get('applying', False)) else "separating"
            )
        except Exception as e:
            logger.error(f"Error extracting aspect data: {e}")
            return None
    
    @staticmethod
    def convert_chart_data(raw_chart: Dict[str, Any]) -> Dict[str, Any]:
        """Convert raw chart calculation to typed chart data"""
        try:
            # Extract planets
            planets: List[Planet] = []
            raw_planets = raw_chart.get('planets', {})
            for planet_name, planet_data in raw_planets.items():
                planet = AstrologyTypeBridge.safe_extract_planet_data(planet_data, planet_name)
                planets.append(planet)
            
            # Extract houses
            houses: List[House] = []
            raw_houses = raw_chart.get('houses', [])
            for i, house_data in enumerate(raw_houses, 1):
                if isinstance(house_data, dict):
                    # Type-safe cast for dynamic data
                    house_dict = cast(Dict[str, Any], house_data)
                    house = AstrologyTypeBridge.safe_extract_house_data(house_dict, i)
                    houses.append(house)
            
            # Extract aspects
            aspects: List[Aspect] = []
            raw_aspects = raw_chart.get('aspects', [])
            for aspect_data in raw_aspects:
                if isinstance(aspect_data, dict):
                    # Type-safe cast for dynamic data
                    aspect_dict = cast(Dict[str, Any], aspect_data)
                    aspect = AstrologyTypeBridge.safe_extract_aspect_data(aspect_dict)
                    if aspect:
                        aspects.append(aspect)
            
            # Extract angles (ASC, MC, etc.)
            angles: List[Dict[str, Any]] = []
            raw_angles = raw_chart.get('angles', {})
            for angle_name, angle_data in raw_angles.items():
                if isinstance(angle_data, (dict, float, int)):
                    if isinstance(angle_data, (float, int)):
                        position = float(angle_data)
                    else:
                        # Type-safe cast for dict access
                        angle_dict = cast(Dict[str, Any], angle_data)
                        position = float(angle_dict.get('position', 0))
                    
                    angle: Dict[str, Any] = {
                        'name': angle_name.lower(),
                        'position': AstrologyTypeBridge.validate_degree(position),
                        'sign': AstrologyTypeBridge.validate_zodiac_sign(
                            AstrologyTypeBridge._degree_to_sign(position)
                        ),
                        'degree': position % 30
                    }
                    angles.append(angle)
            
            return {
                'planets': planets,
                'houses': houses,
                'aspects': aspects,
                'angles': angles,
                'chart_type': raw_chart.get('chart_type', 'natal'),
                'house_system': raw_chart.get('house_system', 'placidus'),
                'zodiac_system': raw_chart.get('zodiac_system', 'tropical'),
                'generated_at': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error converting chart data: {e}")
            return {
                'planets': [],
                'houses': [],
                'aspects': [],
                'angles': [],
                'chart_type': 'natal',
                'house_system': 'placidus',
                'zodiac_system': 'tropical',
                'generated_at': datetime.now().isoformat(),
                'error': f"Chart conversion failed: {str(e)}"
            }
    
    @staticmethod
    def _degree_to_sign(degree: float) -> str:
        """Convert degree position to zodiac sign"""
        degree = degree % 360
        sign_index = int(degree // 30)
        signs = ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
                'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces']
        return signs[sign_index] if 0 <= sign_index < 12 else 'aries'
    
    @staticmethod
    def validate_birth_data(birth_data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate birth data input"""
        try:
            validated = {
                'year': int(birth_data.get('year', 2000)),
                'month': max(1, min(12, int(birth_data.get('month', 1)))),
                'day': max(1, min(31, int(birth_data.get('day', 1)))),
                'hour': max(0, min(23, int(birth_data.get('hour', 12)))),
                'minute': max(0, min(59, int(birth_data.get('minute', 0)))),
                'latitude': max(-90, min(90, float(birth_data.get('latitude', 0)))),
                'longitude': max(-180, min(180, float(birth_data.get('longitude', 0)))),
                'timezone': birth_data.get('timezone', 'UTC')
            }
            
            # Validate year range
            if not (1900 <= validated['year'] <= 2100):
                logger.warning(f"Year {validated['year']} out of range, using 2000")
                validated['year'] = 2000
            
            return validated
        except Exception as e:
            logger.error(f"Error validating birth data: {e}")
            return {
                'year': 2000,
                'month': 1,
                'day': 1,
                'hour': 12,
                'minute': 0,
                'latitude': 0.0,
                'longitude': 0.0,
                'timezone': 'UTC'
            }

    @staticmethod
    def create_chart_response(
        planets: Dict[str, Any],
        houses: Dict[str, Any], 
        aspects: List[Any],
        asteroids: Optional[Dict[str, Any]] = None,
        points: Optional[Dict[str, Any]] = None,
        angles: Optional[Dict[str, Any]] = None,
        systems: Optional[Dict[str, Any]] = None,
        metadata: Optional[Dict[str, Any]] = None,
        generated_at: Optional[str] = None
    ) -> ChartResponse:
        """Create properly typed chart response"""
        if generated_at is None:
            generated_at = datetime.now().isoformat()
            
        return ChartResponse(
            success=True,
            planets=planets,
            houses=houses,
            aspects=aspects,
            asteroids=asteroids,
            points=points,
            angles=angles,
            systems=systems,
            metadata=metadata,
            generated_at=generated_at
        )
    
    @staticmethod 
    def create_multi_system_chart_response(
        birth_data_dict: Dict[str, Any],
        charts: Dict[str, Any],
        processing_time_ms: float,
        generated_at: Optional[str] = None
    ) -> MultiSystemChartResponse:
        """Create properly typed multi-system chart response"""
        if generated_at is None:
            generated_at = datetime.now().isoformat()
            
        # Convert birth data dict to BirthData model
        birth_data = BirthData(**birth_data_dict)
        
        # Create multi-system chart structure
        from backend_types.astrology_systems import (
            MultiSystemChart, ChartCalculationMetadata, WesternChart, VedicChart
        )
        
        metadata = ChartCalculationMetadata(
            calculation_time=datetime.now(),
            processing_time_ms=processing_time_ms
        )
        
        # Process chart data to ensure required fields
        western_chart = None
        if 'western' in charts:
            western_data = charts['western'].copy()
            # Ensure required fields have defaults
            western_data.setdefault('planets', [])
            western_data.setdefault('houses', [])
            western_data.setdefault('aspects', [])
            western_data.setdefault('asteroids', [])
            western_data.setdefault('angles', [])
            western_chart = WesternChart(**western_data)
            
        vedic_chart = None
        if 'vedic' in charts:
            vedic_data = charts['vedic'].copy()
            # Ensure required fields have defaults
            vedic_data.setdefault('planets', [])
            vedic_data.setdefault('houses', [])
            vedic_data.setdefault('aspects', [])
            vedic_data.setdefault('asteroids', [])
            vedic_data.setdefault('angles', [])
            vedic_chart = VedicChart(**vedic_data)
        
        multi_chart = MultiSystemChart(
            western=western_chart,
            vedic=vedic_chart,
            chinese=charts.get('chinese'),
            mayan=charts.get('mayan'),
            uranian=charts.get('uranian'),
            metadata=metadata
        )
        
        return MultiSystemChartResponse(
            success=True,
            birth_data=birth_data,
            charts=multi_chart,
            processing_time_ms=processing_time_ms,
            generated_at=generated_at
        )
    
    @staticmethod
    def create_astrology_health_check(
        calculations_available: bool = True,
        systems_online: Optional[List[str]] = None,
        timestamp: Optional[str] = None
    ) -> AstrologyHealthCheck:
        """Create properly typed astrology health check response"""
        if systems_online is None:
            systems_online = ['western', 'vedic', 'chinese', 'mayan']
        if timestamp is None:
            timestamp = datetime.now().isoformat()
            
        return AstrologyHealthCheck(
            service="Astrology Systems API",
            status='healthy' if calculations_available else 'unhealthy',
            calculations_available=calculations_available,
            systems_online=systems_online,
            timestamp=timestamp
        )
def safe_convert_chart(raw_chart: Dict[str, Any]) -> Dict[str, Any]:
    """Type-safe chart conversion wrapper"""
    return AstrologyTypeBridge.convert_chart_data(raw_chart)

def safe_validate_birth_data(birth_data: Dict[str, Any]) -> Dict[str, Any]:
    """Type-safe birth data validation wrapper"""
    return AstrologyTypeBridge.validate_birth_data(birth_data)
