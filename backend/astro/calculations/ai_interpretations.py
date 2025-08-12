# backend/astro/calculations/ai_interpretations.py
import logging
from typing import Dict, Any, List

logger = logging.getLogger(__name__)

# Enhanced interpretation templates and knowledge base
PLANET_ARCHETYPES = { # type: ignore
    'sun': {
        'essence': 'Core identity, vitality, ego, life purpose',
        'keywords': ['identity', 'vitality', 'ego', 'self-expression', 'leadership', 'creativity'],
        'houses': {
            1: 'Strong sense of self, natural leadership',
            5: 'Creative expression, playful identity',
            10: 'Public recognition, career focus',
            11: 'Group leadership, humanitarian ideals'
        }
    },
    'moon': {
        'essence': 'Emotions, instincts, subconscious, nurturing',
        'keywords': ['emotions', 'intuition', 'mother', 'security', 'habits', 'memory'],
        'houses': {
            4: 'Deep emotional roots, family connection',
            7: 'Emotional partnerships, public sensitivity',
            12: 'Psychic abilities, hidden emotions'
        }
    },
    'mercury': {
        'essence': 'Communication, thinking, learning, adaptability',
        'keywords': ['communication', 'thinking', 'learning', 'adaptability', 'curiosity'],
        'houses': {
            3: 'Natural communicator, sibling connections',
            9: 'Higher learning, philosophical communication',
            6: 'Practical communication, detail-oriented'
        }
    },
    'venus': {
        'essence': 'Love, beauty, values, relationships, harmony',
        'keywords': ['love', 'beauty', 'harmony', 'values', 'pleasure', 'relationships'],
        'houses': {
            2: 'Material beauty, financial values',
            7: 'Relationship harmony, partnership values',
            5: 'Romantic creativity, artistic pleasure'
        }
    },
    'mars': {
        'essence': 'Action, energy, assertion, passion, drive',
        'keywords': ['action', 'energy', 'assertion', 'courage', 'passion', 'competition'],
        'houses': {
            1: 'Direct action, assertive personality',
            8: 'Transformative action, hidden power',
            10: 'Career drive, public assertion'
        }
    },
    'jupiter': {
        'essence': 'Expansion, wisdom, optimism, growth, fortune',
        'keywords': ['expansion', 'wisdom', 'optimism', 'growth', 'fortune', 'philosophy'],
        'houses': {
            9: 'Natural philosopher, higher wisdom',
            2: 'Material expansion, generous values',
            11: 'Social expansion, optimistic ideals'
        }
    },
    'saturn': {
        'essence': 'Discipline, responsibility, limitations, structure',
        'keywords': ['discipline', 'responsibility', 'limitation', 'structure', 'authority'],
        'houses': {
            10: 'Career authority, public responsibility',
            4: 'Family responsibility, structural foundation',
            7: 'Serious partnerships, committed relationships'
        }
    },
    'uranus': {
        'essence': 'Innovation, rebellion, sudden change, freedom',
        'keywords': ['innovation', 'rebellion', 'freedom', 'uniqueness', 'revolution'],
        'houses': {
            1: 'Unique identity, revolutionary personality',
            11: 'Progressive ideals, group innovation',
            4: 'Unconventional home, family rebellion'
        }
    },
    'neptune': {
        'essence': 'Dreams, illusions, spirituality, compassion',
        'keywords': ['dreams', 'illusion', 'spirituality', 'compassion', 'creativity'],
        'houses': {
            12: 'Spiritual connection, psychic abilities',
            7: 'Idealistic relationships, compassionate partnerships',
            5: 'Creative inspiration, romantic illusions'
        }
    },
    'pluto': {
        'essence': 'Transformation, power, death/rebirth, intensity',
        'keywords': ['transformation', 'power', 'intensity', 'rebirth', 'psychology'],
        'houses': {
            8: 'Natural transformation, psychological depth',
            1: 'Powerful identity, transformative presence',
            10: 'Transformative career, powerful reputation'
        }
    }
}

