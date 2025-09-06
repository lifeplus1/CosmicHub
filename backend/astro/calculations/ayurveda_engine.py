"""
Ayurveda Constitutional Analysis Engine
AI #3: Backend Architecture Specialist Implementation
Following Integration Strategy: ENHANCE vs CREATE NEW
"""

import logging
from typing import Dict, Any, List, Optional, TYPE_CHECKING, Literal
from datetime import datetime

# Type aliases for better type safety
if TYPE_CHECKING:
    AyurvedaConstitutionType = Literal[
        "vata", "pitta", "kapha",
        "vata_pitta", "pitta_kapha", "vata_kapha", 
        "tridoshic"
    ]
else:
    AyurvedaConstitutionType = str

try:
    from .ayurveda_schema import (
        AyurvedaAnalysisResult, AyurvedaConstitution, AyurvedaHealthGuidance,
        AstrologyAyurvedaCorrelation, DoshaBalance,
        AYURVEDA_DOSHA_DATA, PLANET_AYURVEDA_CORRELATIONS, 
        AYURVEDA_HOUSE_CORRELATIONS, AYURVEDA_SEASONAL_GUIDANCE
    )
except ImportError:
    # Fallback for standalone testing
    from ayurveda_schema import (
        AyurvedaAnalysisResult, AyurvedaConstitution, AyurvedaHealthGuidance,
        AstrologyAyurvedaCorrelation, DoshaBalance,
        AYURVEDA_DOSHA_DATA, PLANET_AYURVEDA_CORRELATIONS,
        AYURVEDA_HOUSE_CORRELATIONS, AYURVEDA_SEASONAL_GUIDANCE
    )

logger = logging.getLogger(__name__)

