# backend/astro/calculations/tcm_calculations.py
"""
TCM (Traditional Chinese Medicine) Calculation Engine
AI #3: Backend Archite    def calculate_tcm_constitution(
        self,
        year: int,
        month: int, 
        day: int,
        hour: int = 12,
        minute: int = 0,
        lat: float = 0.0,
        lon: float = 0.0,
        timezone: str = "UTC",
        user_id: str = ""
    ) -> TCMAnalysisResult:list Implementation
"""

import logging
from typing import Dict, List, Optional, Union, cast, TypedDict, Any, Mapping
from datetime import datetime

logger = logging.getLogger(__name__)

# Define chart data types to avoid Any
class PlanetPosition(TypedDict):
    position: float
    sign: str

class AstrologicalChart(TypedDict):
    planets: Dict[str, PlanetPosition]
    houses: Dict[str, Dict[str, Union[str, float]]]
    aspects: List[Dict[str, Union[str, float]]]
    birth_season: str
    birth_time_element: str

class OrganAnalysis(TypedDict):
    strength: float
    element: str
    balance_state: str
    recommendations: List[str]

class SeasonalInfluence(TypedDict):
    season: str
    influence_strength: float
    recommendations: List[str]

class HealthGuidance(TypedDict):
    constitutional_strengths: List[str]
    potential_weaknesses: List[str]
    dietary_guidelines: Dict[str, List[str]]
    exercise_recommendations: List[str]
    lifestyle_patterns: Dict[str, List[str]]
    preventive_measures: List[str]
    seasonal_adjustments: Dict[str, List[str]]
    emotional_balance_tips: List[str]

# Import astrological calculation dependencies with proper fallback handling
try:
    from .tcm_schema import (
        TCM_FIVE_ELEMENTS_DATA, 
        TCM_CONSTITUTIONAL_TYPES,
        PLANET_TCM_CORRELATIONS,
        TCMAnalysisResult,
        TCMConstitution,
        TCMAstrologicalMapping,
        validate_tcm_constitution,
        validate_elemental_balance
    )
    schema_available = True
except ImportError:
    # Fallback for development/testing
    logger.warning("TCM schema import failed - using fallbacks")
    schema_available = False
    
    # Fallback data
    TCM_FIVE_ELEMENTS_DATA = {}
    TCM_CONSTITUTIONAL_TYPES = {}
    PLANET_TCM_CORRELATIONS = {}
    
    def validate_tcm_constitution(data: Union['TCMConstitution', Dict[str, Union[str, List[str], Dict[str, str], None]]]) -> bool:
        return True
    
    def validate_elemental_balance(balance: Mapping[str, Union[float, Any]]) -> bool:  # type: ignore[misc]
        return True

# Use schema data if available, otherwise fallbacks
if schema_available:
    elements_data = TCM_FIVE_ELEMENTS_DATA
    constitutional_types = TCM_CONSTITUTIONAL_TYPES
    planet_correlations = PLANET_TCM_CORRELATIONS
else:
    elements_data = {}  # Use empty dict as fallback
    constitutional_types = {}  # Use empty dict as fallback
    planet_correlations = {}  # Use empty dict as fallback