SIGN_ENERGIES = {
    'aries': {
        'element': 'fire',
        'quality': 'cardinal',
        'archetype': 'The Pioneer',
        'essence': 'Initiative, courage, new beginnings',
        'shadow': 'Impulsiveness, selfishness, aggression'
    },
    'taurus': {
        'element': 'earth',
        'quality': 'fixed',
        'archetype': 'The Builder',
        'essence': 'Stability, persistence, sensuality',
        'shadow': 'Stubbornness, materialism, resistance to change'
    },
    'gemini': {
        'element': 'air',
        'quality': 'mutable',
        'archetype': 'The Communicator',
        'essence': 'Curiosity, adaptability, communication',
        'shadow': 'Superficiality, inconsistency, restlessness'
    },
    'cancer': {
        'element': 'water',
        'quality': 'cardinal',
        'archetype': 'The Nurturer',
        'essence': 'Emotional depth, nurturing, protection',
        'shadow': 'Moodiness, clinginess, over-sensitivity'
    },
    'leo': {
        'element': 'fire',
        'quality': 'fixed',
        'archetype': 'The King/Queen',
        'essence': 'Creativity, confidence, self-expression',
        'shadow': 'Arrogance, attention-seeking, pride'
    },
    'virgo': {
        'element': 'earth',
        'quality': 'mutable',
        'archetype': 'The Healer',
        'essence': 'Service, precision, improvement',
        'shadow': 'Perfectionism, criticism, worry'
    },
    'libra': {
        'element': 'air',
        'quality': 'cardinal',
        'archetype': 'The Diplomat',
        'essence': 'Balance, harmony, relationships',
        'shadow': 'Indecision, people-pleasing, superficiality'
    },
    'scorpio': {
        'element': 'water',
        'quality': 'fixed',
        'archetype': 'The Transformer',
        'essence': 'Intensity, depth, transformation',
        'shadow': 'Jealousy, manipulation, vindictiveness'
    },
    'sagittarius': {
        'element': 'fire',
        'quality': 'mutable',
        'archetype': 'The Philosopher',
        'essence': 'Exploration, wisdom, freedom',
        'shadow': 'Dogmatism, recklessness, over-promising'
    },
    'capricorn': {
        'element': 'earth',
        'quality': 'cardinal',
        'archetype': 'The Authority',
        'essence': 'Ambition, discipline, achievement',
        'shadow': 'Coldness, pessimism, status obsession'
    },
    'aquarius': {
        'element': 'air',
        'quality': 'fixed',
        'archetype': 'The Innovator',
        'essence': 'Independence, innovation, humanity',
        'shadow': 'Detachment, rebelliousness, eccentricity'
    },
    'pisces': {
        'element': 'water',
        'quality': 'mutable',
        'archetype': 'The Mystic',
        'essence': 'Compassion, intuition, spirituality',
        'shadow': 'Escapism, victimization, confusion'
    }
}

HOUSE_THEMES = {
    1: {'theme': 'Identity & Self', 'life_area': 'personality, appearance, first impressions'},
    2: {'theme': 'Values & Resources', 'life_area': 'money, possessions, self-worth'},
    3: {'theme': 'Communication & Learning', 'life_area': 'siblings, local environment, education'},
    4: {'theme': 'Home & Family', 'life_area': 'family, roots, emotional foundation'},
    5: {'theme': 'Creativity & Romance', 'life_area': 'children, creativity, love affairs'},
    6: {'theme': 'Service & Health', 'life_area': 'work, health, daily routines'},
    7: {'theme': 'Partnerships', 'life_area': 'marriage, business partnerships, open enemies'},
    8: {'theme': 'Transformation', 'life_area': 'shared resources, sexuality, death/rebirth'},
    9: {'theme': 'Higher Wisdom', 'life_area': 'philosophy, higher education, foreign travel'},
    10: {'theme': 'Career & Reputation', 'life_area': 'career, public image, authority'},
    11: {'theme': 'Hopes & Groups', 'life_area': 'friends, groups, hopes and wishes'},
    12: {'theme': 'Spirituality & Release', 'life_area': 'spirituality, hidden enemies, sacrifice'}
}

def generate_interpretation(chart_data: Dict[str, Any], interpretation_type: str = "advanced") -> Dict[str, Any]:
    """Generate AI-powered astrological interpretation (main entry point for WebSocket)"""
    try:
        if interpretation_type == "basic":
            return generate_basic_interpretation(chart_data)
        elif interpretation_type == "focused":
            return generate_focused_interpretation(chart_data)
        else:  # advanced or default
            return generate_advanced_interpretation(chart_data)
            
    except Exception as e:
        logger.error(f"Error generating {interpretation_type} interpretation: {str(e)}")
        return {'error': str(e)}

def generate_basic_interpretation(chart_data: Dict[str, Any]) -> Dict[str, Any]:
    """Generate basic interpretation focusing on Sun, Moon, Rising"""
    try:
        interpretation = {
            'core_identity': analyze_core_identity(chart_data),
            'basic_summary': generate_basic_summary(chart_data)
        }
        return interpretation
        
    except Exception as e:
        logger.error(f"Error generating basic interpretation: {str(e)}")
        return {'error': str(e)}

