# backend/astro/calculations/chinese.py
import logging
from datetime import datetime
from typing import Dict, List, Any, Tuple

logger = logging.getLogger(__name__)

# Chinese zodiac animals
CHINESE_ANIMALS = [
    "Rat", "Ox", "Tiger", "Rabbit", "Dragon", "Snake",
    "Horse", "Goat", "Monkey", "Rooster", "Dog", "Pig"
]

# Chinese elements
CHINESE_ELEMENTS = ["Wood", "Fire", "Earth", "Metal", "Water"]

# Chinese zodiac traits
ANIMAL_TRAITS = {
    "Rat": {"traits": "Intelligent, adaptable, quick-witted", "lucky_numbers": [2, 3], "element_years": "Yang Water"},
    "Ox": {"traits": "Reliable, patient, honest", "lucky_numbers": [1, 9], "element_years": "Yin Earth"},
    "Tiger": {"traits": "Brave, confident, competitive", "lucky_numbers": [1, 3, 4], "element_years": "Yang Wood"},
    "Rabbit": {"traits": "Gentle, quiet, elegant", "lucky_numbers": [3, 4, 6], "element_years": "Yin Wood"},
    "Dragon": {"traits": "Confident, intelligent, enthusiastic", "lucky_numbers": [1, 6, 7], "element_years": "Yang Earth"},
    "Snake": {"traits": "Wise, charming, intuitive", "lucky_numbers": [2, 8, 9], "element_years": "Yin Fire"},
    "Horse": {"traits": "Energetic, independent, cheerful", "lucky_numbers": [2, 3, 7], "element_years": "Yang Fire"},
    "Goat": {"traits": "Calm, gentle, sympathetic", "lucky_numbers": [3, 4, 9], "element_years": "Yin Earth"},
    "Monkey": {"traits": "Sharp, smart, curious", "lucky_numbers": [1, 7, 8], "element_years": "Yang Metal"},
    "Rooster": {"traits": "Observant, hardworking, courageous", "lucky_numbers": [5, 7, 8], "element_years": "Yin Metal"},
    "Dog": {"traits": "Loyal, honest, responsible", "lucky_numbers": [3, 4, 9], "element_years": "Yang Earth"},
    "Pig": {"traits": "Generous, compassionate, diligent", "lucky_numbers": [2, 5, 8], "element_years": "Yin Water"}
}

# Chinese hours (two-hour periods)
CHINESE_HOURS = [
    {"name": "Zi", "time": "23:00-01:00", "animal": "Rat", "element": "Water"},
    {"name": "Chou", "time": "01:00-03:00", "animal": "Ox", "element": "Earth"},
    {"name": "Yin", "time": "03:00-05:00", "animal": "Tiger", "element": "Wood"},
    {"name": "Mao", "time": "05:00-07:00", "animal": "Rabbit", "element": "Wood"},
    {"name": "Chen", "time": "07:00-09:00", "animal": "Dragon", "element": "Earth"},
    {"name": "Si", "time": "09:00-11:00", "animal": "Snake", "element": "Fire"},
    {"name": "Wu", "time": "11:00-13:00", "animal": "Horse", "element": "Fire"},
    {"name": "Wei", "time": "13:00-15:00", "animal": "Goat", "element": "Earth"},
    {"name": "Shen", "time": "15:00-17:00", "animal": "Monkey", "element": "Metal"},
    {"name": "You", "time": "17:00-19:00", "animal": "Rooster", "element": "Metal"},
    {"name": "Xu", "time": "19:00-21:00", "animal": "Dog", "element": "Earth"},
    {"name": "Hai", "time": "21:00-23:00", "animal": "Pig", "element": "Water"}
]

def get_chinese_year_animal(year: int) -> Tuple[str, str]:
    """Get Chinese zodiac animal and element for a given year"""
    # Chinese zodiac cycle starts from 1924 (Year of the Rat)
    base_year = 1924
    animal_index = (year - base_year) % 12
    
    # Five elements cycle (Wood, Fire, Earth, Metal, Water) with Yang/Yin alternating
    element_cycle = (year - base_year) % 10
    elements_yin_yang = [
        "Yang Wood", "Yin Wood", "Yang Fire", "Yin Fire", "Yang Earth",
        "Yin Earth", "Yang Metal", "Yin Metal", "Yang Water", "Yin Water"
    ]
    
    return CHINESE_ANIMALS[animal_index], elements_yin_yang[element_cycle]

def get_chinese_month_animal(month: int) -> str:
    """Get Chinese zodiac animal for birth month"""
    # Chinese months are traditionally associated with animals
    month_animals = [
        "Tiger", "Rabbit", "Dragon", "Snake", "Horse", "Goat",
        "Monkey", "Rooster", "Dog", "Pig", "Rat", "Ox"
    ]
    return month_animals[month - 1]

def get_chinese_day_animal(year: int, month: int, day: int) -> str:
    """Calculate Chinese zodiac animal for birth day"""
    # This is a simplified calculation - traditional method uses stem-branch calendar
    total_days = sum([
        (year - 1900) * 365,
        (year - 1900) // 4,  # Leap years approximation
        sum([31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][:month-1]),
        day
    ])
    
    if month > 2 and year % 4 == 0:  # Leap year adjustment
        total_days += 1
    
    return CHINESE_ANIMALS[total_days % 12]

def get_chinese_hour_animal(hour: int) -> Dict[str, str]:
    """Get Chinese hour animal and details"""
    hour_index = hour // 2
    if hour == 23:  # 23:00 belongs to next day's first period
        hour_index = 0
    
    return CHINESE_HOURS[hour_index]