class AyurvedaEngine:
    """
    Complete Ayurveda constitutional analysis engine with astrological integration
    
    Analyzes birth chart data to determine:
    - Prakruti (natural constitution)
    - Vikruti (current imbalances) 
    - Dosha balance with planetary influences
    - Personalized health and lifestyle guidance
    - Seasonal recommendations with astrological timing
    
    Cultural Note: This engine provides educational correlations between
    Vedic astrology and Ayurveda while respecting both traditions.
    """
    
    def __init__(self) -> None:
        """Initialize the Ayurveda analysis engine"""
        self.doshas = ["vata", "pitta", "kapha"]
        self.dosha_data = AYURVEDA_DOSHA_DATA
        self.planetary_correlations = PLANET_AYURVEDA_CORRELATIONS
        self.house_correlations = AYURVEDA_HOUSE_CORRELATIONS
        self.seasonal_guidance = AYURVEDA_SEASONAL_GUIDANCE
        
        logger.info("Ayurveda engine initialized with comprehensive dosha-astrology correlations")
    
    def analyze_constitution(
        self,
        birth_data: Dict[str, Any],
        user_id: Optional[str] = None
    ) -> AyurvedaAnalysisResult:
        """
        Complete Ayurvedic constitutional analysis with astrological integration
        
        Args:
            birth_data: Birth chart data with planetary positions, houses, aspects
            user_id: Optional user identifier
            
        Returns:
            Complete Ayurveda analysis result with constitution, guidance, and correlations
        """
        try:
            logger.info(f"Starting Ayurveda analysis for user: {user_id}")
            
            # Extract astrological indicators
            planetary_strengths = self._extract_planetary_strengths(birth_data)
            house_emphasis = self._extract_house_emphasis(birth_data)
            elemental_balance = self._calculate_elemental_balance(birth_data)
            
            # Calculate dosha balance from astrological indicators
            prakruti = self._calculate_prakruti(planetary_strengths, house_emphasis, elemental_balance)
            vikruti = self._calculate_vikruti(planetary_strengths, house_emphasis)
            
            # Determine constitutional type
            constitution_type = self._determine_constitution_type(prakruti)
            constitution = self._create_constitution_analysis(prakruti, vikruti, constitution_type)
            
            # Generate dosha balance analysis
            dosha_analysis = self._analyze_dosha_balance(prakruti, vikruti)
            
            # Create health guidance
            health_guidance = self._generate_health_guidance(constitution_type, dosha_analysis)
            
            # Astrological correlations
            astrological_correlations = self._create_astrological_correlations(
                constitution_type, planetary_strengths, house_emphasis
            )
            
            # Seasonal recommendations with timing
            seasonal_recommendations = self._generate_seasonal_recommendations(
                constitution_type, birth_data
            )
            
            # Calculate analysis confidence
            confidence = self._calculate_analysis_confidence(prakruti, planetary_strengths)
            
            result: AyurvedaAnalysisResult = {
                "user_id": user_id,
                "birth_data": birth_data,
                "constitution": constitution,
                "dosha_analysis": dosha_analysis,
                "health_guidance": health_guidance,
                "astrological_correlations": astrological_correlations,
                "seasonal_recommendations": seasonal_recommendations,
                "analysis_confidence": confidence,
                "calculation_method": "astrological_ayurveda_correlation_v1",
                "timestamp": datetime.now().isoformat()
            }
            
            logger.info(f"Ayurveda analysis completed for constitution type: {constitution_type}")
            return result
            
        except Exception as e:
            logger.error(f"Error in Ayurveda analysis: {str(e)}", exc_info=True)
            # Return error-safe result
            return self._create_error_result(user_id, birth_data, str(e))
    
    def _extract_planetary_strengths(self, birth_data: Dict[str, Any]) -> Dict[str, float]:
        """Extract planetary strength indicators from birth chart"""
        try:
            planetary_strengths = birth_data.get('planetary_strengths', {})
            
            # Ensure all planets have values
            default_planets = {
                'sun': 0.5, 'moon': 0.5, 'mars': 0.5, 'mercury': 0.5,
                'jupiter': 0.5, 'venus': 0.5, 'saturn': 0.5,
                'uranus': 0.4, 'neptune': 0.4, 'pluto': 0.4
            }
            
            for planet, default_strength in default_planets.items():
                if planet not in planetary_strengths:
                    planetary_strengths[planet] = default_strength
                    
            return planetary_strengths
            
        except Exception as e:
            logger.warning(f"Error extracting planetary strengths: {e}")
            return {'sun': 0.5, 'moon': 0.5, 'mars': 0.5, 'mercury': 0.5,
                   'jupiter': 0.5, 'venus': 0.5, 'saturn': 0.5}
    
    def _extract_house_emphasis(self, birth_data: Dict[str, Any]) -> Dict[str, float]:
        """Extract house emphasis from birth chart"""
        try:
            house_emphasis = birth_data.get('house_emphasis', {})
            
            # Ensure all houses have values (1-12)
            for house_num in range(1, 13):
                house_key = str(house_num)
                if house_key not in house_emphasis:
                    house_emphasis[house_key] = 0.5  # Neutral emphasis
                    
            return house_emphasis
            
        except Exception as e:
            logger.warning(f"Error extracting house emphasis: {e}")
            return {str(i): 0.5 for i in range(1, 13)}
    
    def _calculate_elemental_balance(self, birth_data: Dict[str, Any]) -> Dict[str, float]:
        """Calculate elemental balance for Ayurvedic correlation"""
        try:
            element_emphasis = birth_data.get('element_emphasis', {})
            
            # Ensure all elements present
            default_elements = {'fire': 0.25, 'earth': 0.25, 'air': 0.25, 'water': 0.25}
            for element, default_value in default_elements.items():
                if element not in element_emphasis:
                    element_emphasis[element] = default_value
                    
            return element_emphasis
            
        except Exception as e:
            logger.warning(f"Error calculating elemental balance: {e}")
            return {'fire': 0.25, 'earth': 0.25, 'air': 0.25, 'water': 0.25}
    
    def _calculate_prakruti(
        self, 
        planetary_strengths: Dict[str, float], 
        house_emphasis: Dict[str, float],
        elemental_balance: Dict[str, float]
    ) -> Dict[str, float]:
        """Calculate Prakruti (natural constitution) from astrological indicators"""
        
        dosha_scores = {"vata": 0.0, "pitta": 0.0, "kapha": 0.0}
        
        # Planetary contributions to doshas
        for planet, strength in planetary_strengths.items():
            if planet in self.planetary_correlations:
                planet_data = self.planetary_correlations[planet]
                primary_dosha = planet_data["primary_dosha"]
                
                # Weight by planetary strength
                dosha_scores[primary_dosha] += strength * 0.3
        
        # House emphasis contributions
        for house_str, emphasis in house_emphasis.items():
            try:
                house_num = int(house_str)
                if house_num in self.house_correlations:
                    house_data = self.house_correlations[house_num]
                    house_dosha = house_data["dosha_correlation"]
                    
                    # Weight by house emphasis
                    dosha_scores[house_dosha] += emphasis * 0.2
            except (ValueError, KeyError):
                continue
        
        # Elemental balance contributions
        # Fire -> Pitta, Earth/Water -> Kapha, Air -> Vata
        dosha_scores["pitta"] += elemental_balance.get("fire", 0.25) * 0.4
        dosha_scores["kapha"] += (elemental_balance.get("earth", 0.25) + 
                                 elemental_balance.get("water", 0.25)) * 0.2
        dosha_scores["vata"] += elemental_balance.get("air", 0.25) * 0.3
        
        # Normalize scores to sum to 1.0
        total_score = sum(dosha_scores.values())
        if total_score > 0:
            for dosha in dosha_scores:
                dosha_scores[dosha] /= total_score
        else:
            # Default to balanced constitution
            dosha_scores = {"vata": 0.33, "pitta": 0.33, "kapha": 0.34}
        
        return dosha_scores
    
    def _calculate_vikruti(
        self,
        planetary_strengths: Dict[str, float],
        house_emphasis: Dict[str, float]
    ) -> Dict[str, float]:
        """Calculate Vikruti (current imbalances) - simplified for demonstration"""
        # In a real implementation, this would analyze current transits
        # For now, we'll create slight variations from prakruti
        prakruti = self._calculate_prakruti(
            planetary_strengths, house_emphasis, 
            {'fire': 0.25, 'earth': 0.25, 'air': 0.25, 'water': 0.25}
        )
        
        # Add small variations to simulate current state
        import random
        vikruti = {}
        for dosha, score in prakruti.items():
            variation = random.uniform(-0.1, 0.1)  # Small random variation
            vikruti[dosha] = max(0.1, min(0.8, score + variation))
        
        # Normalize
        total = sum(vikruti.values())
        for dosha in vikruti:
            vikruti[dosha] /= total
            
        return vikruti
    
    def _determine_constitution_type(self, prakruti: Dict[str, float]) -> AyurvedaConstitutionType:
        """Determine constitutional type from dosha balance"""
        sorted_doshas = sorted(prakruti.items(), key=lambda x: x[1], reverse=True)
        primary_dosha, primary_score = sorted_doshas[0]
        secondary_dosha, secondary_score = sorted_doshas[1]
        
        # Determine constitution type based on scores
        if primary_score >= 0.6:
            # Single dosha dominant
            return primary_dosha  # type: ignore
        elif primary_score >= 0.4 and secondary_score >= 0.3:
            # Dual constitution
            if primary_dosha == "vata" and secondary_dosha == "pitta":
                return "vata_pitta"
            elif primary_dosha == "pitta" and secondary_dosha == "kapha":
                return "pitta_kapha"
            elif primary_dosha == "vata" and secondary_dosha == "kapha":
                return "vata_kapha"
            elif primary_dosha == "pitta" and secondary_dosha == "vata":
                return "vata_pitta"  # Order doesn't matter for our typing
            elif primary_dosha == "kapha" and secondary_dosha == "pitta":
                return "pitta_kapha"
            elif primary_dosha == "kapha" and secondary_dosha == "vata":
                return "vata_kapha"
        
        # Check for tridoshic (all three balanced)
        if all(0.25 <= score <= 0.42 for score in prakruti.values()):
            return "tridoshic"
        
        # Default to primary dosha
        return primary_dosha  # type: ignore
    
    def _create_constitution_analysis(
        self,
        prakruti: Dict[str, float],
        vikruti: Dict[str, float],
        constitution_type: AyurvedaConstitutionType
    ) -> AyurvedaConstitution:
        """Create comprehensive constitution analysis"""
        
        # Determine primary and secondary doshas
        sorted_prakruti = sorted(prakruti.items(), key=lambda x: x[1], reverse=True)
        primary_dosha = sorted_prakruti[0][0]
        secondary_dosha = sorted_prakruti[1][0] if len(sorted_prakruti) > 1 else None
        
        # Get constitutional traits from primary dosha
        primary_data = self.dosha_data[primary_dosha]
        constitutional_traits = (
            primary_data["mental_traits"] + 
            primary_data["physical_traits"]
        )[:6]  # Limit to 6 main traits
        
        # Determine dominant elements
        dominant_elements = primary_data["elements"].copy()
        if secondary_dosha and secondary_dosha in self.dosha_data:
            secondary_elements = self.dosha_data[secondary_dosha]["elements"]
            dominant_elements.extend(secondary_elements)
        
        constitution: AyurvedaConstitution = {
            "primary_dosha": primary_dosha,
            "secondary_dosha": secondary_dosha,
            "constitution_type": constitution_type,
            "prakruti": prakruti,
            "vikruti": vikruti,
            "constitutional_traits": constitutional_traits,
            "dominant_elements": list(set(dominant_elements))  # Remove duplicates
        }
        
        return constitution
    
    def _analyze_dosha_balance(
        self,
        prakruti: Dict[str, float],
        vikruti: Dict[str, float]
    ) -> Dict[str, DoshaBalance]:
        """Analyze current dosha balance vs natural constitution"""
        
        analysis = {}
        
        for dosha in self.doshas:
            natural_level = prakruti.get(dosha, 0.33)
            current_level = vikruti.get(dosha, 0.33)
            
            # Determine level category
            if current_level < 0.2:
                level = "low"
            elif current_level < 0.4:
                level = "moderate" 
            elif current_level < 0.6:
                level = "high"
            else:
                level = "excess"
            
            # Get characteristics and imbalance indicators
            dosha_info = self.dosha_data[dosha]
            characteristics = dosha_info["mental_traits"] + dosha_info["physical_traits"]
            imbalance_indicators = dosha_info["imbalance_signs"]
            
            balance: DoshaBalance = {
                "level": level,  # type: ignore
                "percentage": current_level * 100,
                "characteristics": characteristics[:4],  # Top 4 characteristics
                "imbalance_indicators": imbalance_indicators[:3]  # Top 3 indicators
            }
            
            analysis[dosha] = balance
        
        return analysis
    
    def _generate_health_guidance(
        self,
        constitution_type: AyurvedaConstitutionType,
        dosha_analysis: Dict[str, DoshaBalance]
    ) -> AyurvedaHealthGuidance:
        """Generate personalized health and lifestyle guidance"""
        
        # Base guidance on primary constitutional type
        primary_dosha = constitution_type.split('_')[0] if '_' in constitution_type else constitution_type
        
        if primary_dosha not in self.dosha_data:
            primary_dosha = "vata"  # Fallback
            
        dosha_info = self.dosha_data[primary_dosha]
        
        # Dietary guidelines based on constitution
        dietary_guidelines = [
            f"Favor {', '.join(self._get_dosha_balancing_tastes(primary_dosha))} tastes",
            f"Eat foods that are {', '.join(self._get_opposite_qualities(dosha_info['qualities']))}",
            "Maintain regular meal times to support digestion",
            f"Consider {primary_dosha}-balancing spices and herbs"
        ]
        
        # Lifestyle recommendations
        lifestyle_recommendations = [
            f"Establish routines that balance {primary_dosha} energy",
            "Practice stress management techniques daily",
            f"Engage in {primary_dosha}-appropriate exercise",
            "Maintain consistent sleep schedule",
            "Create a harmonious living environment"
        ]
        
        # Seasonal adjustments
        seasonal_adjustments = {}
        for season, season_data in self.seasonal_guidance.items():
            adjustments = []
            if season_data["dominant_dosha"] == primary_dosha:
                adjustments = [
                    f"Extra attention needed during {season}",
                    f"Focus on {', '.join(season_data['dietary_emphasis'])} tastes",
                    f"Emphasis on {season_data['body_focus']}"
                ]
            else:
                adjustments = [
                    f"Good season for {primary_dosha} constitution",
                    f"Enjoy {', '.join(season_data['dietary_emphasis'])} tastes in moderation",
                    f"Support {season_data['body_focus']} naturally"
                ]
            seasonal_adjustments[season] = adjustments
        
        # Exercise recommendations
        exercise_recommendations = [
            f"{primary_dosha.title()}-appropriate yoga practices",
            "Regular but not excessive movement",
            "Balance strength and flexibility training",
            "Include pranayama (breathing practices)"
        ]
        
        # Meditation practices
        meditation_practices = [
            f"{primary_dosha.title()}-balancing meditation techniques",
            "Daily mindfulness practice",
            "Seasonal meditation adjustments",
            "Integration with daily routine"
        ]
        
        # Herbal suggestions (educational only)
        herbal_suggestions = [
            f"Traditional {primary_dosha}-balancing herbs (consult practitioner)",
            "Seasonal herbal teas",
            "Ayurvedic cooking spices",
            "Constitutional herbal support"
        ]
        
        # Daily routine suggestions
        daily_routine_suggestions = [
            "Wake and sleep at consistent times",
            f"Follow {primary_dosha}-balancing daily rhythm",
            "Include self-massage with appropriate oils",
            "Create mindful eating practices"
        ]
        
        guidance: AyurvedaHealthGuidance = {
            "dietary_guidelines": dietary_guidelines,
            "lifestyle_recommendations": lifestyle_recommendations,
            "seasonal_adjustments": seasonal_adjustments,
            "exercise_recommendations": exercise_recommendations,
            "meditation_practices": meditation_practices,
            "herbal_suggestions": herbal_suggestions,
            "daily_routine_suggestions": daily_routine_suggestions
        }
        
        return guidance
    
    def _get_dosha_balancing_tastes(self, dosha: str) -> List[str]:
        """Get tastes that balance a specific dosha"""
        balancing_tastes = {
            "vata": ["sweet", "sour", "salty"],
            "pitta": ["sweet", "bitter", "astringent"], 
            "kapha": ["pungent", "bitter", "astringent"]
        }
        return balancing_tastes.get(dosha, ["sweet", "bitter"])
    
    def _get_opposite_qualities(self, qualities: List[str]) -> List[str]:
        """Get opposite qualities for balance"""
        opposites = {
            "dry": "moist", "light": "heavy", "cold": "warm",
            "rough": "smooth", "subtle": "gross", "mobile": "stable",
            "hot": "cool", "sharp": "dull", "oily": "dry",
            "liquid": "solid", "penetrating": "mild", "heavy": "light",
            "slow": "quick", "smooth": "rough", "stable": "mobile"
        }
        return [opposites.get(q, "balanced") for q in qualities[:3]]
    
    def _create_astrological_correlations(
        self,
        constitution_type: AyurvedaConstitutionType,
        planetary_strengths: Dict[str, float],
        house_emphasis: Dict[str, float]
    ) -> AstrologyAyurvedaCorrelation:
        """Create astrological correlation analysis"""
        
        # Get primary dosha
        primary_dosha = constitution_type.split('_')[0] if '_' in constitution_type else constitution_type
        
        # Planetary rulers for this dosha
        if primary_dosha in self.dosha_data:
            dosha_rulers = self.dosha_data[primary_dosha]["planetary_rulers"]
            dosha_signs = self.dosha_data[primary_dosha]["astrological_signs"] 
            dosha_houses = self.dosha_data[primary_dosha]["houses"]
        else:
            dosha_rulers = ["sun", "moon", "mars"]
            dosha_signs = ["aries", "leo", "sagittarius"]
            dosha_houses = [1, 5, 9]
        
        # Create correlations
        correlations: AstrologyAyurvedaCorrelation = {
            "dosha_planetary_rulers": {
                primary_dosha: dosha_rulers
            },
            "elemental_correspondences": {
                primary_dosha: self.dosha_data.get(primary_dosha, {}).get("elements", ["fire"])
            },
            "house_correlations": {
                primary_dosha: dosha_houses
            },
            "sign_affinities": {
                primary_dosha: dosha_signs
            },
            "lunar_cycle_effects": {
                "new_moon": f"Good for starting {primary_dosha}-balancing practices",
                "waxing_moon": f"Building {primary_dosha} strength",
                "full_moon": f"Peak {primary_dosha} energy awareness", 
                "waning_moon": f"Releasing excess {primary_dosha}"
            }
        }
        
        return correlations
    
    def _generate_seasonal_recommendations(
        self,
        constitution_type: AyurvedaConstitutionType,
        birth_data: Dict[str, Any]
    ) -> Dict[str, Dict[str, Any]]:
        """Generate seasonal recommendations with astrological timing"""
        
        recommendations = {}
        
        for season, season_data in self.seasonal_guidance.items():
            season_recommendation = {
                "dominant_dosha": season_data["dominant_dosha"],
                "constitutional_harmony": self._assess_seasonal_harmony(
                    constitution_type, season_data["dominant_dosha"]
                ),
                "dietary_focus": season_data["dietary_emphasis"],
                "lifestyle_adjustments": season_data["lifestyle_adjustments"],
                "yoga_practices": season_data["yoga_practices"],
                "astrological_timing": season_data["astrological_period"],
                "planetary_support": season_data["planetary_influences"],
                "body_focus": season_data["body_focus"]
            }
            
            recommendations[season] = season_recommendation
        
        return recommendations
    
    def _assess_seasonal_harmony(self, constitution: AyurvedaConstitutionType, season_dosha: str) -> str:
        """Assess how well constitution harmonizes with seasonal dosha"""
        primary_dosha = constitution.split('_')[0] if '_' in constitution else constitution
        
        if primary_dosha == season_dosha:
            return "challenging_season"  # Same dosha can increase imbalance
        elif primary_dosha in ["vata", "pitta"] and season_dosha == "kapha":
            return "balancing_season"
        elif primary_dosha == "kapha" and season_dosha in ["vata", "pitta"]:
            return "activating_season"
        else:
            return "neutral_season"
    
    def _calculate_analysis_confidence(
        self,
        prakruti: Dict[str, float],
        planetary_strengths: Dict[str, float]
    ) -> float:
        """Calculate confidence in the analysis"""
        
        # Check how clear the dosha dominance is
        sorted_doshas = sorted(prakruti.values(), reverse=True)
        dosha_clarity = (sorted_doshas[0] - sorted_doshas[1]) if len(sorted_doshas) > 1 else 0.5
        
        # Check planetary data completeness
        key_planets = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn']
        available_planets = sum(1 for planet in key_planets if planet in planetary_strengths)
        data_completeness = available_planets / len(key_planets)
        
        # Combine factors
        confidence = (dosha_clarity * 0.6 + data_completeness * 0.4)
        
        return max(0.3, min(0.95, confidence))  # Keep between 30% and 95%
    
    def _create_error_result(
        self,
        user_id: Optional[str],
        birth_data: Dict[str, Any],
        error_message: str
    ) -> AyurvedaAnalysisResult:
        """Create error-safe result when analysis fails"""
        
        default_result: AyurvedaAnalysisResult = {
            "user_id": user_id,
            "birth_data": birth_data,
            "constitution": {
                "primary_dosha": "vata",
                "secondary_dosha": None,
                "constitution_type": "vata",
                "prakruti": {"vata": 0.5, "pitta": 0.25, "kapha": 0.25},
                "vikruti": {"vata": 0.5, "pitta": 0.25, "kapha": 0.25},
                "constitutional_traits": ["Variable", "Quick", "Creative", "Adaptable"],
                "dominant_elements": ["air", "space"]
            },
            "dosha_analysis": {
                "vata": {
                    "level": "moderate",
                    "percentage": 50.0,
                    "characteristics": ["Creative", "Quick thinking", "Variable"],
                    "imbalance_indicators": ["Anxiety", "Insomnia", "Digestive issues"]
                },
                "pitta": {
                    "level": "low",
                    "percentage": 25.0, 
                    "characteristics": ["Focused", "Intelligent", "Goal oriented"],
                    "imbalance_indicators": ["Anger", "Inflammation", "Acidity"]
                },
                "kapha": {
                    "level": "low",
                    "percentage": 25.0,
                    "characteristics": ["Calm", "Stable", "Loving"],
                    "imbalance_indicators": ["Lethargy", "Weight gain", "Congestion"]
                }
            },
            "health_guidance": {
                "dietary_guidelines": ["Favor warm, cooked foods", "Regular meal times"],
                "lifestyle_recommendations": ["Establish daily routine", "Regular sleep schedule"],
                "seasonal_adjustments": {
                    "spring": ["Light, detoxifying foods"],
                    "summer": ["Cooling foods and activities"],
                    "autumn": ["Warm, grounding foods"],
                    "winter": ["Nourishing, building foods"]
                },
                "exercise_recommendations": ["Gentle, regular exercise", "Yoga practices"],
                "meditation_practices": ["Grounding meditation", "Breath awareness"],
                "herbal_suggestions": ["Consult with Ayurvedic practitioner"],
                "daily_routine_suggestions": ["Consistent wake and sleep times"]
            },
            "astrological_correlations": {
                "dosha_planetary_rulers": {"vata": ["saturn", "mercury"]},
                "elemental_correspondences": {"vata": ["air", "space"]},
                "house_correlations": {"vata": [3, 6, 11]},
                "sign_affinities": {"vata": ["gemini", "virgo", "aquarius"]},
                "lunar_cycle_effects": {
                    "new_moon": "Start new health routines",
                    "full_moon": "Peak awareness",
                    "waxing_moon": "Building strength",
                    "waning_moon": "Release and cleanse"
                }
            },
            "seasonal_recommendations": {},
            "analysis_confidence": 0.3,
            "calculation_method": f"error_fallback: {error_message}",
            "timestamp": datetime.now().isoformat()
        }
        
        return default_result