def generate_focused_interpretation(chart_data: Dict[str, Any]) -> Dict[str, Any]:
    """Generate focused interpretation on specific life areas"""
    try:
        interpretation = {
            'core_identity': analyze_core_identity(chart_data),
            'life_purpose': analyze_life_purpose(chart_data),
            'relationship_patterns': analyze_relationship_patterns(chart_data),
            'career_path': analyze_career_path(chart_data)
        }
        return interpretation
        
    except Exception as e:
        logger.error(f"Error generating focused interpretation: {str(e)}")
        return {'error': str(e)}

def generate_advanced_interpretation(chart_data: Dict[str, Any]) -> Dict[str, Any]:
    """Generate advanced AI-powered interpretations"""
    try:
        interpretation = {
            'core_identity': analyze_core_identity(chart_data),
            'life_purpose': analyze_life_purpose(chart_data),
            'relationship_patterns': analyze_relationship_patterns(chart_data),
            'career_path': analyze_career_path(chart_data),
            'growth_challenges': analyze_growth_challenges(chart_data),
            'spiritual_gifts': analyze_spiritual_gifts(chart_data),
            'current_life_phase': analyze_current_life_phase(chart_data),
            'integration_themes': analyze_integration_themes(chart_data)
        }
        
        return interpretation
        
    except Exception as e:
        logger.error(f"Error generating advanced interpretation: {str(e)}")
        return {'error': str(e)}

def analyze_core_identity(chart_data: Dict[str, Any]) -> Dict[str, Any]:
    """Analyze core identity from Sun, Moon, Rising"""
    try:
        planets = chart_data.get('planets', {})
        houses = chart_data.get('houses', [])
        
        sun_info = get_planet_info(planets.get('sun', {}))
        moon_info = get_planet_info(planets.get('moon', {}))
        
        # Find Rising sign (1st house cusp)
        rising_sign = get_sign_from_position(houses[0]['cusp']) if houses else None
        
        identity_analysis = { # type: ignore
            'sun_identity': {
                'sign': sun_info['sign'],
                'house': sun_info['house'],
                'description': f"Your core identity is expressed through {SIGN_ENERGIES.get(sun_info['sign'], {}).get('essence', '')}",
                'archetype': SIGN_ENERGIES.get(sun_info['sign'], {}).get('archetype', ''),
                'element': SIGN_ENERGIES.get(sun_info['sign'], {}).get('element', ''),
                'quality': SIGN_ENERGIES.get(sun_info['sign'], {}).get('quality', '')
            },
            'moon_nature': {
                'sign': moon_info['sign'],
                'house': moon_info['house'],
                'description': f"Your emotional nature seeks {SIGN_ENERGIES.get(moon_info['sign'], {}).get('essence', '')}",
                'needs': get_moon_needs(moon_info['sign'])
            },
            'rising_persona': {
                'sign': rising_sign,
                'description': f"You present to the world as {SIGN_ENERGIES.get(rising_sign, {}).get('archetype', '')}" if rising_sign else "Rising sign not available"
            },
            'integration_challenge': synthesize_big_three(sun_info['sign'], moon_info['sign'], rising_sign) # type: ignore
        }
        
        return identity_analysis # type: ignore
        
    except Exception as e:
        logger.error(f"Error analyzing core identity: {str(e)}")
        return {}

def analyze_life_purpose(chart_data: Dict[str, Any]) -> Dict[str, Any]:
    """Analyze life purpose from multiple chart factors"""
    try:
        planets = chart_data.get('planets', {})
        
        # North Node (if available)
        north_node = planets.get('north_node', {})
        
        # MC (Midheaven) - 10th house cusp
        houses = chart_data.get('houses', [])
        mc_sign = get_sign_from_position(houses[9]['cusp']) if len(houses) >= 10 else None
        
        # Sun sign and house
        sun_info = get_planet_info(planets.get('sun', {}))
        
        # Jupiter sign and house (expansion/growth area)
        jupiter_info = get_planet_info(planets.get('jupiter', {}))
        
        purpose_analysis = { # type: ignore
            'soul_purpose': {
                'north_node_sign': get_sign_from_position(north_node.get('position', 0)) if north_node else None,
                'growth_direction': get_north_node_purpose(get_sign_from_position(north_node.get('position', 0))) if north_node else "North Node not available"
            },
            'career_calling': {
                'mc_sign': mc_sign,
                'public_expression': get_mc_expression(mc_sign) if mc_sign else "MC not available"
            },
            'creative_purpose': {
                'sun_expression': f"Express your {sun_info['sign']} nature through {HOUSE_THEMES.get(sun_info['house'], {}).get('life_area', 'unknown area')}"
            },
            'expansion_path': {
                'jupiter_gifts': f"Growth through {SIGN_ENERGIES.get(jupiter_info['sign'], {}).get('essence', '')} in {HOUSE_THEMES.get(jupiter_info['house'], {}).get('theme', 'unknown area')}"
            },
            'life_mission': synthesize_life_purpose(sun_info, jupiter_info, mc_sign) # type: ignore
        }
        
        return purpose_analysis # type: ignore
        
    except Exception as e:
        logger.error(f"Error analyzing life purpose: {str(e)}")
        return {}

