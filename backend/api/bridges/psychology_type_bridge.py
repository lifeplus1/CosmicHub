# backend/api/bridges/psychology_type_bridge.py
"""
Psychology Type Bridge for CosmicHub Backend

Type-safe bridge for psychological assessment data, providing centralized factory
methods for creating strongly typed responses from psychology calculation engines.

Following the established type bridge pattern from TCM and Astrology systems.
"""

import logging
from datetime import datetime
from typing import Any, Dict, List, Optional, Union, cast

# Import psychology types from centralized location
from backend.types.psychology_systems import (
    PersonalityTrait, CognitiveFunction, EmotionalProfile, StressIndicator,
    MBTIAssessment, BigFiveAssessment, EnneagramAssessment, TemperamentAssessment,
    PsychologyProfile, TherapeuticRecommendation, GrowthRecommendation, WellnessInsight,
    PsychologyAssessmentResponse, PsychologyProfileResponse, PsychologyComparisonResponse,
    PsychologyHealthCheck, AssessmentType, PersonalityDimension, BigFiveTrait, Temperament
)

logger = logging.getLogger(__name__)

class PsychologyTypeBridge:
    """
    Type-safe bridge for psychological assessment data
    """
    
    # MBTI type validation
    VALID_MBTI_TYPES = {
        'INTJ', 'INTP', 'ENTJ', 'ENTP', 'INFJ', 'INFP', 'ENFJ', 'ENFP',
        'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ', 'ISTP', 'ISFP', 'ESTP', 'ESFP'
    }
    
    # Big Five traits
    BIG_FIVE_TRAITS = ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism']
    
    # Enneagram types
    ENNEAGRAM_TYPES = list(range(1, 10))
    
    # Temperaments
    TEMPERAMENTS = ['sanguine', 'choleric', 'melancholic', 'phlegmatic']
    
    @classmethod
    def create_personality_trait(
        cls,
        name: str,
        value: float,
        percentile: Optional[float] = None,
        description: Optional[str] = None,
        category: Optional[str] = None
    ) -> PersonalityTrait:
        """Create a properly typed PersonalityTrait"""
        return PersonalityTrait(
            name=name,
            value=max(0, min(100, value)),
            percentile=max(0, min(100, percentile)) if percentile is not None else None,
            description=description,
            category=category
        )
    
    @classmethod
    def create_cognitive_function(
        cls,
        name: str,
        code: str,
        strength: float,
        position: int,
        attitude: str
    ) -> CognitiveFunction:
        """Create a properly typed CognitiveFunction"""
        att = attitude if attitude in ['extraverted', 'introverted'] else 'extraverted'
        from typing import cast, Literal
        att_lit = cast(Literal['extraverted', 'introverted'], att)
        return CognitiveFunction(
            name=name,
            code=code.upper(),
            strength=max(0, min(100, strength)),
            position=max(1, min(8, position)),
            attitude=att_lit
        )
    
    @classmethod
    def create_emotional_profile(
        cls,
        emotional_intelligence: float,
        self_awareness: float,
        self_regulation: float,
        motivation: float,
        empathy: float,
        social_skills: float
    ) -> EmotionalProfile:
        """Create a properly typed EmotionalProfile"""
        return EmotionalProfile(
            emotional_intelligence=max(0, min(100, emotional_intelligence)),
            self_awareness=max(0, min(100, self_awareness)),
            self_regulation=max(0, min(100, self_regulation)),
            motivation=max(0, min(100, motivation)),
            empathy=max(0, min(100, empathy)),
            social_skills=max(0, min(100, social_skills))
        )
    
    @classmethod
    def create_stress_indicator(
        cls,
        stress_level: float,
        primary_stressors: List[str],
        coping_strategies: List[str],
        resilience_score: float,
        burnout_risk: str
    ) -> StressIndicator:
        """Create a properly typed StressIndicator"""
        valid_burnout_levels = ['low', 'moderate', 'high']
        risk = burnout_risk if burnout_risk in valid_burnout_levels else 'moderate'
        from typing import cast, Literal
        risk_lit = cast(Literal['low', 'moderate', 'high'], risk)
        return StressIndicator(
            stress_level=max(0, min(100, stress_level)),
            primary_stressors=primary_stressors or [],
            coping_strategies=coping_strategies or [],
            resilience_score=max(0, min(100, resilience_score)),
            burnout_risk=risk_lit
        )
    
    @classmethod
    def create_mbti_assessment(
        cls,
        type_code: str,
        type_name: str,
        cognitive_functions: List[Dict[str, Any]],
        dimensions: Dict[str, float],
        confidence_level: float
    ) -> MBTIAssessment:
        """Create a properly typed MBTIAssessment"""
        # Validate and normalize type code
        type_code = type_code.upper()
        if type_code not in cls.VALID_MBTI_TYPES:
            type_code = 'XXXX'  # Invalid placeholder
        
        # Convert function dicts to CognitiveFunction objects
        functions: List[CognitiveFunction] = []
        for i, func_data in enumerate(cognitive_functions[:8]):  # Max 8 functions
            # func_data expected dict[str, Any]
            functions.append(cls.create_cognitive_function(
                name=func_data.get('name', f'Function {i+1}'),
                code=func_data.get('code', 'Fx'),
                strength=func_data.get('strength', 50.0),
                position=i + 1,
                attitude=func_data.get('attitude', 'extraverted')
            ))
        
        return MBTIAssessment(
            type_code=type_code,
            type_name=type_name,
            cognitive_functions=functions,
            dimensions=dimensions,
            confidence_level=max(0, min(100, confidence_level))
        )
    
    @classmethod
    def create_big_five_assessment(
        cls,
        trait_scores: Dict[str, float],
        overall_profile: str
    ) -> BigFiveAssessment:
        """Create a properly typed BigFiveAssessment"""
        traits: Dict[str, PersonalityTrait] = {}
        for trait_name in cls.BIG_FIVE_TRAITS:
            score = trait_scores.get(trait_name, 50.0)
            traits[trait_name] = cls.create_personality_trait(
                name=trait_name.title(),
                value=score,
                category='big_five'
            )
        return BigFiveAssessment(
            openness=traits['openness'],
            conscientiousness=traits['conscientiousness'],
            extraversion=traits['extraversion'],
            agreeableness=traits['agreeableness'],
            neuroticism=traits['neuroticism'],
            overall_profile=overall_profile
        )
    
    @classmethod
    def create_enneagram_assessment(
        cls,
        primary_type: int,
        wing: Optional[int],
        instinctual_variant: str,
        integration_direction: int,
        disintegration_direction: int,
        type_scores: Dict[str, float]
    ) -> EnneagramAssessment:
        """Create a properly typed EnneagramAssessment"""
        # Validate enneagram type
        primary_type = max(1, min(9, primary_type))
        
        # Validate wing
        if wing is not None:
            wing = max(1, min(9, wing))
        
        # Validate instinctual variant
        valid_variants = ['self_preservation', 'social', 'sexual']
        if instinctual_variant not in valid_variants:
            instinctual_variant = 'self_preservation'
        from typing import cast, Literal
        variant_lit = cast(Literal['self_preservation', 'social', 'sexual'], instinctual_variant)
        return EnneagramAssessment(
            primary_type=primary_type,
            wing=wing,
            instinctual_variant=variant_lit,
            integration_direction=max(1, min(9, integration_direction)),
            disintegration_direction=max(1, min(9, disintegration_direction)),
            type_scores=type_scores
        )
    
    @classmethod
    def create_wellness_insight(
        cls,
        category: str,
        title: str,
        description: str,
        priority: str,
        actionable: bool = True,
        related_traits: Optional[List[str]] = None
    ) -> WellnessInsight:
        """Create a properly typed WellnessInsight"""
        valid_categories = ['strength', 'challenge', 'opportunity', 'risk']
        valid_priorities = ['low', 'medium', 'high', 'critical']
        
        category = category if category in valid_categories else 'opportunity'
        priority = priority if priority in valid_priorities else 'medium'
        
        from typing import cast, Literal
        category_lit = cast(Literal['strength','challenge','opportunity','risk'], category)
        priority_lit = cast(Literal['low','medium','high','critical'], priority)
        return WellnessInsight(
            category=category_lit,
            title=title,
            description=description,
            priority=priority_lit,
            actionable=actionable,
            related_traits=related_traits or []
        )
    
    @classmethod
    def create_therapeutic_recommendation(
        cls,
        approach: str,
        rationale: str,
        suitability_score: float,
        focus_areas: Optional[List[str]] = None,
        techniques: Optional[List[str]] = None
    ) -> TherapeuticRecommendation:
        """Create a properly typed TherapeuticRecommendation"""
        valid_approaches = ['cognitive_behavioral', 'psychoanalytic', 'humanistic', 'systemic', 'integrative']
        approach = approach if approach in valid_approaches else 'integrative'
        
        from typing import cast, Literal
        approach_lit = cast(Literal['cognitive_behavioral','psychoanalytic','humanistic','systemic','integrative'], approach)
        return TherapeuticRecommendation(
            approach=approach_lit,
            rationale=rationale,
            suitability_score=max(0, min(100, suitability_score)),
            focus_areas=focus_areas or [],
            techniques=techniques or []
        )
    
    @classmethod
    def create_psychology_assessment_response(
        cls,
        user_id: str,
        assessment_type: str,
        results: Dict[str, Any],
        insights: Optional[List[Dict[str, Any]]] = None,
        recommendations: Optional[List[Dict[str, Any]]] = None,
        processing_time_ms: float = 0.0,
        generated_at: Optional[str] = None
    ) -> PsychologyAssessmentResponse:
        """Create properly typed PsychologyAssessmentResponse"""
        if generated_at is None:
            generated_at = datetime.now().isoformat()
        
        # Convert insights to WellnessInsight objects
        insight_objects: List[WellnessInsight] = []
        if insights:
            for insight_data in insights:
                insight_objects.append(cls.create_wellness_insight(
                    category=insight_data.get('category', 'opportunity'),
                    title=insight_data.get('title', 'Insight'),
                    description=insight_data.get('description', ''),
                    priority=insight_data.get('priority', 'medium'),
                    actionable=insight_data.get('actionable', True),
                    related_traits=insight_data.get('related_traits', [])
                ))
        
        # Convert recommendations
        recommendation_objects: List[Union[TherapeuticRecommendation, GrowthRecommendation]] = []
        if recommendations:
            for rec_data in recommendations:
                if rec_data.get('type') == 'therapeutic':
                    recommendation_objects.append(cls.create_therapeutic_recommendation(
                        approach=rec_data.get('approach', 'integrative'),
                        rationale=rec_data.get('rationale', ''),
                        suitability_score=rec_data.get('suitability_score', 75.0),
                        focus_areas=rec_data.get('focus_areas', []),
                        techniques=rec_data.get('techniques', [])
                    ))
        
        # Validate assessment type
        valid_types = ['mbti', 'big_five', 'enneagram', 'temperament', 'cognitive', 'emotional']
        if assessment_type not in valid_types:
            assessment_type = 'cognitive'
        
        from typing import cast, Literal
        atype_lit = cast(Literal['mbti','big_five','enneagram','temperament','cognitive','emotional'], assessment_type)
        return PsychologyAssessmentResponse(
            success=True,
            user_id=user_id,
            assessment_type=atype_lit,
            results=results,
            insights=insight_objects,
            recommendations=recommendation_objects,
            processing_time_ms=processing_time_ms,
            generated_at=generated_at
        )
    
    @classmethod
    def create_psychology_profile_response(
        cls,
        profile_data: Dict[str, Any],
        summary: Dict[str, Any],
        insights: Optional[List[Dict[str, Any]]] = None,
        recommendations: Optional[List[Dict[str, Any]]] = None,
        processing_time_ms: float = 0.0,
        generated_at: Optional[str] = None
    ) -> PsychologyProfileResponse:
        """Create properly typed PsychologyProfileResponse"""
        if generated_at is None:
            generated_at = datetime.now().isoformat()
        
        # Create psychology profile from data
        profile = PsychologyProfile(
            user_id=profile_data.get('user_id', ''),
            assessment_date=datetime.fromisoformat(
                profile_data.get('assessment_date', datetime.now().isoformat())
            ),
            assessment_completeness=profile_data.get('assessment_completeness', 0.0),
            reliability_score=profile_data.get('reliability_score', 0.0)
        )
        
        # Convert insights and recommendations (reuse from assessment response)
        insight_objects: List[WellnessInsight] = []
        if insights:
            for insight_data in insights:
                insight_objects.append(cls.create_wellness_insight(
                    category=insight_data.get('category', 'opportunity'),
                    title=insight_data.get('title', 'Insight'),
                    description=insight_data.get('description', ''),
                    priority=insight_data.get('priority', 'medium'),
                    actionable=insight_data.get('actionable', True),
                    related_traits=insight_data.get('related_traits', [])
                ))
        
        recommendation_objects: List[Union[TherapeuticRecommendation, GrowthRecommendation]] = []
        if recommendations:
            for rec_data in recommendations:
                recommendation_objects.append(cls.create_therapeutic_recommendation(
                    approach=rec_data.get('approach', 'integrative'),
                    rationale=rec_data.get('rationale', ''),
                    suitability_score=rec_data.get('suitability_score', 75.0),
                    focus_areas=rec_data.get('focus_areas', []),
                    techniques=rec_data.get('techniques', [])
                ))
        
        return PsychologyProfileResponse(
            success=True,
            profile=profile,
            summary=summary,
            insights=insight_objects,
            recommendations=recommendation_objects,
            compatibility_notes=profile_data.get('compatibility_notes'),
            processing_time_ms=processing_time_ms,
            generated_at=generated_at
        )
    
    @classmethod
    def create_psychology_health_check(
        cls,
        assessments_available: bool,
        models_loaded: List[str],
        timestamp: Optional[str] = None,
        last_assessment: Optional[str] = None,
        uptime_seconds: Optional[float] = None
    ) -> PsychologyHealthCheck:
        """Create properly typed PsychologyHealthCheck"""
        if timestamp is None:
            timestamp = datetime.now().isoformat()
        
        # Determine status based on availability
        if assessments_available and models_loaded:
            status = "healthy"
        elif assessments_available or models_loaded:
            status = "degraded"
        else:
            status = "unhealthy"
        # Map to literal union without unnecessary generic cast
        from typing import Literal
        status_literal: Literal['healthy','degraded','unhealthy']
        if status == 'healthy':
            status_literal = 'healthy'
        elif status == 'degraded':
            status_literal = 'degraded'
        else:
            status_literal = 'unhealthy'
        return PsychologyHealthCheck(
            service="psychology",
            status=status_literal,
            assessments_available=assessments_available,
            models_loaded=models_loaded,
            last_assessment=last_assessment,
            uptime_seconds=uptime_seconds,
            timestamp=timestamp
        )
    
    @classmethod
    def validate_mbti_type(cls, type_code: str) -> bool:
        """Validate MBTI type code"""
        return type_code.upper() in cls.VALID_MBTI_TYPES
    
    @classmethod
    def validate_enneagram_type(cls, type_num: int) -> bool:
        """Validate Enneagram type number"""
        return type_num in cls.ENNEAGRAM_TYPES
    
    @classmethod
    def validate_temperament(cls, temperament: str) -> bool:
        """Validate temperament"""
        return temperament.lower() in cls.TEMPERAMENTS
    
    @classmethod
    def normalize_trait_score(cls, score: float) -> float:
        """Normalize trait score to 0-100 range"""
        return max(0, min(100, score))
    
    @classmethod
    def get_personality_insights(cls, assessment_data: Dict[str, Any]) -> List[WellnessInsight]:
        """Generate personality insights from assessment data"""
        insights: List[WellnessInsight] = []
        
        # Example insight generation logic
        if 'mbti' in assessment_data:
            mbti_raw = assessment_data.get('mbti')
            if isinstance(mbti_raw, dict):
                mbti_dict: Dict[str, Any] = cast(Dict[str, Any], mbti_raw)
                type_val_obj: Any = mbti_dict.get('type_code')
                type_val: str = type_val_obj if isinstance(type_val_obj, str) else ''
                if type_val:
                    insights.append(cls.create_wellness_insight(
                        category='strength',
                        title=f'MBTI Type: {type_val}',
                        description='Your personality type indicates specific strengths and preferences.',
                        priority='medium',
                        related_traits=[type_val]
                    ))
        
        if 'big_five' in assessment_data:
            bf_raw = assessment_data.get('big_five')
            if isinstance(bf_raw, dict):
                bf_dict: Dict[str, Any] = cast(Dict[str, Any], bf_raw)
                for trait_key, score_val in bf_dict.items():
                    if isinstance(score_val, (int, float)) and score_val > 80:
                        insights.append(cls.create_wellness_insight(
                            category='strength',
                            title=f'High {trait_key.title()}',
                            description=f'You score highly on {trait_key}, which is a significant strength.',
                            priority='medium',
                            related_traits=[trait_key]
                        ))
        
        return insights