def calculate_chinese_elements_compatibility(animal1: str, animal2: str) -> Dict[str, Any]:
    """Calculate compatibility between two Chinese zodiac animals"""
    # Simplified compatibility matrix
    highly_compatible = {
        "Rat": ["Dragon", "Monkey"],
        "Ox": ["Snake", "Rooster"],
        "Tiger": ["Horse", "Dog"],
        "Rabbit": ["Goat", "Pig"],
        "Dragon": ["Rat", "Monkey"],
        "Snake": ["Ox", "Rooster"],
        "Horse": ["Tiger", "Dog"],
        "Goat": ["Rabbit", "Pig"],
        "Monkey": ["Rat", "Dragon"],
        "Rooster": ["Ox", "Snake"],
        "Dog": ["Tiger", "Horse"],
        "Pig": ["Rabbit", "Goat"]
    }
    
    incompatible = {
        "Rat": ["Horse"],
        "Ox": ["Goat"],
        "Tiger": ["Monkey"],
        "Rabbit": ["Rooster"],
        "Dragon": ["Dog"],
        "Snake": ["Pig"],
        "Horse": ["Rat"],
        "Goat": ["Ox"],
        "Monkey": ["Tiger"],
        "Rooster": ["Rabbit"],
        "Dog": ["Dragon"],
        "Pig": ["Snake"]
    }
    
    if animal2 in highly_compatible.get(animal1, []):
        return {"compatibility": "High", "description": "Excellent match with natural harmony"}
    elif animal2 in incompatible.get(animal1, []):
        return {"compatibility": "Low", "description": "Challenging combination requiring effort"}
    else:
        return {"compatibility": "Moderate", "description": "Good potential with understanding"}

def get_chinese_five_elements_analysis(year_element: str, birth_hour: int) -> Dict[str, Any]:
    """Analyze Five Elements (Wu Xing) interactions"""
    hour_element = CHINESE_HOURS[birth_hour // 2]["element"]
    
    # Five Elements cycle: Wood → Fire → Earth → Metal → Water → Wood
    element_cycle = ["Wood", "Fire", "Earth", "Metal", "Water"]
    
    # Extract base element (remove Yin/Yang)
    base_year_element = year_element.split()[-1]
    
    def get_element_relationship(elem1: str, elem2: str) -> str:
        try:
            idx1 = element_cycle.index(elem1)
            idx2 = element_cycle.index(elem2)
            
            if (idx1 + 1) % 5 == idx2:
                return "Generating"  # Element 1 generates Element 2
            elif (idx2 + 1) % 5 == idx1:
                return "Draining"   # Element 1 drains Element 2
            elif abs(idx1 - idx2) == 2 or abs(idx1 - idx2) == 3:
                return "Conflicting"  # Elements conflict
            else:
                return "Neutral"
        except ValueError:
            return "Unknown"
    
    relationship = get_element_relationship(base_year_element, hour_element)
    
    return {
        "year_element": year_element,
        "hour_element": hour_element,
        "relationship": relationship,
        "analysis": f"Your year element ({year_element}) has a {relationship.lower()} relationship with your hour element ({hour_element})"
    }

def calculate_chinese_astrology(year: int, month: int, day: int, hour: int) -> Dict[str, Any]:
    """Calculate complete Chinese astrology chart"""
    try:
        # Get all the animals and elements
        year_animal, year_element = get_chinese_year_animal(year)
        month_animal = get_chinese_month_animal(month)
        day_animal = get_chinese_day_animal(year, month, day)
        hour_data = get_chinese_hour_animal(hour)
        
        # Get traits and lucky numbers
        year_traits = ANIMAL_TRAITS.get(year_animal, {})
        
        # Five elements analysis
        elements_analysis = get_chinese_five_elements_analysis(year_element, hour)
        
        # Calculate some compatibility examples
        compatibility_examples = {}
        for animal in ["Rat", "Dragon", "Tiger"]:
            if animal != year_animal:
                compatibility_examples[animal] = calculate_chinese_elements_compatibility(year_animal, animal)
        
        return {
            "year": {
                "animal": year_animal,
                "element": year_element,
                "traits": year_traits.get("traits", ""),
                "lucky_numbers": year_traits.get("lucky_numbers", [])
            },
            "month": {
                "animal": month_animal,
                "significance": f"Month animal influences your public persona and career approach"
            },
            "day": {
                "animal": day_animal,
                "significance": f"Day animal influences your inner nature and private self"
            },
            "hour": {
                "animal": hour_data["animal"],
                "element": hour_data["element"],
                "time_period": hour_data["time"],
                "chinese_name": hour_data["name"],
                "significance": f"Hour animal influences your secret nature and hidden traits"
            },
            "elements_analysis": elements_analysis,
            "compatibility_examples": compatibility_examples,
            "four_pillars": f"{year_element} {year_animal}, {month_animal} Month, {day_animal} Day, {hour_data['animal']} Hour",
            "personality_summary": f"Primary nature: {year_animal} ({year_element}). You are {year_traits.get('traits', 'unique')}. Your inner self reflects {day_animal} qualities, while your social persona shows {month_animal} characteristics."
        }
        
    except Exception as e:
        logger.error(f"Error in Chinese astrology calculation: {str(e)}")
        return {
            "year": {"animal": "Unknown", "element": "Unknown"},
            "error": "Calculation failed"
        }