def analyze_relationship_patterns(chart_data: Dict[str, Any]) -> Dict[str, Any]:
    """Analyze relationship patterns from Venus, Mars, 7th house"""
    try:
        planets = chart_data.get('planets', {})
        houses = chart_data.get('houses', [])
        
        venus_info = get_planet_info(planets.get('venus', {}))
        mars_info = get_planet_info(planets.get('mars', {}))
        
        # 7th house cusp (partnerships)
        partnership_sign = get_sign_from_position(houses[6]['cusp']) if len(houses) >= 7 else None
        
        relationship_analysis = { # type: ignore
            'love_style': {
                'venus_sign': venus_info['sign'],
                'venus_house': venus_info['house'],
                'attraction_style': get_venus_style(venus_info['sign']),
                'love_needs': get_venus_needs(venus_info['sign'])
            },
            'passion_style': {
                'mars_sign': mars_info['sign'],
                'mars_house': mars_info['house'],
                'action_style': get_mars_style(mars_info['sign']),
                'desire_nature': get_mars_desires(mars_info['sign'])
            },
            'partnership_karma': {
                'seventh_house_sign': partnership_sign,
                'partner_qualities': get_partner_qualities(partnership_sign) if partnership_sign else "7th house not available",
                'relationship_lessons': get_relationship_lessons(partnership_sign) if partnership_sign else None
            },
            'compatibility_keys': generate_compatibility_insights(venus_info, mars_info, partnership_sign if partnership_sign is not None else "")
        }
        
        return relationship_analysis # type: ignore
        
    except Exception as e:
        logger.error(f"Error analyzing relationship patterns: {str(e)}")
        return {}

def analyze_career_path(chart_data: Dict[str, Any]) -> Dict[str, Any]:
    """Analyze career potential from multiple indicators"""
    try:
        planets = chart_data.get('planets', {})
        houses = chart_data.get('houses', [])
        
        # MC sign (career direction)
        mc_sign = get_sign_from_position(houses[9]['cusp']) if len(houses) >= 10 else None
        
        # Saturn (discipline/mastery area)
        saturn_info = get_planet_info(planets.get('saturn', {}))
        
        # Sun (identity expression)
        sun_info = get_planet_info(planets.get('sun', {}))
        
        # Any planets in 10th house
        tenth_house_planets = find_planets_in_house(planets, 10)
        
        career_analysis: Dict[str, Any] = {
            'career_direction': {
                'mc_sign': mc_sign,
                'natural_calling': 
                (mc_sign) if mc_sign else "MC not available"
            },
            'mastery_path': {
                'saturn_sign': saturn_info['sign'],
                'saturn_house': saturn_info['house'],
                'discipline_area': get_saturn_mastery(saturn_info['sign'], saturn_info['house'])
            },
            'leadership_style': {
                'sun_influence': f"Lead through {SIGN_ENERGIES.get(sun_info['sign'], {}).get('essence', '')} in {HOUSE_THEMES.get(sun_info['house'], {}).get('theme', 'unknown area')}"
            },
            'tenth_house_influence': {
                'planets_in_tenth': tenth_house_planets,
                'career_focus': get_tenth_house_focus(tenth_house_planets)
            },
            'success_formula': synthesize_career_potential(mc_sign, saturn_info, sun_info, tenth_house_planets)
        }
        
        return career_analysis
        
    except Exception as e:
        logger.error(f"Error analyzing career path: {str(e)}")
        return {}

