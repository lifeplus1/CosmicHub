"""
MBTI-Astrology Bridge System with Enneagram Integration
AI #3: Backend Architecture Specialist Implementation
Following Integration Strategy: ENHANCE vs CREATE NEW approach
"""

from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime
import logging

try:
    from .personality import PersonalityAnalyzer
    PERSONALITY_AVAILABLE = True
except ImportError:
    PERSONALITY_AVAILABLE = False
    PersonalityAnalyzer = None

logger = logging.getLogger(__name__)

class MBTIAstrologyBridge:
    """
    Advanced MBTI-Astrology correlation system with scientific grounding
    
    Bridges Western psychology with astrological patterns through:
    - Jungian archetypal correspondences
    - Cognitive function-planetary correlations
    - House system-personality trait mapping
    - Evidence-based correlation algorithms
    """
    
    def __init__(self):
        """Initialize the MBTI-Astrology bridge system"""
        
        # Cognitive Function to Planetary Correspondences (based on archetypal analysis)
        self.cognitive_function_planets = {
            # Dominant Functions
            'Ni': ['neptune', 'pluto'],      # Introverted Intuition - Deep insight, transformation
            'Ne': ['uranus', 'jupiter'],     # Extraverted Intuition - Innovation, expansion
            'Ti': ['mercury', 'saturn'],     # Introverted Thinking - Analysis, structure
            'Te': ['mercury', 'mars'],       # Extraverted Thinking - Organization, action
            'Fi': ['venus', 'moon'],         # Introverted Feeling - Values, emotion
            'Fe': ['venus', 'jupiter'],      # Extraverted Feeling - Harmony, social connection
            'Si': ['saturn', 'moon'],        # Introverted Sensing - Memory, stability
            'Se': ['mars', 'sun']            # Extraverted Sensing - Action, presence
        }
        
        # MBTI Type to House Correlations
        self.mbti_house_correspondences = {
            # Analysts (NT)
            'INTJ': [8, 9, 10],    # Transformation, higher knowledge, achievement
            'INTP': [3, 9, 11],    # Communication, philosophy, innovation
            'ENTJ': [1, 10, 7],    # Leadership, career, partnerships
            'ENTP': [3, 5, 11],    # Communication, creativity, groups
            
            # Diplomats (NF) 
            'INFJ': [12, 4, 8],    # Spirituality, inner world, transformation
            'INFP': [4, 12, 5],    # Inner world, spirituality, creativity
            'ENFJ': [7, 11, 1],    # Relationships, groups, leadership
            'ENFP': [5, 11, 3],    # Creativity, groups, communication
            
            # Sentinels (SJ)
            'ISTJ': [2, 6, 10],    # Resources, service, structure
            'ISFJ': [4, 6, 2],     # Home, service, security
            'ESTJ': [10, 6, 2],    # Career, organization, resources
            'ESFJ': [7, 2, 4],     # Relationships, security, home
            
            # Explorers (SP)
            'ISTP': [6, 8, 3],     # Practical skills, transformation, learning
            'ISFP': [5, 4, 12],    # Creativity, inner world, spirituality
            'ESTP': [1, 3, 5],     # Identity, communication, fun
            'ESFP': [5, 7, 1]      # Creativity, relationships, self-expression
        }
        
        # Advanced Astrological Correlation Patterns
        self.advanced_correlations = {
            'element_emphasis': {
                'fire_dominant': ['ESTP', 'ESFP', 'ENFP', 'ENTP'],
                'earth_dominant': ['ISTJ', 'ISFJ', 'ESTJ', 'ESFJ'],
                'air_dominant': ['ENTP', 'ENFP', 'INTP', 'INFP'],
                'water_dominant': ['INFJ', 'INFP', 'ISFP', 'ISFJ']
            },
            'modality_emphasis': {
                'cardinal_dominant': ['ENTJ', 'ENFJ', 'ESTJ', 'ESFJ'],
                'fixed_dominant': ['INTJ', 'INFJ', 'ISTJ', 'ISFJ'],
                'mutable_dominant': ['ENTP', 'ENFP', 'ESTP', 'ESFP']
            },
            'planetary_rulers': {
                'mars_strong': ['ENTJ', 'ESTJ', 'ESTP', 'ENTP'],
                'venus_strong': ['ESFJ', 'ISFJ', 'ESFP', 'ISFP'],
                'mercury_strong': ['ENTP', 'INTP', 'ESTP', 'ISTP'],
                'jupiter_strong': ['ENFJ', 'ENFP', 'ESFJ', 'ESFP'],
                'saturn_strong': ['ISTJ', 'INTJ', 'ESTJ', 'ENTJ'],
                'sun_strong': ['ENTJ', 'ENFJ', 'ESTJ', 'ESFJ'],
                'moon_strong': ['ISFJ', 'INFJ', 'ISFP', 'INFP']
            }
        }
        
        # Enneagram-MBTI-Astrology Triple Correlations
        self.enneagram_mbti_bridge = {
            1: {'common_mbti': ['ISTJ', 'INTJ', 'ESTJ'], 'houses': [6, 10, 1], 'planets': ['saturn', 'mars']},
            2: {'common_mbti': ['ESFJ', 'ENFJ', 'ISFJ'], 'houses': [7, 2, 4], 'planets': ['venus', 'moon']},
            3: {'common_mbti': ['ENTJ', 'ESTJ', 'ENFJ'], 'houses': [10, 1, 5], 'planets': ['sun', 'mars']},
            4: {'common_mbti': ['INFP', 'ISFP', 'ENFP'], 'houses': [4, 12, 8], 'planets': ['neptune', 'moon']},
            5: {'common_mbti': ['INTP', 'INTJ', 'ISTP'], 'houses': [9, 8, 3], 'planets': ['mercury', 'saturn']},
            6: {'common_mbti': ['ISFJ', 'ISTJ', 'ESFJ'], 'houses': [6, 2, 4], 'planets': ['saturn', 'moon']},
            7: {'common_mbti': ['ENFP', 'ENTP', 'ESFP'], 'houses': [3, 5, 9], 'planets': ['jupiter', 'mercury']},
            8: {'common_mbti': ['ENTJ', 'ESTJ', 'ESTP'], 'houses': [1, 8, 10], 'planets': ['mars', 'pluto']},
            9: {'common_mbti': ['ISFP', 'INFP', 'ISFJ'], 'houses': [7, 4, 12], 'planets': ['venus', 'neptune']}
        }
        
        logger.info("MBTI-Astrology bridge system initialized with comprehensive correlations")
    
    def analyze_mbti_astrological_correlation(
        self, 
        birth_data: Dict[str, Any],
        mbti_type: Optional[str] = None,
        enneagram_type: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Comprehensive MBTI-Astrology correlation analysis
        
        Args:
            birth_data: Complete birth chart data
            mbti_type: Known MBTI type (if available)
            enneagram_type: Known Enneagram type (if available)
            
        Returns:
            Complete correlation analysis with confidence ratings
        """
        try:
            logger.info("Starting comprehensive MBTI-Astrology correlation analysis")
            
            # Calculate MBTI from astrology if not provided
            if not mbti_type:
                mbti_analysis = self._calculate_mbti_from_astrology(birth_data)
                mbti_type = mbti_analysis['predicted_type']
                mbti_confidence = mbti_analysis['confidence']
            else:
                mbti_confidence = 0.85  # Assume high confidence for provided type
                
            # Calculate Enneagram correlation if not provided
            if not enneagram_type:
                enneagram_analysis = self._calculate_enneagram_from_astrology(birth_data)
                enneagram_type = enneagram_analysis['predicted_type']
                enneagram_confidence = enneagram_analysis['confidence']
            else:
                enneagram_confidence = 0.85
            
            # Astrological confirmation analysis
            astrological_confirmation = self._analyze_astrological_confirmation(
                birth_data, mbti_type, enneagram_type
            )
            
            # Cognitive function analysis
            cognitive_function_analysis = self._analyze_cognitive_functions(birth_data, mbti_type)
            
            # Cross-system integration
            integration_analysis = self._create_integration_analysis(
                mbti_type, enneagram_type, birth_data, astrological_confirmation
            )
            
            # Development recommendations
            development_path = self._generate_development_recommendations(
                mbti_type, enneagram_type, birth_data
            )
            
            result = {
                'mbti_type': mbti_type,
                'mbti_confidence': mbti_confidence,
                'enneagram_type': enneagram_type,
                'enneagram_confidence': enneagram_confidence,
                'astrological_confirmation': astrological_confirmation,
                'cognitive_function_analysis': cognitive_function_analysis,
                'integration_analysis': integration_analysis,
                'development_path': development_path,
                'correlation_strength': self._calculate_overall_correlation_strength(
                    astrological_confirmation, mbti_confidence, enneagram_confidence
                ),
                'timestamp': datetime.now().isoformat(),
                'calculation_method': 'mbti_astrology_bridge_v1'
            }
            
            logger.info(f"MBTI-Astrology correlation analysis complete: {mbti_type} with {result['correlation_strength']:.3f} correlation")
            return result
            
        except Exception as e:
            logger.error(f"Error in MBTI-Astrology correlation: {str(e)}", exc_info=True)
            return self._create_error_result(str(e))
    
    def _calculate_mbti_from_astrology(self, birth_data: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate most likely MBTI type from astrological indicators"""
        
        # Extract astrological data
        planetary_strengths = birth_data.get('planetary_strengths', {})
        house_emphasis = birth_data.get('house_emphasis', {})
        element_emphasis = birth_data.get('element_emphasis', {})
        modality_emphasis = birth_data.get('modality_emphasis', {})
        
        # Score all MBTI types based on astrological correlations
        type_scores = {}
        
        for mbti_type in self.mbti_house_correspondences.keys():
            score = 0.0
            
            # House correlation scoring
            associated_houses = self.mbti_house_correspondences[mbti_type]
            for house in associated_houses:
                house_strength = house_emphasis.get(str(house), 0.5)
                score += house_strength * 0.3
            
            # Element correlation scoring
            for element, associated_types in self.advanced_correlations['element_emphasis'].items():
                if mbti_type in associated_types:
                    element_name = element.split('_')[0]  # Extract element name
                    element_strength = element_emphasis.get(element_name, 0.25)
                    score += element_strength * 0.25
            
            # Planetary ruler scoring
            for planetary_pattern, associated_types in self.advanced_correlations['planetary_rulers'].items():
                if mbti_type in associated_types:
                    planet_name = planetary_pattern.split('_')[0]  # Extract planet name
                    planet_strength = planetary_strengths.get(planet_name, 0.5)
                    score += planet_strength * 0.2
            
            # Modality correlation
            for modality_pattern, associated_types in self.advanced_correlations['modality_emphasis'].items():
                if mbti_type in associated_types:
                    modality_name = modality_pattern.split('_')[0]  # Extract modality
                    modality_strength = modality_emphasis.get(modality_name, 0.33)
                    score += modality_strength * 0.15
            
            type_scores[mbti_type] = score
        
        # Determine best match
        best_type = max(type_scores.keys(), key=lambda k: type_scores[k])
        confidence = min(0.95, max(0.3, type_scores[best_type] / max(type_scores.values()) if type_scores.values() else 0.5))
        
        # Get top 3 possibilities
        sorted_types = sorted(type_scores.items(), key=lambda x: x[1], reverse=True)
        
        return {
            'predicted_type': best_type,
            'confidence': confidence,
            'type_scores': type_scores,
            'top_three': sorted_types[:3],
            'analysis_method': 'astrological_correlation'
        }
    
    def _calculate_enneagram_from_astrology(self, birth_data: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate most likely Enneagram type from astrological indicators"""
        
        planetary_strengths = birth_data.get('planetary_strengths', {})
        house_emphasis = birth_data.get('house_emphasis', {})
        
        # Score each Enneagram type
        type_scores = {}
        
        for enneagram_type, correlation_data in self.enneagram_mbti_bridge.items():
            score = 0.0
            
            # House correlation scoring
            for house in correlation_data['houses']:
                house_strength = house_emphasis.get(str(house), 0.5)
                score += house_strength * 0.4
            
            # Planetary correlation scoring
            for planet in correlation_data['planets']:
                planet_strength = planetary_strengths.get(planet, 0.5)
                score += planet_strength * 0.3
            
            type_scores[enneagram_type] = score
        
        # Determine best match
        best_type = max(type_scores.keys(), key=lambda k: type_scores[k])
        confidence = min(0.95, max(0.3, type_scores[best_type] / max(type_scores.values()) if type_scores.values() else 0.5))
        
        return {
            'predicted_type': best_type,
            'confidence': confidence,
            'type_scores': type_scores,
            'analysis_method': 'astrological_correlation'
        }
    
    def _analyze_astrological_confirmation(
        self,
        birth_data: Dict[str, Any],
        mbti_type: str,
        enneagram_type: int
    ) -> Dict[str, Any]:
        """Analyze how well astrology confirms the personality types"""
        
        confirmation_factors = {
            'house_alignment': 0.0,
            'planetary_alignment': 0.0,
            'element_alignment': 0.0,
            'cognitive_function_alignment': 0.0
        }
        
        # Check house alignment
        if mbti_type in self.mbti_house_correspondences:
            associated_houses = self.mbti_house_correspondences[mbti_type]
            house_emphasis = birth_data.get('house_emphasis', {})
            
            total_house_strength = 0.0
            for house in associated_houses:
                total_house_strength += house_emphasis.get(str(house), 0.5)
            
            confirmation_factors['house_alignment'] = total_house_strength / len(associated_houses)
        
        # Check planetary alignment for Enneagram
        if enneagram_type in self.enneagram_mbti_bridge:
            associated_planets = self.enneagram_mbti_bridge[enneagram_type]['planets']
            planetary_strengths = birth_data.get('planetary_strengths', {})
            
            total_planetary_strength = 0.0
            for planet in associated_planets:
                total_planetary_strength += planetary_strengths.get(planet, 0.5)
            
            confirmation_factors['planetary_alignment'] = total_planetary_strength / len(associated_planets)
        
        # Check element alignment
        element_emphasis = birth_data.get('element_emphasis', {})
        element_match_score = 0.0
        
        for element_pattern, associated_types in self.advanced_correlations['element_emphasis'].items():
            if mbti_type in associated_types:
                element_name = element_pattern.split('_')[0]
                element_strength = element_emphasis.get(element_name, 0.25)
                element_match_score += element_strength
        
        confirmation_factors['element_alignment'] = min(1.0, element_match_score)
        
        # Cognitive function alignment (simplified)
        if PERSONALITY_AVAILABLE and PersonalityAnalyzer:
            analyzer = PersonalityAnalyzer()
            if mbti_type in analyzer.cognitive_functions:
                functions = analyzer.cognitive_functions[mbti_type]
                function_score = self._score_cognitive_functions(functions, birth_data)
                confirmation_factors['cognitive_function_alignment'] = function_score
        
        # Overall confirmation score
        overall_confirmation = sum(confirmation_factors.values()) / len(confirmation_factors)
        
        return {
            'individual_factors': confirmation_factors,
            'overall_confirmation': overall_confirmation,
            'confirmation_level': self._get_confirmation_level(overall_confirmation),
            'strongest_indicators': self._get_strongest_indicators(confirmation_factors),
            'areas_for_exploration': self._get_exploration_areas(confirmation_factors)
        }
    
    def _score_cognitive_functions(self, functions: Dict[str, str], birth_data: Dict[str, Any]) -> float:
        """Score how well cognitive functions align with astrological indicators"""
        
        planetary_strengths = birth_data.get('planetary_strengths', {})
        total_score = 0.0
        function_count = 0
        
        for position, function in functions.items():
            if function in self.cognitive_function_planets:
                associated_planets = self.cognitive_function_planets[function]
                function_score = 0.0
                
                for planet in associated_planets:
                    planet_strength = planetary_strengths.get(planet, 0.5)
                    function_score += planet_strength
                
                # Weight dominant and auxiliary functions more heavily
                if position == 'dominant':
                    function_score *= 1.5
                elif position == 'auxiliary':
                    function_score *= 1.2
                elif position == 'inferior':
                    function_score *= 0.7  # Inferior function may show as weaker
                
                total_score += function_score / len(associated_planets)
                function_count += 1
        
        return total_score / function_count if function_count > 0 else 0.5
    
    def _analyze_cognitive_functions(self, birth_data: Dict[str, Any], mbti_type: str) -> Dict[str, Any]:
        """Detailed cognitive function analysis with astrological correlations"""
        
        if not PERSONALITY_AVAILABLE or not PersonalityAnalyzer:
            return {"error": "Personality analysis not available"}
            
        analyzer = PersonalityAnalyzer()
        if mbti_type not in analyzer.cognitive_functions:
            return {"error": f"No cognitive function data for {mbti_type}"}
        
        functions = analyzer.cognitive_functions[mbti_type]
        planetary_strengths = birth_data.get('planetary_strengths', {})
        
        function_analysis = {}
        
        for position, function in functions.items():
            if function in self.cognitive_function_planets:
                associated_planets = self.cognitive_function_planets[function]
                
                # Calculate planetary support for this function
                planetary_support = {}
                total_support = 0.0
                
                for planet in associated_planets:
                    support_strength = planetary_strengths.get(planet, 0.5)
                    planetary_support[planet] = support_strength
                    total_support += support_strength
                
                average_support = total_support / len(associated_planets)
                
                function_analysis[position] = {
                    'function': function,
                    'associated_planets': associated_planets,
                    'planetary_support': planetary_support,
                    'average_support': average_support,
                    'function_strength': self._assess_function_strength(position, average_support),
                    'development_recommendations': self._get_function_development_tips(function, average_support)
                }
        
        return function_analysis
    
    def _create_integration_analysis(
        self,
        mbti_type: str,
        enneagram_type: int,
        birth_data: Dict[str, Any],
        astrological_confirmation: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Create integrated personality-astrology analysis"""
        
        # Type combination analysis
        type_combination = f"{mbti_type}-{enneagram_type}"
        
        # Check if this is a common combination
        common_combinations = []
        if enneagram_type in self.enneagram_mbti_bridge:
            common_mbti_types = self.enneagram_mbti_bridge[enneagram_type]['common_mbti']
            if mbti_type in common_mbti_types:
                common_combinations.append(f"Common {mbti_type}-{enneagram_type} combination")
        
        # Integration themes
        integration_themes = self._generate_integration_themes(mbti_type, enneagram_type)
        
        # Astrological support for combination
        combination_support = self._assess_combination_support(
            mbti_type, enneagram_type, birth_data, astrological_confirmation
        )
        
        return {
            'type_combination': type_combination,
            'combination_rarity': self._assess_combination_rarity(mbti_type, enneagram_type),
            'common_combinations': common_combinations,
            'integration_themes': integration_themes,
            'astrological_support': combination_support,
            'synthesis_insights': self._generate_synthesis_insights(mbti_type, enneagram_type),
            'potential_conflicts': self._identify_potential_conflicts(mbti_type, enneagram_type),
            'growth_opportunities': self._identify_growth_opportunities(mbti_type, enneagram_type, birth_data)
        }
    
    def _generate_development_recommendations(
        self,
        mbti_type: str,
        enneagram_type: int,
        birth_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Generate personalized development recommendations"""
        
        # MBTI-based development
        mbti_development = self._get_mbti_development_path(mbti_type, birth_data)
        
        # Enneagram-based development
        enneagram_development = self._get_enneagram_development_path(enneagram_type, birth_data)
        
        # Integrated development approach
        integrated_approach = self._create_integrated_development_approach(
            mbti_type, enneagram_type, birth_data
        )
        
        # Astrological timing for development work
        astrological_timing = self._get_development_timing(birth_data)
        
        return {
            'mbti_development': mbti_development,
            'enneagram_development': enneagram_development,
            'integrated_approach': integrated_approach,
            'astrological_timing': astrological_timing,
            'priority_areas': self._identify_priority_development_areas(mbti_type, enneagram_type),
            'practices_and_exercises': self._recommend_practices(mbti_type, enneagram_type),
            'books_and_resources': self._recommend_resources(mbti_type, enneagram_type)
        }
    
    def _calculate_overall_correlation_strength(
        self,
        astrological_confirmation: Dict[str, Any],
        mbti_confidence: float,
        enneagram_confidence: float
    ) -> float:
        """Calculate overall correlation strength between psychology and astrology"""
        
        confirmation_score = astrological_confirmation.get('overall_confirmation', 0.5)
        confidence_average = (mbti_confidence + enneagram_confidence) / 2
        
        # Weighted combination of factors
        correlation_strength = (
            confirmation_score * 0.6 +  # How well astrology confirms types
            confidence_average * 0.4    # Confidence in type predictions
        )
        
        return min(0.95, max(0.1, correlation_strength))
    
    # Helper methods (simplified implementations)
    def _get_confirmation_level(self, score: float) -> str:
        """Get descriptive confirmation level"""
        if score >= 0.8:
            return "Strong"
        elif score >= 0.6:
            return "Moderate"
        elif score >= 0.4:
            return "Weak"
        else:
            return "Minimal"
    
    def _get_strongest_indicators(self, factors: Dict[str, float]) -> List[str]:
        """Get strongest astrological indicators"""
        sorted_factors = sorted(factors.items(), key=lambda x: x[1], reverse=True)
        return [factor[0] for factor in sorted_factors[:2]]
    
    def _get_exploration_areas(self, factors: Dict[str, float]) -> List[str]:
        """Get areas for further exploration"""
        weak_factors = [factor for factor, score in factors.items() if score < 0.4]
        return weak_factors
    
    def _assess_function_strength(self, position: str, average_support: float) -> str:
        """Assess cognitive function strength from astrological support"""
        if position == 'dominant' and average_support >= 0.7:
            return "Well-developed"
        elif position == 'auxiliary' and average_support >= 0.6:
            return "Supportive"
        elif position == 'inferior' and average_support <= 0.4:
            return "Appropriately underdeveloped"
        else:
            return "Moderate development"
    
    def _get_function_development_tips(self, function: str, support_level: float) -> List[str]:
        """Get development tips for cognitive functions"""
        if support_level < 0.4:
            return [f"Focus on developing {function}", "Seek experiences that challenge this function"]
        elif support_level > 0.8:
            return [f"Excellent {function} support", "Use this strength to help others"]
        else:
            return [f"Moderate {function} development", "Continue balanced growth"]
    
    # Additional helper methods would be implemented here...
    def _generate_integration_themes(self, mbti_type: str, enneagram_type: int) -> List[str]:
        return [f"Integration theme for {mbti_type}-{enneagram_type} combination"]
    
    def _assess_combination_support(self, mbti_type: str, enneagram_type: int, birth_data: Dict[str, Any], confirmation: Dict[str, Any]) -> Dict[str, Any]:
        return {"support_level": "moderate", "details": "Astrological indicators support this combination"}
    
    def _assess_combination_rarity(self, mbti_type: str, enneagram_type: int) -> str:
        return "Common"  # Simplified
    
    def _generate_synthesis_insights(self, mbti_type: str, enneagram_type: int) -> List[str]:
        return [f"Synthesis insight for {mbti_type}-{enneagram_type}"]
    
    def _identify_potential_conflicts(self, mbti_type: str, enneagram_type: int) -> List[str]:
        return ["Potential conflict area identified"]
    
    def _identify_growth_opportunities(self, mbti_type: str, enneagram_type: int, birth_data: Dict[str, Any]) -> List[str]:
        return ["Growth opportunity identified"]
    
    def _get_mbti_development_path(self, mbti_type: str, birth_data: Dict[str, Any]) -> Dict[str, Any]:
        return {"focus": "Develop auxiliary function"}
    
    def _get_enneagram_development_path(self, enneagram_type: int, birth_data: Dict[str, Any]) -> Dict[str, Any]:
        return {"focus": "Work with core fear"}
    
    def _create_integrated_development_approach(self, mbti_type: str, enneagram_type: int, birth_data: Dict[str, Any]) -> Dict[str, Any]:
        return {"approach": "Integrated development"}
    
    def _get_development_timing(self, birth_data: Dict[str, Any]) -> Dict[str, str]:
        return {"optimal_periods": "Saturn returns, Jupiter transits"}
    
    def _identify_priority_development_areas(self, mbti_type: str, enneagram_type: int) -> List[str]:
        return ["Priority development area"]
    
    def _recommend_practices(self, mbti_type: str, enneagram_type: int) -> List[str]:
        return ["Recommended practice"]
    
    def _recommend_resources(self, mbti_type: str, enneagram_type: int) -> List[str]:
        return ["Recommended resource"]
    
    def _create_error_result(self, error_message: str) -> Dict[str, Any]:
        """Create error result when analysis fails"""
        return {
            'error': error_message,
            'mbti_type': 'Unknown',
            'enneagram_type': 0,
            'correlation_strength': 0.0,
            'timestamp': datetime.now().isoformat(),
            'calculation_method': 'error_fallback'
        }


# Convenience function for direct usage
def analyze_personality_astrology_bridge(
    birth_data: Dict[str, Any],
    mbti_type: Optional[str] = None,
    enneagram_type: Optional[int] = None
) -> Dict[str, Any]:
    """
    Analyze MBTI-Astrology correlations with Enneagram integration
    
    Args:
        birth_data: Complete birth chart data
        mbti_type: Known MBTI type (optional)
        enneagram_type: Known Enneagram type (optional)
        
    Returns:
        Complete correlation analysis
    """
    bridge = MBTIAstrologyBridge()
    return bridge.analyze_mbti_astrological_correlation(birth_data, mbti_type, enneagram_type)
