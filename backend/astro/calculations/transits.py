# backend/astro/calculations/transits.py
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Any
import swisseph as swe  # type: ignore

logger = logging.getLogger(__name__)

def calculate_transits(birth_data: Dict[str, Any], start_date: str, end_date: str, 
                      orb: float = 2.0, include_retrogrades: bool = True) -> Dict[str, Any]:
    """Calculate planetary transits for a given time period"""
    try:
        # Parse dates
        start_dt = datetime.fromisoformat(start_date.replace('Z', '+00:00'))  # type: ignore
        end_dt = datetime.fromisoformat(end_date.replace('Z', '+00:00'))  # type: ignore
        
        # Get natal chart positions
        natal_positions = get_natal_positions(birth_data)  # type: ignore
        
        # Calculate transits
        transits = []  # type: ignore
        current_date = start_dt  # type: ignore
        
        while current_date <= end_dt:  # type: ignore
            daily_transits = calculate_daily_transits(  # type: ignore
                natal_positions, current_date, orb, include_retrogrades
            )
            if daily_transits:  # type: ignore
                transits.extend(daily_transits)  # type: ignore
            
            current_date += timedelta(days=1)  # type: ignore
        
        # Group and analyze transits
        analyzed_transits = analyze_transit_patterns(transits)  # type: ignore
        
        return {  # type: ignore
            "period": {  # type: ignore
                "start": start_date,  # type: ignore
                "end": end_date,  # type: ignore
                "duration_days": (end_dt - start_dt).days  # type: ignore
            },
            "natal_positions": natal_positions,  # type: ignore
            "transits": analyzed_transits,  # type: ignore
            "significant_periods": identify_significant_periods(analyzed_transits),  # type: ignore
            "summary": generate_transit_summary(analyzed_transits)  # type: ignore
        }
        
    except Exception as e:
        logger.error(f"Error calculating transits: {str(e)}", exc_info=True)
        raise ValueError(f"Transit calculation failed: {str(e)}")

def get_natal_positions(birth_data: Dict[str, Any]) -> Dict[str, float]:
    """Get natal planet positions"""
    try:
        # Convert birth data to Julian day
        birth_datetime = datetime.fromisoformat(birth_data['datetime'].replace('Z', '+00:00'))  # type: ignore
        jd = swe.julday(  # type: ignore
            birth_datetime.year,  # type: ignore
            birth_datetime.month,  # type: ignore
            birth_datetime.day,  # type: ignore
            birth_datetime.hour + birth_datetime.minute/60.0  # type: ignore
        )
        
        positions = {}  # type: ignore
        planets = [  # type: ignore
            (swe.SUN, 'sun'),  # type: ignore
            (swe.MOON, 'moon'),  # type: ignore
            (swe.MERCURY, 'mercury'),  # type: ignore
            (swe.VENUS, 'venus'),  # type: ignore
            (swe.MARS, 'mars'),  # type: ignore
            (swe.JUPITER, 'jupiter'),  # type: ignore
            (swe.SATURN, 'saturn'),  # type: ignore
            (swe.URANUS, 'uranus'),  # type: ignore
            (swe.NEPTUNE, 'neptune'),  # type: ignore
            (swe.PLUTO, 'pluto')  # type: ignore
        ]
        
        for planet_id, planet_name in planets:  # type: ignore
            position, _ = swe.calc_ut(jd, planet_id)  # type: ignore
            positions[planet_name] = position[0]  # type: ignore
        
        return positions  # type: ignore
        
    except Exception as e:
        logger.error(f"Error getting natal positions: {str(e)}")
        return {}  # type: ignore

