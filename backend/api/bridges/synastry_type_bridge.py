"""Minimal clean Synastry Type Bridge.

Implements only factories required by current synastry routers & tests.
Advanced helpers intentionally omitted until baseline passes.

DATA FLOWS:
The bridge supports 3 distinct data flows for maximum flexibility:

1. API Flow: Structured objects and explicit parameters
   - BirthData objects with full validation
   - Direct method calls with all parameters
   - Used by production API endpoints

2. Flat Config Flow: Dictionary-based configuration
   - Simplified date/time string formats ("2023-05-15", "14:30")
   - Key-value configuration dictionaries
   - Used by configuration files and batch processing

3. Mock Flow: Default/fallback values for testing
   - Generates sensible defaults when data is incomplete
   - Ensures system resilience with malformed inputs
   - Used by tests and error recovery
"""
from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, List, Optional, cast, Literal

from backend_types.astrology_systems import BirthData
from backend_types.synastry_systems import (
    SynastryAspect,
    CompatibilityScore,
    ElementalCompatibility,
    ModalityCompatibility,
    SynastryAnalysis,
    SynastryAnalysisSummary,
    SynastryAnalysisResponse,
    RelationshipMatch,
    PowerDynamic,
    CommunicationStyle,
    RelationshipMatchResponse,
    CompatibilityBreakdown,
    RelationshipTiming,
    RelationshipTransit,
    SynastryTimingResponse,
    SynastryComparisonResponse,
    CompatibilityCategory,
    SynastryAspectType,
    MatchQuality,
    AnalysisLevel,
)

# Type alias for category
CategoryType = Literal['harmonious', 'challenging', 'dynamic', 'neutral']

# Type alias for relationship phases  
RelationshipPhaseType = Literal['attraction', 'bonding', 'commitment', 'challenge', 'growth', 'transformation']


