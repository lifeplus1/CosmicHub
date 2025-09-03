# backend/astro/calculations/tcm_engine.py
"""
Simplified TCM (Traditional Chinese Medicine) Engine
AI #3: Backend Architecture Specialist Implementation
Focus on core functionality with minimal typing complexity
"""

import logging
from typing import Any, Dict, List, Optional
from datetime import datetime

logger = logging.getLogger(__name__)

class SimplifiedTCMEngine:
    """
    Simplified TCM calculation engine focused on core functionality
    """
    
    def __init__(self):
        self.elements = ["wood", "fire", "earth", "metal", "water"]
        
        # Core TCM data embedded for reliability
        self.element_data = {
            "wood": {
                "season": "spring",
                "organ_yin": "liver",
                "organ_yang": "gallbladder", 
                "emotion_balanced": "patience",
                "emotion_imbalanced": "anger",
                "planets": ["jupiter", "mars"],
                "hours": {"liver": "1-3am", "gallbladder": "11pm-1am"}
            },
            "fire": {
                "season": "summer",
                "organ_yin": "heart",
                "organ_yang": "small_intestine",
                "emotion_balanced": "joy",
                "emotion_imbalanced": "anxiety",
                "planets": ["sun", "mars"],
                "hours": {"heart": "11am-1pm", "small_intestine": "1-3pm"}
            },
            "earth": {
                "season": "late_summer",
                "organ_yin": "spleen",
                "organ_yang": "stomach", 
                "emotion_balanced": "empathy",
                "emotion_imbalanced": "worry",
                "planets": ["saturn", "venus"],
                "hours": {"spleen": "9-11am", "stomach": "7-9am"}
            },
            "metal": {
                "season": "autumn",
                "organ_yin": "lung",
                "organ_yang": "large_intestine",
                "emotion_balanced": "clarity",
                "emotion_imbalanced": "grief",
                "planets": ["mercury", "venus"],
                "hours": {"lung": "3-5am", "large_intestine": "5-7am"}
            },
            "water": {
                "season": "winter",
                "organ_yin": "kidney", 
                "organ_yang": "bladder",
                "emotion_balanced": "wisdom",
                "emotion_imbalanced": "fear",
                "planets": ["moon", "pluto"],
                "hours": {"kidney": "5-7pm", "bladder": "3-5pm"}
            }
        }
        
    def calculate_constitution(
        self, 
        year: int, 
        month: int, 
        day: int, 
        hour: int = 12,
        user_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """Calculate TCM constitutional analysis"""
        try:
            logger.info(f"Calculating TCM constitution for {year}-{month}-{day}")
            
            # Calculate elemental balance
            elemental_balance = self._calculate_elemental_balance(year, month, day, hour)
            
            # Determine primary constitution
            primary_element = max(elemental_balance.items(), key=lambda x: x[1])[0]
            
            # Generate constitution analysis
            constitution = self._create_constitution_analysis(primary_element, elemental_balance)
            
            # Generate health guidance
            health_guidance = self._generate_health_guidance(primary_element, elemental_balance)
            
            # Generate seasonal recommendations
            seasonal_recs = self._generate_seasonal_recommendations(elemental_balance)
            
            # Calculate confidence
            confidence = self._calculate_confidence(elemental_balance)
            
            return {
                "user_id": user_id or "anonymous",
                "birth_data": {"year": year, "month": month, "day": day, "hour": hour},
                "primary_element": primary_element,
                "elemental_balance": elemental_balance,
                "constitution_analysis": constitution,
                "health_guidance": health_guidance,
                "seasonal_recommendations": seasonal_recs,
                "organ_analysis": self._analyze_organs(elemental_balance),
                "analysis_confidence": confidence,
                "timestamp": datetime.now().isoformat(),
                "calculation_method": "simplified_tcm_engine"
            }
            
        except Exception as e:
            logger.error(f"TCM calculation failed: {e}")
            return self._create_error_response(e, user_id)
    
    def _calculate_elemental_balance(
        self, year: int, month: int, day: int, hour: int
    ) -> Dict[str, float]:
        """Calculate elemental balance from birth data"""
        scores = {element: 0.0 for element in self.elements}
        
        # Birth season influence (30%)
        birth_season = self._get_season(month)
        seasonal_element = self._get_seasonal_element(birth_season)
        scores[seasonal_element] += 0.30
        
        # Birth hour influence (20%) - TCM organ clock
        hour_element = self._get_hour_element(hour)
        scores[hour_element] += 0.20
        
        # Year element influence (Chinese 5-element cycle) (15%)
        year_element = self._get_year_element(year)
        scores[year_element] += 0.15
        
        # Day number influence (10%)
        day_element = self._get_day_element(day)
        scores[day_element] += 0.10
        
        # Month element influence (10%)
        month_element = self._get_month_element(month)
        scores[month_element] += 0.10
        
        # Base distribution (15%) - everyone has some of each element
        for element in self.elements:
            scores[element] += 0.03  # 0.15 / 5 = 0.03
            
        # Normalize to sum to 1.0
        total = sum(scores.values())
        if total > 0:
            scores = {elem: score/total for elem, score in scores.items()}
        
        return scores
    
    def _get_season(self, month: int) -> str:
        """Get season from month"""
        if month in [3, 4, 5]:
            return "spring"
        elif month in [6, 7, 8]:  
            return "summer"
        elif month in [9, 10, 11]:
            return "autumn"
        else:
            return "winter"
            
    def _get_seasonal_element(self, season: str) -> str:
        """Get element for season"""
        season_map = {
            "spring": "wood", "summer": "fire", 
            "autumn": "metal", "winter": "water"
        }
        return season_map.get(season, "earth")
        
    def _get_hour_element(self, hour: int) -> str:
        """Get element based on TCM organ clock"""
        # Simplified mapping of hours to elements
        if 1 <= hour < 7:  # Liver, Lung, Large Intestine
            return "wood" if hour < 3 else "metal"
        elif 7 <= hour < 13:  # Stomach, Spleen, Heart
            return "earth" if hour < 11 else "fire"
        elif 13 <= hour < 19:  # Small Intestine, Bladder, Kidney
            return "fire" if hour < 15 else "water"
        else:  # Pericardium, Triple Heater, Gallbladder
            return "fire" if hour < 23 else "wood"
    
    def _get_year_element(self, year: int) -> str:
        """Get element from year (simplified Chinese system)"""
        # 5-element cycle based on year
        elements = ["metal", "water", "wood", "fire", "earth"]
        return elements[year % 5]
        
    def _get_day_element(self, day: int) -> str:
        """Get element from day of month"""
        return self.elements[day % 5]
        
    def _get_month_element(self, month: int) -> str:
        """Get element from month"""
        # Map months to elements
        month_elements = {
            1: "water", 2: "water", 3: "wood", 4: "wood", 5: "wood",
            6: "fire", 7: "fire", 8: "fire", 9: "metal", 10: "metal", 
            11: "metal", 12: "water"
        }
        return month_elements.get(month, "earth")
    
    def _create_constitution_analysis(
        self, primary_element: str, elemental_balance: Dict[str, float]
    ) -> Dict[str, Any]:
        """Create constitutional analysis"""
        element_info = self.element_data[primary_element]
        
        # Find secondary element
        sorted_elements = sorted(elemental_balance.items(), key=lambda x: x[1], reverse=True)
        secondary_element = sorted_elements[1][0] if len(sorted_elements) > 1 else None
        
        return {
            "primary_element": primary_element,
            "secondary_element": secondary_element,
            "constitutional_type": f"{primary_element.title()} Constitution",
            "dominant_organs": [element_info["organ_yin"], element_info["organ_yang"]],
            "optimal_season": element_info["season"],
            "balanced_emotion": element_info["emotion_balanced"],
            "imbalanced_emotion": element_info["emotion_imbalanced"],
            "planetary_influences": element_info["planets"],
            "organ_hours": element_info["hours"],
            "element_strength": elemental_balance[primary_element],
            "constitution_traits": self._get_constitution_traits(primary_element)
        }
    
    def _get_constitution_traits(self, element: str) -> List[str]:
        """Get traits for constitutional type"""
        trait_map = {
            "wood": ["Natural leader", "Visionary", "Flexible", "Goal-oriented"],
            "fire": ["Charismatic", "Enthusiastic", "Communicative", "Warm"],
            "earth": ["Stable", "Nurturing", "Practical", "Reliable"],
            "metal": ["Precise", "Organized", "Clear thinking", "Structured"],
            "water": ["Wise", "Adaptable", "Deep", "Intuitive"]
        }
        return trait_map.get(element, ["Balanced individual"])
    
    def _generate_health_guidance(
        self, primary_element: str, elemental_balance: Dict[str, float]
    ) -> Dict[str, Any]:
        """Generate health recommendations"""
        element_info = self.element_data[primary_element]
        
        # Find weakest element
        weakest_element = min(elemental_balance.items(), key=lambda x: x[1])[0]
        weak_info = self.element_data[weakest_element]
        
        return {
            "constitutional_strengths": [
                f"Strong {primary_element} constitution supports {element_info['emotion_balanced']}",
                f"Natural affinity for {element_info['season']} activities"
            ],
            "potential_weaknesses": [
                f"Weak {weakest_element} may lead to {weak_info['emotion_imbalanced']}",
                f"May struggle during {weak_info['season']} season"
            ],
            "dietary_recommendations": self._get_dietary_recommendations(primary_element),
            "lifestyle_recommendations": self._get_lifestyle_recommendations(primary_element),
            "organ_support": {
                "primary_organs": [element_info["organ_yin"], element_info["organ_yang"]],
                "support_times": element_info["hours"],
                "weakness_watch": [weak_info["organ_yin"], weak_info["organ_yang"]]
            }
        }
    
    def _get_dietary_recommendations(self, element: str) -> List[str]:
        """Get dietary recommendations for element type"""
        dietary_map = {
            "wood": ["Sour foods in moderation", "Green vegetables", "Flexible eating schedule"],
            "fire": ["Bitter foods for balance", "Cooling foods in summer", "Regular meal times"],
            "earth": ["Sweet foods naturally", "Yellow/orange foods", "Mindful eating"],
            "metal": ["Spicy foods in moderation", "White foods", "Breathing before meals"],
            "water": ["Salty foods carefully", "Black/blue foods", "Warm foods in winter"]
        }
        return dietary_map.get(element, ["Balanced diet with all flavors"])
    
    def _get_lifestyle_recommendations(self, element: str) -> List[str]:
        """Get lifestyle recommendations for element type"""
        lifestyle_map = {
            "wood": ["Regular exercise", "Creative outlets", "Nature activities", "Stress management"],
            "fire": ["Social activities", "Heart-healthy exercise", "Cooling practices", "Joy cultivation"],
            "earth": ["Grounding activities", "Routine and stability", "Nurturing relationships", "Worry reduction"],
            "metal": ["Breathing exercises", "Organization", "Precision activities", "Grief processing"],
            "water": ["Restorative activities", "Wisdom seeking", "Kidney support", "Fear management"]
        }
        return lifestyle_map.get(element, ["Balanced lifestyle"])
    
    def _generate_seasonal_recommendations(self, elemental_balance: Dict[str, float]) -> Dict[str, Any]:
        """Generate seasonal recommendations"""
        recommendations = {}
        
        for season in ["spring", "summer", "autumn", "winter"]:
            seasonal_element = self._get_seasonal_element(season)
            personal_strength = elemental_balance.get(seasonal_element, 0.2)
            
            if personal_strength > 0.25:
                energy_level = "high"
                recommendation = f"This is your optimal season - embrace {season} energy"
            elif personal_strength > 0.15:
                energy_level = "moderate"
                recommendation = f"Good season for you - maintain balance during {season}"
            else:
                energy_level = "challenging"
                recommendation = f"Support yourself extra during {season} - this may be challenging"
                
            recommendations[season] = {
                "energy_level": energy_level,
                "element_affinity": personal_strength,
                "recommendation": recommendation,
                "support_practices": self._get_seasonal_practices(season, energy_level)
            }
            
        return recommendations
    
    def _get_seasonal_practices(self, season: str, energy_level: str) -> List[str]:
        """Get practices for seasonal support"""
        if energy_level == "high":
            return [f"Take advantage of natural {season} energy", "Pursue growth and expansion"]
        elif energy_level == "moderate":
            return [f"Maintain steady practices during {season}", "Support with appropriate nutrition"]
        else:
            return [f"Extra self-care during {season}", "Consider supportive treatments", "Rest and restore"]
    
    def _analyze_organs(self, elemental_balance: Dict[str, float]) -> Dict[str, Any]:
        """Analyze organ system strengths"""
        organ_analysis = {}
        
        for element, strength in elemental_balance.items():
            element_info = self.element_data[element]
            
            strength_level = "strong" if strength > 0.25 else "moderate" if strength > 0.15 else "weak"
            
            organ_analysis[element] = {
                "yin_organ": element_info["organ_yin"],
                "yang_organ": element_info["organ_yang"],
                "strength_level": strength_level,
                "strength_score": strength,
                "optimal_hours": element_info["hours"],
                "emotional_balance": element_info["emotion_balanced"],
                "emotional_imbalance": element_info["emotion_imbalanced"],
                "seasonal_peak": element_info["season"]
            }
            
        return organ_analysis
    
    def _calculate_confidence(self, elemental_balance: Dict[str, float]) -> float:
        """Calculate analysis confidence"""
        # Higher confidence when there's clear elemental dominance
        max_strength = max(elemental_balance.values())
        min_strength = min(elemental_balance.values())
        spread = max_strength - min_strength
        
        # Base confidence
        confidence = 0.7
        
        # Bonus for clear dominance
        if spread > 0.15:
            confidence += 0.2
        elif spread > 0.10:
            confidence += 0.1
            
        return min(confidence, 0.95)
    
    def _create_error_response(self, error: Exception, user_id: Optional[str]) -> Dict[str, Any]:
        """Create error response"""
        return {
            "user_id": user_id or "anonymous",
            "error": str(error),
            "primary_element": "earth",  # Safe default
            "elemental_balance": {elem: 0.2 for elem in self.elements},
            "analysis_confidence": 0.0,
            "timestamp": datetime.now().isoformat()
        }


# Module-level function for API compatibility
def calculate_tcm_constitution(
    year: int, month: int, day: int, hour: int = 12, 
    minute: int = 0, lat: float = 0.0, lon: float = 0.0, 
    timezone: str = "UTC", user_id: Optional[str] = None
) -> Dict[str, Any]:
    """
    Calculate TCM constitutional analysis - API-compatible function
    """
    engine = SimplifiedTCMEngine()
    return engine.calculate_constitution(year, month, day, hour, user_id)


# Global engine instance
tcm_engine = SimplifiedTCMEngine()