def calculate_daily_transits(natal_positions: Dict[str, float], date: datetime, 
                           orb: float, include_retrogrades: bool) -> List[Dict[str, Any]]:
    """Calculate transits for a specific day"""
    try:
        jd = swe.julday(date.year, date.month, date.day, 12.0)  # Noon  # type: ignore
        
        transits = []  # type: ignore
        
        # Transit planets (excluding Moon for daily transits)
        transit_planets = [  # type: ignore
            (swe.SUN, 'sun'),  # type: ignore
            (swe.MERCURY, 'mercury'),  # type: ignore
            (swe.VENUS, 'venus'),  # type: ignore
            (swe.MARS, 'mars'),  # type: ignore
            (swe.JUPITER, 'jupiter'),  # type: ignore
            (swe.SATURN, 'saturn'),  # type: ignore
            (swe.URANUS, 'uranus'),  # type: ignore
            (swe.NEPTUNE, 'neptune'),  # type: ignore
            (swe.PLUTO, 'pluto')  # type: ignore
        ]
        
        # Calculate current positions
        current_positions = {}  # type: ignore
        for planet_id, planet_name in transit_planets:  # type: ignore
            position, speed = swe.calc_ut(jd, planet_id)  # type: ignore
            current_positions[planet_name] = {  # type: ignore
                'position': position[0],  # type: ignore
                'speed': speed[0],  # type: ignore
                'retrograde': speed[0] < 0  # type: ignore
            }
        
        # Check for aspects between transiting and natal planets
        aspect_types = {  # type: ignore
            0: 'conjunction',  # type: ignore
            60: 'sextile',  # type: ignore
            90: 'square',  # type: ignore
            120: 'trine',  # type: ignore
            180: 'opposition'  # type: ignore
        }
        
        for transit_planet, transit_data in current_positions.items():  # type: ignore
            if not include_retrogrades and transit_data['retrograde']:  # type: ignore
                continue
                
            for natal_planet, natal_position in natal_positions.items():  # type: ignore
                for aspect_angle, aspect_name in aspect_types.items():  # type: ignore
                    
                    # Calculate actual angle between planets
                    angle_diff = abs(transit_data['position'] - natal_position)  # type: ignore
                    if angle_diff > 180:  # type: ignore
                        angle_diff = 360 - angle_diff  # type: ignore
                    
                    # Check if within orb of aspect
                    orb_diff = abs(angle_diff - aspect_angle)  # type: ignore
                    if orb_diff <= orb:  # type: ignore
                        transits.append({  # type: ignore
                            'date': date.isoformat(),  # type: ignore
                            'transit_planet': transit_planet,  # type: ignore
                            'natal_planet': natal_planet,  # type: ignore
                            'aspect': aspect_name,  # type: ignore
                            'aspect_angle': aspect_angle,  # type: ignore
                            'actual_angle': angle_diff,  # type: ignore
                            'orb': orb_diff,  # type: ignore
                            'exactness': max(0, 100 - (orb_diff / orb * 100)),  # type: ignore
                            'transit_position': transit_data['position'],  # type: ignore
                            'natal_position': natal_position,  # type: ignore
                            'retrograde': transit_data['retrograde'],  # type: ignore
                            'speed': transit_data['speed'],  # type: ignore
                            'applying': is_applying_aspect(  # type: ignore
                                transit_data['position'],   # type: ignore
                                natal_position,   # type: ignore
                                aspect_angle,   # type: ignore
                                transit_data['speed']  # type: ignore
                            ),
                            'interpretation': get_transit_interpretation(  # type: ignore
                                transit_planet, natal_planet, aspect_name  # type: ignore
                            )
                        })
        
        return sorted(transits, key=lambda x: x['orb'])  # type: ignore
        
    except Exception as e:
        logger.error(f"Error calculating daily transits: {str(e)}")
        return []  # type: ignore

