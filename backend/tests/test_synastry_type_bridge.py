from datetime import datetime
from backend.api.bridges.synastry_type_bridge import SynastryTypeBridge
from backend.types.synastry_systems import (
    SynastryAnalysisResponse, RelationshipMatchResponse,
)


def test_create_synastry_aspect_coercion():
    aspect = SynastryTypeBridge.create_synastry_aspect(
        person1_planet="sun",
        person2_planet="moon",
        aspect_type="INVALID_TYPE",  # should coerce to conjunction
        orb=12.5,  # beyond max, expect clamp to 10
        exactness=150,  # beyond max, expect clamp to 100
        strength=150,
        harmony_score=150,  # beyond +100
        interpretation="Test interpretation",
        keywords=["bond"],
        category="unsupported"  # should coerce to neutral
    )
    assert aspect.aspect_type == 'conjunction'
    assert aspect.orb == 10
    assert aspect.exactness == 100
    assert aspect.strength == 100
    assert aspect.harmony_score == 100
    assert aspect.category == 'neutral'


def test_create_synastry_analysis_response_basic():
    resp = SynastryTypeBridge.create_synastry_analysis_response(
        person1_birth_data={
            "date": "1990-01-01",
            "time": "12:00",
            "timezone": "+00:00",
            "latitude": 0.0,
            "longitude": 0.0
        },
        person2_birth_data={
            "date": "1992-02-02",
            "time": "06:00",
            "timezone": "+00:00",
            "latitude": 10.0,
            "longitude": 10.0
        },
        synastry_aspects=[{
            "person1_planet": "sun",
            "person2_planet": "moon",
            "aspect_type": "trine",
            "orb": 2.0,
            "exactness": 90.0,
            "strength": 80.0,
            "harmony_score": 60.0,
            "interpretation": "Supportive energy",
            "keywords": ["support"],
            "category": "harmonious"
        }],
        compatibility_scores={
            "overall": 80.0,
            "romantic": 82.0,
            "emotional": 78.0,
            "mental": 75.0,
            "physical": 70.0,
            "spiritual": 85.0,
            "communication": 77.0,
            "conflict_resolution": 73.0
        },
        analysis_summary={
            "strengths": ["good communication"],
            "challenges": ["different routines"],
            "advice": ["practice patience"],
            "key_themes": ["growth"],
            "overall_compatibility": 0.8
        },
        insights=["Strong emotional bond"],
        recommendations=["Schedule quality time"],
        processing_time_ms=12.5
    )
    assert isinstance(resp, SynastryAnalysisResponse)
    assert resp.analysis.synastry_aspects[0].aspect_type == 'trine'
    assert resp.summary.overall_compatibility == 0.8
    assert resp.processing_time_ms == 12.5


def test_create_relationship_match_response_quality_mapping():
    breakdown: dict[str, float | list[str]] = {
        "emotional_compatibility": 0.80,
        "intellectual_compatibility": 0.78,
        "physical_compatibility": 0.76,
        "spiritual_compatibility": 0.82,
        "communication_score": 0.75,
        "long_term_potential": 0.79,
        "areas_of_harmony": ["values", "humor"],
        "growth_opportunities": ["conflict resolution"]
    }

    resp = SynastryTypeBridge.create_relationship_match_response(
        person1_id="P1",
        person2_id="P2",
        match_score=88.0,
        match_type="romantic",
        astrological_factors={
            "sun_compatibility": 85.0,
            "moon_compatibility": 83.0,
            "venus_mars_compatibility": 87.0,
            "mercury_compatibility": 80.0
        },
        breakdown_data=breakdown,
        psychological_factors={"overall": 70.0},
        processing_time_ms=10.0
    )

    assert isinstance(resp, RelationshipMatchResponse)
    assert resp.match_quality == 'excellent'
    assert resp.compatibility_score == 88.0
    assert set(resp.dominant_themes) == {"values", "humor"}
    assert resp.processing_time_ms == 10.0


def test_match_quality_tiers():
    # (score, expected_quality)
    cases = [
        (90, 'excellent'),
        (80, 'very_good'),
        (70, 'good'),
        (55, 'fair'),
        (40, 'challenging')
    ]
    for score, expected in cases:
        quality = SynastryTypeBridge.categorize_match_quality(score)
        assert quality == expected


def test_create_synastry_timing_response():
    timing = SynastryTypeBridge.create_relationship_timing(
        current_phase='bonding',
        next_phase='growth'
    )
    transit = SynastryTypeBridge.create_relationship_transit(
        transiting_planet='saturn',
        transit_type='square',
        start_date=datetime(2025, 1, 1),
        peak_date=datetime(2025, 1, 10),
        end_date=datetime(2025, 1, 20),
        intensity=120.0,  # should clamp to 100
        relationship_impact='Tests commitment',
        advice='Maintain patience'
    )
    resp = SynastryTypeBridge.create_synastry_timing_response(
        timing=timing,
        significant_transits=[transit],
        best_windows=['2025-02'],
        challenging_periods=['2025-01'],
        long_term_outlook='Stabilizing'
    )
    assert resp.current_timing.current_phase == 'bonding'
    assert resp.significant_transits[0].intensity == 100
    assert resp.long_term_outlook == 'Stabilizing'


def test_create_synastry_comparison_response():
    comparison_inputs: list[dict[str, float | str]] = [
        {
            'person1_id': 'A', 'person2_id': 'B', 'match_score': 82.0, 'match_type': 'romantic',
            'sun_compatibility': 80.0, 'moon_compatibility': 78.0,
            'venus_mars_compatibility': 85.0, 'mercury_compatibility': 79.0
        },
        {
            'person1_id': 'A', 'person2_id': 'C', 'match_score': 90.0, 'match_type': 'friendship',
            'sun_compatibility': 88.0, 'moon_compatibility': 86.0,
            'venus_mars_compatibility': 87.0, 'mercury_compatibility': 89.0
        }
    ]
    resp = SynastryTypeBridge.create_synastry_comparison_response(
        base_person_id='A',
        comparison_inputs=comparison_inputs,
        insights=['C shows strongest intellectual resonance']
    )
    assert len(resp.comparisons) == 2
    assert resp.ranking[0] == 'C'
    assert 'strongest intellectual' in resp.comparison_insights[0]
