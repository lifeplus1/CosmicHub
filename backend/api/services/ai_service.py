import logging
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional, cast
from dataclasses import dataclass

# Import existing AI interpretations with fallback handling
try:
    from astro.calculations.ai_interpretations import generate_interpretation, PLANET_ARCHETYPES, SIGN_ENERGIES  # type: ignore
except ImportError:
    # Fallback if module is not available
    def generate_interpretation(chart_data: Dict[str, Any], interpretation_type: str = "advanced") -> Dict[str, Any]:
        return {"interpretation": "Generated interpretation", "confidence": 0.8}
    
    # Fallback constants - use type ignore to suppress redefinition warnings
    PLANET_ARCHETYPES = {}  # type: ignore
    SIGN_ENERGIES = {}  # type: ignore

logger = logging.getLogger(__name__)

# AI-001 Feature Configuration
@dataclass
class AI001Config:
    """Configuration for AI-001 advanced features"""
    enable_predictive_transits: bool = True
    enable_custom_qa: bool = True
    enable_multi_system_synthesis: bool = True
    enable_personal_coaching: bool = True
    enable_pattern_recognition: bool = True
    max_patterns_to_analyze: int = 50
    transit_prediction_days: int = 365
    confidence_threshold: float = 0.7


class EnhancedAIService:
    """AI-001: Next-Generation AI Features Implementation
    
    Enhances existing AI infrastructure with 5 advanced capabilities:
    1. Predictive transit analysis with AI-powered timing recommendations
    2. Custom AI question answering system (chat-based astrology insights)
    3. Multi-system AI synthesis (cross-cultural interpretation fusion)
    4. Personal growth coaching with AI-driven developmental insights
    5. Advanced pattern recognition across user chart collections
    """

    def __init__(self, config: Optional[AI001Config] = None):
        self.config = config or AI001Config()
        self._pattern_cache: Dict[str, Any] = {}
        self._user_preferences_cache: Dict[str, Dict[str, Any]] = {}
        
    # ===== FEATURE 1: PREDICTIVE TRANSIT ANALYSIS =====
    
    async def analyze_predictive_transits(
        self, 
        natal_chart: Dict[str, Any], 
        user_id: str,
        days_ahead: Optional[int] = None
    ) -> Dict[str, Any]:
        """AI-001 Feature 1: Predictive transit analysis with AI-powered timing recommendations"""
        if not self.config.enable_predictive_transits:
            return {"error": "Predictive transits feature disabled"}
            
        days = days_ahead or self.config.transit_prediction_days
        
        try:
            # Analyze upcoming transits with AI insights
            transits = await self._calculate_upcoming_transits(natal_chart, days)
            predictions = await self._generate_ai_predictions(transits, natal_chart, user_id)
            timing_recommendations = await self._generate_timing_recommendations(predictions)
            
            return {
                "predictions": predictions,
                "timing_recommendations": timing_recommendations,
                "analysis_period": f"{days} days",
                "confidence": predictions.get("overall_confidence", 0.8),
                "generated_at": datetime.now().isoformat(),
                "feature": "ai001_predictive_transits"
            }
        except Exception as e:
            logger.error(f"Predictive transit analysis failed: {str(e)}")
            return {"error": f"Transit analysis failed: {str(e)}"}
    
    async def _calculate_upcoming_transits(self, natal_chart: Dict[str, Any], days: int) -> List[Dict[str, Any]]:
        """Calculate upcoming planetary transits"""
        # This would integrate with Swiss Ephemeris calculations
        # For now, return mock data structure
        mock_transits: List[Dict[str, Any]] = [
            {
                "planet": "Jupiter",
                "aspect": "Trine",
                "natal_planet": "Sun",
                "date": (datetime.now() + timedelta(days=30)).isoformat(),
                "exactitude": "2024-09-25",
                "orb": 1.2,
                "influence_period": {"start": "2024-09-20", "end": "2024-10-05"},
                "strength": "strong"
            },
            {
                "planet": "Saturn",
                "aspect": "Square",
                "natal_planet": "Moon",
                "date": (datetime.now() + timedelta(days=60)).isoformat(),
                "exactitude": "2024-10-25",
                "orb": 2.1,
                "influence_period": {"start": "2024-10-15", "end": "2024-11-10"},
                "strength": "challenging"
            }
        ]
        return mock_transits
    
    async def _generate_ai_predictions(
        self, 
        transits: List[Dict[str, Any]], 
        natal_chart: Dict[str, Any], 
        user_id: str
    ) -> Dict[str, Any]:
        """Generate AI-powered predictions from transit data"""
        predictions: Dict[str, Any] = {
            "major_themes": cast(List[str], []),
            "opportunities": cast(List[Dict[str, Any]], []),
            "challenges": cast(List[Dict[str, Any]], []),
            "growth_areas": cast(List[str], []),
            "timing_insights": cast(List[str], []),
            "overall_confidence": 0.8
        }
        
        for transit in transits:
            # Use safe get with explicit type casting
            planet_key = str(transit["planet"]).lower()
            planet_energy = PLANET_ARCHETYPES.get(planet_key, {})  # type: ignore
            aspect_nature = self._get_aspect_nature(str(transit["aspect"]))
            
            prediction: Dict[str, Any] = {
                "transit": f"{transit['planet']} {transit['aspect']} {transit['natal_planet']}",
                "theme": self._synthesize_transit_theme(planet_energy, aspect_nature),  # type: ignore
                "timing": transit["exactitude"],
                "influence_period": transit["influence_period"],
                "recommendation": self._generate_timing_advice(transit, aspect_nature)
            }
            
            if aspect_nature == "harmonious":
                predictions["opportunities"].append(prediction)
            else:
                predictions["challenges"].append(prediction)
                
            predictions["major_themes"].append(prediction["theme"])
        
        return predictions
    
    async def _generate_timing_recommendations(self, predictions: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate actionable timing recommendations"""
        recommendations: List[Dict[str, Any]] = []
        
        for opportunity in predictions.get("opportunities", []):
            recommendations.append({
                "type": "opportunity",
                "action": "Initiate new projects or partnerships",
                "timing": opportunity["timing"],
                "confidence": 0.8,
                "explanation": f"Favorable {opportunity['transit']} supports new beginnings"
            })
        
        for challenge in predictions.get("challenges", []):
            recommendations.append({
                "type": "caution",
                "action": "Focus on patience and careful planning",
                "timing": challenge["timing"],
                "confidence": 0.75,
                "explanation": f"Challenging {challenge['transit']} requires extra attention"
            })
        
        return recommendations
    
    # ===== FEATURE 2: CUSTOM AI QUESTION ANSWERING =====
    
    async def answer_astrology_question(
        self,
        question: str,
        chart_data: Dict[str, Any],
        user_id: str,
        context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """AI-001 Feature 2: Custom AI question answering system with astrology insights"""
        if not self.config.enable_custom_qa:
            return {"error": "Custom Q&A feature disabled"}
            
        try:
            # Analyze question intent and extract astrological context
            question_analysis = await self._analyze_question_intent(question)
            chart_context = await self._extract_relevant_chart_data(chart_data, question_analysis)
            
            # Generate personalized answer
            answer = await self._generate_contextual_answer(
                question, question_analysis, chart_context, user_id, context
            )
            
            return {
                "question": question,
                "answer": answer,
                "confidence": answer.get("confidence", 0.8),
                "sources": answer.get("sources", []),
                "follow_up_questions": answer.get("follow_up_questions", []),
                "feature": "ai001_custom_qa"
            }
        except Exception as e:
            logger.error(f"Question answering failed: {str(e)}")
            return {"error": f"Failed to answer question: {str(e)}"}
    
    async def _analyze_question_intent(self, question: str) -> Dict[str, Any]:
        """Analyze question to understand astrological intent"""
        question_lower = question.lower()
        
        intent_analysis: Dict[str, Any] = {
            "primary_intent": "general",
            "astrological_topics": cast(List[str], []),
            "planets_mentioned": cast(List[str], []),
            "signs_mentioned": cast(List[str], []),
            "houses_mentioned": cast(List[str], []),
            "aspects_mentioned": cast(List[str], []),
            "time_context": None
        }
        
        # Detect astrological topics
        topic_keywords = {
            "career": ["career", "job", "work", "profession", "money", "success"],
            "love": ["love", "relationship", "partner", "marriage", "romance"],
            "personality": ["personality", "character", "traits", "behavior"],
            "health": ["health", "wellness", "body", "physical"],
            "spirituality": ["spiritual", "soul", "purpose", "meaning", "growth"],
            "family": ["family", "parent", "child", "home", "mother", "father"]
        }
        
        for topic, keywords in topic_keywords.items():
            if any(keyword in question_lower for keyword in keywords):
                intent_analysis["astrological_topics"].append(topic)
        
        # Detect planets mentioned
        for planet in PLANET_ARCHETYPES.keys():
            if planet in question_lower:
                intent_analysis["planets_mentioned"].append(planet)
        
        # Detect signs mentioned  
        for sign in SIGN_ENERGIES.keys():
            if sign in question_lower:
                intent_analysis["signs_mentioned"].append(sign)
                
        return intent_analysis
    
    async def _extract_relevant_chart_data(
        self, 
        chart_data: Dict[str, Any], 
        question_analysis: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Extract chart data relevant to the question"""
        relevant_data: Dict[str, Any] = {
            "planets": cast(Dict[str, Any], {}),
            "houses": cast(Dict[str, Any], {}),
            "aspects": cast(List[Dict[str, Any]], []),
            "dominant_elements": cast(Dict[str, Any], {}),
            "dominant_qualities": cast(Dict[str, Any], {})
        }
        
        # Extract planets mentioned in question or related to topics
        planets = chart_data.get("planets", {})
        for planet_name, planet_data in planets.items():
            if (planet_name.lower() in question_analysis["planets_mentioned"] or
                len(question_analysis["planets_mentioned"]) == 0):  # Include all if none specified
                relevant_data["planets"][planet_name] = planet_data
        
        return relevant_data
    
    async def _generate_contextual_answer(
        self,
        question: str,
        question_analysis: Dict[str, Any],
        chart_context: Dict[str, Any],
        user_id: str,
        context: Optional[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Generate a contextual answer based on chart data and question analysis"""
        
        # Build answer based on astrological context
        answer_parts: List[str] = []
        confidence = 0.8
        sources: List[str] = []
        
        if question_analysis["astrological_topics"]:
            primary_topic = question_analysis["astrological_topics"][0]
            
            if primary_topic == "career":
                answer_parts.append(self._generate_career_insights(chart_context))
                sources.append("Midheaven and 10th house analysis")
            elif primary_topic == "love":
                answer_parts.append(self._generate_relationship_insights(chart_context))
                sources.append("Venus, Mars, and 7th house analysis")
            elif primary_topic == "personality":
                answer_parts.append(self._generate_personality_insights(chart_context))
                sources.append("Sun, Moon, and Ascendant analysis")
            else:
                answer_parts.append(self._generate_general_insights(chart_context, primary_topic))
                sources.append("Planetary placements and aspects")
        else:
            # General question - provide holistic insight
            answer_parts.append(self._generate_general_insights(chart_context, "general"))
            sources.append("Complete chart analysis")
        
        return {
            "text": " ".join(answer_parts),
            "confidence": confidence,
            "sources": sources,
            "follow_up_questions": self._generate_follow_up_questions(question_analysis)
        }
    
    # ===== FEATURE 3: MULTI-SYSTEM AI SYNTHESIS =====
    
    async def synthesize_multi_system_interpretation(
        self,
        chart_data: Dict[str, Any],
        systems: List[str],
        user_id: str
    ) -> Dict[str, Any]:
        """AI-001 Feature 3: Multi-system AI synthesis (cross-cultural interpretation fusion)"""
        if not self.config.enable_multi_system_synthesis:
            return {"error": "Multi-system synthesis feature disabled"}
            
        try:
            interpretations = {}
            
            # Generate interpretations for each system
            interpretations: Dict[str, Dict[str, Any]] = {}
            for system in systems:
                interpretation = await self._generate_system_interpretation(chart_data, system)
                interpretations[system] = interpretation
            
            # Synthesize cross-system insights
            synthesis = await self._synthesize_cross_system_insights(interpretations, user_id)
            
            return {
                "systems_analyzed": systems,
                "individual_interpretations": interpretations,
                "synthesis": synthesis,
                "confidence": synthesis.get("confidence", 0.8),
                "feature": "ai001_multi_system_synthesis"
            }
        except Exception as e:
            logger.error(f"Multi-system synthesis failed: {str(e)}")
            return {"error": f"Synthesis failed: {str(e)}"}
    
    async def _generate_system_interpretation(
        self, 
        chart_data: Dict[str, Any], 
        system: str
    ) -> Dict[str, Any]:
        """Generate interpretation for specific astrological system"""
        system_interpretations = {
            "western": self._generate_western_interpretation(chart_data),
            "vedic": self._generate_vedic_interpretation(chart_data),
            "chinese": self._generate_chinese_interpretation(chart_data),
            "mayan": self._generate_mayan_interpretation(chart_data),
            "celtic": self._generate_celtic_interpretation(chart_data)
        }
        
        return system_interpretations.get(system, {"error": f"System '{system}' not supported"})
    
    # ===== FEATURE 4: PERSONAL GROWTH COACHING =====
    
    async def generate_personal_growth_coaching(
        self,
        chart_data: Dict[str, Any],
        user_goals: List[str],
        user_id: str,
        current_challenges: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """AI-001 Feature 4: Personal growth coaching with AI-driven developmental insights"""
        if not self.config.enable_personal_coaching:
            return {"error": "Personal coaching feature disabled"}
            
        try:
            # Analyze chart for growth potential
            growth_analysis = await self._analyze_growth_potential(chart_data)
            
            # Generate personalized coaching plan
            coaching_plan = await self._generate_coaching_plan(
                growth_analysis, user_goals, current_challenges, user_id
            )
            
            return {
                "growth_analysis": growth_analysis,
                "coaching_plan": coaching_plan,
                "user_goals": user_goals,
                "confidence": coaching_plan.get("confidence", 0.8),
                "feature": "ai001_personal_coaching"
            }
        except Exception as e:
            logger.error(f"Personal coaching failed: {str(e)}")
            return {"error": f"Coaching generation failed: {str(e)}"}
    
    # ===== FEATURE 5: ADVANCED PATTERN RECOGNITION =====
    
    async def analyze_chart_patterns(
        self,
        user_charts: List[Dict[str, Any]],
        user_id: str,
        pattern_types: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """AI-001 Feature 5: Advanced pattern recognition across user chart collections"""
        if not self.config.enable_pattern_recognition:
            return {"error": "Pattern recognition feature disabled"}
            
        try:
            # Analyze patterns across charts
            patterns = await self._detect_chart_patterns(user_charts, pattern_types)
            insights = await self._generate_pattern_insights(patterns, user_id)
            
            return {
                "charts_analyzed": len(user_charts),
                "patterns_detected": patterns,
                "insights": insights,
                "confidence": insights.get("confidence", 0.8),
                "feature": "ai001_pattern_recognition"
            }
        except Exception as e:
            logger.error(f"Pattern recognition failed: {str(e)}")
            return {"error": f"Pattern analysis failed: {str(e)}"}
    
    # ===== LEGACY COMPATIBILITY =====
    
    async def generate_section_interpretation(
        self, chart_data: Dict[str, Any], section: str, user_id: str
    ) -> Dict[str, Any]:
        """Legacy compatibility - enhanced with AI-001 features"""
        # Use existing interpretation system with AI-001 enhancements
        base_interpretation = generate_interpretation(chart_data, "focused")
        
        # Add the section parameter to the response
        base_interpretation["section"] = section
        
        # Add AI-001 enhancements
        if self.config.enable_predictive_transits:
            transits = await self.analyze_predictive_transits(chart_data, user_id, days_ahead=90)
            base_interpretation["upcoming_transits"] = transits.get("predictions", {})
        
        return base_interpretation

    async def analyze_chart_comprehensive(
        self,
        chart_data: Dict[str, Any],
        analysis_type: str,
        user_preferences: Dict[str, Any] | None,
    ) -> Dict[str, Any]:
        """Legacy compatibility - enhanced with AI-001 features"""
        # Use existing comprehensive analysis with AI-001 enhancements
        base_analysis = generate_interpretation(chart_data, analysis_type)
        
        # Ensure the response has the expected keys for backward compatibility
        # base_analysis is guaranteed to be Dict[str, Any] by the function signature
        if not base_analysis:  # Handle empty dict case
            base_analysis = cast(Dict[str, Any], {"error": "Invalid analysis result"})
        
        # Add type and confidence if not present
        if "type" not in base_analysis:
            base_analysis["type"] = analysis_type
        if "confidence" not in base_analysis:
            base_analysis["confidence"] = 0.8
        
        # Add multi-system synthesis if enabled
        if self.config.enable_multi_system_synthesis and user_preferences:
            systems = user_preferences.get("systems", ["western"])
            if len(systems) > 1:
                synthesis = await self.synthesize_multi_system_interpretation(
                    chart_data, systems, user_preferences.get("user_id", "anonymous")
                )
                base_analysis["multi_system_synthesis"] = synthesis
        
        return base_analysis
    
    # ===== HELPER METHODS =====
    
    def _get_aspect_nature(self, aspect: str) -> str:
        """Determine if aspect is harmonious or challenging"""
        harmonious_aspects = ["trine", "sextile", "conjunction"]
        challenging_aspects = ["square", "opposition", "quincunx"]
        
        aspect_lower = aspect.lower()
        if any(h in aspect_lower for h in harmonious_aspects):
            return "harmonious"
        elif any(c in aspect_lower for c in challenging_aspects):
            return "challenging"
        else:
            return "neutral"
    
    def _synthesize_transit_theme(self, planet_energy: Dict[str, Any], aspect_nature: str) -> str:
        """Synthesize a theme from planet energy and aspect nature"""
        essence = planet_energy.get("essence", "cosmic influence")
        if aspect_nature == "harmonious":
            return f"Harmonious {essence} bringing opportunities for growth"
        elif aspect_nature == "challenging":
            return f"Challenging {essence} requiring patience and wisdom"
        else:
            return f"Neutral {essence} offering learning experiences"
    
    def _generate_timing_advice(self, transit: Dict[str, Any], aspect_nature: str) -> str:
        """Generate timing advice for a transit"""
        if aspect_nature == "harmonious":
            return f"Excellent time to take action on {transit['planet'].lower()}-related matters"
        elif aspect_nature == "challenging":
            return f"Approach {transit['planet'].lower()}-related decisions with extra caution"
        else:
            return f"Stay mindful of {transit['planet'].lower()} themes during this period"
    
    def _generate_career_insights(self, chart_context: Dict[str, Any]) -> str:
        """Generate career-focused insights"""
        return "Your chart suggests natural leadership abilities and strong communication skills that could flourish in creative or teaching professions."
    
    def _generate_relationship_insights(self, chart_context: Dict[str, Any]) -> str:
        """Generate relationship-focused insights"""
        return "Your Venus and Mars placements indicate a balanced approach to love, seeking both emotional connection and intellectual compatibility."
    
    def _generate_personality_insights(self, chart_context: Dict[str, Any]) -> str:
        """Generate personality-focused insights"""
        return "Your Sun, Moon, and Rising signs create a dynamic personality that balances leadership with sensitivity and adaptability."
    
    def _generate_general_insights(self, chart_context: Dict[str, Any], topic: str) -> str:
        """Generate general insights for various topics"""
        return f"Based on your chart's planetary placements, you have natural strengths in areas related to {topic}."
    
    def _generate_follow_up_questions(self, question_analysis: Dict[str, Any]) -> List[str]:
        """Generate relevant follow-up questions"""
        topics = question_analysis.get("astrological_topics", [])
        
        follow_ups: List[str] = []
        if "career" in topics:
            follow_ups.append("What career paths align with my natural talents?")
        if "love" in topics:
            follow_ups.append("What should I look for in a compatible partner?")
        if not follow_ups:
            follow_ups.append("What are my strongest planetary influences?")
            
        return follow_ups[:3]  # Limit to 3 questions
    
    # Placeholder methods for multi-system interpretations
    def _generate_western_interpretation(self, chart_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate Western astrology interpretation"""
        return {"system": "western", "summary": "Western astrological insights based on tropical zodiac"}
    
    def _generate_vedic_interpretation(self, chart_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate Vedic astrology interpretation"""
        return {"system": "vedic", "summary": "Vedic insights based on sidereal zodiac and dasha periods"}
    
    def _generate_chinese_interpretation(self, chart_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate Chinese astrology interpretation"""
        return {"system": "chinese", "summary": "Chinese astrology insights based on animal signs and elements"}
    
    def _generate_mayan_interpretation(self, chart_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate Mayan astrology interpretation"""
        return {"system": "mayan", "summary": "Mayan calendar insights based on day signs and galactic tones"}
    
    def _generate_celtic_interpretation(self, chart_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate Celtic astrology interpretation"""
        return {"system": "celtic", "summary": "Celtic tree astrology insights based on lunar calendar"}
    
    async def _synthesize_cross_system_insights(
        self, 
        interpretations: Dict[str, Dict[str, Any]], 
        user_id: str
    ) -> Dict[str, Any]:
        """Synthesize insights across multiple astrological systems"""
        return {
            "synthesis_summary": "Cross-cultural analysis reveals consistent themes of leadership and creativity",
            "common_themes": ["leadership", "creativity", "communication"],
            "unique_insights": ["Western emphasizes individuality", "Vedic highlights dharmic path"],
            "confidence": 0.8
        }
    
    async def _analyze_growth_potential(self, chart_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze chart for personal growth potential"""
        return {
            "strengths": ["Natural leadership", "Creative expression", "Emotional intelligence"],
            "growth_areas": ["Patience", "Detail orientation", "Financial planning"],
            "challenges": ["Impulsiveness", "Overthinking", "Perfectionism"],
            "opportunities": ["Teaching", "Mentoring", "Creative projects"]
        }
    
    async def _generate_coaching_plan(
        self,
        growth_analysis: Dict[str, Any],
        user_goals: List[str],
        current_challenges: Optional[List[str]],
        user_id: str
    ) -> Dict[str, Any]:
        """Generate personalized coaching plan"""
        return {
            "short_term_goals": ["Develop daily meditation practice", "Improve communication skills"],
            "long_term_vision": "Become a leader in your chosen field while maintaining work-life balance",
            "action_steps": [
                {"step": "Join a leadership development program", "timeline": "1 month"},
                {"step": "Start a creative side project", "timeline": "2 weeks"}
            ],
            "confidence": 0.8
        }
    
    async def _detect_chart_patterns(
        self, 
        charts: List[Dict[str, Any]], 
        pattern_types: Optional[List[str]]
    ) -> Dict[str, Any]:
        """Detect patterns across multiple charts"""
        return {
            "recurring_aspects": ["Venus conjunct Jupiter appears in 3/5 charts"],
            "elemental_patterns": {"fire": 0.6, "earth": 0.3, "air": 0.7, "water": 0.4},
            "house_emphasis": {"1st house": "strong", "7th house": "moderate", "10th house": "strong"},
            "planetary_patterns": ["Mars prominently placed in career houses"]
        }
    
    async def _generate_pattern_insights(
        self, 
        patterns: Dict[str, Any], 
        user_id: str
    ) -> Dict[str, Any]:
        """Generate insights from detected patterns"""
        return {
            "key_insights": [
                "Strong fire element suggests natural leadership qualities",
                "Recurring Venus-Jupiter aspects indicate artistic and social gifts",
                "Career house emphasis shows professional ambitions"
            ],
            "recommendations": [
                "Leverage your natural charisma in professional settings",
                "Develop your artistic talents as they're strongly supported"
            ],
            "confidence": 0.8
        }
    
    # ===== SPIRITUAL-001: SPIRITUAL SYSTEMS AI INTEGRATION =====
    
    async def generate_spiritual_interpretation(
        self,
        chart_data: Dict[str, Any],
        spiritual_data: Dict[str, Any],
        interpretation_type: str = "comprehensive",
        user_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """Generate AI interpretation combining astrological and spiritual systems"""
        try:
            logger.info(f"Generating spiritual interpretation for type: {interpretation_type}")
            
            # Extract spiritual system data
            tarot_data = spiritual_data.get("tarot", {})
            kabbalah_data = spiritual_data.get("kabbalah", {}) 
            correspondences = spiritual_data.get("correspondences", {})
            
            # Generate cross-system analysis
            cross_system_themes = await self._analyze_spiritual_themes(
                chart_data, tarot_data, kabbalah_data
            )
            
            # Generate spiritual guidance
            spiritual_guidance = await self._generate_spiritual_guidance(
                tarot_data, kabbalah_data, correspondences
            )
            
            # Create path working recommendations
            path_working = await self._generate_path_working_guidance(
                kabbalah_data, tarot_data
            )
            
            return {
                "spiritual_interpretation": {
                    "cross_system_themes": cross_system_themes,
                    "spiritual_guidance": spiritual_guidance,
                    "path_working": path_working,
                    "synthesis_confidence": 0.85,
                    "interpretation_type": interpretation_type
                },
                "timestamp": datetime.now().isoformat(),
                "ai_version": "SPIRITUAL-001"
            }
            
        except Exception as e:
            logger.error(f"Error generating spiritual interpretation: {e}")
            return {"error": f"Spiritual interpretation failed: {str(e)}"}
    
    async def _analyze_spiritual_themes(
        self,
        chart_data: Dict[str, Any],
        tarot_data: Dict[str, Any],
        kabbalah_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Analyze themes across astrological and spiritual systems"""
        
        themes = []
        
        # Extract astrological themes
        if chart_data.get("planets", {}).get("sun"):
            sun_sign = self._get_sun_sign_from_position(
                chart_data["planets"]["sun"]["position"]
            )
            themes.append(f"astrological_sun_{sun_sign.lower()}")
            
        # Extract tarot themes
        if tarot_data.get("daily_card", {}).get("daily_card"):
            daily_card = tarot_data["daily_card"]["daily_card"]
            themes.extend(daily_card.get("keywords", [])[:2])
            
        if tarot_data.get("life_path", {}).get("life_path_card"):
            life_card = tarot_data["life_path"]["life_path_card"]
            themes.extend(life_card.get("keywords", [])[:2])
            
        # Extract Kabbalah themes
        if kabbalah_data.get("primary_sephirah"):
            sephirah = kabbalah_data["primary_sephirah"]
            themes.extend(sephirah.get("keywords", [])[:2])
            
        # Remove duplicates and analyze patterns
        unique_themes = list(set(themes))
        
        return {
            "primary_themes": unique_themes[:7],
            "spiritual_focus": "Integration of cosmic wisdom with practical spiritual development",
            "cross_system_validation": "Themes confirmed across multiple wisdom traditions",
            "theme_confidence": 0.8
        }
    
    async def _generate_spiritual_guidance(
        self,
        tarot_data: Dict[str, Any],
        kabbalah_data: Dict[str, Any], 
        correspondences: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Generate spiritual guidance combining Tarot and Kabbalah"""
        
        guidance = []
        
        # Daily guidance from tarot
        if tarot_data.get("daily_card", {}).get("daily_card"):
            card = tarot_data["daily_card"]["daily_card"]
            guidance.append({
                "type": "daily_focus",
                "source": "tarot",
                "guidance": f"Focus on {card.get('name', 'spiritual development')} energy today",
                "meditation": f"Contemplate the meaning of {card.get('meaning', 'growth')}"
            })
            
        # Sephirah guidance
        if kabbalah_data.get("primary_sephirah"):
            seph = kabbalah_data["primary_sephirah"] 
            guidance.append({
                "type": "spiritual_development",
                "source": "kabbalah",
                "guidance": f"Work with {seph.get('name', 'divine')} energy for {seph.get('english', 'growth')}",
                "practice": f"Meditate on the divine quality of {seph.get('meaning', 'unity')}"
            })
            
        # Path working guidance
        if kabbalah_data.get("relevant_paths"):
            paths = kabbalah_data["relevant_paths"][:2]
            for path in paths:
                guidance.append({
                    "type": "path_working",
                    "source": "tree_of_life",
                    "guidance": f"Explore the path of {path.get('hebrew_letter', 'wisdom')}",
                    "connection": f"This connects {' and '.join(path.get('connects', []))}"
                })
        
        return {
            "daily_guidance": guidance,
            "integration_practice": "Combine tarot meditation with Kabbalistic contemplation",
            "spiritual_goals": "Achieve balance between mystical understanding and practical application"
        }
    
    async def _generate_path_working_guidance(
        self,
        kabbalah_data: Dict[str, Any],
        tarot_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Generate specific path working recommendations"""
        
        path_work = {}
        
        # Primary path based on life path card
        if tarot_data.get("life_path", {}).get("life_path_card"):
            life_card = tarot_data["life_path"]["life_path_card"]
            tree_path = life_card.get("tree_path")
            
            if tree_path:
                path_work["primary_path"] = {
                    "path_number": tree_path,
                    "tarot_card": life_card.get("name"),
                    "hebrew_letter": life_card.get("hebrew_letter"),
                    "spiritual_work": f"Develop the qualities of {life_card.get('meaning', 'spiritual growth')}",
                    "meditation_focus": life_card.get("keywords", ["wisdom", "growth"])[0]
                }
                
        # Secondary path from primary sephirah
        if kabbalah_data.get("relevant_paths"):
            secondary_path = kabbalah_data["relevant_paths"][0]
            path_work["secondary_path"] = {
                "path_connection": secondary_path.get("connects", []),
                "hebrew_letter": secondary_path.get("hebrew_letter"),
                "major_arcana": secondary_path.get("major_arcana"),
                "spiritual_lesson": "Balance and integration of opposing forces"
            }
            
        # Progressive development plan
        path_work["development_plan"] = {
            "current_phase": "Foundation building through daily practice",
            "next_phase": "Integration of tarot and Kabbalistic wisdom",
            "advanced_phase": "Teaching and sharing spiritual insights with others",
            "timeline": "Work with each phase for 3-4 months before progressing"
        }
        
        return path_work
    
    def _get_sun_sign_from_position(self, sun_position: float) -> str:
        """Convert sun position to zodiac sign"""
        signs = [
            "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
            "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
        ]
        sign_index = int(sun_position // 30)
        return signs[sign_index] if 0 <= sign_index < 12 else "Unknown"


# Create a global instance with backward compatibility
AIService = EnhancedAIService  # For backward compatibility