def is_applying_aspect(transit_pos: float, natal_pos: float, aspect_angle: float, speed: float) -> bool:
    """Determine if a transit is applying (getting closer) or separating"""
    try:
        # Calculate where the aspect will be exact
        target_pos = (natal_pos + aspect_angle) % 360  # type: ignore
        
        # Calculate how the transit position will change
        future_pos = (transit_pos + speed) % 360  # type: ignore
        
        # Check if future position is closer to target
        current_distance = min(  # type: ignore
            abs(transit_pos - target_pos),  # type: ignore
            360 - abs(transit_pos - target_pos)  # type: ignore
        )
        
        future_distance = min(  # type: ignore
            abs(future_pos - target_pos),  # type: ignore
            360 - abs(future_pos - target_pos)  # type: ignore
        )
        
        return future_distance < current_distance  # type: ignore
        
    except Exception:
        return True  # Default to applying

def get_transit_interpretation(transit_planet: str, natal_planet: str, aspect: str) -> str:
    """Get interpretation for transit aspect"""
    
    planet_meanings = {  # type: ignore
        'sun': 'identity, vitality, ego',
        'moon': 'emotions, instincts, habits',
        'mercury': 'communication, thinking, learning',
        'venus': 'love, beauty, values',
        'mars': 'action, energy, assertion',
        'jupiter': 'expansion, wisdom, opportunities',
        'saturn': 'discipline, responsibility, limitations',
        'uranus': 'innovation, rebellion, sudden changes',
        'neptune': 'dreams, illusions, spirituality',
        'pluto': 'transformation, power, deep change'
    }
    
    aspect_qualities = {  # type: ignore
        'conjunction': 'intense focus and new beginnings',
        'sextile': 'opportunities and harmonious flow',
        'square': 'challenges and dynamic tension',
        'trine': 'ease and natural talents',
        'opposition': 'awareness and balance needs'
    }
    
    transit_meaning = planet_meanings.get(transit_planet, transit_planet)  # type: ignore
    natal_meaning = planet_meanings.get(natal_planet, natal_planet)  # type: ignore
    aspect_quality = aspect_qualities.get(aspect, aspect)  # type: ignore
    base_interpretation = f"Transit {transit_planet.title()} {aspect} natal {natal_planet.title()}: "  # type: ignore
    
    # Specific interpretations for common transits
    transit_key = f"{transit_planet}_{aspect}_{natal_planet}"  # type: ignore
    
    specific_interpretations = {  # type: ignore
        'saturn_square_sun': 'A time of testing your authority and self-confidence. Face limitations with maturity.',
        'jupiter_trine_venus': 'Opportunities for love, pleasure, and financial gain flow naturally.',
        'uranus_opposition_moon': 'Emotional upheaval and the need for greater freedom in personal life.',
        'pluto_conjunct_mars': 'Intense transformation of your drive and energy. Use power wisely.',
        'neptune_square_mercury': 'Confusion in communication. Be careful of deception or unclear thinking.',
        'mars_conjunct_venus': 'Passionate energy in relationships and creative pursuits.',
        'saturn_trine_mercury': 'Structured thinking and serious communication bring lasting results.',
        'jupiter_square_jupiter': 'Expansion meets resistance. Avoid overconfidence and excess.',
        'uranus_sextile_sun': 'Innovative approaches to self-expression bring exciting opportunities.',
        'pluto_opposition_venus': 'Deep transformation in relationships and values. Release what no longer serves.'
    }
    
    if transit_key in specific_interpretations:  # type: ignore
        return base_interpretation + specific_interpretations[transit_key]  # type: ignore
    
    # Generic interpretation
    return f"{base_interpretation}The energy of {transit_meaning} creates {aspect_quality} with your {natal_meaning}."  # type: ignore