def analyze_growth_challenges(chart_data: Dict[str, Any]) -> Dict[str, Any]:
    """Analyze growth challenges from Saturn, Chiron, difficult aspects"""
    try:
        planets = chart_data.get('planets', {})
        aspects = chart_data.get('aspects', [])
        
        saturn_info = get_planet_info(planets.get('saturn', {}))
        
        # Find challenging aspects (squares, oppositions)
        challenging_aspects = [
            aspect for aspect in aspects 
            if aspect.get('aspect') in ['square', 'opposition'] and aspect.get('orb', 10) <= 5
        ]
        
        # Sort by exactness
        challenging_aspects.sort(key=lambda x: x.get('orb', 10))
        
        growth_analysis = {
            'saturn_lessons': {
                'saturn_sign': saturn_info['sign'],
                'saturn_house': saturn_info['house'],
                'mastery_challenge': get_saturn_lessons(saturn_info['sign'], saturn_info['house']),
                'growth_timeline': get_saturn_timeline()
            },
            'key_challenges': analyze_challenging_aspects(challenging_aspects[:5]),
            'integration_work': {
                'primary_tension': identify_primary_tension(challenging_aspects),
                'resolution_path': get_resolution_strategies(challenging_aspects)
            },
            'empowerment_potential': {
                'hidden_strengths': identify_hidden_strengths(chart_data),
                'transformation_gifts': get_transformation_gifts(challenging_aspects)
            }
        }
        
        return growth_analysis
        
    except Exception as e:
        logger.error(f"Error analyzing growth challenges: {str(e)}")
        return {}

def analyze_spiritual_gifts(chart_data: Dict[str, Any]) -> Dict[str, Any]:
    """Analyze spiritual gifts from 12th house, Neptune, Pluto"""
    try:
        planets = chart_data.get('planets', {})
        houses = chart_data.get('houses', [])
        
        # 12th house analysis
        twelfth_house_sign = get_sign_from_position(houses[11]['cusp']) if len(houses) >= 12 else None
        twelfth_house_planets = find_planets_in_house(planets, 12)
        
        neptune_info = get_planet_info(planets.get('neptune', {}))
        pluto_info = get_planet_info(planets.get('pluto', {}))
        
        spiritual_analysis = {
            'psychic_abilities': {
                'twelfth_house_sign': twelfth_house_sign,
                'intuitive_gifts': get_psychic_gifts(twelfth_house_sign) if twelfth_house_sign else None,
                'spiritual_planets': twelfth_house_planets
            },
            'mystical_nature': {
                'neptune_sign': neptune_info['sign'],
                'neptune_house': neptune_info['house'],
                'spiritual_path': get_neptune_spirituality(neptune_info['sign'], neptune_info['house'])
            },
            'transformation_power': {
                'pluto_sign': pluto_info['sign'],
                'pluto_house': pluto_info['house'],
                'healing_gifts': get_pluto_healing(pluto_info['sign'], pluto_info['house'])
            },
            'service_mission': synthesize_spiritual_mission(twelfth_house_sign, neptune_info, pluto_info)
        }
        
        return spiritual_analysis
        
    except Exception as e:
        logger.error(f"Error analyzing spiritual gifts: {str(e)}")
        return {}

def analyze_current_life_phase(chart_data: Dict[str, Any]) -> Dict[str, Any]:
    """Analyze current life phase based on age and planetary cycles"""
    # This would require birth date calculation for current transits
    # For now, return a placeholder structure
    return {
        'life_phase': 'Phase analysis requires birth date',
        'current_focus': 'Enable transit calculations for detailed life phase analysis',
        'upcoming_themes': 'Available with premium transit features'
    }

def analyze_integration_themes(chart_data: Dict[str, Any]) -> Dict[str, Any]:
    """Synthesize overall integration themes"""
    try:
        planets = chart_data.get('planets', {})
        
        # Element balance
        element_count = count_elements(planets)
        
        # Quality balance
        quality_count = count_qualities(planets)
        
        # Most aspected planets
        aspects = chart_data.get('aspects', [])
        planet_aspect_count = count_planet_aspects(aspects)
        
        integration_analysis = {
            'elemental_balance': {
                'distribution': element_count,
                'dominant_element': max(element_count.keys(), key=lambda k: element_count[k]) if element_count else None,
                'missing_elements': [elem for elem, count in element_count.items() if count == 0],
                'integration_focus': get_elemental_integration(element_count)
            },
            'modal_balance': {
                'distribution': quality_count,
                'dominant_quality': max(quality_count.keys(), key=lambda k: quality_count[k]) if quality_count else None,
                'integration_need': get_modal_integration(quality_count)
            },
            'focal_planets': {
                'most_aspected': sorted(planet_aspect_count.items(), key=lambda x: x[1], reverse=True)[:3],
                'integration_priority': get_focal_planet_meaning(planet_aspect_count)
            },
            'overall_theme': synthesize_integration_theme(element_count, quality_count, planet_aspect_count)
        }
        
        return integration_analysis
        
    except Exception as e:
        logger.error(f"Error analyzing integration themes: {str(e)}")
        return {}

