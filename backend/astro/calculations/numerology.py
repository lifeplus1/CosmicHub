"""
Numerology calculations for life path, destiny, and personality numbers.
Includes Pythagorean, Chaldean, and Kabbalah numerology systems.
"""

from datetime import datetime
from typing import Dict, List, Optional, Any
import re

# Pythagorean number mapping (A=1, B=2, ... Z=26, reduced to 1-9)
PYTHAGOREAN = {
    'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5, 'F': 6, 'G': 7, 'H': 8, 'I': 9,
    'J': 1, 'K': 2, 'L': 3, 'M': 4, 'N': 5, 'O': 6, 'P': 7, 'Q': 8, 'R': 9,
    'S': 1, 'T': 2, 'U': 3, 'V': 4, 'W': 5, 'X': 6, 'Y': 7, 'Z': 8
}

# Chaldean number mapping (different from Pythagorean, no 9)
CHALDEAN = {
    'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5, 'F': 8, 'G': 3, 'H': 5, 'I': 1,
    'J': 1, 'K': 2, 'L': 3, 'M': 4, 'N': 5, 'O': 7, 'P': 8, 'Q': 1, 'R': 2,
    'S': 3, 'T': 4, 'U': 6, 'V': 6, 'W': 6, 'X': 5, 'Y': 1, 'Z': 7
}

def calculate_numerology(name: str, birth_date: datetime) -> Dict[str, Any]:
    """
    Calculate comprehensive numerology analysis.
    
    Args:
        name: Full name as string
        birth_date: Birth date as datetime object
        
    Returns:
        Dictionary containing all numerology calculations
    """
    calc = NumerologyCalculator()
    
    # Clean name for calculations
    clean_name = re.sub(r'[^a-zA-Z\s]', '', name.upper())
    
    result = {
        'core_numbers': {
            'life_path': calc.calculate_life_path(birth_date),
            'destiny': calc.calculate_destiny_number(clean_name),
            'soul_urge': calc.calculate_soul_urge(clean_name),
            'personality': calc.calculate_personality_number(clean_name),
            'birth_day': calc.calculate_birth_day_number(birth_date),
            'attitude': calc.calculate_attitude_number(birth_date),
            'power_name': calc.calculate_power_name_number(clean_name)
        },
        'karmic_numbers': calc.calculate_karmic_numbers(clean_name, birth_date),
        'personal_year': calc.calculate_personal_year(birth_date),
        'challenge_numbers': calc.calculate_challenge_numbers(birth_date),
        'pinnacle_numbers': calc.calculate_pinnacle_numbers(birth_date),
        'systems': {
            'pythagorean': calc.calculate_pythagorean_analysis(clean_name),
            'chaldean': calc.calculate_chaldean_analysis(clean_name)
        },
        'interpretation': calc.get_comprehensive_interpretation(clean_name, birth_date)
    }
    
    return result