def analyze_transit_patterns(transits: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Analyze patterns in transits"""
    try:
        # Group by planet and aspect
        by_planet = {}  # type: ignore
        by_aspect = {}  # type: ignore
        by_date = {}  # type: ignore
        
        for transit in transits:  # type: ignore
            # Group by transit planet
            planet = transit['transit_planet']  # type: ignore
            if planet not in by_planet:  # type: ignore
                by_planet[planet] = []  # type: ignore
            by_planet[planet].append(transit)  # type: ignore
            
            # Group by aspect
            aspect = transit['aspect']  # type: ignore
            if aspect not in by_aspect:  # type: ignore
                by_aspect[aspect] = []  # type: ignore
            by_aspect[aspect].append(transit)  # type: ignore
            
            # Group by date
            date = transit['date'][:10]  # Just the date part  # type: ignore
            if date not in by_date:  # type: ignore
                by_date[date] = []  # type: ignore
            by_date[date].append(transit)  # type: ignore
        
        # Find most active periods
        most_active_days = sorted(  # type: ignore
            by_date.items(),  # type: ignore
            key=lambda x: len(x[1]),  # type: ignore
            reverse=True
        )[:10]  # type: ignore
        
        # Find strongest transits
        strongest_transits = sorted(  # type: ignore
            transits,
            key=lambda x: x['exactness'],  # type: ignore
            reverse=True
        )[:20]  # type: ignore
        
        return {  # type: ignore
            'by_planet': by_planet,  # type: ignore
            'by_aspect': by_aspect,  # type: ignore
            'by_date': by_date,  # type: ignore
            'most_active_days': [  # type: ignore
                {
                    'date': date,  # type: ignore
                    'transit_count': len(day_transits),  # type: ignore
                    'transits': day_transits  # type: ignore
                }
                for date, day_transits in most_active_days  # type: ignore
            ],
            'strongest_transits': strongest_transits,  # type: ignore
            'total_transits': len(transits)  # type: ignore
        }
        
    except Exception as e:
        logger.error(f"Error analyzing transit patterns: {str(e)}")
        return {'error': str(e)}  # type: ignore

def identify_significant_periods(analyzed_transits: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Identify periods of significant astrological activity"""
    try:
        significant_periods = []  # type: ignore
        
        # Find periods with multiple strong transits
        most_active = analyzed_transits.get('most_active_days', [])  # type: ignore
        
        for period in most_active[:5]:  # Top 5 most active days  # type: ignore
            if period['transit_count'] >= 3:  # At least 3 transits  # type: ignore
                strongest_in_period = sorted(  # type: ignore
                    period['transits'],  # type: ignore
                    key=lambda x: x['exactness'],  # type: ignore
                    reverse=True
                )[:3]  # type: ignore
                
                themes = []  # type: ignore
                for transit in strongest_in_period:  # type: ignore
                    if 'pluto' in transit['transit_planet'] or 'saturn' in transit['transit_planet']:  # type: ignore
                        themes.append('transformation')  # type: ignore
                    elif 'jupiter' in transit['transit_planet']:  # type: ignore
                        themes.append('expansion')  # type: ignore
                    elif 'mars' in transit['transit_planet']:  # type: ignore
                        themes.append('action')  # type: ignore
                    elif 'venus' in transit['transit_planet']:  # type: ignore
                        themes.append('relationships')  # type: ignore
                
                significant_periods.append({  # type: ignore
                    'date': period['date'],  # type: ignore
                    'activity_level': period['transit_count'],  # type: ignore
                    'primary_themes': list(set(themes)),  # type: ignore
                    'key_transits': strongest_in_period,  # type: ignore
                    'significance_score': calculate_period_significance(period['transits'])  # type: ignore
                })
        
        return sorted(significant_periods, key=lambda x: x['significance_score'], reverse=True)  # type: ignore
        
    except Exception as e:
        logger.error(f"Error identifying significant periods: {str(e)}")
        return []  # type: ignore

def calculate_period_significance(transits: List[Dict[str, Any]]) -> float:
    """Calculate significance score for a period"""
    try:
        score = 0  # type: ignore
        
        for transit in transits:  # type: ignore
            # Base score from exactness
            score += transit['exactness']  # type: ignore
            
            # Bonus for outer planet transits
            if transit['transit_planet'] in ['saturn', 'uranus', 'neptune', 'pluto']:  # type: ignore
                score += 20  # type: ignore
            
            # Bonus for hard aspects
            if transit['aspect'] in ['conjunction', 'square', 'opposition']:  # type: ignore
                score += 10  # type: ignore
            
            # Bonus for personal planet contacts
            if transit['natal_planet'] in ['sun', 'moon', 'mercury', 'venus', 'mars']:  # type: ignore
                score += 15  # type: ignore
        
        return score  # type: ignore
        
    except Exception:
        return 0  # type: ignore

def generate_transit_summary(analyzed_transits: Dict[str, Any]) -> Dict[str, Any]:
    """Generate summary of transit period"""
    try:
        strongest = analyzed_transits.get('strongest_transits', [])  # type: ignore
        by_planet = analyzed_transits.get('by_planet', {})  # type: ignore
        
        # Find most active planet
        most_active_planet = max(  # type: ignore
            by_planet.keys(),  # type: ignore
            key=lambda p: len(by_planet[p])  # type: ignore
        ) if by_planet else None  # type: ignore
        
        # Count aspect types
        aspect_counts = {}  # type: ignore
        for transit in strongest[:10]:  # type: ignore
            aspect = transit['aspect']  # type: ignore
            aspect_counts[aspect] = aspect_counts.get(aspect, 0) + 1  # type: ignore
        
        # Identify dominant themes
        themes = []  # type: ignore
        for transit in strongest[:5]:  # type: ignore
            planet = transit['transit_planet']  # type: ignore
            if planet in ['saturn', 'pluto']:  # type: ignore
                themes.append('Major life restructuring and transformation')  # type: ignore
            elif planet in ['jupiter']:  # type: ignore
                themes.append('Growth and expansion opportunities')  # type: ignore
            elif planet in ['uranus']:  # type: ignore
                themes.append('Innovation and sudden changes')  # type: ignore
            elif planet in ['neptune']:  # type: ignore
                themes.append('Spiritual development and intuition')  # type: ignore
            elif planet in ['mars']:  # type: ignore
                themes.append('Increased activity and assertiveness')  # type: ignore
        
        return {  # type: ignore
            'period_overview': f"Period contains {analyzed_transits.get('total_transits', 0)} significant transits",  # type: ignore
            'most_active_planet': most_active_planet,  # type: ignore
            'dominant_aspects': aspect_counts,  # type: ignore
            'key_themes': list(set(themes))[:3],  # type: ignore
            'overall_intensity': calculate_overall_intensity(strongest),  # type: ignore
            'recommendations': generate_recommendations(strongest[:5])  # type: ignore
        }
        
    except Exception as e:
        logger.error(f"Error generating transit summary: {str(e)}")
        return {'error': str(e)}  # type: ignore

def calculate_overall_intensity(strongest_transits: List[Dict[str, Any]]) -> str:
    """Calculate overall intensity of the period"""
    try:
        if not strongest_transits:  # type: ignore
            return "Low"  # type: ignore
        
        avg_exactness = sum(t['exactness'] for t in strongest_transits[:5]) / min(5, len(strongest_transits))  # type: ignore
        outer_planet_count = sum(1 for t in strongest_transits[:10]  # type: ignore
                               if t['transit_planet'] in ['saturn', 'uranus', 'neptune', 'pluto'])  # type: ignore
        
        if avg_exactness > 80 and outer_planet_count >= 3:  # type: ignore
            return "Very High"  # type: ignore
        elif avg_exactness > 60 and outer_planet_count >= 2:  # type: ignore
            return "High"  # type: ignore
        elif avg_exactness > 40:  # type: ignore
            return "Moderate"  # type: ignore
        else:
            return "Low"  # type: ignore
            
    except Exception:
        return "Unknown"  # type: ignore

def generate_recommendations(key_transits: List[Dict[str, Any]]) -> List[str]:
    """Generate recommendations based on key transits"""
    try:
        recommendations = []  # type: ignore
        
        for transit in key_transits:  # type: ignore
            planet = transit['transit_planet']  # type: ignore
            aspect = transit['aspect']  # type: ignore
            
            if planet == 'saturn':  # type: ignore
                if aspect in ['square', 'opposition']:  # type: ignore
                    recommendations.append("Focus on discipline and long-term planning")  # type: ignore
                else:
                    recommendations.append("Build solid foundations for the future")  # type: ignore
            elif planet == 'jupiter':  # type: ignore
                recommendations.append("Embrace opportunities for growth and learning")  # type: ignore
            elif planet == 'uranus':  # type: ignore
                recommendations.append("Be open to innovation and unexpected changes")  # type: ignore
            elif planet == 'neptune':  # type: ignore
                recommendations.append("Trust your intuition and creative inspiration")  # type: ignore
            elif planet == 'pluto':  # type: ignore
                recommendations.append("Embrace transformation and release what no longer serves")  # type: ignore
            elif planet == 'mars':  # type: ignore
                if aspect in ['square', 'opposition']:  # type: ignore
                    recommendations.append("Channel energy constructively, avoid conflicts")  # type: ignore
                else:
                    recommendations.append("Take initiative and pursue your goals actively")  # type: ignore
        
        return list(set(recommendations))[:5]  # Remove duplicates, limit to 5  # type: ignore
        
    except Exception:
        return ["Stay mindful of astrological influences and trust your inner guidance"]  # type: ignore

def calculate_lunar_transits(birth_data: Dict[str, Any], start_date: str, end_date: str) -> Dict[str, Any]:
    """Calculate Moon transits separately due to frequency"""
    try:
        start_dt = datetime.fromisoformat(start_date.replace('Z', '+00:00'))  # type: ignore
        end_dt = datetime.fromisoformat(end_date.replace('Z', '+00:00'))  # type: ignore
        
        natal_positions = get_natal_positions(birth_data)  # type: ignore
        moon_transits = []  # type: ignore
        current_date = start_dt  # type: ignore
        
        while current_date <= end_dt:  # type: ignore
            jd = swe.julday(current_date.year, current_date.month, current_date.day,   # type: ignore
                          current_date.hour + current_date.minute/60.0)  # type: ignore
            
            moon_pos, moon_speed = swe.calc_ut(jd, swe.MOON)  # type: ignore
            
            # Check aspects to natal planets
            for natal_planet, natal_position in natal_positions.items():  # type: ignore
                for aspect_angle, aspect_name in [(0, 'conjunction'), (90, 'square'),   # type: ignore
                                                (120, 'trine'), (180, 'opposition')]:  # type: ignore
                    angle_diff = abs(moon_pos[0] - natal_position)  # type: ignore
                    if angle_diff > 180:  # type: ignore
                        angle_diff = 360 - angle_diff  # type: ignore
                    
                    if abs(angle_diff - aspect_angle) <= 1.0:  # 1 degree orb for Moon  # type: ignore
                        moon_transits.append({  # type: ignore
                            'datetime': current_date.isoformat(),  # type: ignore
                            'aspect': aspect_name,  # type: ignore
                            'natal_planet': natal_planet,  # type: ignore
                            'moon_position': moon_pos[0],  # type: ignore
                            'interpretation': f"Moon {aspect_name} natal {natal_planet.title()}: Emotional focus on {natal_planet} themes"  # type: ignore
                        })
            
            current_date += timedelta(hours=2)  # Check every 2 hours for Moon  # type: ignore
        
        return {  # type: ignore
            'period': {'start': start_date, 'end': end_date},  # type: ignore
            'moon_transits': moon_transits,  # type: ignore
            'summary': f"Found {len(moon_transits)} significant Moon transits"  # type: ignore
        }
        
    except Exception as e:
        logger.error(f"Error calculating lunar transits: {str(e)}")
        return {'error': str(e)}  # type: ignore
