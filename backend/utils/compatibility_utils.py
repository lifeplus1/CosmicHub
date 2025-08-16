# apps/backend/src/utils/compatibility_utils.py
from typing import Dict, List, Optional, Any, Tuple
from .aspect_utils import PLANETS, ORBS, AspectData, Matrix

ASPECT_SCORES: Dict[str, int] = {
    'conjunction': 4, 
    'trine': 3, 
    'sextile': 2, 
    'semi_sextile': 1,
    'square': -2, 
    'opposition': -3, 
    'quincunx': -1
}

PLANET_WEIGHTS: Dict[str, float] = {
    'sun': 3, 'moon': 3, 'venus': 3, 'mars': 3, 
    'mercury': 2, 'jupiter': 2, 
    'saturn': 1.5, 'uranus': 1, 'neptune': 1, 'pluto': 1
}

def calculate_compatibility_score(
    matrix: Matrix,
    overlays: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """Calculate overall compatibility score.

    Parameters:
        matrix: Read-only synastry aspect matrix (Matrix alias).
        overlays: Optional house overlay analysis structure.
    Returns:
        dict with overall_score, interpretation, and area breakdown (0-100 scaled).
    """
    if overlays is None:
        overlays = {}
    
    total = 0.0
    aspect_count = {'harmonious': 0, 'challenging': 0, 'neutral': 0}
    breakdown: Dict[str, float] = {}
    
    # Calculate aspect scores
    for i, row in enumerate(matrix):
        p1 = PLANETS[i] if i < len(PLANETS) else 'unknown'
        w1 = PLANET_WEIGHTS.get(p1, 1)
        
        for j, aspect in enumerate(row):
            if aspect:
                p2 = PLANETS[j] if j < len(PLANETS) else 'unknown'
                w2 = PLANET_WEIGHTS.get(p2, 1)
                base_score = ASPECT_SCORES.get(aspect['aspect'], 0)
                orb_factor = 1 - (aspect['orb'] / ORBS.get(aspect['aspect'], 10))
                
                weight_avg = (w1 + w2) / 2
                score_contribution = weight_avg * base_score * orb_factor
                total += score_contribution
                
                # Count aspect types
                aspect_count[aspect['type']] += 1
    
    # Add overlay bonuses
    overlay_bonus = 0
    if overlays:
        key_houses = [1, 4, 5, 7, 8, 10]
        for direction in ['p1_in_p2', 'p2_in_p1']:
            if direction in overlays:
                for planet, overlay in overlays[direction].items():
                    house = overlay.house if hasattr(overlay, 'house') else overlay.get('house', 0)
                    if house in key_houses and planet in ['venus', 'mars', 'moon']:
                        overlay_bonus += 5
    
    total += overlay_bonus
    
    # Calculate breakdown scores
    breakdown = {
        'emotional': calculate_area_score(matrix, ['sun', 'moon']),
        'communication': calculate_area_score(matrix, ['mercury', 'venus']),
        'physical': calculate_area_score(matrix, ['mars', 'venus']),
        'spiritual': calculate_area_score(matrix, ['jupiter', 'neptune', 'pluto']),
        'stability': calculate_area_score(matrix, ['saturn', 'jupiter'])
    }
    
    # Normalize to 0-100 scale
    max_possible_score = len(PLANETS) * len(PLANETS) * 4  # Rough maximum
    normalized = max(0, min(100, ((total + (max_possible_score / 4)) / (max_possible_score / 2)) * 100))
    
    return {
        'overall_score': round(normalized, 1),
        'interpretation': get_compatibility_interpretation(normalized, aspect_count),
        'breakdown': {k: max(0, min(100, v + 50)) for k, v in breakdown.items()}
    }

def calculate_area_score(matrix: Matrix, focus_planets: List[str]) -> float:
    """Calculate average score for a thematic area.

    Thematic areas are defined by a subset of planets (focus_planets). Only
    aspects where both planets are in this subset contribute.
    """
    score = 0.0
    count = 0
    
    for i, row in enumerate(matrix):
        p1 = PLANETS[i] if i < len(PLANETS) else 'unknown'
        if p1 not in focus_planets:
            continue
            
        for j, aspect in enumerate(row):
            if aspect:
                p2 = PLANETS[j] if j < len(PLANETS) else 'unknown'
                if p2 in focus_planets:
                    base_score = ASPECT_SCORES.get(aspect['aspect'], 0)
                    orb_factor = 1 - (aspect['orb'] / ORBS.get(aspect['aspect'], 10))
                    score += base_score * orb_factor
                    count += 1
    
    return score / max(count, 1)  # Average score

def get_compatibility_interpretation(score: float, aspect_count: Dict[str, int]) -> str:
    """Generate interpretation based on compatibility score and aspect patterns."""
    if score >= 80:
        base = "Exceptional compatibility with deep harmony and mutual understanding."
    elif score >= 65:
        base = "Strong compatibility with good potential for lasting connection."
    elif score >= 50:
        base = "Moderate compatibility with both harmonious and challenging dynamics."
    elif score >= 35:
        base = "Some compatibility challenges requiring conscious effort and compromise."
    else:
        base = "Significant compatibility challenges that demand dedication and understanding."
    
    # Add context based on aspect patterns
    total_aspects = sum(aspect_count.values())
    if total_aspects > 0:
        harmonious_pct = (aspect_count['harmonious'] / total_aspects) * 100
        if harmonious_pct > 60:
            base += " The abundance of harmonious aspects suggests natural ease and flow."
        elif aspect_count['challenging'] > aspect_count['harmonious']:
            base += " The challenging aspects indicate areas for growth and transformation."
    
    return base

StrongAspect = Tuple[str, str, AspectData]

def generate_relationship_summary(
    matrix: Matrix,
    overlays: Optional[Dict[str, Any]] = None
) -> Dict[str, List[str]]:
    """Generate structured relationship summary.

    Returns buckets: key_themes, strengths, challenges, advice.
    Tight aspects (orb <= 2°) are scanned to infer themes.
    """
    if overlays is None:
        overlays = {}
        
    summary: Dict[str, List[str]] = {
        'key_themes': [],
        'strengths': [],
        'challenges': [],
        'advice': []
    }
    
    # Analyze key themes based on strongest aspects
    strong_aspects: List[StrongAspect] = []
    for i, row in enumerate(matrix):
        p1 = PLANETS[i] if i < len(PLANETS) else 'unknown'
        for j, aspect in enumerate(row):
            if aspect and aspect['orb'] <= 2.0:  # Tight orbs only
                p2 = PLANETS[j] if j < len(PLANETS) else 'unknown'
                strong_aspects.append((p1, p2, aspect))
    
    # Determine themes
    if any(a[2]['aspect'] in ['conjunction', 'trine'] and 
           set([a[0], a[1]]) & {'sun', 'moon'} for a in strong_aspects):
        summary['key_themes'].append('Soul Connection')
        summary['strengths'].append('Deep emotional understanding and natural harmony')
    
    if any(set([a[0], a[1]]) & {'venus', 'mars'} for a in strong_aspects):
        summary['key_themes'].append('Romantic Chemistry')
        summary['strengths'].append('Strong physical and romantic attraction')
    
    # Identify challenges
    challenging_aspects = [a for a in strong_aspects if a[2]['type'] == 'challenging']
    if challenging_aspects:
        summary['challenges'].append('Need to work through conflicting needs and desires')
        summary['advice'].append('Practice open communication and compromise')
    
    # Add general advice
    summary['advice'].extend([
        'Focus on understanding each other\'s perspectives',
        'Use challenges as opportunities for growth',
        'Celebrate your natural harmonies and build on them'
    ])
    
    return summary