class SynastryTypeBridge:
    """Bridge for handling synastry data across 3 flows: API, flat config, and mocks."""
    
    VALID_ASPECT_TYPES = {
        'conjunction', 'opposition', 'trine', 'square', 'sextile',
        'quincunx', 'semisextile', 'semisquare', 'sesquiquadrate'
    }
    COMPATIBILITY_CATEGORIES = {
        'romantic', 'friendship', 'business', 'family', 'mentor', 'creative'
    }

    # --- Internal Typed Helpers -------------------------------------------------
    @staticmethod
    def _clamp(value: float, low: float, high: float) -> float:
        """Clamp a numeric value within inclusive [low, high] range.

        Using a dedicated helper (rather than ad-hoc lambdas) improves
        readability, enables reuse, and provides a single location for
        potential future instrumentation or logging.
        """
        if value < low:
            return low
        if value > high:
            return high
        return value

    @classmethod
    def _norm100(cls, value: float) -> float:
        """Normalize a value to the 0–100 range (alias of clamp for clarity)."""
        return cls._clamp(value, 0.0, 100.0)

    # --- Data Flow Handlers ---
    @classmethod
    def from_api_birth_data(cls, birth_data: BirthData) -> BirthData:
        """Flow 1: Handle structured API BirthData objects."""
        return birth_data

    @classmethod 
    def from_flat_config(cls, config_dict: Dict[str, Any]) -> BirthData:
        """Flow 2: Handle flat config dictionaries with date/time strings."""
        if 'date' not in config_dict or 'time' not in config_dict:
            return cls.from_mock_defaults()
            
        date_str = str(config_dict.get('date', '2000-01-01'))
        time_str = str(config_dict.get('time', '12:00'))
        
        try:
            year, month, day = (int(p) for p in date_str.split('-'))
        except Exception:
            return cls.from_mock_defaults()
        
        try:
            hour, minute = (int(p) for p in time_str.split(':'))
        except Exception:
            hour, minute = 12, 0
        
        return BirthData(
            year=year,
            month=month, 
            day=day,
            hour=hour,
            minute=minute,
            city=config_dict.get('city', 'unknown'),
            timezone=config_dict.get('timezone'),
            lat=config_dict.get('latitude', config_dict.get('lat')),
            lon=config_dict.get('longitude', config_dict.get('lon')),
        )

    @classmethod
    def from_mock_defaults(cls) -> BirthData:
        """Flow 3: Generate mock/default BirthData for testing and fallbacks."""
        now = datetime.now()
        return BirthData(
            year=now.year,
            month=now.month,
            day=now.day,
            hour=12,
            minute=0,
            city='unknown',
            timezone=None,
            lat=None,
            lon=None,
        )

    @classmethod
    def coerce_birth_data(cls, input_data: BirthData | Dict[str, Any]) -> BirthData:
        """Universal birth data coercion supporting all 3 data flows.
        
        Args:
            input_data: BirthData object, API dict, flat config dict, or any dict
        
        Returns:
            BirthData: Properly structured birth data
        
        Flows:
            1. API: BirthData objects or dicts with year/month/day/hour/minute
            2. Flat config: dicts with date/time strings 
            3. Mock: fallback defaults for missing/invalid data
        """
        # Flow 1: API - Already structured BirthData
        if isinstance(input_data, BirthData):
            return cls.from_api_birth_data(input_data)
        
        # At this point input_data must be a dict based on type annotation
        data: Dict[str, Any] = dict(input_data)
        
        # Flow 1: API - Canonical form with individual date/time fields  
        if all(k in data for k in ('year', 'month', 'day', 'hour', 'minute')):
            data.setdefault('city', 'unknown')
            # Support latitude/longitude aliases for API compatibility
            if 'lat' not in data and 'latitude' in data:
                data['lat'] = data['latitude']
            if 'lon' not in data and 'longitude' in data:
                data['lon'] = data['longitude']
            return BirthData(**data)
        
        # Flow 2: Flat config - Simplified date/time strings
        if 'date' in data and 'time' in data:
            return cls.from_flat_config(data)
        
        # Flow 3: Mock fallback for incomplete/malformed data
        return cls.from_mock_defaults()

    # --- Aspect Factory with 3 Data Flows ---
    @classmethod
    def create_synastry_aspect(
        cls,
        person1_planet: str,
        person2_planet: str,
        aspect_type: SynastryAspectType | str,
        orb: float,
        exactness: float,
        strength: float,
        harmony_score: float,
        interpretation: str,
        keywords: Optional[List[str]] = None,
        category: str = 'neutral',
    ) -> SynastryAspect:
        """Create synastry aspect with validation (API flow)."""
        if aspect_type not in cls.VALID_ASPECT_TYPES:
            aspect_type = 'conjunction'
        if category not in {'harmonious', 'challenging', 'dynamic', 'neutral'}:
            category = 'neutral'
        def clamp(v: float, lo: float, hi: float) -> float:
            return max(lo, min(hi, v))
        return SynastryAspect(
            person1_planet=person1_planet,
            person2_planet=person2_planet,
            aspect_type=cast(SynastryAspectType, aspect_type),
            orb=clamp(orb, 0, 10),
            exactness=clamp(exactness, 0, 100),
            strength=clamp(strength, 0, 100),
            harmony_score=clamp(harmony_score, -100, 100),
            interpretation=interpretation or 'Aspect interaction',
            keywords=keywords or [],
            category=cast(CategoryType, category),
        )

    @classmethod
    def create_aspect_from_dict(cls, aspect_dict: Dict[str, Any]) -> SynastryAspect:
        """Create synastry aspect from flat config dict (Flow 2)."""
        return cls.create_synastry_aspect(
            person1_planet=aspect_dict.get('person1_planet', 'sun'),
            person2_planet=aspect_dict.get('person2_planet', 'moon'),
            aspect_type=aspect_dict.get('aspect_type', 'conjunction'),
            orb=aspect_dict.get('orb', 0.0),
            exactness=aspect_dict.get('exactness', 100.0),
            strength=aspect_dict.get('strength', 100.0),
            harmony_score=aspect_dict.get('harmony_score', 50.0),
            interpretation=aspect_dict.get('interpretation', 'Aspect interaction'),
            keywords=aspect_dict.get('keywords', []),
            category=aspect_dict.get('category', 'neutral'),
        )

    @classmethod
    def create_mock_aspect(cls, planet1: str = 'sun', planet2: str = 'moon') -> SynastryAspect:
        """Create mock synastry aspect for testing (Flow 3)."""
        return cls.create_synastry_aspect(
            person1_planet=planet1,
            person2_planet=planet2,
            aspect_type='trine',
            orb=2.5,
            exactness=95.0,
            strength=85.0,
            harmony_score=75.0,
            interpretation=f'Harmonious {planet1}-{planet2} connection',
            keywords=['harmony', 'flow', 'natural'],
            category='harmonious',
        )

    # --- Compatibility Score ---
    @classmethod
    def create_compatibility_score(
        cls,
        overall: float,
        romantic: float,
        emotional: float,
        mental: float,
        physical: float,
        spiritual: float,
        communication: float,
        conflict_resolution: float,
    ) -> CompatibilityScore:
        return CompatibilityScore(
            overall_score=cls._norm100(overall),
            romantic_score=cls._norm100(romantic),
            emotional_score=cls._norm100(emotional),
            mental_score=cls._norm100(mental),
            physical_score=cls._norm100(physical),
            spiritual_score=cls._norm100(spiritual),
            communication_score=cls._norm100(communication),
            conflict_resolution_score=cls._norm100(conflict_resolution),
        )

    # --- Match Quality Helper ---
    @staticmethod
    def categorize_match_quality(score: float) -> MatchQuality:
        if score >= 85: return 'excellent'
        if score >= 75: return 'very_good'
        if score >= 65: return 'good'
        if score >= 50: return 'fair'
        return 'challenging'

    # --- Relationship Match ---
    @classmethod
    def create_relationship_match(
        cls,
        person1_id: str,
        person2_id: str,
        match_score: float,
        match_type: CompatibilityCategory | str,
        sun_compatibility: float,
        moon_compatibility: float,
        venus_mars_compatibility: float,
        mercury_compatibility: float,
        strengths: Optional[List[str]] = None,
        challenges: Optional[List[str]] = None,
        growth_potential: float = 75.0,
        psychological_compatibility: Optional[float] = None,
        recommended_type: str = 'romantic partnership',
    ) -> RelationshipMatch:
        if match_type not in cls.COMPATIBILITY_CATEGORIES:
            match_type = 'romantic'
        return RelationshipMatch(
            person1_id=person1_id,
            person2_id=person2_id,
            match_score=cls._norm100(match_score),
            match_type=cast(CompatibilityCategory, match_type),
            sun_sign_compatibility=cls._norm100(sun_compatibility),
            moon_sign_compatibility=cls._norm100(moon_compatibility),
            venus_mars_compatibility=cls._norm100(venus_mars_compatibility),
            mercury_compatibility=cls._norm100(mercury_compatibility),
            top_strengths=strengths or [],
            main_challenges=challenges or [],
            growth_potential=cls._norm100(growth_potential),
            psychological_compatibility=cls._norm100(psychological_compatibility) if psychological_compatibility is not None else None,
            recommended_relationship_type=recommended_type,
        )

    # --- Synastry Analysis Response ---
    @classmethod
    def create_synastry_analysis_response(
        cls,
        person1_birth_data: BirthData | Dict[str, Any],
        person2_birth_data: BirthData | Dict[str, Any],
        synastry_aspects: List[Dict[str, Any]],
        compatibility_scores: Dict[str, float],
        analysis_summary: Dict[str, Any] | SynastryAnalysisSummary,
        insights: Optional[List[str]] = None,
        recommendations: Optional[List[str]] = None,
        processing_time_ms: float = 0.0,
        generated_at: Optional[str] = None,
        analysis_level: AnalysisLevel | str = 'intermediate',
    ) -> SynastryAnalysisResponse:
        if generated_at is None:
            generated_at = datetime.now().isoformat()

        def _coerce(bd: BirthData | Dict[str, Any]) -> BirthData:
            """Coerce various birth data dict shapes into BirthData using 3 data flows."""
            return cls.coerce_birth_data(bd)

        b1 = _coerce(person1_birth_data)
        b2 = _coerce(person2_birth_data)

        aspect_objs: List[SynastryAspect] = [
            cls.create_aspect_from_dict(a) for a in synastry_aspects
        ]

        comp = cls.create_compatibility_score(
            overall=compatibility_scores.get('overall', 75.0),
            romantic=compatibility_scores.get('romantic', 75.0),
            emotional=compatibility_scores.get('emotional', 75.0),
            mental=compatibility_scores.get('mental', 75.0),
            physical=compatibility_scores.get('physical', 75.0),
            spiritual=compatibility_scores.get('spiritual', 75.0),
            communication=compatibility_scores.get('communication', 75.0),
            conflict_resolution=compatibility_scores.get('conflict_resolution', 75.0),
        )

        elemental = ElementalCompatibility(
            fire_fire=65, earth_earth=65, air_air=65, water_water=65,
            fire_earth=55, fire_air=75, fire_water=45,
            earth_air=45, earth_water=55, air_water=50,
            overall_elemental_harmony=60,
        )
        modality = ModalityCompatibility(
            cardinal_cardinal=65, fixed_fixed=65, mutable_mutable=65,
            cardinal_fixed=55, cardinal_mutable=60, fixed_mutable=55,
            overall_modal_harmony=60,
        )

        if isinstance(analysis_summary, dict):
            summary_obj = SynastryAnalysisSummary(
                strengths=analysis_summary.get('strengths', []),
                challenges=analysis_summary.get('challenges', []),
                advice=analysis_summary.get('advice', []),
                key_themes=analysis_summary.get('key_themes', []),
                overall_compatibility=max(0.0, min(1.0, analysis_summary.get('overall_compatibility', 0.75))),
            )
        else:
            summary_obj = analysis_summary

        if analysis_level not in {'basic', 'intermediate', 'advanced', 'professional'}:
            analysis_level = 'intermediate'

        analysis = SynastryAnalysis(
            person1_birth_data=b1,
            person2_birth_data=b2,
            analysis_date=datetime.now(),
            analysis_level=cast(AnalysisLevel, analysis_level),
            synastry_aspects=aspect_objs,
            house_overlays_1_to_2=[],
            house_overlays_2_to_1=[],
            compatibility_scores=comp,
            elemental_compatibility=elemental,
            modality_compatibility=modality,
            relationship_dynamics=[],
            power_dynamic=PowerDynamic(
                person1_power_score=50.0,
                person2_power_score=50.0,
                balance_score=80.0,
                dominant_areas_person1=['initiative'],
                dominant_areas_person2=['empathy'],
                collaborative_areas=['planning'],
            ),
            communication_style=CommunicationStyle(
                person1_style='direct',
                person2_style='intuitive',
                compatibility_score=75.0,
                potential_misunderstandings=['pace differences'],
                strengths=['clarity', 'insight'],
                improvement_suggestions=['active listening'],
            ),
            karmic_connections=[],
            soul_mate_indicators=[],
        )

        return SynastryAnalysisResponse(
            success=True,
            analysis=analysis,
            summary=summary_obj,
            insights=insights or [],
            recommendations=recommendations or [],
            processing_time_ms=processing_time_ms,
            generated_at=generated_at or datetime.now().isoformat(),
        )

    # --- Timing ---
    @classmethod
    def create_relationship_timing(
        cls,
        current_phase: str,
        next_phase: str,
        phase_start: Optional[datetime] = None,
        phase_peak: Optional[datetime] = None,
        phase_end: Optional[datetime] = None,
        transition_period: Optional[str] = None,
    ) -> RelationshipTiming:
        valid = {'attraction', 'bonding', 'commitment', 'challenge', 'growth', 'transformation'}
        if current_phase not in valid:
            current_phase = 'growth'
        if next_phase not in valid:
            next_phase = 'transformation'
        return RelationshipTiming(
            current_phase=cast(RelationshipPhaseType, current_phase),
            next_phase=cast(RelationshipPhaseType, next_phase),
            phase_start=phase_start,
            phase_peak=phase_peak,
            phase_end=phase_end,
            transition_period=transition_period,
        )

    @classmethod
    def create_relationship_transit(
        cls,
        transiting_planet: str,
        transit_type: str,
        start_date: datetime,
        peak_date: datetime,
        end_date: datetime,
        intensity: float,
        relationship_impact: str,
        advice: str,
    ) -> RelationshipTransit:
        return RelationshipTransit(
            transiting_planet=transiting_planet,
            transit_type=transit_type,
            start_date=start_date,
            peak_date=peak_date,
            end_date=end_date,
            intensity=max(0, min(100, intensity)),
            relationship_impact=relationship_impact,
            advice=advice,
        )

    @classmethod
    def create_synastry_timing_response(
        cls,
        timing: RelationshipTiming,
        significant_transits: Optional[List[RelationshipTransit]] = None,
        best_windows: Optional[List[str]] = None,
        challenging_periods: Optional[List[str]] = None,
        long_term_outlook: str = 'Positive trajectory',
        processing_time_ms: float = 0.0,
        generated_at: Optional[str] = None,
    ) -> SynastryTimingResponse:
        if generated_at is None:
            generated_at = datetime.now().isoformat()
        return SynastryTimingResponse(
            success=True,
            current_timing=timing,
            significant_transits=significant_transits or [],
            best_timing_windows=best_windows or [],
            challenging_periods=challenging_periods or [],
            long_term_outlook=long_term_outlook,
            processing_time_ms=processing_time_ms,
            generated_at=generated_at,
        )

    # --- Comparison ---
    @classmethod
    def create_synastry_comparison_response(
        cls,
        base_person_id: str,
        comparison_inputs: List[Dict[str, Any]],
        processing_time_ms: float = 0.0,
        generated_at: Optional[str] = None,
        insights: Optional[List[str]] = None,
    ) -> SynastryComparisonResponse:
        if generated_at is None:
            generated_at = datetime.now().isoformat()
        matches: List[RelationshipMatch] = []
        for data in comparison_inputs:
            matches.append(
                cls.create_relationship_match(
                    person1_id=data.get('person1_id', base_person_id),
                    person2_id=data.get('person2_id', 'UNKNOWN'),
                    match_score=data.get('match_score', 70.0),
                    match_type=data.get('match_type', 'romantic'),
                    sun_compatibility=data.get('sun_compatibility', 70.0),
                    moon_compatibility=data.get('moon_compatibility', 70.0),
                    venus_mars_compatibility=data.get('venus_mars_compatibility', 70.0),
                    mercury_compatibility=data.get('mercury_compatibility', 70.0),
                    strengths=data.get('strengths'),
                    challenges=data.get('challenges'),
                    growth_potential=data.get('growth_potential', 70.0),
                    psychological_compatibility=data.get('psychological_compatibility'),
                )
            )
        ranking = [m.person2_id for m in sorted(matches, key=lambda m: m.match_score, reverse=True)]
        return SynastryComparisonResponse(
            success=True,
            base_person_id=base_person_id,
            comparisons=matches,
            ranking=ranking,
            comparison_insights=insights or [],
            processing_time_ms=processing_time_ms,
            generated_at=generated_at,
        )

    # --- Relationship Match Response ---
    @classmethod
    def create_relationship_match_response(
        cls,
        person1_id: str,
        person2_id: str,
        match_score: float,
        match_type: CompatibilityCategory | str,
        astrological_factors: Dict[str, float],
        breakdown_data: Dict[str, Any],
        psychological_factors: Optional[Dict[str, float]] = None,
        processing_time_ms: float = 0.0,
        generated_at: Optional[str] = None,
    ) -> RelationshipMatchResponse:
        if generated_at is None:
            generated_at = datetime.now().isoformat()
        rel_match = cls.create_relationship_match(
            person1_id=person1_id,
            person2_id=person2_id,
            match_score=match_score,
            match_type=match_type,
            sun_compatibility=astrological_factors.get('sun_compatibility', 75.0),
            moon_compatibility=astrological_factors.get('moon_compatibility', 75.0),
            venus_mars_compatibility=astrological_factors.get('venus_mars_compatibility', 75.0),
            mercury_compatibility=astrological_factors.get('mercury_compatibility', 75.0),
            strengths=breakdown_data.get('areas_of_harmony', []),
            challenges=breakdown_data.get('growth_opportunities', []),
            growth_potential=breakdown_data.get('long_term_potential', 75.0),
            psychological_compatibility=(psychological_factors or {}).get('overall'),
        )
        breakdown = CompatibilityBreakdown(
            emotional_compatibility=breakdown_data.get('emotional_compatibility', 0.75),
            intellectual_compatibility=breakdown_data.get('intellectual_compatibility', 0.75),
            physical_compatibility=breakdown_data.get('physical_compatibility', 0.75),
            spiritual_compatibility=breakdown_data.get('spiritual_compatibility', 0.75),
            communication_score=breakdown_data.get('communication_score', 0.75),
            long_term_potential=breakdown_data.get('long_term_potential', 0.75),
            areas_of_harmony=breakdown_data.get('areas_of_harmony', []) or [],
            growth_opportunities=breakdown_data.get('growth_opportunities', []) or [],
        )
        quality = cls.categorize_match_quality(rel_match.match_score)
        return RelationshipMatchResponse(
            success=True,
            compatibility_score=rel_match.match_score,
            match_quality=quality,
            detailed_breakdown=breakdown,
            dominant_themes=rel_match.top_strengths,
            growth_opportunities=rel_match.main_challenges,
            processing_time_ms=processing_time_ms,
            generated_at=generated_at,
        )

    # --- Utility ---
    @classmethod
    def normalize_compatibility_score(cls, score: float) -> float:
        return max(0, min(100, score))

    @classmethod
    def calculate_overall_compatibility(cls, scores: Dict[str, float]) -> float:
        if not scores:
            return 50.0
        weights = {
            'romantic': 0.25,
            'emotional': 0.20,
            'mental': 0.15,
            'communication': 0.15,
            'physical': 0.10,
            'spiritual': 0.10,
            'conflict_resolution': 0.05,
        }
        total = 0.0
        wsum = 0.0
        for k, v in scores.items():
            if k in weights:
                w = weights[k]
                total += v * w
                wsum += w
        if wsum:
            return total / wsum
        return sum(scores.values()) / len(scores)
