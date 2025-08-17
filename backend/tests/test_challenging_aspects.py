from astro.calculations.ai_interpretations import analyze_challenging_aspects
from typing import List, Dict, Any


def test_analyze_challenging_aspects_classification_and_sort():
    aspects: List[Dict[str, Any]] = [
        {"aspect": "Square", "orb": 3.9, "point1": "Sun", "point2": "Mars"},  # moderate
        {"aspect": "Opposition", "orb": 1.2, "point1": "Moon", "point2": "Saturn"},  # high
        {"aspect": "Conjunction", "orb": 5.1, "point1": "Mercury", "point2": "Neptune"},  # mild (orb >4)
        {"aspect": "Trine", "orb": 2.0, "point1": "Venus", "point2": "Jupiter"},  # supportive, should be filtered out
        {"aspect": "Quincunx", "orb": 2.4, "point1": "Sun", "point2": "Pluto"},  # moderate
        {"type": "Square", "orb": 0.8, "point1": "Mars", "point2": "Saturn"},  # high, alt key 'type'
    ]

    classified = analyze_challenging_aspects(aspects)

    # Should filter out the Trine (supportive aspect)
    aspect_types = {c.get('aspect') or c.get('type') for c in classified}
    assert 'Trine' not in aspect_types

    # Sort order: ascending orb -> first should be the 0.8 orb entry
    assert classified[0]['orb'] == 0.8
    assert classified[0]['severity'] == 'high'

    # Check severities mapping based on orb thresholds
    # high: <=2, moderate: <=4, mild: else
    severities = { (c.get('aspect') or c.get('type')): c['severity'] for c in classified }
    assert severities['Opposition'] == 'high'
    # Conjunction has orb 5.1 -> mild
    assert severities['Conjunction'] == 'mild'
    # Square with orb 3.9 -> moderate
    assert severities['Square'] in {'high', 'moderate'}  # two squares: one high (0.8) one moderate (3.9)

    # growth_focus keys present & non-empty
    for c in classified:
        assert c.get('growth_focus')
