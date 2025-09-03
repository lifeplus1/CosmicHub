"""
Personality analysis calculations combining MBTI, Enneagram, and astrological insights.
"""
from typing import Dict, Any, List, Optional
from datetime import datetime

class PersonalityAnalyzer:
    """Advanced personality analysis integrating MBTI, Enneagram with astrological data"""
    
    def __init__(self):
        # MBTI Cognitive Functions Framework
        self.cognitive_functions = {
            'INTJ': {'dominant': 'Ni', 'auxiliary': 'Te', 'tertiary': 'Fi', 'inferior': 'Se'},
            'INTP': {'dominant': 'Ti', 'auxiliary': 'Ne', 'tertiary': 'Si', 'inferior': 'Fe'},
            'ENTJ': {'dominant': 'Te', 'auxiliary': 'Ni', 'tertiary': 'Se', 'inferior': 'Fi'},
            'ENTP': {'dominant': 'Ne', 'auxiliary': 'Ti', 'tertiary': 'Fe', 'inferior': 'Si'},
            'INFJ': {'dominant': 'Ni', 'auxiliary': 'Fe', 'tertiary': 'Ti', 'inferior': 'Se'},
            'INFP': {'dominant': 'Fi', 'auxiliary': 'Ne', 'tertiary': 'Si', 'inferior': 'Te'},
            'ENFJ': {'dominant': 'Fe', 'auxiliary': 'Ni', 'tertiary': 'Se', 'inferior': 'Ti'},
            'ENFP': {'dominant': 'Ne', 'auxiliary': 'Fi', 'tertiary': 'Te', 'inferior': 'Si'},
            'ISTJ': {'dominant': 'Si', 'auxiliary': 'Te', 'tertiary': 'Fi', 'inferior': 'Ne'},
            'ISFJ': {'dominant': 'Si', 'auxiliary': 'Fe', 'tertiary': 'Ti', 'inferior': 'Ne'},
            'ESTJ': {'dominant': 'Te', 'auxiliary': 'Si', 'tertiary': 'Ne', 'inferior': 'Fi'},
            'ESFJ': {'dominant': 'Fe', 'auxiliary': 'Si', 'tertiary': 'Ne', 'inferior': 'Ti'},
            'ISTP': {'dominant': 'Ti', 'auxiliary': 'Se', 'tertiary': 'Ni', 'inferior': 'Fe'},
            'ISFP': {'dominant': 'Fi', 'auxiliary': 'Se', 'tertiary': 'Ni', 'inferior': 'Te'},
            'ESTP': {'dominant': 'Se', 'auxiliary': 'Ti', 'tertiary': 'Fe', 'inferior': 'Ni'},
            'ESFP': {'dominant': 'Se', 'auxiliary': 'Fi', 'tertiary': 'Te', 'inferior': 'Ni'},
        }
        
        # Astrological correlations for MBTI
        self.mbti_astrological_correlations = {
            'E': ['sun_fire', 'mars_strong', 'jupiter_strong', 'leo_stellium', 'aries_stellium'],
            'I': ['moon_water', 'neptune_strong', 'saturn_strong', 'cancer_stellium', 'pisces_stellium'],
            'S': ['earth_emphasis', 'saturn_strong', 'taurus_stellium', 'virgo_stellium', 'capricorn_stellium'],
            'N': ['air_emphasis', 'uranus_strong', 'mercury_strong', 'gemini_stellium', 'aquarius_stellium'],
            'T': ['mars_strong', 'saturn_strong', 'fire_air_emphasis', 'aries_aspects'],
            'F': ['venus_strong', 'moon_strong', 'water_emphasis', 'cancer_aspects', 'libra_aspects'],
            'J': ['saturn_strong', 'capricorn_emphasis', 'fixed_signs', 'earth_emphasis'],
            'P': ['jupiter_strong', 'mutable_signs', 'gemini_emphasis', 'sagittarius_emphasis']
        }
        
        # Enneagram house and planetary correlations
        self.enneagram_correlations: Dict[int, Dict[str, Any]] = {
            1: {
                'houses': [1, 6, 10],
                'planets': ['mars', 'saturn'],
                'signs': ['aries', 'virgo', 'capricorn'],
                'description': 'The Perfectionist/Reformer'
            },
            2: {
                'houses': [2, 7, 11],
                'planets': ['venus', 'moon'],
                'signs': ['cancer', 'libra', 'pisces'],
                'description': 'The Helper/Giver'
            },
            3: {
                'houses': [1, 5, 10],
                'planets': ['sun', 'mars'],
                'signs': ['leo', 'aries', 'capricorn'],
                'description': 'The Achiever/Performer'
            },
            4: {
                'houses': [4, 8, 12],
                'planets': ['moon', 'neptune', 'pluto'],
                'signs': ['cancer', 'scorpio', 'pisces'],
                'description': 'The Individualist/Artist'
            },
            5: {
                'houses': [3, 9, 11],
                'planets': ['mercury', 'uranus'],
                'signs': ['gemini', 'virgo', 'aquarius'],
                'description': 'The Investigator/Observer'
            },
            6: {
                'houses': [2, 6, 8],
                'planets': ['saturn', 'mercury'],
                'signs': ['taurus', 'virgo', 'scorpio'],
                'description': 'The Loyalist/Guardian'
            },
            7: {
                'houses': [3, 5, 9, 11],
                'planets': ['jupiter', 'venus'],
                'signs': ['gemini', 'leo', 'sagittarius'],
                'description': 'The Enthusiast/Adventurer'
            },
            8: {
                'houses': [1, 8, 10],
                'planets': ['mars', 'pluto'],
                'signs': ['aries', 'leo', 'scorpio'],
                'description': 'The Challenger/Leader'
            },
            9: {
                'houses': [4, 7, 12],
                'planets': ['venus', 'neptune'],
                'signs': ['taurus', 'cancer', 'libra', 'pisces'],
                'description': 'The Peacemaker/Mediator'
            }
        }
    
    def analyze_personality(self, chart_data: Dict[str, Any]) -> Dict[str, Any]:
        """Complete personality analysis combining MBTI and Enneagram"""
        mbti_analysis = self.calculate_mbti(chart_data)
        enneagram_analysis = self.calculate_enneagram(chart_data)
        
        return {
            'mbti': mbti_analysis,
            'enneagram': enneagram_analysis,
            'synthesis': self._create_synthesis(mbti_analysis, enneagram_analysis, chart_data),
            'timestamp': datetime.now().isoformat()
        }
    
    def calculate_mbti(self, chart_data: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate MBTI type with cognitive functions and astrological correlations"""
        # Calculate preference scores
        extroversion = self._calculate_extroversion(chart_data)
        intuition = self._calculate_intuition(chart_data)
        thinking = self._calculate_thinking(chart_data)
        judging = self._calculate_judging(chart_data)
        
        # Determine MBTI type
        mbti_type = (
            ('E' if extroversion > 0.5 else 'I') +
            ('N' if intuition > 0.5 else 'S') +
            ('T' if thinking > 0.5 else 'F') +
            ('J' if judging > 0.5 else 'P')
        )
        
        # Get cognitive functions
        functions = self.cognitive_functions.get(mbti_type, {})
        
        return {
            'type': mbti_type,
            'preferences': {
                'extroversion_introversion': {'score': extroversion, 'preference': 'E' if extroversion > 0.5 else 'I'},
                'sensing_intuition': {'score': intuition, 'preference': 'N' if intuition > 0.5 else 'S'},
                'thinking_feeling': {'score': thinking, 'preference': 'T' if thinking > 0.5 else 'F'},
                'judging_perceiving': {'score': judging, 'preference': 'J' if judging > 0.5 else 'P'}
            },
            'cognitive_functions': functions,
            'astrological_correlations': self._get_mbti_astrological_correlations(mbti_type, chart_data),
            'description': self._get_mbti_description(mbti_type),
            'strength_confidence': min(
                abs(extroversion - 0.5), abs(intuition - 0.5),
                abs(thinking - 0.5), abs(judging - 0.5)
            ) * 2  # Convert to 0-1 scale
        }
    
    def calculate_enneagram(self, chart_data: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate Enneagram type with astrological correlations"""
        type_scores: Dict[int, float] = {}
        
        # Calculate scores for each Enneagram type
        for enneagram_type, correlations in self.enneagram_correlations.items():
            score = self._calculate_enneagram_type_score(correlations, chart_data)
            type_scores[enneagram_type] = score
        
        # Determine primary and secondary types
        sorted_types = sorted(type_scores.items(), key=lambda x: x[1], reverse=True)
        primary_type: int = sorted_types[0][0]
        secondary_type: Optional[int] = sorted_types[1][0] if len(sorted_types) > 1 else None
        
        return {
            'primary_type': primary_type,
            'secondary_type': secondary_type,
            'type_scores': type_scores,
            'description': self.enneagram_correlations[primary_type]['description'],
            'astrological_correlations': self._get_enneagram_astrological_correlations(primary_type, chart_data),
            'wings': self._calculate_enneagram_wings(primary_type, type_scores),
            'instinctual_variants': self._determine_instinctual_variants(chart_data),
            'confidence': sorted_types[0][1]
        }
    
    def _calculate_extroversion(self, chart_data: Dict[str, Any]) -> float:
        """Calculate extroversion score from astrological indicators"""
        score = 0.5  # Base score
        
        # Fire signs emphasis
        fire_emphasis = chart_data.get('element_emphasis', {}).get('fire', 0)
        score += (fire_emphasis - 0.25) * 0.4
        
        # Strong Sun/Mars
        sun_strength = chart_data.get('planetary_strengths', {}).get('sun', 0.5)
        mars_strength = chart_data.get('planetary_strengths', {}).get('mars', 0.5)
        score += (sun_strength + mars_strength - 1.0) * 0.3
        
        # Angular houses (1, 4, 7, 10)
        angular_emphasis = chart_data.get('house_emphasis', {}).get('angular', 0.5)
        score += (angular_emphasis - 0.5) * 0.3
        
        return max(0, min(1, score))
    
    def _calculate_intuition(self, chart_data: Dict[str, Any]) -> float:
        """Calculate intuition score from astrological indicators"""
        score = 0.5  # Base score
        
        # Air signs emphasis
        air_emphasis = chart_data.get('element_emphasis', {}).get('air', 0)
        score += (air_emphasis - 0.25) * 0.3
        
        # Water signs (intuitive depth)
        water_emphasis = chart_data.get('element_emphasis', {}).get('water', 0)
        score += (water_emphasis - 0.25) * 0.2
        
        # Strong Neptune/Uranus
        neptune_strength = chart_data.get('planetary_strengths', {}).get('neptune', 0.5)
        uranus_strength = chart_data.get('planetary_strengths', {}).get('uranus', 0.5)
        score += (neptune_strength + uranus_strength - 1.0) * 0.3
        
        # 9th and 12th house emphasis (higher consciousness)
        ninth_house = chart_data.get('house_emphasis', {}).get('9', 0.5)
        twelfth_house = chart_data.get('house_emphasis', {}).get('12', 0.5)
        score += (ninth_house + twelfth_house - 1.0) * 0.2
        
        return max(0, min(1, score))
    
    def _calculate_thinking(self, chart_data: Dict[str, Any]) -> float:
        """Calculate thinking score from astrological indicators"""
        score = 0.5  # Base score
        
        # Fire/Air emphasis (masculine, yang energy)
        fire_emphasis = chart_data.get('element_emphasis', {}).get('fire', 0)
        air_emphasis = chart_data.get('element_emphasis', {}).get('air', 0)
        score += (fire_emphasis + air_emphasis - 0.5) * 0.3
        
        # Strong Mars/Saturn (logical, structured)
        mars_strength = chart_data.get('planetary_strengths', {}).get('mars', 0.5)
        saturn_strength = chart_data.get('planetary_strengths', {}).get('saturn', 0.5)
        score += (mars_strength + saturn_strength - 1.0) * 0.4
        
        # Mercury in air signs
        mercury_sign = chart_data.get('planetary_positions', {}).get('mercury', {}).get('sign', '')
        if mercury_sign.lower() in ['gemini', 'libra', 'aquarius']:
            score += 0.3
        
        return max(0, min(1, score))
    
    def _calculate_judging(self, chart_data: Dict[str, Any]) -> float:
        """Calculate judging score from astrological indicators"""
        score = 0.5  # Base score
        
        # Fixed/Cardinal emphasis (structured approach)
        fixed_emphasis = chart_data.get('modality_emphasis', {}).get('fixed', 0)
        cardinal_emphasis = chart_data.get('modality_emphasis', {}).get('cardinal', 0)
        score += (fixed_emphasis + cardinal_emphasis - 0.66) * 0.4
        
        # Strong Saturn (structure, discipline)
        saturn_strength = chart_data.get('planetary_strengths', {}).get('saturn', 0.5)
        score += (saturn_strength - 0.5) * 0.4
        
        # Earth signs emphasis (practical, organized)
        earth_emphasis = chart_data.get('element_emphasis', {}).get('earth', 0)
        score += (earth_emphasis - 0.25) * 0.2
        
        return max(0, min(1, score))
    
    def _calculate_enneagram_type_score(self, correlations: Dict[str, Any], chart_data: Dict[str, Any]) -> float:
        """Calculate score for a specific Enneagram type based on astrological correlations"""
        score = 0
        
        # House correlations
        house_emphasis = chart_data.get('house_emphasis', {})
        for house in correlations['houses']:
            score += house_emphasis.get(str(house), 0.5)
        
        # Planetary correlations
        planetary_strengths = chart_data.get('planetary_strengths', {})
        for planet in correlations['planets']:
            score += planetary_strengths.get(planet, 0.5)
        
        # Sign correlations
        sign_emphasis = chart_data.get('sign_emphasis', {})
        for sign in correlations['signs']:
            score += sign_emphasis.get(sign, 0.5)
        
        # Normalize score
        total_factors = len(correlations['houses']) + len(correlations['planets']) + len(correlations['signs'])
        return score / total_factors if total_factors > 0 else 0.5
    
    def _get_mbti_astrological_correlations(self, mbti_type: str, chart_data: Dict[str, Any]) -> List[str]:
        """Get specific astrological correlations for MBTI type"""
        correlations: List[str] = []
        for letter in mbti_type:
            correlations.extend(self.mbti_astrological_correlations.get(letter, []))
        return correlations
    
    def _get_enneagram_astrological_correlations(self, enneagram_type: int, chart_data: Dict[str, Any]) -> Dict[str, Any]:
        """Get astrological correlations for Enneagram type"""
        return self.enneagram_correlations.get(enneagram_type, {})
    
    def _get_mbti_description(self, mbti_type: str) -> str:
        """Get description for MBTI type"""
        descriptions = {
            'INTJ': 'The Architect/Mastermind',
            'INTP': 'The Thinker/Logician',
            'ENTJ': 'The Commander/Executive',
            'ENTP': 'The Debater/Innovator',
            'INFJ': 'The Advocate/Counselor',
            'INFP': 'The Mediator/Healer',
            'ENFJ': 'The Protagonist/Teacher',
            'ENFP': 'The Campaigner/Inspirer',
            'ISTJ': 'The Logistician/Inspector',
            'ISFJ': 'The Protector/Nurturer',
            'ESTJ': 'The Executive/Supervisor',
            'ESFJ': 'The Consul/Provider',
            'ISTP': 'The Virtuoso/Craftsperson',
            'ISFP': 'The Adventurer/Artist',
            'ESTP': 'The Entrepreneur/Promoter',
            'ESFP': 'The Entertainer/Performer'
        }
        return descriptions.get(mbti_type, 'Unknown Type')
    
    def _calculate_enneagram_wings(self, primary_type: int, type_scores: Dict[int, float]) -> Dict[str, float]:
        """Calculate Enneagram wing strengths"""
        left_wing = primary_type - 1 if primary_type > 1 else 9
        right_wing = primary_type + 1 if primary_type < 9 else 1
        
        return {
            f'{primary_type}w{left_wing}': type_scores.get(left_wing, 0.5),
            f'{primary_type}w{right_wing}': type_scores.get(right_wing, 0.5)
        }
    
    def _determine_instinctual_variants(self, chart_data: Dict[str, Any]) -> Dict[str, float]:
        """Determine instinctual variant emphasis from chart"""
        # Self-Preservation: Earth signs, 2nd/6th houses, Saturn/Taurus emphasis
        sp_score = (
            chart_data.get('element_emphasis', {}).get('earth', 0.25) +
            chart_data.get('house_emphasis', {}).get('2', 0.5) +
            chart_data.get('house_emphasis', {}).get('6', 0.5) +
            chart_data.get('planetary_strengths', {}).get('saturn', 0.5)
        ) / 4
        
        # Social: Air signs, 7th/11th houses, Venus/Mercury emphasis
        so_score = (
            chart_data.get('element_emphasis', {}).get('air', 0.25) +
            chart_data.get('house_emphasis', {}).get('7', 0.5) +
            chart_data.get('house_emphasis', {}).get('11', 0.5) +
            chart_data.get('planetary_strengths', {}).get('venus', 0.5)
        ) / 4
        
        # Sexual/One-to-One: Fire/Water signs, 5th/8th houses, Mars/Pluto emphasis
        sx_score = (
            chart_data.get('element_emphasis', {}).get('fire', 0.25) +
            chart_data.get('element_emphasis', {}).get('water', 0.25) +
            chart_data.get('house_emphasis', {}).get('5', 0.5) +
            chart_data.get('house_emphasis', {}).get('8', 0.5) +
            chart_data.get('planetary_strengths', {}).get('mars', 0.5) +
            chart_data.get('planetary_strengths', {}).get('pluto', 0.5)
        ) / 6
        
        return {
            'self_preservation': sp_score,
            'social': so_score,
            'sexual': sx_score
        }
    
    def _create_synthesis(self, mbti: Dict[str, Any], enneagram: Dict[str, Any], chart_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create integrated synthesis of MBTI and Enneagram with astrological insights"""
        return {
            'personality_integration': f"Your {mbti['type']} personality type combined with Enneagram {enneagram['primary_type']} creates a unique psychological profile.",
            'astrological_confirmation': f"Astrological indicators support this personality combination through planetary and house emphasis patterns.",
            'development_path': self._get_development_recommendations(mbti, enneagram),
            'shadow_work': self._get_shadow_work_insights(mbti, enneagram),
            'spiritual_growth': self._get_spiritual_growth_guidance(mbti, enneagram, chart_data)
        }
    
    def _get_development_recommendations(self, mbti: Dict[str, Any], enneagram: Dict[str, Any]) -> List[str]:
        """Get personalized development recommendations"""
        return [
            f"Develop your {mbti['cognitive_functions'].get('inferior', 'weak')} function through conscious practice",
            f"As Enneagram {enneagram['primary_type']}, focus on integrating toward your growth direction",
            "Use astrological timing for personal development work"
        ]
    
    def _get_shadow_work_insights(self, mbti: Dict[str, Any], enneagram: Dict[str, Any]) -> List[str]:
        """Get shadow work insights based on type combination"""
        return [
            f"MBTI inferior function ({mbti['cognitive_functions'].get('inferior', 'unknown')}) represents a key shadow area",
            f"Enneagram {enneagram['primary_type']} core fear and desire patterns need conscious awareness",
            "Astrological 12th house and hidden planetary aspects reveal unconscious patterns"
        ]
    
    def _get_spiritual_growth_guidance(self, mbti: Dict[str, Any], enneagram: Dict[str, Any], chart_data: Dict[str, Any]) -> Dict[str, str]:
        """Get spiritual growth guidance based on integrated analysis"""
        return {
            'meditation_style': f"Recommended meditation approach based on {mbti['type']} cognitive preferences",
            'spiritual_practices': f"Practices that support Enneagram {enneagram['primary_type']} growth path",
            'astrological_timing': "Use planetary transits and lunar cycles to support personal development work"
        }

# Maintain backwards compatibility by importing the class under the old name
PersonalityCalculator = PersonalityAnalyzer
import logging
from typing import Any, Dict, List
from dataclasses import dataclass

logger = logging.getLogger(__name__)


@dataclass
class PlanetaryPosition:
    """Represents a planetary position with sign and degree"""
    planet: str
    sign: str
    degree: float
    house: int


class PersonalityCalculator:
    """Main calculator for personality systems integration with astrology"""
    
    # MBTI-Astrological Correlations (based on Jungian archetypal analysis)
    MBTI_CORRELATIONS: Dict[str, Dict[str, List[str]]] = {
        "extroversion_indicators": {
            "fire_signs": ["Aries", "Leo", "Sagittarius"],
            "air_signs": ["Gemini", "Libra", "Aquarius"],
            "angular_houses": ["1", "4", "7", "10"],
            "extroverted_aspects": ["sun_jupiter", "mars_jupiter", "sun_mars"]
        },
        "intuition_indicators": {
            "intuitive_signs": ["Sagittarius", "Pisces", "Aquarius", "Scorpio"],
            "intuitive_houses": ["9", "12", "8", "11"],
            "neptune_aspects": ["sun_neptune", "moon_neptune", "mercury_neptune"],
            "uranus_aspects": ["sun_uranus", "mercury_uranus"]
        },
        "thinking_indicators": {
            "thinking_signs": ["Gemini", "Virgo", "Aquarius", "Capricorn"],
            "thinking_houses": ["3", "6", "10", "11"],
            "mercury_emphasis": ["angular_mercury", "strong_mercury"],
            "saturn_aspects": ["mercury_saturn", "sun_saturn"]
        },
        "judging_indicators": {
            "fixed_signs": ["Taurus", "Leo", "Scorpio", "Aquarius"],
            "earth_signs": ["Taurus", "Virgo", "Capricorn"],
            "saturn_emphasis": ["angular_saturn", "strong_saturn"],
            "structure_houses": ["2", "6", "10"]
        }
    }
    
    # Enneagram-Astrological Correlations (based on passion/virtue patterns)
    ENNEAGRAM_CORRELATIONS: Dict[str, Dict[str, List[Any]]] = {
        "type_1_perfectionist": {
            "key_planets": ["saturn", "mercury"],
            "signs": ["Virgo", "Capricorn"],
            "houses": [6, 10],
            "aspects": ["saturn_sun", "mercury_saturn"]
        },
        "type_2_helper": {
            "key_planets": ["venus", "moon", "neptune"],
            "signs": ["Cancer", "Pisces", "Libra"],
            "houses": [4, 7, 12],
            "aspects": ["venus_moon", "moon_neptune"]
        },
        "type_3_achiever": {
            "key_planets": ["sun", "mars", "jupiter"],
            "signs": ["Leo", "Aries", "Capricorn"],
            "houses": [1, 5, 10],
            "aspects": ["sun_mars", "sun_jupiter"]
        },
        "type_4_individualist": {
            "key_planets": ["neptune", "pluto", "moon"],
            "signs": ["Pisces", "Scorpio", "Cancer"],
            "houses": [8, 12, 4],
            "aspects": ["moon_neptune", "sun_pluto"]
        },
        "type_5_investigator": {
            "key_planets": ["mercury", "saturn", "uranus"],
            "signs": ["Virgo", "Aquarius", "Scorpio"],
            "houses": [3, 8, 9],
            "aspects": ["mercury_saturn", "mercury_uranus"]
        },
        "type_6_loyalist": {
            "key_planets": ["moon", "saturn", "mercury"],
            "signs": ["Cancer", "Virgo", "Capricorn"],
            "houses": [2, 4, 6],
            "aspects": ["moon_saturn", "mercury_saturn"]
        },
        "type_7_enthusiast": {
            "key_planets": ["jupiter", "mercury", "uranus"],
            "signs": ["Sagittarius", "Gemini", "Aquarius"],
            "houses": [3, 9, 11],
            "aspects": ["jupiter_mercury", "jupiter_uranus"]
        },
        "type_8_challenger": {
            "key_planets": ["mars", "pluto", "sun"],
            "signs": ["Aries", "Scorpio", "Leo"],
            "houses": [1, 8, 10],
            "aspects": ["mars_pluto", "sun_mars"]
        },
        "type_9_peacemaker": {
            "key_planets": ["venus", "neptune", "moon"],
            "signs": ["Libra", "Pisces", "Taurus"],
            "houses": [7, 12, 2],
            "aspects": ["venus_neptune", "moon_venus"]
        }
    }

    # MBTI Type Descriptions with Astrological Context
    MBTI_DESCRIPTIONS: Dict[str, Dict[str, Any]] = {
        "INTJ": {
            "title": "The Architect",
            "description": "Imaginative and strategic thinkers, with a plan for everything.",
            "cognitive_functions": ["Ni", "Te", "Fi", "Se"],
            "astrological_themes": "Often correlates with strong Capricorn/Scorpio emphasis, Saturn-Pluto aspects"
        },
        "INTP": {
            "title": "The Thinker", 
            "description": "Innovative inventors with an unquenchable thirst for knowledge.",
            "cognitive_functions": ["Ti", "Ne", "Si", "Fe"],
            "astrological_themes": "Often correlates with Mercury-Uranus aspects, Aquarius/Gemini emphasis"
        },
        "ENTJ": {
            "title": "The Commander",
            "description": "Bold, imaginative and strong-willed leaders.",
            "cognitive_functions": ["Te", "Ni", "Se", "Fi"],
            "astrological_themes": "Often correlates with Leo/Capricorn emphasis, Sun-Saturn aspects"
        },
        "ENTP": {
            "title": "The Debater",
            "description": "Smart and curious thinkers who cannot resist an intellectual challenge.",
            "cognitive_functions": ["Ne", "Ti", "Fe", "Si"],
            "astrological_themes": "Often correlates with Gemini/Sagittarius emphasis, Mercury-Jupiter aspects"
        },
        "INFJ": {
            "title": "The Advocate",
            "description": "Quiet and mystical, yet very inspiring and tireless idealists.",
            "cognitive_functions": ["Ni", "Fe", "Ti", "Se"],
            "astrological_themes": "Often correlates with Scorpio/Pisces emphasis, Neptune-Pluto aspects"
        },
        "INFP": {
            "title": "The Mediator",
            "description": "Poetic, kind and altruistic people, always eager to help a good cause.",
            "cognitive_functions": ["Fi", "Ne", "Si", "Te"],
            "astrological_themes": "Often correlates with Pisces/Cancer emphasis, Venus-Neptune aspects"
        },
        "ENFJ": {
            "title": "The Protagonist",
            "description": "Charismatic and inspiring leaders, able to mesmerize their listeners.",
            "cognitive_functions": ["Fe", "Ni", "Se", "Ti"],
            "astrological_themes": "Often correlates with Leo/Libra emphasis, Sun-Venus aspects"
        },
        "ENFP": {
            "title": "The Campaigner",
            "description": "Enthusiastic, creative and sociable free spirits.",
            "cognitive_functions": ["Ne", "Fi", "Te", "Si"],
            "astrological_themes": "Often correlates with Sagittarius/Gemini emphasis, Jupiter-Mercury aspects"
        },
        "ISTJ": {
            "title": "The Logistician",
            "description": "Practical and fact-minded, reliable and responsible.",
            "cognitive_functions": ["Si", "Te", "Fi", "Ne"],
            "astrological_themes": "Often correlates with Virgo/Capricorn emphasis, Saturn-Mercury aspects"
        },
        "ISFJ": {
            "title": "The Protector",
            "description": "Warm-hearted and dedicated, always ready to protect their loved ones.",
            "cognitive_functions": ["Si", "Fe", "Ti", "Ne"],
            "astrological_themes": "Often correlates with Cancer/Virgo emphasis, Moon-Saturn aspects"
        },
        "ESTJ": {
            "title": "The Executive",
            "description": "Excellent administrators, unsurpassed at managing things or people.",
            "cognitive_functions": ["Te", "Si", "Ne", "Fi"],
            "astrological_themes": "Often correlates with Capricorn/Leo emphasis, Sun-Saturn aspects"
        },
        "ESFJ": {
            "title": "The Consul",
            "description": "Extraordinarily caring, social and popular people, always eager to help.",
            "cognitive_functions": ["Fe", "Si", "Ne", "Ti"],
            "astrological_themes": "Often correlates with Cancer/Libra emphasis, Moon-Venus aspects"
        },
        "ISTP": {
            "title": "The Virtuoso",
            "description": "Bold and practical experimenters, masters of all kinds of tools.",
            "cognitive_functions": ["Ti", "Se", "Ni", "Fe"],
            "astrological_themes": "Often correlates with Scorpio/Capricorn emphasis, Mars-Saturn aspects"
        },
        "ISFP": {
            "title": "The Adventurer",
            "description": "Flexible and charming artists, always ready to explore new possibilities.",
            "cognitive_functions": ["Fi", "Se", "Ni", "Te"],
            "astrological_themes": "Often correlates with Pisces/Taurus emphasis, Venus-Neptune aspects"
        },
        "ESTP": {
            "title": "The Entrepreneur",
            "description": "Smart, energetic and very perceptive people, truly enjoy living on the edge.",
            "cognitive_functions": ["Se", "Ti", "Fe", "Ni"],
            "astrological_themes": "Often correlates with Aries/Gemini emphasis, Mars-Mercury aspects"
        },
        "ESFP": {
            "title": "The Entertainer",
            "description": "Spontaneous, energetic and enthusiastic people - life is never boring around them.",
            "cognitive_functions": ["Se", "Fi", "Te", "Ni"],
            "astrological_themes": "Often correlates with Leo/Sagittarius emphasis, Sun-Jupiter aspects"
        }
    }


def get_personality_traits(chart: Dict[str, Any]) -> Dict[str, Any]:
    """Legacy function - get basic sun sign personality traits"""
    logger.debug(f"Analyzing personality for chart: {chart}")
    try:
        sun_sign = get_sun_sign(chart["planets"]["sun"]["position"])
        traits = {
            "Aries": "Bold, ambitious, competitive",
            "Taurus": "Stable, practical, sensual",
            "Gemini": "Curious, adaptable, communicative",
            "Cancer": "Emotional, nurturing, intuitive",
            "Leo": "Confident, charismatic, leadership-oriented",
            "Virgo": "Analytical, meticulous, service-oriented",
            "Libra": "Diplomatic, charming, balanced",
            "Scorpio": "Intense, passionate, transformative",
            "Sagittarius": "Adventurous, optimistic, philosophical",
            "Capricorn": "Disciplined, responsible, ambitious",
            "Aquarius": "Innovative, independent, humanitarian",
            "Pisces": "Empathetic, imaginative, spiritual",
        }
        return {
            "sun_sign": sun_sign,
            "traits": traits.get(sun_sign, "Unknown"),
        }
    except Exception as e:
        logger.error(f"Error in personality analysis: {str(e)}", exc_info=True)
        raise ValueError(f"Error in personality analysis: {str(e)}")


def get_sun_sign(position: float) -> str:
    """Get zodiac sign from degree position"""
    zodiac_signs = [
        "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
        "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
    ]
    sign_index = int(position % 360 / 30)
    return zodiac_signs[sign_index]


def calculate_mbti_from_chart(chart: Dict[str, Any]) -> Dict[str, Any]:
    """
    Calculate MBTI type based on astrological chart correlations
    
    This provides educational correlations between Jungian functions and
    astrological indicators. Not a replacement for proper MBTI assessment.
    
    Cultural Note: Maintains psychological validity while exploring spiritual correlations.
    """
    try:
        calculator = PersonalityCalculator()
        
        # Extract planetary positions and houses
        positions = _extract_planetary_data(chart)
        houses = _extract_house_data(chart)
        
        # Calculate dimension scores
        scores = {
            "extroversion": _calculate_extroversion_score(positions, houses, calculator),
            "intuition": _calculate_intuition_score(positions, houses, calculator),
            "thinking": _calculate_thinking_score(positions, houses, calculator),
            "judging": _calculate_judging_score(positions, houses, calculator)
        }
        
        # Determine MBTI type
        mbti_type = ""
        mbti_type += "E" if scores["extroversion"] > 0.5 else "I"
        mbti_type += "N" if scores["intuition"] > 0.5 else "S"  
        mbti_type += "T" if scores["thinking"] > 0.5 else "F"
        mbti_type += "J" if scores["judging"] > 0.5 else "P"
        
        type_info = calculator.MBTI_DESCRIPTIONS.get(mbti_type, {
            "title": "Unknown Type",
            "description": "Type information not available",
            "cognitive_functions": [],
            "astrological_themes": ""
        })
        
        return {
            "type": mbti_type,
            "title": type_info["title"],
            "description": type_info["description"],
            "cognitive_functions": type_info["cognitive_functions"],
            "dimension_scores": scores,
            "astrological_themes": type_info["astrological_themes"],
            "confidence": _calculate_confidence_score(scores),
            "disclaimer": "This correlation explores Jungian archetypal patterns in astrology. For accurate MBTI typing, professional assessment is recommended."
        }
        
    except Exception as e:
        logger.error(f"Error in MBTI calculation: {str(e)}", exc_info=True)
        return {
            "type": "Unknown",
            "error": f"Could not calculate MBTI: {str(e)}",
            "disclaimer": "Professional MBTI assessment recommended for accurate typing."
        }


def calculate_enneagram_from_chart(chart: Dict[str, Any]) -> Dict[str, Any]:
    """
    Calculate Enneagram type based on astrological chart correlations
    
    This provides educational correlations between Enneagram passions/virtues and
    astrological patterns. Not a replacement for proper Enneagram assessment.
    
    Cultural Note: Respects the spiritual depth of Enneagram while exploring astrological connections.
    """
    try:
        calculator = PersonalityCalculator()
        
        # Extract planetary positions and houses
        positions = _extract_planetary_data(chart)
        houses = _extract_house_data(chart)
        
        # Calculate type scores for all 9 types
        type_scores: Dict[str, float] = {}
        for type_key in calculator.ENNEAGRAM_CORRELATIONS:
            type_scores[type_key] = _calculate_enneagram_type_score(
                positions, houses, calculator.ENNEAGRAM_CORRELATIONS[type_key]
            )
        
        # Determine primary type
        primary_type = max(type_scores.keys(), key=lambda k: type_scores[k])
        type_number = int(primary_type.split('_')[1])
        
        # Get top 3 types
        sorted_types = sorted(type_scores.items(), key=lambda x: x[1], reverse=True)
        top_types = [(k, v) for k, v in sorted_types[:3]]
        
        return {
            "primary_type": type_number,
            "type_name": _get_enneagram_type_name(type_number),
            "description": _get_enneagram_description(type_number),
            "core_motivation": _get_enneagram_motivation(type_number),
            "core_fear": _get_enneagram_fear(type_number),
            "type_scores": {k.replace('type_', '').replace('_', ' ').title(): v for k, v in type_scores.items()},
            "top_three_types": [(int(k.split('_')[1]), v) for k, v in top_types],
            "astrological_indicators": _get_enneagram_astrological_indicators(type_number, positions),
            "confidence": type_scores[primary_type],
            "disclaimer": "This correlation explores archetypal patterns between Enneagram and astrology. For accurate typing, work with a qualified Enneagram teacher."
        }
        
    except Exception as e:
        logger.error(f"Error in Enneagram calculation: {str(e)}", exc_info=True)
        return {
            "primary_type": 0,
            "error": f"Could not calculate Enneagram: {str(e)}",
            "disclaimer": "Professional Enneagram assessment with qualified teacher recommended for accurate typing."
        }


def _extract_planetary_data(chart: Dict[str, Any]) -> Dict[str, Dict[str, Any]]:
    """Extract planetary positions and signs from chart"""
    planets: Dict[str, Dict[str, Any]] = {}
    if "planets" in chart:
        for planet, data in chart["planets"].items():
            if "position" in data:
                planets[planet] = {
                    "position": data["position"],
                    "sign": get_sun_sign(data["position"]),
                    "house": data.get("house", 1)  # Default to house 1 if not available
                }
    return planets


def _extract_house_data(chart: Dict[str, Any]) -> Dict[int, float]:
    """Extract house cusp positions from chart"""
    houses: Dict[int, float] = {}
    if "houses" in chart:
        for i, cusp in enumerate(chart["houses"], 1):
            houses[i] = cusp
    else:
        # Default equal house system starting at 0 degrees
        for i in range(1, 13):
            houses[i] = (i - 1) * 30
    return houses


def _calculate_extroversion_score(positions: Dict[str, Dict[str, Any]], houses: Dict[int, float], calculator: PersonalityCalculator) -> float:
    """Calculate extroversion tendency score"""
    score = 0.5  # Neutral starting point
    correlations = calculator.MBTI_CORRELATIONS["extroversion_indicators"]
    
    # Check fire and air sign placements
    for planet, data in positions.items():
        if planet in ["sun", "mars", "jupiter"]:
            if data["sign"] in correlations["fire_signs"]:
                score += 0.15
            elif data["sign"] in correlations["air_signs"]:
                score += 0.1
                
        # Check angular house placements
        if data["house"] in [int(h) for h in correlations["angular_houses"]]:
            if planet == "sun":
                score += 0.1
            elif planet in ["mars", "jupiter"]:
                score += 0.05
    
    return min(max(score, 0.0), 1.0)  # Clamp between 0 and 1


def _calculate_intuition_score(positions: Dict[str, Dict[str, Any]], houses: Dict[int, float], calculator: PersonalityCalculator) -> float:
    """Calculate intuition tendency score"""
    score = 0.5  # Neutral starting point
    correlations = calculator.MBTI_CORRELATIONS["intuition_indicators"]
    
    # Check intuitive sign placements
    for planet, data in positions.items():
        if planet in ["mercury", "jupiter", "neptune", "uranus"]:
            if data["sign"] in correlations["intuitive_signs"]:
                score += 0.1
                
        # Check intuitive house placements
        if data["house"] in [int(h) for h in correlations["intuitive_houses"]]:
            if planet in ["mercury", "jupiter", "neptune"]:
                score += 0.08
    
    return min(max(score, 0.0), 1.0)


def _calculate_thinking_score(positions: Dict[str, Dict[str, Any]], houses: Dict[int, float], calculator: PersonalityCalculator) -> float:
    """Calculate thinking tendency score"""
    score = 0.5  # Neutral starting point
    correlations = calculator.MBTI_CORRELATIONS["thinking_indicators"]
    
    # Check thinking sign placements
    for planet, data in positions.items():
        if planet in ["mercury", "saturn"]:
            if data["sign"] in correlations["thinking_signs"]:
                score += 0.12
                
        # Check thinking house placements
        if data["house"] in [int(h) for h in correlations["thinking_houses"]]:
            if planet == "mercury":
                score += 0.1
            elif planet == "saturn":
                score += 0.08
    
    return min(max(score, 0.0), 1.0)


def _calculate_judging_score(positions: Dict[str, Dict[str, Any]], houses: Dict[int, float], calculator: PersonalityCalculator) -> float:
    """Calculate judging tendency score"""
    score = 0.5  # Neutral starting point
    correlations = calculator.MBTI_CORRELATIONS["judging_indicators"]
    
    # Check structured sign placements
    for planet, data in positions.items():
        if planet in ["sun", "saturn"]:
            if data["sign"] in correlations["fixed_signs"]:
                score += 0.1
            elif data["sign"] in correlations["earth_signs"]:
                score += 0.12
                
        # Check structure house placements
        if data["house"] in [int(h) for h in correlations["structure_houses"]]:
            if planet == "saturn":
                score += 0.1
            elif planet == "sun":
                score += 0.08
    
    return min(max(score, 0.0), 1.0)


def _calculate_enneagram_type_score(positions: Dict[str, Dict[str, Any]], houses: Dict[int, float], type_data: Dict[str, Any]) -> float:
    """Calculate correlation score for specific Enneagram type"""
    score = 0.0
    
    # Check key planet placements
    for planet in type_data.get("key_planets", []):
        if planet in positions:
            planet_data = positions[planet]
            
            # Sign correlations
            if planet_data["sign"] in type_data.get("signs", []):
                score += 0.3
                
            # House correlations  
            if planet_data["house"] in type_data.get("houses", []):
                score += 0.2
    
    # Normalize score
    max_possible = len(type_data.get("key_planets", [])) * 0.5
    if max_possible > 0:
        score = score / max_possible
        
    return min(max(score, 0.0), 1.0)


def _calculate_confidence_score(scores: Dict[str, float]) -> float:
    """Calculate confidence in type determination based on score clarity"""
    # Check how decisive the scores are
    extreme_scores = sum(1 for score in scores.values() if score < 0.3 or score > 0.7)
    moderate_scores = len(scores) - extreme_scores
    
    # Higher confidence with more extreme scores
    confidence = (extreme_scores * 0.8 + moderate_scores * 0.4) / len(scores)
    return min(max(confidence, 0.3), 0.9)  # Keep between 30% and 90%


def _get_enneagram_type_name(type_number: int) -> str:
    """Get the name for an Enneagram type"""
    names = {
        1: "The Perfectionist",
        2: "The Helper", 
        3: "The Achiever",
        4: "The Individualist",
        5: "The Investigator",
        6: "The Loyalist",
        7: "The Enthusiast", 
        8: "The Challenger",
        9: "The Peacemaker"
    }
    return names.get(type_number, "Unknown Type")


def _get_enneagram_description(type_number: int) -> str:
    """Get description for an Enneagram type"""
    descriptions = {
        1: "Rational, idealistic, principled, purposeful, self-controlled, and perfectionistic.",
        2: "Caring, interpersonal, demonstrative, generous, people-pleasing, and possessive.",
        3: "Success-oriented, pragmatic, adaptive, driven, image-conscious, and hostile.",
        4: "Sensitive, withdrawn, expressive, dramatic, self-absorbed, and temperamental.",
        5: "Intense, cerebral, perceptive, innovative, secretive, and isolated.",
        6: "Committed, security-oriented, engaging, responsible, anxious, and suspicious.",
        7: "Busy, fun-loving, versatile, distractible, scattered, and impulsive.",
        8: "Self-confident, decisive, willful, confrontational, aggressive, and lustful.",
        9: "Receptive, reassuring, agreeable, complacent, and resigned."
    }
    return descriptions.get(type_number, "Description not available")


def _get_enneagram_motivation(type_number: int) -> str:
    """Get core motivation for an Enneagram type"""
    motivations = {
        1: "To be good, right, perfect, and to improve everything",
        2: "To feel loved and needed and to be appreciated",
        3: "To feel valuable and worthwhile—to be affirmed",
        4: "To find themselves and their significance—to create identity",
        5: "To be capable and competent—to understand the world",
        6: "To have security and support—to have guidance",
        7: "To maintain happiness and satisfaction—to avoid pain",
        8: "To be self-reliant and in control of their own life",
        9: "To create harmony in their environment and avoid conflict"
    }
    return motivations.get(type_number, "Motivation unknown")


def _get_enneagram_fear(type_number: int) -> str:
    """Get core fear for an Enneagram type"""
    fears = {
        1: "Of being corrupt, defective, or wrong",
        2: "Of being unwanted or unworthy of love", 
        3: "Of being worthless or without value apart from achievements",
        4: "Of having no identity or personal significance",
        5: "Of being useless, helpless, or incapable",
        6: "Of being without support or guidance",
        7: "Of being trapped in pain or deprivation",
        8: "Of being controlled or violated by others",
        9: "Of loss of connection and fragmentation"
    }
    return fears.get(type_number, "Fear unknown")


def _get_enneagram_astrological_indicators(type_number: int, positions: Dict[str, Dict[str, Any]]) -> List[str]:
    """Get astrological indicators for Enneagram type"""
    # This would be expanded with specific astrological pattern analysis
    # For now, return basic indicators based on the type
    type_indicators = {
        1: ["Strong Saturn placement", "Virgo emphasis", "6th house activity"],
        2: ["Venus-Moon aspects", "Cancer/Pisces emphasis", "4th/12th house activity"],
        3: ["Strong Sun placement", "Leo emphasis", "5th/10th house activity"],
        4: ["Neptune prominence", "Water sign emphasis", "8th/12th house activity"],
        5: ["Mercury-Saturn aspects", "Air/Earth emphasis", "3rd/9th house activity"],
        6: ["Moon-Saturn aspects", "Cancer/Capricorn emphasis", "4th/10th house activity"],
        7: ["Jupiter prominence", "Fire/Air emphasis", "3rd/9th/11th house activity"],
        8: ["Mars-Pluto aspects", "Fixed sign emphasis", "1st/8th house activity"],
        9: ["Venus-Neptune aspects", "Mutable emphasis", "7th/12th house activity"]
    }
    
    return type_indicators.get(type_number, ["No specific indicators identified"])