class TCMCalculationEngine:
    """
    Traditional Chinese Medicine Calculation Engine
    Integrates Five Element Theory with Western Astrology
    """
    
    def __init__(self):
        self.elements = ["wood", "fire", "earth", "metal", "water"]
        self.element_cycle = {
            "generative": ["wood->fire", "fire->earth", "earth->metal", "metal->water", "water->wood"],
            "destructive": ["wood->earth", "fire->metal", "earth->water", "metal->fire", "water->wood"]
        }
        
    def calculate_tcm_constitution(
        self,
        year: int,
        month: int, 
        day: int,
        hour: int = 12,
        minute: int = 0,
        lat: float = 0.0,
        lon: float = 0.0,
        timezone: str = "UTC",
        user_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Calculate complete TCM constitutional analysis
        """
        try:
            logger.info(f"Calculating TCM constitution for {year}-{month}-{day}")
            
            # Get astrological chart data
            chart_data = self._get_astrological_context(
                year, month, day, hour, minute, lat, lon, timezone
            )
            
            # Calculate elemental influences from birth data
            elemental_balance = self._calculate_elemental_balance(
                year, month, day, hour, chart_data
            )
            
            # Determine primary constitutional type
            primary_constitution = self._determine_constitutional_type(
                elemental_balance, chart_data
            )
            
            # Analyze organ system strengths
            organ_analysis = self._analyze_organ_systems(
                elemental_balance, chart_data, primary_constitution
            )
            
            # Generate seasonal influences
            seasonal_influences = self._calculate_seasonal_influences(
                month, day, elemental_balance
            )
            
            # Create health guidance
            health_guidance = self._generate_health_guidance(
                primary_constitution, elemental_balance, seasonal_influences
            )
            
            # Generate astrological correlations
            astro_correlations = self._generate_astro_correlations(
                chart_data, elemental_balance
            )
            
            # Create lifestyle recommendations
            lifestyle_recs = self._generate_lifestyle_recommendations(
                primary_constitution, elemental_balance, seasonal_influences
            )
            
            # Generate treatment suggestions
            treatment_suggestions = self._generate_treatment_suggestions(
                primary_constitution, organ_analysis
            )
            
            # Calculate confidence score
            confidence = self._calculate_analysis_confidence(
                chart_data, elemental_balance, primary_constitution
            )
            
            result = {
                "user_id": user_id or "anonymous",
                "birth_data": {
                    "year": year, "month": month, "day": day,
                    "hour": hour, "minute": minute,
                    "lat": lat, "lon": lon, "timezone": timezone
                },
                "primary_constitution": primary_constitution,
                "elemental_balance": elemental_balance,
                "organ_strength_analysis": organ_analysis,
                "seasonal_influences": seasonal_influences,
                "health_guidance": health_guidance,
                "astrological_correlations": astro_correlations,
                "lifestyle_recommendations": lifestyle_recs,
                "treatment_suggestions": treatment_suggestions,
                "analysis_confidence": confidence,
                "timestamp": datetime.now().isoformat()
            }
            
            # Validate result
            if not self._validate_tcm_result(result):
                raise ValueError("TCM analysis validation failed")
                
            return result
            
        except Exception as e:
            logger.error(f"TCM calculation failed: {e}")
            # Return minimal valid result on error
            return self._create_error_result(e, user_id)
    
    def _get_astrological_context(
        self, year: int, month: int, day: int, hour: int, 
        minute: int, lat: float, lon: float, timezone: str
    ) -> AstrologicalChart:
        """Get astrological chart for TCM analysis"""
        try:
            # This would integrate with existing chart calculation
            # For now, return mock structure
            return {
                "planets": {
                    "sun": {"position": 120.5, "sign": "Cancer"},
                    "moon": {"position": 45.2, "sign": "Taurus"},
                    "mercury": {"position": 135.7, "sign": "Leo"},
                    "venus": {"position": 98.3, "sign": "Gemini"},
                    "mars": {"position": 67.8, "sign": "Gemini"}
                },
                "houses": {},
                "aspects": [],
                "birth_season": self._determine_birth_season(month),
                "birth_time_element": self._determine_time_element(hour)
            }
        except Exception as e:
            logger.warning(f"Chart calculation failed, using fallback: {e}")
            return {
                "planets": {}, 
                "houses": {}, 
                "aspects": [], 
                "birth_season": "unknown", 
                "birth_time_element": "unknown"
            }
    
    def _calculate_elemental_balance(
        self, year: int, month: int, day: int, hour: int, chart_data: AstrologicalChart
    ) -> Dict[str, float]:
        """Calculate Five Element balance from birth data and planets"""
        
        element_scores = {element: 0.0 for element in self.elements}
        
        # Birth season influence (strongest factor)
        birth_season = chart_data.get("birth_season", "unknown")
        seasonal_element = self._get_seasonal_element(birth_season)
        if seasonal_element in element_scores:
            element_scores[seasonal_element] += 0.3
        
        # Birth hour influence 
        birth_hour_element = chart_data.get("birth_time_element", "unknown")
        if birth_hour_element in element_scores:
            element_scores[birth_hour_element] += 0.2
            
        # Planetary influences
        planets = chart_data.get("planets", {})
        for planet_name, planet_data in planets.items():
            if planet_name.lower() in PLANET_TCM_CORRELATIONS:
                correlation = PLANET_TCM_CORRELATIONS[planet_name.lower()]
                primary_element = correlation["primary_element"]
                
                # Handle multi-element associations
                if "_" in primary_element:
                    elements = primary_element.split("_")
                    weight = 0.15 / len(elements)
                    for elem in elements:
                        if elem in element_scores:
                            element_scores[elem] += weight
                else:
                    if primary_element in element_scores:
                        element_scores[primary_element] += 0.15
        
        # Birth year element (Chinese astrology integration)
        year_element = self._get_chinese_year_element(year)
        if year_element in element_scores:
            element_scores[year_element] += 0.1
            
        # Numerological influences
        birth_number = self._calculate_birth_number(year, month, day)
        numerology_element = self._get_numerology_element(birth_number)
        if numerology_element in element_scores:
            element_scores[numerology_element] += 0.05
        
        # Normalize scores to sum to 1.0
        total_score = sum(element_scores.values())
        if total_score > 0:
            element_scores = {elem: score/total_score for elem, score in element_scores.items()}
        else:
            # Equal distribution fallback
            element_scores = {elem: 0.2 for elem in self.elements}
            
        return element_scores
    
    def _determine_constitutional_type(
        self, elemental_balance: Dict[str, float], chart_data: AstrologicalChart
    ) -> 'TCMConstitution':
        """Determine primary constitutional type"""
        
        # Find dominant element
        dominant_element = max(elemental_balance.items(), key=lambda x: x[1])
        primary_element = dominant_element[0]
        
        # Find secondary element (second highest that's not too close to primary)
        sorted_elements = sorted(elemental_balance.items(), key=lambda x: x[1], reverse=True)
        secondary_element = sorted_elements[1][0] if len(sorted_elements) > 1 else None
        
        # Create constitutional type key
        constitution_key = f"{primary_element}_dominant"
        
        # Get base constitution from schema
        if schema_available and constitution_key in TCM_CONSTITUTIONAL_TYPES:
            base_constitution = dict(TCM_CONSTITUTIONAL_TYPES[constitution_key])
        else:
            # Create generic constitution
            base_constitution = self._create_generic_constitution(primary_element)
        
        # Customize based on chart data and secondary element
        if secondary_element:
            # Safe type conversion using the literal value pattern (same as type bridge)
            if isinstance(base_constitution, dict):
                constitution_dict = dict(base_constitution)
            else:
                # Convert to dict safely with literal defaults
                constitution_dict = {
                    "primary_element": getattr(base_constitution, "primary_element", primary_element),
                    "secondary_element": secondary_element,
                    "element_strength": getattr(base_constitution, "element_strength", 0.8),
                    "constitutional_type": getattr(base_constitution, "constitutional_type", "balanced"),
                    "organ_systems": getattr(base_constitution, "organ_systems", {}),
                    "dietary_guidelines": getattr(base_constitution, "dietary_guidelines", []),
                    "lifestyle_recommendations": getattr(base_constitution, "lifestyle_recommendations", []),
                }
            constitution_dict["secondary_element"] = secondary_element
            final_constitution = cast('TCMConstitution', self._customize_constitution(
                constitution_dict, chart_data, elemental_balance
            ))
        else:
            final_constitution = cast('TCMConstitution', base_constitution)
        
        # Return the properly typed constitution
        return final_constitution
    
    def _analyze_organ_systems(
        self,
        elemental_balance: Dict[str, float],
        chart_data: AstrologicalChart,
        constitution: TCMConstitution
    ) -> Dict[str, OrganAnalysis]:
        """Analyze strength of TCM organ systems"""
        
        organ_analysis = {}
        
        for element, strength in elemental_balance.items():
            if element in TCM_FIVE_ELEMENTS_DATA:
                element_data = TCM_FIVE_ELEMENTS_DATA[element]
                
                # Analyze yin organ
                yin_organ = element_data["yin_organ"]
                organ_analysis[yin_organ] = {
                    "element": element,
                    "organ_type": "yin",
                    "strength_score": strength,
                    "energy_level": self._categorize_strength(strength),
                    "optimal_time": element_data["meridian_flow_hours"][yin_organ],
                    "emotion_balanced": element_data["emotion_balanced"],
                    "emotion_imbalanced": element_data["emotion_imbalanced"],
                    "supporting_elements": self._get_supporting_elements(element),
                    "challenging_elements": self._get_challenging_elements(element)
                }
                
                # Analyze yang organ
                yang_organ = element_data["yang_organ"]
                organ_analysis[yang_organ] = {
                    "element": element,
                    "organ_type": "yang", 
                    "strength_score": strength * 0.9,  # Yang slightly lower
                    "energy_level": self._categorize_strength(strength * 0.9),
                    "optimal_time": element_data["meridian_flow_hours"][yang_organ],
                    "emotion_balanced": element_data["emotion_balanced"],
                    "emotion_imbalanced": element_data["emotion_imbalanced"],
                    "supporting_elements": self._get_supporting_elements(element),
                    "challenging_elements": self._get_challenging_elements(element)
                }
        
        return cast(Dict[str, 'OrganAnalysis'], organ_analysis)
    
    def _calculate_seasonal_influences(
        self, birth_month: int, birth_day: int, elemental_balance: Dict[str, float]
    ) -> Dict[str, SeasonalInfluence]:
        """Calculate how seasons affect this person's constitution"""
        
        seasonal_effects = {}
        
        for season, months in [
            ("spring", [3, 4, 5]), ("summer", [6, 7, 8]),
            ("late_summer", [8, 9]), ("autumn", [9, 10, 11]), 
            ("winter", [12, 1, 2])
        ]:
            seasonal_element = self._get_seasonal_element(season)
            personal_affinity = elemental_balance.get(seasonal_element, 0.2)
            
            # Calculate seasonal compatibility
            compatibility = "high" if personal_affinity > 0.3 else "moderate" if personal_affinity > 0.15 else "low"
            
            seasonal_effects[season] = {
                "season": season,
                "influence_strength": personal_affinity,
                "recommendations": self._get_seasonal_recommendations(season, compatibility),
                "optimal_activities": self._get_seasonal_activities(season),
                "foods_to_favor": self._get_seasonal_foods(season, True),
                "foods_to_avoid": self._get_seasonal_foods(season, False),
                "energy_patterns": f"{compatibility} energy compatibility",
                "potential_challenges": self._get_seasonal_challenges(season, compatibility)
            }
        
        return cast(Dict[str, 'SeasonalInfluence'], seasonal_effects)
    
    def _generate_health_guidance(
        self, 
        constitution: Union[TCMConstitution, Dict[str, Any]],
        elemental_balance: Dict[str, float],
        seasonal_influences: Dict[str, SeasonalInfluence]
    ) -> HealthGuidance:
        """Generate comprehensive health guidance"""
        
        # Convert TypedDict to regular dict for safe access
        constitution_dict = cast(Dict[str, Any], constitution)
        primary_element = constitution_dict.get("primary_element", "earth")
        
        return {
            "constitutional_strengths": constitution_dict.get("characteristics", []),
            "potential_weaknesses": self._identify_constitutional_weaknesses(cast('TCMConstitution', constitution), elemental_balance),
            "dietary_guidelines": self._generate_dietary_guidelines(primary_element, elemental_balance),
            "exercise_recommendations": self._generate_exercise_recommendations(primary_element),
            "lifestyle_patterns": self._generate_lifestyle_patterns(cast('TCMConstitution', constitution)),
            "preventive_measures": self._generate_preventive_measures(cast('TCMConstitution', constitution), elemental_balance),
            "seasonal_adjustments": self._generate_seasonal_adjustments(seasonal_influences),
            "emotional_balance_tips": self._generate_emotional_balance_tips(cast('TCMConstitution', constitution))
        }
    
    def _generate_astro_correlations(
        self, chart_data: AstrologicalChart, elemental_balance: Dict[str, float]
    ) -> List[TCMAstrologicalMapping]:
        """Generate specific astrology-TCM correlations"""
        
        correlations = []
        planets = chart_data.get("planets", {})
        
        for planet_name, planet_data in planets.items():
            if planet_name.lower() in PLANET_TCM_CORRELATIONS:
                correlation_data = PLANET_TCM_CORRELATIONS[planet_name.lower()]
                
                correlations.append({
                    "planet": planet_name,
                    "planet_position": planet_data.get("position", 0),
                    "planet_sign": planet_data.get("sign", "Unknown"),
                    "tcm_element": correlation_data["primary_element"],
                    "organ_system": correlation_data["organ_system"],
                    "emotional_quality": correlation_data["emotional_quality"],
                    "physical_influence": correlation_data["physical_influence"],
                    "optimal_timing": correlation_data["optimal_timing"],
                    "strength_in_chart": elemental_balance.get(
                        correlation_data["primary_element"].split("_")[0], 0.2
                    ),
                    "recommendations": self._generate_planet_tcm_recommendations(
                        planet_name, correlation_data
                    )
                })
        
        return cast(List['TCMAstrologicalMapping'], correlations)
    
    # ===== HELPER METHODS =====
    
    def _determine_birth_season(self, month: int) -> str:
        """Determine birth season from month"""
        if month in [3, 4, 5]:
            return "spring"
        elif month in [6, 7, 8]:
            return "summer" 
        elif month in [9, 10, 11]:
            return "autumn"
        else:
            return "winter"
    
    def _determine_time_element(self, hour: int) -> str:
        """Determine elemental influence from birth hour (TCM body clock)"""
        # TCM organ clock mapping to elements
        hour_elements = {
            (23, 1): "water",    # Gallbladder/Liver transition
            (1, 3): "wood",      # Liver 
            (3, 5): "metal",     # Lung
            (5, 7): "metal",     # Large Intestine
            (7, 9): "earth",     # Stomach
            (9, 11): "earth",    # Spleen
            (11, 13): "fire",    # Heart
            (13, 15): "fire",    # Small Intestine
            (15, 17): "water",   # Bladder
            (17, 19): "water",   # Kidney
            (19, 21): "fire",    # Pericardium
            (21, 23): "fire"     # Triple Heater
        }
        
        for (start, end), element in hour_elements.items():
            if start <= hour < end or (start > end and (hour >= start or hour < end)):
                return element
        return "earth"  # Default fallback
    
    def _get_seasonal_element(self, season: str) -> str:
        """Get primary element for season"""
        seasonal_map = {
            "spring": "wood",
            "summer": "fire", 
            "late_summer": "earth",
            "autumn": "metal",
            "winter": "water"
        }
        return seasonal_map.get(season, "earth")
    
    def _get_chinese_year_element(self, year: int) -> str:
        """Calculate Chinese year element"""
        # Simplified 5-element cycle (12-year cycle mapped to 5 elements)
        elements = ["metal", "water", "wood", "fire", "earth"]
        return elements[(year - 1900) % 5]
    
    def _calculate_birth_number(self, year: int, month: int, day: int) -> int:
        """Calculate numerological birth number"""
        total = year + month + day
        while total > 9:
            total = sum(int(digit) for digit in str(total))
        return total
    
    def _get_numerology_element(self, number: int) -> str:
        """Map numerology number to TCM element"""
        number_elements = {
            1: "water", 2: "earth", 3: "wood", 4: "wood", 5: "earth",
            6: "metal", 7: "metal", 8: "earth", 9: "fire"
        }
        return number_elements.get(number, "earth")
    
    def _create_generic_constitution(self, primary_element: str) -> Dict[str, Any]:
        """Create generic constitution for unknown types"""
        element_traits = {
            "wood": "Natural leader with vision and flexibility",
            "fire": "Charismatic communicator with warmth and enthusiasm", 
            "earth": "Stable and nurturing with practical wisdom",
            "metal": "Precise and organized with clarity of purpose",
            "water": "Wise and adaptable with deep inner strength"
        }
        
        return {
            "type_name": f"{primary_element.title()} Constitution",
            "primary_element": primary_element,
            "secondary_element": None,
            "dominant_organs": [TCM_FIVE_ELEMENTS_DATA[primary_element]["yin_organ"]] if primary_element in TCM_FIVE_ELEMENTS_DATA else [],
            "characteristics": [element_traits.get(primary_element, "Balanced individual")],
            "emotional_tendencies": ["Varies with elemental balance"],
            "physical_traits": ["Constitution reflects elemental dominance"],
            "astrological_correlations": {"primary_element": primary_element},
            "health_recommendations": [f"Support {primary_element} element balance"],
            "optimal_seasons": [season for season, elem in [
                ("spring", "wood"), ("summer", "fire"), ("late_summer", "earth"),
                ("autumn", "metal"), ("winter", "water")
            ] if elem == primary_element]
        }
    
    def _customize_constitution(
        self, constitution: Union[TCMConstitution, Dict[str, Any]], chart_data: AstrologicalChart, elemental_balance: Dict[str, float]
    ) -> Union[TCMConstitution, Dict[str, Any]]:
        """Customize constitution based on chart and balance"""
        # Add customizations based on secondary elements and planetary influences
        constitution_dict = cast(Dict[str, Any], constitution)
        secondary = constitution_dict.get("secondary_element")
        if secondary and secondary in TCM_FIVE_ELEMENTS_DATA:
            secondary_data = TCM_FIVE_ELEMENTS_DATA[secondary]
            characteristics = constitution_dict.get("characteristics", [])
            if isinstance(characteristics, list):
                characteristics.append(f"Secondary {secondary} influence brings {secondary_data['emotion_balanced']}")
                constitution_dict["characteristics"] = characteristics
        
        return constitution
    
    def _categorize_strength(self, strength: float) -> str:
        """Categorize organ strength level"""
        if strength >= 0.3:
            return "strong"
        elif strength >= 0.2:
            return "moderate"
        else:
            return "weak"
    
    def _get_supporting_elements(self, element: str) -> List[str]:
        """Get elements that support this element (generative cycle)"""
        cycle_map = {"wood": "water", "fire": "wood", "earth": "fire", "metal": "earth", "water": "metal"}
        supporting = cycle_map.get(element)
        return [supporting] if supporting else []
    
    def _get_challenging_elements(self, element: str) -> List[str]:
        """Get elements that challenge this element (destructive cycle)"""
        challenge_map = {"wood": "metal", "fire": "water", "earth": "wood", "metal": "fire", "water": "earth"}
        challenging = challenge_map.get(element)
        return [challenging] if challenging else []
    
    def _identify_constitutional_weaknesses(
        self, constitution: TCMConstitution, elemental_balance: Dict[str, float]
    ) -> List[str]:
        """Identify potential constitutional weaknesses"""
        weaknesses = []
        
        # Find weakest elements
        weak_elements = [elem for elem, strength in elemental_balance.items() if strength < 0.15]
        
        for weak_elem in weak_elements:
            if weak_elem in TCM_FIVE_ELEMENTS_DATA:
                element_data = TCM_FIVE_ELEMENTS_DATA[weak_elem]
                weaknesses.append(f"Weak {weak_elem} may lead to {element_data['emotion_imbalanced']}")
        
        return weaknesses
    
    def _generate_dietary_guidelines(self, primary_element: str, elemental_balance: Dict[str, float]) -> Dict[str, List[str]]:
        """Generate dietary recommendations"""
        return {
            "general": [
                f"Support {primary_element} element with appropriate foods",
                "Balance flavors according to Five Element theory",
                "Eat seasonally to support natural cycles"
            ],
            "foods_to_favor": [
                f"Foods that strengthen {primary_element} element",
                "Seasonal and local produce",
                "Balanced flavors"
            ],
            "foods_to_limit": [
                "Processed foods",
                "Excessive cold or hot foods",
                "Foods that weaken your constitution"
            ]
        }
    
    def _generate_exercise_recommendations(self, primary_element: str) -> List[str]:
        """Generate exercise recommendations"""
        exercise_map = {
            "wood": ["Flexibility training", "Martial arts", "Outdoor activities"],
            "fire": ["Cardiovascular exercise", "Dancing", "Team sports"],
            "earth": ["Strength training", "Hiking", "Yoga"],
            "metal": ["Breathing exercises", "Swimming", "Tai Chi"],
            "water": ["Low-impact exercise", "Meditation", "Water activities"]
        }
        return exercise_map.get(primary_element, ["Balanced exercise routine"])
    
    def _generate_lifestyle_patterns(self, constitution: TCMConstitution) -> Dict[str, List[str]]:
        """Generate lifestyle recommendations"""
        return {
            "daily_routine": [
                "Maintain regular sleep patterns",
                "Follow natural circadian rhythms",
                "Include movement and rest periods"
            ],
            "work_patterns": [
                "Balance activity with rest",
                "Align work with natural energy cycles"
            ],
            "stress_management": [
                "Practice stress management techniques",
                "Engage in appropriate relaxation methods"
            ]
        }
    
    def _generate_preventive_measures(
        self, constitution: TCMConstitution, elemental_balance: Dict[str, float]
    ) -> List[str]:
        """Generate preventive health measures"""
        return [
            "Regular TCM check-ups during seasonal transitions",
            "Monitor emotional balance and stress levels",
            "Support weakest elements with appropriate practices"
        ]
    
    def _generate_seasonal_adjustments(self, seasonal_influences: Dict[str, SeasonalInfluence]) -> Dict[str, List[str]]:
        """Generate seasonal adjustment recommendations"""
        return {
            season: [
                f"Adjust lifestyle for {season} season",
                f"Influence strength: {data['influence_strength']:.2f}",
                "Follow seasonal recommendations"
            ]
            for season, data in seasonal_influences.items()
        }
    
    def _generate_emotional_balance_tips(self, constitution: TCMConstitution) -> List[str]:
        """Generate emotional balance recommendations"""
        return [
            "Practice mindfulness and emotional awareness",
            "Use breathing techniques for emotional regulation",
            "Cultivate virtues associated with your dominant element"
        ]
    
    def _get_seasonal_recommendations(self, season: str, compatibility: str) -> List[str]:
        """Get specific recommendations for each season"""
        if compatibility == "high":
            return [f"This is your optimal season - embrace {season} energy"]
        elif compatibility == "moderate":
            return [f"Support yourself during {season} with balancing practices"]
        else:
            return [f"Take extra care during {season} - this may be challenging"]
    
    def _get_seasonal_activities(self, season: str) -> List[str]:
        """Get seasonal activity recommendations"""
        activities_map = {
            "spring": ["Outdoor activities", "Creative projects", "Planning and goal setting"],
            "summer": ["Social gatherings", "High-energy activities", "Travel and exploration"],
            "late_summer": ["Grounding activities", "Home projects", "Community involvement"],
            "autumn": ["Reflection and planning", "Organization", "Preparation activities"],
            "winter": ["Rest and reflection", "Indoor activities", "Meditation and introspection"]
        }
        return activities_map.get(season, ["Balanced activities"])
    
    def _get_seasonal_foods(self, season: str, favor: bool) -> List[str]:
        """Get seasonal food recommendations"""
        if favor:
            foods_map = {
                "spring": ["Green vegetables", "Light proteins", "Fresh herbs"],
                "summer": ["Cooling foods", "Fresh fruits", "Raw vegetables"],
                "late_summer": ["Root vegetables", "Grounding grains", "Sweet flavors"],
                "autumn": ["Warming spices", "Cooked vegetables", "Hearty grains"],
                "winter": ["Warming foods", "Bone broths", "Stored foods"]
            }
        else:
            foods_map = {
                "spring": ["Heavy foods", "Excessive dairy", "Processed foods"],
                "summer": ["Hot spicy foods", "Heavy meals", "Excess heating foods"],
                "late_summer": ["Cold foods", "Excessive sweets", "Damp-producing foods"],
                "autumn": ["Cold raw foods", "Excessive cooling foods", "Light meals"],
                "winter": ["Cold foods", "Raw vegetables", "Cooling beverages"]
            }
        return foods_map.get(season, ["Balanced foods"])
    
    def _get_seasonal_challenges(self, season: str, compatibility: str) -> List[str]:
        """Get potential seasonal challenges"""
        if compatibility == "high":
            return ["May become overstimulated during peak season"]
        elif compatibility == "moderate":
            return ["Monitor energy levels during seasonal transitions"]
        else:
            return ["May experience fatigue or imbalance", "Extra self-care needed"]
    
    def _generate_planet_tcm_recommendations(
        self, planet: str, correlation_data: TCMAstrologicalMapping
    ) -> List[str]:
        """Generate recommendations based on planet-TCM correlations"""
        # Convert TypedDict to regular dict for safe access
        correlation_dict = cast(Dict[str, Any], correlation_data)
        return [
            f"Work with {planet} energy during {correlation_dict.get('optimal_timing', 'appropriate times')}",
            f"Focus on {correlation_dict.get('emotional_quality', 'balanced emotions')} development",
            f"Support {correlation_dict.get('organ_system', 'overall health')} health"
        ]
    
    def _generate_lifestyle_recommendations(
        self, 
        constitution: TCMConstitution,
        elemental_balance: Dict[str, float],
        seasonal_influences: Dict[str, SeasonalInfluence]
    ) -> Dict[str, List[str]]:
        """Generate comprehensive lifestyle recommendations"""
        return {
            "daily_routine": [
                "Wake and sleep with natural light cycles",
                "Eat meals at consistent times",
                "Include movement and rest periods"
            ],
            "stress_management": [
                "Practice appropriate meditation for your constitution",
                "Use breathing techniques",
                "Engage in creative expression"
            ],
            "social_connections": [
                "Build supportive relationships",
                "Engage with community",
                "Balance solitude and social time"
            ]
        }
    
    def _generate_treatment_suggestions(
        self, constitution: TCMConstitution, organ_analysis: Dict[str, OrganAnalysis]
    ) -> Dict[str, List[str]]:
        """Generate treatment modality suggestions"""
        return {
            "acupuncture": [
                "Focus on meridians related to dominant organs",
                "Seasonal treatments for balance",
                "Constitutional strengthening points"
            ],
            "herbal_medicine": [
                "Constitutional formulas for your type",
                "Seasonal herbal support",
                "Organ-specific strengthening herbs"
            ],
            "lifestyle_therapy": [
                "Qigong exercises for your constitution",
                "Dietary therapy based on Five Elements",
                "Emotional regulation practices"
            ]
        }
    
    def _calculate_analysis_confidence(
        self,
        chart_data: AstrologicalChart,
        elemental_balance: Dict[str, float],
        constitution: Union[TCMConstitution, Dict[str, Any]]
    ) -> float:
        """Calculate confidence score for the analysis"""
        confidence_factors = []
        
        # Chart data quality
        if chart_data.get("planets"):
            confidence_factors.append(0.3)
        
        # Elemental balance clarity
        max_element_strength = max(elemental_balance.values())
        if max_element_strength > 0.3:
            confidence_factors.append(0.3)
        elif max_element_strength > 0.25:
            confidence_factors.append(0.2)
        else:
            confidence_factors.append(0.1)
            
        # Constitution validation
        try:
            constitution_dict = cast(Dict[str, Any], constitution)
            if constitution_dict and constitution_dict.get("type_name") and constitution_dict.get("primary_element"):
                confidence_factors.append(0.2)
        except (TypeError, KeyError):
            pass
            
        # Elemental balance validation
        try:
            if elemental_balance and len(elemental_balance) == 5:
                confidence_factors.append(0.2)
        except (TypeError, AttributeError):
            pass
        
        return min(sum(confidence_factors), 1.0)
    
    def _validate_tcm_result(self, result: Union[TCMAnalysisResult, Dict[str, Any]]) -> bool:
        """Validate complete TCM analysis result"""
        try:
            # Convert TypedDict to regular dict for safe access
            result_dict = cast(Dict[str, Any], result)
            
            # Check required fields
            required_fields = ["user_id", "primary_constitution", "elemental_balance", "analysis_confidence"]
            if not all(field in result_dict for field in required_fields):
                return False
                
            # Validate elemental balance structure
            try:
                elemental_balance = result_dict.get("elemental_balance", {})
                if not (isinstance(elemental_balance, dict) and len(elemental_balance) == 5):
                    return False
            except (TypeError, KeyError):
                return False
                
            # Validate constitution structure
            try:
                constitution = result_dict.get("primary_constitution", {})
                constitution_dict = cast(Dict[str, Any], constitution)
                if not (isinstance(constitution_dict, dict) and constitution_dict.get("type_name")):
                    return False
            except (TypeError, KeyError):
                return False
                
            # Check confidence is reasonable
            confidence = result_dict.get("analysis_confidence", 0.0)
            if not 0.0 <= confidence <= 1.0:
                return False
                
            return True
        except Exception as e:
            logger.error(f"TCM result validation failed: {e}")
            return False
    
    def _create_error_result(self, error: Exception, user_id: Optional[str]) -> Dict[str, Any]:
        """Create minimal valid result on error"""
        return {
            "user_id": user_id or "anonymous",
            "birth_data": {},
            "primary_constitution": self._create_generic_constitution("earth"),
            "elemental_balance": {"wood": 0.2, "fire": 0.2, "earth": 0.2, "metal": 0.2, "water": 0.2},
            "organ_strength_analysis": {},
            "seasonal_influences": {},
            "health_guidance": {"error": f"Analysis failed: {str(error)}"},
            "astrological_correlations": [],
            "lifestyle_recommendations": {},
            "treatment_suggestions": {},
            "analysis_confidence": 0.0,
            "timestamp": datetime.now().isoformat()
        }


# ===== MODULE EXPORTS =====

def calculate_tcm_constitution(
    year: int, month: int, day: int, hour: int = 12, minute: int = 0,
    lat: float = 0.0, lon: float = 0.0, timezone: str = "UTC", user_id: Optional[str] = None
) -> Dict[str, Any]:
    """
    Main function to calculate TCM constitutional analysis
    Compatible with existing spiritual systems API
    """
    engine = TCMCalculationEngine()
    result = engine.calculate_tcm_constitution(
        year, month, day, hour, minute, lat, lon, timezone, user_id
    )
    # Convert TypedDict to regular dict for API compatibility
    return cast(Dict[str, Any], result)


# Create engine instance for module-level access
tcm_engine = TCMCalculationEngine()