# Helper functions
def get_planet_info(planet_data: Dict[str, Any]) -> Dict[str, Any]:
    """Extract planet sign and house information"""
    if not planet_data or 'position' not in planet_data:
        return {'sign': None, 'house': None}
    
    position = planet_data['position']
    house = planet_data.get('house', None)
    sign = get_sign_from_position(position)
    
    return {'sign': sign, 'house': house}

def get_sign_from_position(position: float) -> str:
    """Convert ecliptic longitude to zodiac sign"""
    if position is None:
        return None
    
    signs = ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
             'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces']
    
    sign_index = int(position // 30)
    return signs[sign_index] if 0 <= sign_index < 12 else None

def get_moon_needs(sign: str) -> str:
    """Get emotional needs based on Moon sign"""
    moon_needs = {
        'aries': 'Independence, excitement, new experiences',
        'taurus': 'Security, comfort, sensual pleasures',
        'gemini': 'Mental stimulation, variety, communication',
        'cancer': 'Emotional security, nurturing, family connection',
        'leo': 'Recognition, creative expression, admiration',
        'virgo': 'Order, usefulness, practical service',
        'libra': 'Harmony, beauty, balanced relationships',
        'scorpio': 'Emotional depth, privacy, transformative experiences',
        'sagittarius': 'Freedom, adventure, philosophical growth',
        'capricorn': 'Achievement, respect, structured progress',
        'aquarius': 'Independence, social causes, intellectual freedom',
        'pisces': 'Compassion, spiritual connection, creative expression'
    }
    return moon_needs.get(sign, 'Unknown emotional needs')

def synthesize_big_three(sun_sign: str, moon_sign: str, rising_sign: str) -> str:
    """Synthesize Sun, Moon, Rising integration challenge"""
    if not all([sun_sign, moon_sign, rising_sign]):
        return "Complete birth time needed for full integration analysis"
    
    sun_element = SIGN_ENERGIES.get(sun_sign, {}).get('element', '')
    moon_element = SIGN_ENERGIES.get(moon_sign, {}).get('element', '')
    rising_element = SIGN_ENERGIES.get(rising_sign, {}).get('element', '')
    
    if sun_element == moon_element == rising_element:
        return f"Strong {sun_element} emphasis - integrate through balanced expression"
    else:
        return f"Balance {sun_element} identity, {moon_element} emotions, and {rising_element} presentation"

def count_elements(planets: Dict[str, Any]) -> Dict[str, int]:
    """Count planets by element"""
    element_count = {'fire': 0, 'earth': 0, 'air': 0, 'water': 0}
    
    for planet_data in planets.values():
        if 'position' in planet_data:
            sign = get_sign_from_position(planet_data['position'])
            if sign:
                element = SIGN_ENERGIES.get(sign, {}).get('element')
                if element:
                    element_count[element] += 1
    
    return element_count

def count_qualities(planets: Dict[str, Any]) -> Dict[str, int]:
    """Count planets by quality/modality"""
    quality_count = {'cardinal': 0, 'fixed': 0, 'mutable': 0}
    
    for planet_data in planets.values():
        if 'position' in planet_data:
            sign = get_sign_from_position(planet_data['position'])
            if sign:
                quality = SIGN_ENERGIES.get(sign, {}).get('quality')
                if quality:
                    quality_count[quality] += 1
    
    return quality_count

def count_planet_aspects(aspects: List[Dict[str, Any]]) -> Dict[str, int]:
    """Count aspects for each planet"""
    aspect_count = {}
    
    for aspect in aspects:
        point1 = aspect.get('point1')
        point2 = aspect.get('point2')
        
        if point1:
            aspect_count[point1] = aspect_count.get(point1, 0) + 1
        if point2:
            aspect_count[point2] = aspect_count.get(point2, 0) + 1
    
    return aspect_count

def find_planets_in_house(planets: Dict[str, Any], house_number: int) -> List[str]:
    """Find planets in a specific house"""
    planets_in_house = []
    
    for planet_name, planet_data in planets.items():
        if planet_data.get('house') == house_number:
            planets_in_house.append(planet_name)
    
    return planets_in_house

# Additional helper functions for specific interpretations
def get_venus_style(sign: str) -> str:
    """Get Venus love style by sign"""
    venus_styles = {
        'aries': 'Direct, passionate, spontaneous attraction',
        'taurus': 'Sensual, steady, material comfort in love',
        'gemini': 'Intellectual, playful, variety in relationships',
        'cancer': 'Nurturing, protective, emotional bonding',
        'leo': 'Dramatic, generous, romantic grand gestures',
        'virgo': 'Practical, helpful, perfecting through service',
        'libra': 'Harmonious, balanced, partnership-focused',
        'scorpio': 'Intense, transformative, deep emotional bonds',
        'sagittarius': 'Adventurous, philosophical, freedom-loving',
        'capricorn': 'Traditional, committed, status-conscious',
        'aquarius': 'Unconventional, friendship-based, humanitarian',
        'pisces': 'Compassionate, romantic, spiritually connected'
    }
    return venus_styles.get(sign, 'Venus style unknown')

def get_venus_needs(sign: str) -> str:
    """Get Venus love needs by sign"""
    venus_needs = {
        'aries': 'Excitement, independence, direct affection',
        'taurus': 'Security, sensuality, loyalty',
        'gemini': 'Mental stimulation, variety, playful communication',
        'cancer': 'Emotional safety, nurturing, caring bonds',
        'leo': 'Admiration, romance, creative expression',
        'virgo': 'Practical support, helpfulness, reliability',
        'libra': 'Harmony, partnership, beauty',
        'scorpio': 'Depth, intensity, transformative connection',
        'sagittarius': 'Freedom, adventure, shared beliefs',
        'capricorn': 'Commitment, stability, shared goals',
        'aquarius': 'Friendship, uniqueness, intellectual rapport',
        'pisces': 'Compassion, spiritual connection, empathy'
    }
    return venus_needs.get(sign, 'Venus needs unknown')

def get_mars_style(sign: str) -> str:
    """Get Mars action style by sign"""
    mars_styles = {
        'aries': 'Direct, impulsive, pioneering action',
        'taurus': 'Steady, determined, practical approach',
        'gemini': 'Quick, versatile, mental energy',
        'cancer': 'Protective, emotional, defensive action',
        'leo': 'Confident, creative, dramatic expression',
        'virgo': 'Precise, methodical, service-oriented',
        'libra': 'Diplomatic, balanced, partnership action',
        'scorpio': 'Intense, strategic, transformative power',
        'sagittarius': 'Enthusiastic, adventurous, goal-oriented',
        'capricorn': 'Disciplined, ambitious, systematic approach',
        'aquarius': 'Innovative, unconventional, group-focused',
        'pisces': 'Intuitive, compassionate, flowing action'
    }
    return mars_styles.get(sign, 'Mars style unknown')

def get_mars_desires(sign: str) -> str:
    """Get Mars desire nature by sign"""
    mars_desires = {
        'aries': 'Seeks excitement, conquest, and immediate results',
        'taurus': 'Desires stability, sensual pleasure, and loyalty',
        'gemini': 'Craves variety, stimulation, and intellectual engagement',
        'cancer': 'Wants emotional security, protection, and nurturing',
        'leo': 'Yearns for recognition, creative expression, and admiration',
        'virgo': 'Desires usefulness, improvement, and practical service',
        'libra': 'Seeks harmony, partnership, and fairness',
        'scorpio': 'Craves intensity, transformation, and deep connection',
        'sagittarius': 'Desires adventure, freedom, and exploration',
        'capricorn': 'Wants achievement, respect, and structured progress',
        'aquarius': 'Seeks innovation, independence, and group involvement',
        'pisces': 'Yearns for compassion, spiritual connection, and inspiration'
    }
    return mars_desires.get(sign, 'Mars desires unknown')

def get_saturn_lessons(sign: str, house: int) -> str:
    """Get Saturn mastery lessons"""
    base_lesson = f"Master {SIGN_ENERGIES.get(sign, {}).get('essence', 'unknown')} "
    house_area = HOUSE_THEMES.get(house, {}).get('life_area', 'unknown area')
    return f"{base_lesson}in {house_area}"

def get_saturn_timeline() -> str:
    """Get Saturn cycle timeline"""
    return "Major lessons at ages 29-30 (Saturn Return), 58-60 (Second Return)"

def generate_compatibility_insights(venus_info: Dict, mars_info: Dict, partnership_sign: str) -> List[str]:
    """Generate relationship compatibility insights"""
    insights = []
    
    venus_element = SIGN_ENERGIES.get(venus_info['sign'], {}).get('element')
    mars_element = SIGN_ENERGIES.get(mars_info['sign'], {}).get('element')
    
    if venus_element:
        insights.append(f"Attracted to {venus_element} types")
    
    if mars_element:
        insights.append(f"Express passion through {mars_element} energy")
    
    if partnership_sign:
        partner_element = SIGN_ENERGIES.get(partnership_sign, {}).get('element')
        if partner_element:
            insights.append(f"Seek {partner_element} partners for balance")
    
    return insights

def synthesize_life_purpose(sun_info: Dict, jupiter_info: Dict, mc_sign: str) -> str:
    """Synthesize overall life purpose"""
    purpose_elements = []
    
    if sun_info['sign']:
        purpose_elements.append(f"Express {SIGN_ENERGIES.get(sun_info['sign'], {}).get('essence', '')}")
    
    if jupiter_info['sign']:
        purpose_elements.append(f"Expand through {SIGN_ENERGIES.get(jupiter_info['sign'], {}).get('essence', '')}")
    
    if mc_sign:
        purpose_elements.append(f"Achieve recognition for {SIGN_ENERGIES.get(mc_sign, {}).get('essence', '')}")
    
    return " | ".join(purpose_elements) if purpose_elements else "Detailed birth data needed for purpose analysis"

def get_north_node_purpose(sign: str) -> str:
    """Get North Node growth direction by sign"""
    north_node_purposes = {
        'aries': 'Develop independence, courage, and self-leadership',
        'taurus': 'Cultivate stability, self-worth, and material security',
        'gemini': 'Embrace curiosity, communication, and adaptability',
        'cancer': 'Nurture emotional connections, family, and intuition',
        'leo': 'Express creativity, confidence, and authentic selfhood',
        'virgo': 'Practice service, precision, and practical improvement',
        'libra': 'Seek harmony, partnership, and balanced relationships',
        'scorpio': 'Transform through depth, power, and psychological growth',
        'sagittarius': 'Explore wisdom, freedom, and philosophical truth',
        'capricorn': 'Achieve discipline, ambition, and responsible leadership',
        'aquarius': 'Innovate, collaborate, and serve humanity',
        'pisces': 'Surrender, trust intuition, and embrace spiritual growth'
    }
    return north_node_purposes.get(sign, 'North Node purpose unknown')

def get_mc_expression(mc_sign: str) -> str:
    """Get MC (Midheaven) public expression by sign"""
    if not mc_sign:
        return "MC sign not available"
    essence = SIGN_ENERGIES.get(mc_sign, {}).get('essence', '')
    archetype = SIGN_ENERGIES.get(mc_sign, {}).get('archetype', '')
    return f"Publicly expresses {essence} ({archetype})" if essence and archetype else "MC expression unknown"

def get_career_direction(mc_sign: str) -> str:
    """Get career direction based on MC sign"""
    if not mc_sign:
        return "MC sign not available"
    essence = SIGN_ENERGIES.get(mc_sign, {}).get('essence', '')
    archetype = SIGN_ENERGIES.get(mc_sign, {}).get('archetype', '')
    return f"Career direction: {essence} ({archetype})" if essence and archetype else "Career direction unknown"

def get_tenth_house_focus(planets_in_tenth: List[str]) -> str:
    """Interpret career focus based on planets in the 10th house"""
    if not planets_in_tenth:
        return "No major planets in 10th house; career focus is flexible or depends on other factors."
    focus_descriptions = []
    for planet in planets_in_tenth:
        archetype = PLANET_ARCHETYPES.get(planet, {}).get('essence', planet.capitalize())
        focus_descriptions.append(f"{planet.capitalize()}: {archetype}")
    return "Career focus influenced by: " + ", ".join(focus_descriptions)

def generate_basic_summary(chart_data: Dict[str, Any]) -> Dict[str, Any]:
    """Generate a basic personality summary"""
    try:
        planets = chart_data.get('planets', {})
        
        sun_info = get_planet_info(planets.get('sun', {}))
        moon_info = get_planet_info(planets.get('moon', {}))
        houses = chart_data.get('houses', [])
        rising_sign = get_sign_from_position(houses[0]['cusp']) if houses else None
        
        summary = {
            'personality_overview': f"You are a {sun_info['sign']} with {moon_info['sign']} Moon, presenting as {rising_sign or 'Unknown'} Rising",
            'key_traits': [
                f"Core identity: {SIGN_ENERGIES.get(sun_info['sign'], {}).get('essence', 'Unknown')}",
                f"Emotional nature: {SIGN_ENERGIES.get(moon_info['sign'], {}).get('essence', 'Unknown')}",
                f"Outer expression: {SIGN_ENERGIES.get(rising_sign, {}).get('essence', 'Unknown') if rising_sign else 'Unknown'}"
            ],
            'life_themes': [
                HOUSE_THEMES.get(sun_info['house'], {}).get('theme', 'Identity expression'),
                HOUSE_THEMES.get(moon_info['house'], {}).get('theme', 'Emotional foundation')
            ]
        }
        
        return summary
        
    except Exception as e:
        logger.error(f"Error generating basic summary: {str(e)}")
        return {'error': str(e)}

# Additional helper functions for complete interpretation system...