# Convenience function for direct usage
def calculate_ayurveda_constitution(
    birth_data: Dict[str, Any],
    user_id: Optional[str] = None
) -> AyurvedaAnalysisResult:
    """
    Calculate Ayurvedic constitution from birth chart data
    
    Args:
        birth_data: Birth chart data with planetary positions and houses
        user_id: Optional user identifier
        
    Returns:
        Complete Ayurveda analysis result
    """
    engine = AyurvedaEngine()
    return engine.analyze_constitution(birth_data, user_id)

# Additional utility functions for specific calculations
def get_dosha_balance_from_chart(birth_data: Dict[str, Any]) -> Dict[str, float]:
    """Get basic dosha balance from chart data"""
    engine = AyurvedaEngine()
    planetary_strengths = engine._extract_planetary_strengths(birth_data)
    house_emphasis = engine._extract_house_emphasis(birth_data) 
    elemental_balance = engine._calculate_elemental_balance(birth_data)
    
    return engine._calculate_prakruti(planetary_strengths, house_emphasis, elemental_balance)

def get_constitutional_type(dosha_balance: Dict[str, float]) -> AyurvedaConstitutionType:
    """Determine constitutional type from dosha balance"""
    engine = AyurvedaEngine()
    return engine._determine_constitution_type(dosha_balance)

def get_seasonal_guidance(constitution_type: AyurvedaConstitutionType) -> Dict[str, Any]:
    """Get seasonal guidance for constitution type"""
    engine = AyurvedaEngine()
    return engine._generate_seasonal_recommendations(constitution_type, {})