class NumerologyCalculator:
    """Enhanced numerology calculator with multiple systems and interpretations."""
    
    def reduce_to_single_digit(self, number: int, keep_master: bool = True) -> int:
        """Reduce number to single digit, optionally keeping master numbers 11, 22, 33."""
        while number > 9:
            if keep_master and number in [11, 22, 33]:
                return number
            number = sum(int(digit) for digit in str(number))
        return number
    
    def calculate_life_path(self, birth_date: datetime) -> Dict[str, Any]:
        """Calculate life path number from birth date."""
        # Method 1: Add all digits
        date_str = birth_date.strftime('%m%d%Y')
        total = sum(int(digit) for digit in date_str)
        life_path = self.reduce_to_single_digit(total)
        
        # Method 2: Add month, day, year separately then combine
        month = self.reduce_to_single_digit(birth_date.month)
        day = self.reduce_to_single_digit(birth_date.day)
        year = self.reduce_to_single_digit(birth_date.year)
        alternative = self.reduce_to_single_digit(month + day + year)
        
        return {
            'number': life_path,
            'alternative_calculation': alternative,
            'components': {'month': month, 'day': day, 'year': year},
            'meaning': self.get_life_path_meaning(life_path)
        }
    
    def calculate_destiny_number(self, name: str) -> Dict[str, Any]:
        """Calculate destiny number from full name (Pythagorean)."""
        total = sum(PYTHAGOREAN.get(char, 0) for char in name if char.isalpha())
        destiny = self.reduce_to_single_digit(total)
        
        return {
            'number': destiny,
            'calculation_total': total,
            'meaning': self.get_destiny_meaning(destiny)
        }
    
    def calculate_soul_urge(self, name: str) -> Dict[str, Any]:
        """Calculate soul urge number from vowels in name."""
        vowels = 'AEIOU'
        vowel_total = sum(PYTHAGOREAN.get(char, 0) for char in name if char in vowels)
        soul_urge = self.reduce_to_single_digit(vowel_total)
        
        return {
            'number': soul_urge,
            'vowel_total': vowel_total,
            'vowels_used': [char for char in name if char in vowels],
            'meaning': self.get_soul_urge_meaning(soul_urge)
        }
    
    def calculate_personality_number(self, name: str) -> Dict[str, Any]:
        """Calculate personality number from consonants in name."""
        vowels = 'AEIOU'
        consonant_total = sum(PYTHAGOREAN.get(char, 0) for char in name if char.isalpha() and char not in vowels)
        personality = self.reduce_to_single_digit(consonant_total)
        
        return {
            'number': personality,
            'consonant_total': consonant_total,
            'consonants_used': [char for char in name if char.isalpha() and char not in vowels],
            'meaning': self.get_personality_meaning(personality)
        }
    
    def calculate_birth_day_number(self, birth_date: datetime) -> Dict[str, Any]:
        """Calculate birth day number (day of month)."""
        day = birth_date.day
        birth_day = self.reduce_to_single_digit(day)
        
        return {
            'number': birth_day,
            'day_of_month': day,
            'meaning': self.get_birth_day_meaning(birth_day)
        }
    
    def calculate_attitude_number(self, birth_date: datetime) -> Dict[str, Any]:
        """Calculate attitude number (month + day)."""
        total = birth_date.month + birth_date.day
        attitude = self.reduce_to_single_digit(total)
        
        return {
            'number': attitude,
            'calculation': f"{birth_date.month} + {birth_date.day} = {total}",
            'meaning': self.get_attitude_meaning(attitude)
        }
    
    def calculate_power_name_number(self, name: str) -> Dict[str, Any]:
        """Calculate power name number (first name + last name)."""
        names = name.split()
        if len(names) >= 2:
            first_name_total = sum(PYTHAGOREAN.get(char, 0) for char in names[0])
            last_name_total = sum(PYTHAGOREAN.get(char, 0) for char in names[-1])
            total = first_name_total + last_name_total
            power_name = self.reduce_to_single_digit(total)
            
            return {
                'number': power_name,
                'first_name_value': first_name_total,
                'last_name_value': last_name_total,
                'total': total,
                'meaning': self.get_power_name_meaning(power_name)
            }
        
        return {'number': 0, 'meaning': 'Requires first and last name'}
    
    def calculate_karmic_numbers(self, name: str, birth_date: datetime) -> Dict[str, Any]:
        """Calculate karmic debt and lesson numbers."""
        # Karmic debt numbers: 13, 14, 16, 19
        karmic_debts = []
        
        # Check life path for karmic debt
        life_path_total = sum(int(d) for d in birth_date.strftime('%m%d%Y'))
        if life_path_total in [13, 14, 16, 19]:
            karmic_debts.append(life_path_total)
        
        # Check destiny number for karmic debt
        destiny_total = sum(PYTHAGOREAN.get(char, 0) for char in name if char.isalpha())
        if destiny_total in [13, 14, 16, 19]:
            karmic_debts.append(destiny_total)
        
        # Calculate karmic lessons (missing numbers 1-9 in name)
        name_numbers = set()
        for char in name:
            if char.isalpha():
                name_numbers.add(PYTHAGOREAN.get(char, 0))
        
        karmic_lessons = [i for i in range(1, 10) if i not in name_numbers]
        
        return {
            'karmic_debts': karmic_debts,
            'karmic_lessons': karmic_lessons,
            'debt_meanings': [self.get_karmic_debt_meaning(debt) for debt in karmic_debts],
            'lesson_meanings': [self.get_karmic_lesson_meaning(lesson) for lesson in karmic_lessons]
        }
    
    def calculate_personal_year(self, birth_date: datetime, target_year: Optional[int] = None) -> Dict[str, Any]:
        """Calculate personal year number for current or target year."""
        if target_year is None:
            target_year = datetime.now().year
        
        month = birth_date.month
        day = birth_date.day
        total = month + day + target_year
        personal_year = self.reduce_to_single_digit(total)
        
        return {
            'number': personal_year,
            'year': target_year,
            'calculation': f"{month} + {day} + {target_year} = {total}",
            'meaning': self.get_personal_year_meaning(personal_year)
        }
    
    def calculate_challenge_numbers(self, birth_date: datetime) -> Dict[str, Any]:
        """Calculate the four challenge numbers."""
        month = self.reduce_to_single_digit(birth_date.month, keep_master=False)
        day = self.reduce_to_single_digit(birth_date.day, keep_master=False)
        year = self.reduce_to_single_digit(birth_date.year, keep_master=False)
        
        first_challenge = abs(month - day)
        second_challenge = abs(day - year)
        third_challenge = abs(first_challenge - second_challenge)
        fourth_challenge = abs(month - year)
        
        return {
            'first_challenge': {'number': first_challenge, 'period': 'Birth to ~28'},
            'second_challenge': {'number': second_challenge, 'period': '~28 to ~52'},
            'third_challenge': {'number': third_challenge, 'period': '~52 onwards'},
            'fourth_challenge': {'number': fourth_challenge, 'period': 'Lifetime'},
            'meanings': {
                'first': self.get_challenge_meaning(first_challenge),
                'second': self.get_challenge_meaning(second_challenge),
                'third': self.get_challenge_meaning(third_challenge),
                'fourth': self.get_challenge_meaning(fourth_challenge)
            }
        }
    
    def calculate_pinnacle_numbers(self, birth_date: datetime) -> Dict[str, Any]:
        """Calculate the four pinnacle numbers."""
        month = self.reduce_to_single_digit(birth_date.month, keep_master=False)
        day = self.reduce_to_single_digit(birth_date.day, keep_master=False)
        year = self.reduce_to_single_digit(birth_date.year, keep_master=False)
        
        first_pinnacle = self.reduce_to_single_digit(month + day)
        second_pinnacle = self.reduce_to_single_digit(day + year)
        third_pinnacle = self.reduce_to_single_digit(first_pinnacle + second_pinnacle)
        fourth_pinnacle = self.reduce_to_single_digit(month + year)
        
        return {
            'first_pinnacle': {'number': first_pinnacle, 'period': 'Birth to ~28'},
            'second_pinnacle': {'number': second_pinnacle, 'period': '~28 to ~37'},
            'third_pinnacle': {'number': third_pinnacle, 'period': '~37 to ~46'},
            'fourth_pinnacle': {'number': fourth_pinnacle, 'period': '~46 onwards'},
            'meanings': {
                'first': self.get_pinnacle_meaning(first_pinnacle),
                'second': self.get_pinnacle_meaning(second_pinnacle),
                'third': self.get_pinnacle_meaning(third_pinnacle),
                'fourth': self.get_pinnacle_meaning(fourth_pinnacle)
            }
        }
    
    def calculate_pythagorean_analysis(self, name: str) -> Dict[str, Any]:
        """Full Pythagorean numerology analysis."""
        letter_values = {}
        for char in name:
            if char.isalpha():
                value = PYTHAGOREAN.get(char, 0)
                if value not in letter_values:
                    letter_values[value] = []
                letter_values[value].append(char)
        
        return {
            'system': 'Pythagorean',
            'letter_values': letter_values,
            'total_value': sum(PYTHAGOREAN.get(char, 0) for char in name if char.isalpha()),
            'characteristics': self.get_pythagorean_characteristics(letter_values)
        }
    
    def calculate_chaldean_analysis(self, name: str) -> Dict[str, Any]:
        """Full Chaldean numerology analysis."""
        letter_values = {}
        for char in name:
            if char.isalpha():
                value = CHALDEAN.get(char, 0)
                if value not in letter_values:
                    letter_values[value] = []
                letter_values[value].append(char)
        
        total = sum(CHALDEAN.get(char, 0) for char in name if char.isalpha())
        chaldean_number = self.reduce_to_single_digit(total)
        
        return {
            'system': 'Chaldean',
            'letter_values': letter_values,
            'total_value': total,
            'chaldean_number': chaldean_number,
            'meaning': self.get_chaldean_meaning(chaldean_number)
        }
    
    def get_comprehensive_interpretation(self, name: str, birth_date: datetime) -> Dict[str, str]:
        """Generate comprehensive numerology interpretation."""
        life_path = self.calculate_life_path(birth_date)['number']
        destiny = self.calculate_destiny_number(name)['number']
        soul_urge = self.calculate_soul_urge(name)['number']
        
        return {
            'life_purpose': f"Your life path {life_path} combined with destiny {destiny} suggests a journey focused on {self.get_combined_purpose(life_path, destiny)}",
            'personality_overview': f"With soul urge {soul_urge} and destiny {destiny}, you are naturally drawn to {self.get_personality_overview(soul_urge, destiny)}",
            'current_focus': f"In your personal year {self.calculate_personal_year(birth_date)['number']}, focus on {self.get_current_year_focus(self.calculate_personal_year(birth_date)['number'])}",
            'spiritual_path': self.get_spiritual_path_guidance(life_path, soul_urge)
        }
    
    # Interpretation methods
    def get_life_path_meaning(self, number: int) -> str:
        meanings = {
            1: "Independent leader and pioneer with strong will and determination",
            2: "Cooperative peacemaker with sensitivity and diplomacy",
            3: "Creative communicator with artistic talents and optimism",
            4: "Practical builder with organization and reliability",
            5: "Freedom-loving adventurer with versatility and curiosity",
            6: "Nurturing caretaker with responsibility and healing abilities",
            7: "Spiritual seeker with analytical mind and intuition",
            8: "Ambitious achiever with material mastery and leadership",
            9: "Humanitarian server with wisdom and universal love",
            11: "Intuitive illuminator with spiritual insight and inspiration",
            22: "Master builder with practical vision and global impact",
            33: "Master teacher with unconditional love and healing"
        }
        return meanings.get(number, "Unique spiritual path requiring individual interpretation")
    
    def get_destiny_meaning(self, number: int) -> str:
        meanings = {
            1: "Destined to lead, innovate, and blaze new trails",
            2: "Destined to cooperate, mediate, and bring harmony",
            3: "Destined to create, communicate, and inspire joy",
            4: "Destined to build, organize, and create stability",
            5: "Destined to explore, experience, and promote freedom",
            6: "Destined to nurture, heal, and serve family/community",
            7: "Destined to seek truth, develop wisdom, and teach",
            8: "Destined to achieve material success and organize large undertakings",
            9: "Destined to serve humanity and complete important cycles"
        }
        return meanings.get(number, "Unique destiny requiring individual expression")
    
    def get_soul_urge_meaning(self, number: int) -> str:
        meanings = {
            1: "Deep desire for independence, leadership, and personal achievement",
            2: "Soul craves partnership, peace, and emotional connection",
            3: "Inner need for creative self-expression and joyful communication",
            4: "Soul seeks security, order, and practical accomplishment",
            5: "Deep desire for freedom, adventure, and varied experiences",
            6: "Soul needs to nurture, heal, and create harmonious relationships",
            7: "Inner drive for spiritual understanding and mystical knowledge",
            8: "Soul craves material success and recognition of achievements",
            9: "Deep desire to serve humanity and make a global impact"
        }
        return meanings.get(number, "Unique soul mission requiring personal discovery")
    
    def get_personality_meaning(self, number: int) -> str:
        meanings = {
            1: "Appears confident, independent, and leadership-oriented",
            2: "Appears gentle, cooperative, and diplomatic",
            3: "Appears charismatic, creative, and socially engaging",
            4: "Appears reliable, practical, and well-organized",
            5: "Appears dynamic, adventurous, and freedom-loving",
            6: "Appears caring, responsible, and family-oriented",
            7: "Appears mysterious, analytical, and spiritually inclined",
            8: "Appears ambitious, successful, and business-minded",
            9: "Appears wise, humanitarian, and globally conscious"
        }
        return meanings.get(number, "Unique personality expression")
    
    def get_birth_day_meaning(self, number: int) -> str:
        meanings = {
            1: "Natural leadership abilities and pioneering spirit",
            2: "Diplomatic skills and talent for cooperation",
            3: "Creative expression and communication gifts",
            4: "Practical organization and building abilities",
            5: "Versatility and love of change and travel",
            6: "Nurturing instincts and healing abilities",
            7: "Analytical mind and spiritual inclinations",
            8: "Business acumen and material achievement drive",
            9: "Humanitarian nature and wisdom beyond years"
        }
        return meanings.get(number, "Special birth day influence")
    
    def get_attitude_meaning(self, number: int) -> str:
        meanings = {
            1: "Projects confidence and leadership in first impressions",
            2: "Appears diplomatic and peace-loving to others",
            3: "Comes across as cheerful and creatively expressive",
            4: "Appears organized, reliable, and trustworthy",
            5: "Projects energy, freedom, and adventurous spirit",
            6: "Appears caring, responsible, and family-oriented",
            7: "Projects mystery, depth, and spiritual awareness",
            8: "Appears ambitious, successful, and authoritative",
            9: "Projects wisdom, compassion, and global awareness"
        }
        return meanings.get(number, "Unique attitude and first impression")
    
    def get_power_name_meaning(self, number: int) -> str:
        meanings = {
            1: "Power through leadership and individual achievement",
            2: "Power through cooperation and bringing people together",
            3: "Power through creativity and inspirational communication",
            4: "Power through practical skills and systematic building",
            5: "Power through adaptability and progressive thinking",
            6: "Power through nurturing and healing others",
            7: "Power through wisdom and spiritual understanding",
            8: "Power through business acumen and material mastery",
            9: "Power through humanitarian service and universal love"
        }
        return meanings.get(number, "Unique power expression through name")
    
    def get_karmic_debt_meaning(self, number: int) -> str:
        meanings = {
            13: "Need to learn discipline, hard work, and transformation through effort",
            14: "Need to learn moderation, freedom with responsibility, and avoiding excess",
            16: "Need to learn humility, spiritual development, and releasing ego",
            19: "Need to learn independence while helping others, avoiding selfishness"
        }
        return meanings.get(number, "No karmic debt indicated")
    
    def get_karmic_lesson_meaning(self, number: int) -> str:
        meanings = {
            1: "Learn self-reliance, leadership, and individual initiative",
            2: "Learn cooperation, diplomacy, and working with others",
            3: "Learn creative expression, communication, and optimism",
            4: "Learn discipline, organization, and practical application",
            5: "Learn freedom with responsibility and constructive change",
            6: "Learn nurturing, healing, and taking care of others",
            7: "Learn spiritual development, analysis, and inner wisdom",
            8: "Learn material mastery, business skills, and achievement",
            9: "Learn humanitarian service, wisdom, and letting go"
        }
        return meanings.get(number, "Lesson already mastered")
    
    def get_personal_year_meaning(self, number: int) -> str:
        meanings = {
            1: "New beginnings, leadership opportunities, and fresh starts",
            2: "Cooperation, patience, and developing relationships",
            3: "Creative expression, communication, and social expansion",
            4: "Hard work, building foundations, and practical focus",
            5: "Change, freedom, travel, and new experiences",
            6: "Responsibility, family, healing, and home focus",
            7: "Spiritual development, study, and inner reflection",
            8: "Material achievement, business success, and recognition",
            9: "Completion, humanitarian service, and preparing for new cycle"
        }
        return meanings.get(number, "Transitional year requiring individual guidance")
    
    def get_challenge_meaning(self, number: int) -> str:
        meanings = {
            0: "No specific challenge - maintain balance and avoid extremes",
            1: "Learn to be independent without being selfish or overly aggressive",
            2: "Learn to cooperate without losing your individual identity",
            3: "Learn to express creativity without scattering energy",
            4: "Learn to work systematically without becoming rigid",
            5: "Learn to embrace change without being irresponsible",
            6: "Learn to serve others without becoming a martyr",
            7: "Learn to develop spirituality without withdrawing from life",
            8: "Learn to achieve materially without losing spiritual values"
        }
        return meanings.get(number, "Unique challenge requiring individual understanding")
    
    def get_pinnacle_meaning(self, number: int) -> str:
        meanings = {
            1: "Time for leadership, independence, and new beginnings",
            2: "Time for cooperation, relationships, and patient development",
            3: "Time for creative expression, communication, and joy",
            4: "Time for hard work, building foundations, and practical achievements",
            5: "Time for change, freedom, travel, and varied experiences",
            6: "Time for responsibility, family, healing, and service",
            7: "Time for spiritual development, study, and inner growth",
            8: "Time for material achievement, business success, and recognition",
            9: "Time for humanitarian service, wisdom, and global awareness"
        }
        return meanings.get(number, "Unique pinnacle period")
    
    def get_chaldean_meaning(self, number: int) -> str:
        meanings = {
            1: "Chaldean 1: Leadership and independence with ancient wisdom",
            2: "Chaldean 2: Cooperation and sensitivity with mystical insight",
            3: "Chaldean 3: Creative expression with spiritual communication",
            4: "Chaldean 4: Practical mastery with ancient knowledge",
            5: "Chaldean 5: Freedom and adventure with esoteric understanding",
            6: "Chaldean 6: Nurturing and healing with cosmic love",
            7: "Chaldean 7: Spiritual mastery and mystical wisdom",
            8: "Chaldean 8: Material achievement with karmic balance"
        }
        return meanings.get(number, "Unique Chaldean interpretation")
    
    def get_pythagorean_characteristics(self, letter_values: Dict) -> List[str]:
        """Get personality characteristics based on Pythagorean letter analysis."""
        characteristics = []
        
        # Analyze dominant numbers
        for num, letters in letter_values.items():
            count = len(letters)
            if count >= 3:
                if num == 1:
                    characteristics.append("Strong leadership tendencies")
                elif num == 2:
                    characteristics.append("Highly cooperative nature")
                elif num == 3:
                    characteristics.append("Naturally creative and expressive")
                elif num == 4:
                    characteristics.append("Very practical and organized")
                elif num == 5:
                    characteristics.append("Freedom-loving and adventurous")
                elif num == 6:
                    characteristics.append("Naturally nurturing and responsible")
                elif num == 7:
                    characteristics.append("Deeply spiritual and analytical")
                elif num == 8:
                    characteristics.append("Business-minded and ambitious")
                elif num == 9:
                    characteristics.append("Humanitarian and globally conscious")
        
        return characteristics if characteristics else ["Balanced numerical expression"]
    
    def get_combined_purpose(self, life_path: int, destiny: int) -> str:
        """Get combined life purpose interpretation."""
        combinations = {
            (1, 1): "pioneering leadership and innovative breakthroughs",
            (1, 8): "entrepreneurial leadership with material achievement",
            (2, 6): "harmonious service and healing relationships",
            (3, 3): "joyful creative expression and artistic mastery",
            (7, 7): "spiritual teaching and mystical wisdom sharing",
            (8, 8): "major material achievements and business empire building",
            (9, 6): "humanitarian healing and global service"
        }
        
        return combinations.get((life_path, destiny), 
                               f"balancing personal growth (path {life_path}) with worldly expression (destiny {destiny})")
    
    def get_personality_overview(self, soul_urge: int, destiny: int) -> str:
        """Get personality overview based on soul urge and destiny."""
        if soul_urge == destiny:
            return f"authentic expression of your core nature - what you want and what you're meant to do are aligned"
        elif abs(soul_urge - destiny) <= 2:
            return f"harmonious blend of inner desires and outer expression"
        else:
            return f"learning to balance inner needs ({soul_urge}) with outer purpose ({destiny})"
    
    def get_current_year_focus(self, personal_year: int) -> str:
        """Get current year focus guidance."""
        focus_areas = {
            1: "initiating new projects and taking leadership roles",
            2: "building relationships and practicing patience",
            3: "creative projects and joyful self-expression",
            4: "laying foundations and working systematically",
            5: "embracing change and seeking new experiences",
            6: "family responsibilities and healing work",
            7: "spiritual development and inner reflection",
            8: "material goals and business achievements",
            9: "completing projects and preparing for new cycles"
        }
        return focus_areas.get(personal_year, "following your intuitive guidance")
    
    def get_spiritual_path_guidance(self, life_path: int, soul_urge: int) -> str:
        """Get spiritual path guidance."""
        if life_path == 7 or soul_urge == 7:
            return "Your spiritual path involves deep study, meditation, and sharing mystical wisdom with others."
        elif life_path == 9 or soul_urge == 9:
            return "Your spiritual path involves humanitarian service and developing universal love and compassion."
        elif life_path in [11, 22, 33] or soul_urge in [11, 22, 33]:
            return "You have a master number influence, indicating a spiritual mission of inspiration and service to humanity."
        else:
            return f"Your spiritual path involves integrating the lessons of {life_path} (life purpose) with {soul_urge} (soul desires) for balanced growth."
