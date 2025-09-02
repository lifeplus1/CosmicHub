# backend/astro/calculations/spiritual.py
import logging
from typing import Any, Dict, List, Optional, TypedDict
from datetime import datetime

logger = logging.getLogger(__name__)

# ===== TYPE DEFINITIONS =====

class TarotCardDict(TypedDict):
    number: int
    name: str
    hebrew_letter: str
    tree_path: int
    astrology: str
    numerology: int
    connects: str
    meaning: str
    keywords: List[str]

class SephirahDict(TypedDict):
    number: int
    name: str
    hebrew: str
    english: str
    astrology: str
    tarot_association: str
    element: str
    gematria: int
    meaning: str
    keywords: List[str]
    position: str

class MinorArcanaCardDict(TypedDict):
    number: int
    name: str
    sephirah: str
    meaning: str
    keywords: List[str]

class CourtCardDict(TypedDict):
    name: str
    sephirah: str
    element: str
    meaning: str
    keywords: List[str]

class TreePathDict(TypedDict):
    path: int
    connects: List[str]
    hebrew_letter: str
    major_arcana: str

class CorrespondenceDict(TypedDict, total=False):
    daily_focus: Dict[str, Any]
    life_purpose: Dict[str, Any]
    spiritual_center: Dict[str, Any]
    error: str

class PathWorkingDict(TypedDict, total=False):
    current_phase: str
    recommended_duration: str
    phases: List[Dict[str, Any]]
    primary_path: Dict[str, Any]
    error: str

class HermeticCorrespondenceDict(TypedDict, total=False):
    sephirah_hermetic: Dict[str, Any]
    error: str

class SpiritualSynthesisDict(TypedDict, total=False):
    primary_themes: List[str]
    spiritual_guidance: str
    integration_focus: str
    daily_practice: str
    tree_visualization: Dict[str, Any]
    path_working: PathWorkingDict
    hermetic_correspondences: HermeticCorrespondenceDict
    error: str

# ===== TAROT SYSTEM =====

# Major Arcana (22 cards, paths of Tree of Life)
MAJOR_ARCANA: List[TarotCardDict] = [
    {
        "number": 0,
        "name": "The Fool",
        "hebrew_letter": "Aleph (א)",
        "tree_path": 11,
        "astrology": "Air",
        "numerology": 1,
        "connects": "Kether→Chokmah",
        "meaning": "Divine breath, infinite potential, beginning of consciousness",
        "keywords": ["new beginnings", "spiritual awakening", "leap of faith", "innocence", "spontaneity"]
    },
    {
        "number": 1,
        "name": "The Magician",
        "hebrew_letter": "Beth (ב)",
        "tree_path": 12,
        "astrology": "Mercury",
        "numerology": 2,
        "connects": "Kether→Binah",
        "meaning": "Will to create, divine manifestation, communication",
        "keywords": ["personal power", "manifestation", "communication", "skill", "willpower"]
    },
    {
        "number": 2,
        "name": "The High Priestess",
        "hebrew_letter": "Gimel (ג)",
        "tree_path": 13,
        "astrology": "Moon",
        "numerology": 3,
        "connects": "Kether→Tiphareth",
        "meaning": "Intuitive wisdom, subconscious knowledge, lunar mysteries",
        "keywords": ["intuition", "hidden knowledge", "feminine wisdom", "mystery", "subconscious"]
    },
    {
        "number": 3,
        "name": "The Empress",
        "hebrew_letter": "Daleth (ד)",
        "tree_path": 14,
        "astrology": "Venus",
        "numerology": 4,
        "connects": "Chokmah→Binah",
        "meaning": "Divine feminine, creativity, abundance, nurturing",
        "keywords": ["creativity", "fertility", "nurturing", "material abundance", "nature"]
    },
    {
        "number": 4,
        "name": "The Emperor",
        "hebrew_letter": "Heh (ה)",
        "tree_path": 15,
        "astrology": "Aries",
        "numerology": 5,
        "connects": "Chokmah→Tiphareth",
        "meaning": "Divine authority, leadership, structure, masculine power",
        "keywords": ["leadership", "authority", "structure", "discipline", "control"]
    },
    {
        "number": 5,
        "name": "The Hierophant",
        "hebrew_letter": "Vav (ו)",
        "tree_path": 16,
        "astrology": "Taurus",
        "numerology": 6,
        "connects": "Chokmah→Chesed",
        "meaning": "Spiritual teaching, tradition, divine connection",
        "keywords": ["spiritual guidance", "tradition", "learning", "mentorship", "conformity"]
    },
    {
        "number": 6,
        "name": "The Lovers",
        "hebrew_letter": "Zayin (ז)",
        "tree_path": 17,
        "astrology": "Gemini",
        "numerology": 7,
        "connects": "Binah→Tiphareth",
        "meaning": "Sacred union, choice, duality resolved in unity",
        "keywords": ["relationships", "choices", "union", "harmony", "love"]
    },
    {
        "number": 7,
        "name": "The Chariot",
        "hebrew_letter": "Cheth (ח)",
        "tree_path": 18,
        "astrology": "Cancer",
        "numerology": 8,
        "connects": "Binah→Geburah",
        "meaning": "Spiritual victory, control over lower nature, protection",
        "keywords": ["willpower", "control", "victory", "protection", "determination"]
    },
    {
        "number": 8,
        "name": "Strength",
        "hebrew_letter": "Teth (ט)",
        "tree_path": 19,
        "astrology": "Leo",
        "numerology": 9,
        "connects": "Chesed→Geburah",
        "meaning": "Spiritual strength, courage, taming the lower self",
        "keywords": ["inner strength", "courage", "self-control", "confidence", "patience"]
    },
    {
        "number": 9,
        "name": "The Hermit",
        "hebrew_letter": "Yod (י)",
        "tree_path": 20,
        "astrology": "Virgo",
        "numerology": 10,
        "connects": "Chesed→Tiphareth",
        "meaning": "Inner wisdom, soul searching, divine spark within",
        "keywords": ["self-reflection", "wisdom", "guidance", "spiritual search", "solitude"]
    },
    {
        "number": 10,
        "name": "Wheel of Fortune",
        "hebrew_letter": "Kaph (כ)",
        "tree_path": 21,
        "astrology": "Jupiter",
        "numerology": 20,
        "connects": "Chesed→Netzach",
        "meaning": "Divine cycles, karma, fortune, expansion",
        "keywords": ["cycles", "fate", "opportunity", "expansion", "luck"]
    },
    {
        "number": 11,
        "name": "Justice",
        "hebrew_letter": "Lamed (ל)",
        "tree_path": 22,
        "astrology": "Libra",
        "numerology": 30,
        "connects": "Geburah→Tiphareth",
        "meaning": "Divine justice, balance, karmic law, equilibrium",
        "keywords": ["justice", "balance", "karma", "fairness", "truth"]
    },
    {
        "number": 12,
        "name": "The Hanged Man",
        "hebrew_letter": "Mem (מ)",
        "tree_path": 23,
        "astrology": "Water/Neptune",
        "numerology": 40,
        "connects": "Geburah→Hod",
        "meaning": "Sacrifice, suspension, new perspective, surrender",
        "keywords": ["surrender", "sacrifice", "new perspective", "letting go", "waiting"]
    },
    {
        "number": 13,
        "name": "Death",
        "hebrew_letter": "Nun (נ)",
        "tree_path": 24,
        "astrology": "Scorpio",
        "numerology": 50,
        "connects": "Tiphareth→Netzach",
        "meaning": "Transformation, rebirth, ending and beginning",
        "keywords": ["transformation", "endings", "rebirth", "change", "renewal"]
    },
    {
        "number": 14,
        "name": "Temperance",
        "hebrew_letter": "Samech (ס)",
        "tree_path": 25,
        "astrology": "Sagittarius",
        "numerology": 60,
        "connects": "Tiphareth→Yesod",
        "meaning": "Spiritual alchemy, moderation, synthesis",
        "keywords": ["balance", "moderation", "synthesis", "patience", "healing"]
    },
    {
        "number": 15,
        "name": "The Devil",
        "hebrew_letter": "Ayin (ע)",
        "tree_path": 26,
        "astrology": "Capricorn",
        "numerology": 70,
        "connects": "Tiphareth→Hod",
        "meaning": "Material bondage, illusion, shadow work, earthly desires",
        "keywords": ["shadow work", "materialism", "bondage", "liberation", "temptation"]
    },
    {
        "number": 16,
        "name": "The Tower",
        "hebrew_letter": "Peh (פ)",
        "tree_path": 27,
        "astrology": "Mars",
        "numerology": 80,
        "connects": "Netzach→Hod",
        "meaning": "Divine revelation, destruction of illusion, awakening",
        "keywords": ["sudden change", "revelation", "destruction", "awakening", "upheaval"]
    },
    {
        "number": 17,
        "name": "The Star",
        "hebrew_letter": "Tzaddi (צ)",
        "tree_path": 28,
        "astrology": "Aquarius",
        "numerology": 90,
        "connects": "Netzach→Yesod",
        "meaning": "Divine hope, inspiration, spiritual guidance",
        "keywords": ["hope", "inspiration", "guidance", "spirituality", "healing"]
    },
    {
        "number": 18,
        "name": "The Moon",
        "hebrew_letter": "Qoph (ק)",
        "tree_path": 29,
        "astrology": "Pisces",
        "numerology": 100,
        "connects": "Netzach→Malkuth",
        "meaning": "Illusion, psychic development, subconscious fears",
        "keywords": ["illusion", "intuition", "subconscious", "dreams", "psychic"]
    },
    {
        "number": 19,
        "name": "The Sun",
        "hebrew_letter": "Resh (ר)",
        "tree_path": 30,
        "astrology": "Sol",
        "numerology": 200,
        "connects": "Hod→Yesod",
        "meaning": "Divine illumination, success, clarity, vitality",
        "keywords": ["success", "clarity", "vitality", "illumination", "joy"]
    },
    {
        "number": 20,
        "name": "Judgement",
        "hebrew_letter": "Shin (ש)",
        "tree_path": 31,
        "astrology": "Fire/Pluto",
        "numerology": 300,
        "connects": "Hod→Malkuth",
        "meaning": "Divine judgment, rebirth, awakening, resurrection",
        "keywords": ["rebirth", "awakening", "calling", "judgment", "resurrection"]
    },
    {
        "number": 21,
        "name": "The World",
        "hebrew_letter": "Tau (ת)",
        "tree_path": 32,
        "astrology": "Saturn",
        "numerology": 400,
        "connects": "Yesod→Malkuth",
        "meaning": "Completion, cosmic consciousness, unity",
        "keywords": ["completion", "fulfillment", "cosmic awareness", "unity", "achievement"]
    }
]

# Minor Arcana suits
TAROT_SUITS: List[Dict[str, Any]] = [
    {
        "name": "Wands",
        "element": "Fire",
        "keywords": ["creativity", "passion", "energy", "career", "ambition"]
    },
    {
        "name": "Cups", 
        "element": "Water",
        "keywords": ["emotions", "relationships", "intuition", "love", "spirituality"]
    },
    {
        "name": "Swords",
        "element": "Air", 
        "keywords": ["thoughts", "communication", "conflict", "intellect", "challenges"]
    },
    {
        "name": "Pentacles",
        "element": "Earth",
        "keywords": ["material", "money", "career", "health", "practical matters"]
    }
]

# ===== KABBALAH TREE OF LIFE =====

# The 10 Sephirot (Divine Emanations)
SEPHIROT: List[SephirahDict] = [
    {
        "number": 1,
        "name": "Kether",
        "hebrew": "כתר",
        "english": "Crown",
        "astrology": "Divine Light",
        "tarot_association": "Four Aces",
        "element": "Divine Light",
        "gematria": 620,
        "meaning": "Divine Unity, Pure Consciousness, Source",
        "keywords": ["unity consciousness", "divine purpose", "spiritual crown", "source"],
        "position": "top"
    },
    {
        "number": 2,
        "name": "Chokmah",
        "hebrew": "חכמה",
        "english": "Wisdom",
        "astrology": "Zodiac Wheel",
        "tarot_association": "Four Twos",
        "element": "Fire",
        "gematria": 73,
        "meaning": "Divine Masculine, Active Principle, Wisdom",
        "keywords": ["masculine energy", "wisdom", "active principle", "force"],
        "position": "right_pillar_top"
    },
    {
        "number": 3,
        "name": "Binah",
        "hebrew": "בינה", 
        "english": "Understanding",
        "astrology": "Saturn",
        "tarot_association": "Four Threes",
        "element": "Water",
        "gematria": 67,
        "meaning": "Divine Feminine, Passive Principle, Understanding",
        "keywords": ["feminine energy", "understanding", "receptive principle", "form"],
        "position": "left_pillar_top"
    },
    {
        "number": 4,
        "name": "Chesed",
        "hebrew": "חסד",
        "english": "Mercy",
        "astrology": "Jupiter", 
        "tarot_association": "Four Fours",
        "element": "Water",
        "gematria": 72,
        "meaning": "Loving-kindness, Expansion, Mercy",
        "keywords": ["compassion", "expansion", "generosity", "mercy"],
        "position": "right_pillar_middle"
    },
    {
        "number": 5,
        "name": "Geburah",
        "hebrew": "גבורה",
        "english": "Severity",
        "astrology": "Mars",
        "tarot_association": "Four Fives", 
        "element": "Fire",
        "gematria": 216,
        "meaning": "Divine Justice, Strength, Severity",
        "keywords": ["justice", "strength", "necessary conflict", "severity"],
        "position": "left_pillar_middle"
    },
    {
        "number": 6,
        "name": "Tiphareth",
        "hebrew": "תפארת",
        "english": "Beauty",
        "astrology": "Sun",
        "tarot_association": "Four Sixes",
        "element": "Air",
        "gematria": 1081,
        "meaning": "Harmony, Beauty, Balance, Heart Center",
        "keywords": ["beauty", "balance", "heart wisdom", "harmony"],
        "position": "middle_pillar_center"
    },
    {
        "number": 7,
        "name": "Netzach",
        "hebrew": "נצח",
        "english": "Victory", 
        "astrology": "Venus",
        "tarot_association": "Four Sevens",
        "element": "Fire",
        "gematria": 148,
        "meaning": "Eternity, Victory, Emotion, Instinct",
        "keywords": ["victory", "emotions", "desires", "perseverance"],
        "position": "right_pillar_bottom"
    },
    {
        "number": 8,
        "name": "Hod",
        "hebrew": "הוד",
        "english": "Glory",
        "astrology": "Mercury",
        "tarot_association": "Four Eights",
        "element": "Water", 
        "gematria": 15,
        "meaning": "Glory, Intellect, Communication",
        "keywords": ["intellect", "communication", "mental clarity", "glory"],
        "position": "left_pillar_bottom"
    },
    {
        "number": 9,
        "name": "Yesod",
        "hebrew": "יסוד",
        "english": "Foundation",
        "astrology": "Moon",
        "tarot_association": "Four Nines",
        "element": "Air",
        "gematria": 80,
        "meaning": "Foundation, Astral Plane, Subconscious",
        "keywords": ["foundation", "subconscious", "dreams", "cycles"],
        "position": "middle_pillar_bottom"
    },
    {
        "number": 10,
        "name": "Malkuth",
        "hebrew": "מלכות",
        "english": "Kingdom",
        "astrology": "Earth",
        "tarot_association": "Four Tens",
        "element": "Earth",
        "gematria": 496,
        "meaning": "Physical World, Kingdom, Manifestation",
        "keywords": ["manifestation", "physical world", "completion", "material"],
        "position": "bottom"
    }
]

# Tree of Life Path Connections (22 paths connecting the 10 sephirot)
TREE_PATHS: List[TreePathDict] = [
    {"path": 11, "connects": ["Kether", "Chokmah"], "hebrew_letter": "Aleph", "major_arcana": "The Fool"},
    {"path": 12, "connects": ["Kether", "Binah"], "hebrew_letter": "Beth", "major_arcana": "The Magician"},
    {"path": 13, "connects": ["Kether", "Tiphareth"], "hebrew_letter": "Gimel", "major_arcana": "The High Priestess"},
    {"path": 14, "connects": ["Chokmah", "Binah"], "hebrew_letter": "Daleth", "major_arcana": "The Empress"},
    {"path": 15, "connects": ["Chokmah", "Tiphareth"], "hebrew_letter": "Heh", "major_arcana": "The Emperor"},
    {"path": 16, "connects": ["Chokmah", "Chesed"], "hebrew_letter": "Vav", "major_arcana": "The Hierophant"},
    {"path": 17, "connects": ["Binah", "Tiphareth"], "hebrew_letter": "Zayin", "major_arcana": "The Lovers"},
    {"path": 18, "connects": ["Binah", "Geburah"], "hebrew_letter": "Cheth", "major_arcana": "The Chariot"},
    {"path": 19, "connects": ["Chesed", "Geburah"], "hebrew_letter": "Teth", "major_arcana": "Strength"},
    {"path": 20, "connects": ["Chesed", "Tiphareth"], "hebrew_letter": "Yod", "major_arcana": "The Hermit"},
    {"path": 21, "connects": ["Chesed", "Netzach"], "hebrew_letter": "Kaph", "major_arcana": "Wheel of Fortune"},
    {"path": 22, "connects": ["Geburah", "Tiphareth"], "hebrew_letter": "Lamed", "major_arcana": "Justice"},
    {"path": 23, "connects": ["Geburah", "Hod"], "hebrew_letter": "Mem", "major_arcana": "The Hanged Man"},
    {"path": 24, "connects": ["Tiphareth", "Netzach"], "hebrew_letter": "Nun", "major_arcana": "Death"},
    {"path": 25, "connects": ["Tiphareth", "Yesod"], "hebrew_letter": "Samech", "major_arcana": "Temperance"},
    {"path": 26, "connects": ["Tiphareth", "Hod"], "hebrew_letter": "Ayin", "major_arcana": "The Devil"},
    {"path": 27, "connects": ["Netzach", "Hod"], "hebrew_letter": "Peh", "major_arcana": "The Tower"},
    {"path": 28, "connects": ["Netzach", "Yesod"], "hebrew_letter": "Tzaddi", "major_arcana": "The Star"},
    {"path": 29, "connects": ["Netzach", "Malkuth"], "hebrew_letter": "Qoph", "major_arcana": "The Moon"},
    {"path": 30, "connects": ["Hod", "Yesod"], "hebrew_letter": "Resh", "major_arcana": "The Sun"},
    {"path": 31, "connects": ["Hod", "Malkuth"], "hebrew_letter": "Shin", "major_arcana": "Judgement"},
    {"path": 32, "connects": ["Yesod", "Malkuth"], "hebrew_letter": "Tau", "major_arcana": "The World"}
]

# ===== MINOR ARCANA COMPLETE MAPPING =====

MINOR_ARCANA: Dict[str, List[MinorArcanaCardDict]] = {
    "wands": [
        {"number": 1, "name": "Ace of Wands", "sephirah": "Kether", "meaning": "Creative spark, new projects", "keywords": ["inspiration", "energy", "potential"]},
        {"number": 2, "name": "Two of Wands", "sephirah": "Chokmah", "meaning": "Planning, personal power", "keywords": ["planning", "decisions", "leadership"]},
        {"number": 3, "name": "Three of Wands", "sephirah": "Binah", "meaning": "Expansion, foresight", "keywords": ["expansion", "enterprise", "trade"]},
        {"number": 4, "name": "Four of Wands", "sephirah": "Chesed", "meaning": "Celebration, harmony", "keywords": ["celebration", "completion", "harmony"]},
        {"number": 5, "name": "Five of Wands", "sephirah": "Geburah", "meaning": "Competition, conflict", "keywords": ["competition", "struggle", "disagreement"]},
        {"number": 6, "name": "Six of Wands", "sephirah": "Tiphareth", "meaning": "Victory, recognition", "keywords": ["victory", "success", "public recognition"]},
        {"number": 7, "name": "Seven of Wands", "sephirah": "Netzach", "meaning": "Courage, perseverance", "keywords": ["courage", "determination", "challenge"]},
        {"number": 8, "name": "Eight of Wands", "sephirah": "Hod", "meaning": "Swift action, movement", "keywords": ["speed", "action", "movement"]},
        {"number": 9, "name": "Nine of Wands", "sephirah": "Yesod", "meaning": "Resilience, persistence", "keywords": ["resilience", "courage", "persistence"]},
        {"number": 10, "name": "Ten of Wands", "sephirah": "Malkuth", "meaning": "Burden, hard work", "keywords": ["burden", "hard work", "responsibility"]}
    ],
    "cups": [
        {"number": 1, "name": "Ace of Cups", "sephirah": "Kether", "meaning": "New love, emotional beginning", "keywords": ["love", "emotions", "spirituality"]},
        {"number": 2, "name": "Two of Cups", "sephirah": "Chokmah", "meaning": "Partnership, love", "keywords": ["partnership", "unity", "attraction"]},
        {"number": 3, "name": "Three of Cups", "sephirah": "Binah", "meaning": "Friendship, celebration", "keywords": ["friendship", "community", "celebration"]},
        {"number": 4, "name": "Four of Cups", "sephirah": "Chesed", "meaning": "Apathy, contemplation", "keywords": ["apathy", "meditation", "reevaluation"]},
        {"number": 5, "name": "Five of Cups", "sephirah": "Geburah", "meaning": "Loss, grief", "keywords": ["regret", "loss", "disappointment"]},
        {"number": 6, "name": "Six of Cups", "sephirah": "Tiphareth", "meaning": "Nostalgia, childhood", "keywords": ["nostalgia", "childhood", "innocence"]},
        {"number": 7, "name": "Seven of Cups", "sephirah": "Netzach", "meaning": "Illusion, choices", "keywords": ["illusion", "fantasy", "wishful thinking"]},
        {"number": 8, "name": "Eight of Cups", "sephirah": "Hod", "meaning": "Disappointment, abandonment", "keywords": ["disappointment", "abandonment", "withdrawal"]},
        {"number": 9, "name": "Nine of Cups", "sephirah": "Yesod", "meaning": "Satisfaction, wish fulfillment", "keywords": ["satisfaction", "contentment", "gratitude"]},
        {"number": 10, "name": "Ten of Cups", "sephirah": "Malkuth", "meaning": "Happiness, family", "keywords": ["happiness", "family", "emotional fulfillment"]}
    ],
    "swords": [
        {"number": 1, "name": "Ace of Swords", "sephirah": "Kether", "meaning": "New ideas, mental clarity", "keywords": ["clarity", "breakthrough", "new ideas"]},
        {"number": 2, "name": "Two of Swords", "sephirah": "Chokmah", "meaning": "Indecision, stalemate", "keywords": ["indecision", "difficult choice", "blocked emotions"]},
        {"number": 3, "name": "Three of Swords", "sephirah": "Binah", "meaning": "Heartbreak, sorrow", "keywords": ["heartbreak", "betrayal", "grief"]},
        {"number": 4, "name": "Four of Swords", "sephirah": "Chesed", "meaning": "Rest, contemplation", "keywords": ["rest", "meditation", "contemplation"]},
        {"number": 5, "name": "Five of Swords", "sephirah": "Geburah", "meaning": "Defeat, conflict", "keywords": ["conflict", "defeat", "disagreement"]},
        {"number": 6, "name": "Six of Swords", "sephirah": "Tiphareth", "meaning": "Transition, moving forward", "keywords": ["transition", "travel", "moving forward"]},
        {"number": 7, "name": "Seven of Swords", "sephirah": "Netzach", "meaning": "Deception, strategy", "keywords": ["deception", "strategy", "mental manipulation"]},
        {"number": 8, "name": "Eight of Swords", "sephirah": "Hod", "meaning": "Restriction, imprisonment", "keywords": ["restriction", "confusion", "powerlessness"]},
        {"number": 9, "name": "Nine of Swords", "sephirah": "Yesod", "meaning": "Anxiety, worry", "keywords": ["anxiety", "worry", "nightmares"]},
        {"number": 10, "name": "Ten of Swords", "sephirah": "Malkuth", "meaning": "Pain, rock bottom", "keywords": ["betrayal", "pain", "rock bottom"]}
    ],
    "pentacles": [
        {"number": 1, "name": "Ace of Pentacles", "sephirah": "Kether", "meaning": "New financial opportunity", "keywords": ["opportunity", "manifestation", "new venture"]},
        {"number": 2, "name": "Two of Pentacles", "sephirah": "Chokmah", "meaning": "Balance, juggling", "keywords": ["balance", "adaptability", "time management"]},
        {"number": 3, "name": "Three of Pentacles", "sephirah": "Binah", "meaning": "Teamwork, collaboration", "keywords": ["teamwork", "collaboration", "skill building"]},
        {"number": 4, "name": "Four of Pentacles", "sephirah": "Chesed", "meaning": "Control, conservation", "keywords": ["control", "conservation", "frugality"]},
        {"number": 5, "name": "Five of Pentacles", "sephirah": "Geburah", "meaning": "Financial loss, poverty", "keywords": ["financial loss", "poverty", "insecurity"]},
        {"number": 6, "name": "Six of Pentacles", "sephirah": "Tiphareth", "meaning": "Generosity, charity", "keywords": ["generosity", "charity", "sharing"]},
        {"number": 7, "name": "Seven of Pentacles", "sephirah": "Netzach", "meaning": "Assessment, reward", "keywords": ["assessment", "perseverance", "investment"]},
        {"number": 8, "name": "Eight of Pentacles", "sephirah": "Hod", "meaning": "Skill development, mastery", "keywords": ["skill", "mastery", "quality"]},
        {"number": 9, "name": "Nine of Pentacles", "sephirah": "Yesod", "meaning": "Luxury, self-reliance", "keywords": ["luxury", "self-reliance", "financial independence"]},
        {"number": 10, "name": "Ten of Pentacles", "sephirah": "Malkuth", "meaning": "Wealth, family legacy", "keywords": ["wealth", "family", "tradition"]}
    ]
}

COURT_CARDS: Dict[str, List[CourtCardDict]] = {
    "wands": [
        {"name": "Page of Wands", "sephirah": "Malkuth", "element": "Earth of Fire", "meaning": "Enthusiasm, exploration", "keywords": ["enthusiasm", "exploration", "discovery"]},
        {"name": "Knight of Wands", "sephirah": "Tiphareth", "element": "Air of Fire", "meaning": "Impulsive action, adventure", "keywords": ["action", "adventure", "impulsiveness"]},
        {"name": "Queen of Wands", "sephirah": "Binah", "element": "Water of Fire", "meaning": "Confidence, determination", "keywords": ["confidence", "courage", "determination"]},
        {"name": "King of Wands", "sephirah": "Chokmah", "element": "Fire of Fire", "meaning": "Leadership, vision", "keywords": ["leadership", "vision", "honor"]}
    ],
    "cups": [
        {"name": "Page of Cups", "sephirah": "Malkuth", "element": "Earth of Water", "meaning": "Creative opportunities, intuitive messages", "keywords": ["creativity", "intuition", "sensitivity"]},
        {"name": "Knight of Cups", "sephirah": "Tiphareth", "element": "Air of Water", "meaning": "Romance, following heart", "keywords": ["romance", "charm", "imagination"]},
        {"name": "Queen of Cups", "sephirah": "Binah", "element": "Water of Water", "meaning": "Compassion, emotional security", "keywords": ["compassion", "intuition", "emotional security"]},
        {"name": "King of Cups", "sephirah": "Chokmah", "element": "Fire of Water", "meaning": "Emotional balance, diplomacy", "keywords": ["emotional balance", "diplomacy", "compassion"]}
    ],
    "swords": [
        {"name": "Page of Swords", "sephirah": "Malkuth", "element": "Earth of Air", "meaning": "New ideas, vigilance", "keywords": ["vigilance", "new ideas", "curiosity"]},
        {"name": "Knight of Swords", "sephirah": "Tiphareth", "element": "Air of Air", "meaning": "Ambitious action, driven", "keywords": ["ambition", "action", "driven"]},
        {"name": "Queen of Swords", "sephirah": "Binah", "element": "Water of Air", "meaning": "Independent, perceptive", "keywords": ["independence", "perception", "direct communication"]},
        {"name": "King of Swords", "sephirah": "Chokmah", "element": "Fire of Air", "meaning": "Intellectual power, authority", "keywords": ["authority", "intellectual power", "truth"]}
    ],
    "pentacles": [
        {"name": "Page of Pentacles", "sephirah": "Malkuth", "element": "Earth of Earth", "meaning": "Manifestation, financial opportunity", "keywords": ["manifestation", "study", "planning"]},
        {"name": "Knight of Pentacles", "sephirah": "Tiphareth", "element": "Air of Earth", "meaning": "Hard work, productivity", "keywords": ["hard work", "productivity", "routine"]},
        {"name": "Queen of Pentacles", "sephirah": "Binah", "element": "Water of Earth", "meaning": "Practical, nurturing", "keywords": ["nurturing", "practical", "down-to-earth"]},
        {"name": "King of Pentacles", "sephirah": "Chokmah", "element": "Fire of Earth", "meaning": "Material success, generosity", "keywords": ["material success", "generosity", "reliability"]}
    ]
}

# ===== ENHANCED CALCULATION FUNCTIONS =====

def calculate_tarot_of_day(year: int, month: int, day: int) -> Dict[str, Any]:
    """Calculate tarot card of the day using numerology"""
    try:
        # Enhanced numerological calculation for daily card
        date_sum = day + month + year
        original_sum = date_sum
        
        # Reduce to single digit or master number
        while date_sum > 22:
            date_sum = sum(int(digit) for digit in str(date_sum))
        
        if date_sum == 0:
            date_sum = 22  # The Fool (0) becomes 22 in this system
            
        # Get the corresponding Major Arcana card
        daily_card = None
        for card in MAJOR_ARCANA:
            if card["number"] == (date_sum if date_sum <= 21 else 0):
                daily_card = card
                break
        
        # Calculate secondary influence (Minor Arcana)
        secondary_sum = (day + month) % 10
        if secondary_sum == 0:
            secondary_sum = 10
            
        # Get minor arcana card based on birth month for suit
        suit_index = (month - 1) % 4
        suits = ["wands", "cups", "swords", "pentacles"]
        suit = suits[suit_index]
        
        minor_card = None
        if suit in MINOR_ARCANA and secondary_sum <= len(MINOR_ARCANA[suit]):
            minor_card = MINOR_ARCANA[suit][secondary_sum - 1]
                
        return {
            "daily_card": daily_card,
            "secondary_influence": minor_card,
            "calculation": date_sum,
            "original_sum": original_sum,
            "guidance": f"Today's spiritual focus through {daily_card['name'] if daily_card else 'Unknown'}",
            "secondary_guidance": f"Secondary influence: {minor_card['name'] if minor_card else 'None'}"
        }
    except Exception as e:
        logger.error(f"Error calculating tarot of day: {e}")
        return {"error": str(e)}

def calculate_life_path_tarot(year: int, month: int, day: int) -> Dict[str, Any]:
    """Calculate life path tarot card using birth date numerology"""
    try:
        # Calculate life path number
        birth_sum = sum(int(digit) for digit in f"{day:02d}{month:02d}{year}")
        while birth_sum > 22:
            birth_sum = sum(int(digit) for digit in str(birth_sum))
            
        if birth_sum == 0:
            birth_sum = 22
            
        # Get corresponding Major Arcana card
        life_card = None
        for card in MAJOR_ARCANA:
            if card["number"] == (birth_sum if birth_sum <= 21 else 0):
                life_card = card
                break
                
        return {
            "life_path_card": life_card,
            "life_path_number": birth_sum,
            "spiritual_purpose": f"Your soul's journey through {life_card['name'] if life_card else 'Unknown'}"
        }
    except Exception as e:
        logger.error(f"Error calculating life path tarot: {e}")
        return {"error": str(e)}

def get_kabbalah_tree_analysis(birth_data: Dict[str, Any]) -> Dict[str, Any]:
    """Generate Kabbalah Tree of Life analysis"""
    try:
        # Extract birth information
        year = birth_data.get("year")
        month = birth_data.get("month") 
        day = birth_data.get("day")
        
        if not all([year, month, day]) or not all(isinstance(x, int) for x in [year, month, day]):
            return {"error": "Missing or invalid birth date information"}
            
        # Type assertion after validation - we know these are ints now
        assert isinstance(year, int) and isinstance(month, int) and isinstance(day, int)
            
        # Calculate primary sephirah based on birth date
        birth_sum = day + month + year
        sephirah_number = (birth_sum % 10) + 1 if (birth_sum % 10) != 0 else 10
        
        primary_sephirah = None
        for seph in SEPHIROT:
            if seph["number"] == sephirah_number:
                primary_sephirah = seph
                break
                
        # Calculate secondary sephirah based on month
        secondary_sephirah_num = (month % 10) if (month % 10) != 0 else 10
        secondary_sephirah = None
        for seph in SEPHIROT:
            if seph["number"] == secondary_sephirah_num:
                secondary_sephirah = seph
                break
                
        # Find relevant paths
        relevant_paths: List[TreePathDict] = []
        for path in TREE_PATHS:
            if primary_sephirah and (primary_sephirah["name"] in path["connects"]):
                relevant_paths.append(path)
                
        return {
            "primary_sephirah": primary_sephirah,
            "secondary_sephirah": secondary_sephirah,
            "relevant_paths": relevant_paths[:3],  # Top 3 most relevant paths
            "spiritual_focus": f"Your spiritual development centers on {primary_sephirah['english'] if primary_sephirah else 'Unknown'} - {primary_sephirah['meaning'] if primary_sephirah else 'Unknown'}",
            "tree_guidance": "Work with these sephirot and paths for spiritual growth"
        }
    except Exception as e:
        logger.error(f"Error in Kabbalah analysis: {e}")
        return {"error": str(e)}

def calculate_secondary_tarot_influence(year: int, month: int, day: int) -> Dict[str, Any]:
    """Calculate secondary tarot influence (Minor Arcana)"""
    try:
        # Calculate secondary influence (Minor Arcana)
        secondary_sum = (day + month) % 10
        if secondary_sum == 0:
            secondary_sum = 10
            
        # Get minor arcana card based on birth month for suit
        suit_index = (month - 1) % 4
        suits = ["wands", "cups", "swords", "pentacles"]
        suit = suits[suit_index]
        
        minor_card = None
        if suit in MINOR_ARCANA and secondary_sum <= len(MINOR_ARCANA[suit]):
            minor_card = MINOR_ARCANA[suit][secondary_sum - 1]
                
        return {
            "card": minor_card,
            "suit": suit,
            "calculation": secondary_sum,
            "guidance": f"Secondary influence: {minor_card['name'] if minor_card else 'None'}"
        }
    except Exception as e:
        logger.error(f"Error calculating secondary tarot influence: {e}")
        return {"error": str(e)}


def calculate_spiritual_systems(
    year: int,
    month: int, 
    day: int,
    hour: int = 12,
    minute: int = 0
) -> Dict[str, Any]:
    """Main function to calculate all spiritual systems"""
    try:
        logger.info(f"Calculating spiritual systems for {year}-{month}-{day}")
        
        # Tarot calculations
        daily_tarot = calculate_tarot_of_day(year, month, day)
        life_path_tarot = calculate_life_path_tarot(year, month, day)
        
        # Kabbalah Tree of Life analysis
        birth_data = {"year": year, "month": month, "day": day, "hour": hour, "minute": minute}
        kabbalah_analysis = get_kabbalah_tree_analysis(birth_data)
        
        # Cross-system correspondence
        correspondences = get_spiritual_correspondences(daily_tarot, life_path_tarot, kabbalah_analysis)
        
        # Generate Tree of Life visualization
        tree_visualization = generate_tree_visualization(birth_data, kabbalah_analysis, life_path_tarot)
        
        # Calculate secondary tarot influence
        secondary_influence = calculate_secondary_tarot_influence(year, month, day)
        
        return {
            "tarot": {
                "daily_card": daily_tarot,
                "life_path": life_path_tarot,
                "secondary_influence": secondary_influence,
                "suits": TAROT_SUITS
            },
            "kabbalah": kabbalah_analysis,
            "tree_of_life": {
                "visualization": tree_visualization,
                "coordinates": get_tree_layout_coordinates(),
                "active_paths": kabbalah_analysis.get("relevant_paths", [])
            },
            "correspondences": correspondences,
            "synthesis": generate_spiritual_synthesis(daily_tarot, life_path_tarot, kabbalah_analysis),
            "calculation_timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error calculating spiritual systems: {e}")
        return {"error": str(e)}

def get_spiritual_correspondences(
    daily_tarot: Dict[str, Any],
    life_path_tarot: Dict[str, Any], 
    kabbalah_analysis: Dict[str, Any]
) -> CorrespondenceDict:
    """Generate cross-system correspondences"""
    try:
        correspondences: CorrespondenceDict = {
            "daily_focus": {},
            "life_purpose": {},
            "spiritual_center": {}
        }
        
        # Daily card correspondences
        if daily_tarot.get("daily_card"):
            card = daily_tarot["daily_card"]
            correspondences["daily_focus"] = {
                "tarot": card["name"],
                "hebrew_letter": card["hebrew_letter"],
                "astrology": card["astrology"],
                "tree_path": card["tree_path"],
                "keywords": card["keywords"]
            }
            
        # Life path correspondences
        if life_path_tarot.get("life_path_card"):
            card = life_path_tarot["life_path_card"]
            correspondences["life_purpose"] = {
                "tarot": card["name"],
                "hebrew_letter": card["hebrew_letter"], 
                "astrology": card["astrology"],
                "tree_path": card["tree_path"],
                "spiritual_lesson": card["meaning"]
            }
            
        # Sephirah correspondences
        if kabbalah_analysis.get("primary_sephirah"):
            seph = kabbalah_analysis["primary_sephirah"]
            correspondences["spiritual_center"] = {
                "sephirah": seph["name"],
                "hebrew": seph["hebrew"],
                "astrology": seph["astrology"],
                "tarot_association": seph["tarot_association"],
                "element": seph["element"],
                "focus": seph["keywords"]
            }
            
        return correspondences
        
    except Exception as e:
        logger.error(f"Error generating correspondences: {e}")
        return {"error": str(e)}

def generate_spiritual_synthesis(
    daily_tarot: Dict[str, Any],
    life_path_tarot: Dict[str, Any],
    kabbalah_analysis: Dict[str, Any]
) -> SpiritualSynthesisDict:
    """Generate synthesis of all spiritual systems"""
    try:
        synthesis_themes: List[str] = []
        
        # Analyze daily card themes
        if daily_tarot.get("daily_card"):
            daily_themes: List[str] = daily_tarot["daily_card"]["keywords"][:2]
            synthesis_themes.extend(daily_themes)
            
        # Analyze life path themes  
        if life_path_tarot.get("life_path_card"):
            life_themes: List[str] = life_path_tarot["life_path_card"]["keywords"][:2]
            synthesis_themes.extend(life_themes)
            
        # Analyze sephirah themes
        if kabbalah_analysis.get("primary_sephirah"):
            seph_themes: List[str] = kabbalah_analysis["primary_sephirah"]["keywords"][:2]
            synthesis_themes.extend(seph_themes)
            
        # Remove duplicates and create synthesis
        unique_themes: List[str] = list(set(synthesis_themes))
        
        # Generate Tree of Life visualization data
        tree_visualization = generate_tree_visualization(kabbalah_analysis, daily_tarot, life_path_tarot)
        
        # Generate path working guidance
        path_working_result = generate_advanced_path_working(kabbalah_analysis, life_path_tarot)
        
        # Generate hermetic correspondences
        hermetic_corr = get_hermetic_correspondences(daily_tarot, kabbalah_analysis)
        
        synthesis_result: SpiritualSynthesisDict = {
            "primary_themes": unique_themes[:5],
            "spiritual_guidance": "Your spiritual path combines multiple wisdom traditions",
            "integration_focus": "Balance tarot insights with Kabbalistic understanding",
            "daily_practice": "Meditate on the correspondences between your cards and Tree of Life position",
            "tree_visualization": tree_visualization,
            "path_working": path_working_result,
            "hermetic_correspondences": hermetic_corr
        }
        
        return synthesis_result
        
    except Exception as e:
        logger.error(f"Error generating synthesis: {e}")
        return {"error": str(e)}

def generate_tree_visualization(
    kabbalah_analysis: Dict[str, Any], 
    daily_tarot: Dict[str, Any], 
    life_path_tarot: Dict[str, Any]
) -> Dict[str, Any]:
    """Generate interactive Tree of Life visualization data"""
    try:
        # Create sephirot with activation status
        activated_sephirot: List[Dict[str, Any]] = []
        primary_seph = kabbalah_analysis.get("primary_sephirah")
        secondary_seph = kabbalah_analysis.get("secondary_sephirah")
        
        for seph in SEPHIROT:
            activation_level = "inactive"
            if primary_seph and seph["name"] == primary_seph["name"]:
                activation_level = "primary"
            elif secondary_seph and seph["name"] == secondary_seph["name"]:
                activation_level = "secondary"
                
            activated_sephirot.append({
                **seph,
                "activation_level": activation_level,
                "meditation_focus": get_sephirah_meditation(seph["name"])
            })
        
        # Create paths with highlighting
        highlighted_paths: List[Dict[str, Any]] = []
        daily_card = daily_tarot.get("daily_card", {}).get("daily_card")
        life_card = life_path_tarot.get("life_path_card", {}).get("life_path_card")
        
        for path in TREE_PATHS:
            highlight_level = "normal"
            if daily_card and path["path"] == daily_card.get("tree_path"):
                highlight_level = "daily"
            elif life_card and path["path"] == life_card.get("tree_path"):
                highlight_level = "life_path"
                
            highlighted_paths.append({
                **path,
                "highlight_level": highlight_level,
                "meditation_practice": get_path_meditation(path["hebrew_letter"])
            })
        
        return {
            "sephirot": activated_sephirot,
            "paths": highlighted_paths,
            "tree_layout": get_tree_layout_coordinates(),
            "active_correspondences": get_active_correspondences(kabbalah_analysis, daily_tarot, life_path_tarot)
        }
        
    except Exception as e:
        logger.error(f"Error generating tree visualization: {e}")
        return {"error": str(e)}

def get_tree_layout_coordinates() -> Dict[str, Any]:
    """Get Tree of Life layout coordinates for visualization"""
    return {
        "sephirot_positions": {
            "Kether": {"x": 50, "y": 5},
            "Chokmah": {"x": 25, "y": 20},
            "Binah": {"x": 75, "y": 20},
            "Chesed": {"x": 25, "y": 40},
            "Geburah": {"x": 75, "y": 40},
            "Tiphareth": {"x": 50, "y": 50},
            "Netzach": {"x": 25, "y": 70},
            "Hod": {"x": 75, "y": 70},
            "Yesod": {"x": 50, "y": 85},
            "Malkuth": {"x": 50, "y": 95}
        },
        "path_connections": [
            {"from": "Kether", "to": "Chokmah"},
            {"from": "Kether", "to": "Binah"},
            {"from": "Kether", "to": "Tiphareth"},
            {"from": "Chokmah", "to": "Binah"},
            {"from": "Chokmah", "to": "Tiphareth"},
            {"from": "Chokmah", "to": "Chesed"},
            {"from": "Binah", "to": "Tiphareth"},
            {"from": "Binah", "to": "Geburah"},
            {"from": "Chesed", "to": "Geburah"},
            {"from": "Chesed", "to": "Tiphareth"},
            {"from": "Chesed", "to": "Netzach"},
            {"from": "Geburah", "to": "Tiphareth"},
            {"from": "Geburah", "to": "Hod"},
            {"from": "Tiphareth", "to": "Netzach"},
            {"from": "Tiphareth", "to": "Yesod"},
            {"from": "Tiphareth", "to": "Hod"},
            {"from": "Netzach", "to": "Hod"},
            {"from": "Netzach", "to": "Yesod"},
            {"from": "Netzach", "to": "Malkuth"},
            {"from": "Hod", "to": "Yesod"},
            {"from": "Hod", "to": "Malkuth"},
            {"from": "Yesod", "to": "Malkuth"}
        ]
    }

def get_sephirah_meditation(sephirah_name: str) -> str:
    """Get meditation guidance for specific sephirah"""
    meditations = {
        "Kether": "Meditate on pure unity and divine consciousness",
        "Chokmah": "Focus on active wisdom and creative force",
        "Binah": "Contemplate understanding and receptive wisdom",
        "Chesed": "Practice loving-kindness and compassion",
        "Geburah": "Work with strength and necessary boundaries",
        "Tiphareth": "Center in beauty, balance, and heart wisdom",
        "Netzach": "Embrace victory and emotional authenticity",
        "Hod": "Develop intellectual clarity and communication",
        "Yesod": "Connect with dreams and subconscious patterns",
        "Malkuth": "Ground spiritual insights in physical reality"
    }
    return meditations.get(sephirah_name, "Meditate on divine emanation")

def get_path_meditation(hebrew_letter: str) -> str:
    """Get meditation practice for specific Hebrew letter path"""
    practices = {
        "Aleph": "Breathe with divine consciousness",
        "Beth": "Practice manifesting through willpower",
        "Gimel": "Develop intuitive listening",
        "Daleth": "Cultivate creative abundance",
        "Heh": "Strengthen leadership and structure",
        "Vav": "Study traditional wisdom",
        "Zayin": "Practice conscious choice-making",
        "Cheth": "Build protective boundaries",
        "Teth": "Tame inner conflicts with gentle strength",
        "Yod": "Seek wisdom through solitude",
        "Kaph": "Accept life's cycles with grace",
        "Lamed": "Practice justice and balance",
        "Mem": "Surrender to higher guidance",
        "Nun": "Embrace transformation",
        "Samech": "Practice moderation and patience",
        "Ayin": "Face shadow aspects with compassion",
        "Peh": "Welcome revelatory insights",
        "Tzaddi": "Connect with hope and inspiration",
        "Qoph": "Work with dreams and intuition",
        "Resh": "Celebrate clarity and success",
        "Shin": "Accept spiritual rebirth",
        "Tau": "Integrate completion and new beginning"
    }
    return practices.get(hebrew_letter, "Meditate on Hebrew letter wisdom")

def generate_advanced_path_working(
    kabbalah_analysis: Dict[str, Any], 
    life_path_tarot: Dict[str, Any]
) -> PathWorkingDict:
    """Generate advanced path working guidance"""
    try:
        path_work: PathWorkingDict = {
            "current_phase": "Foundation Building",
            "recommended_duration": "3-4 months per phase",
            "phases": []
        }
        
        # Primary path from life path card
        if life_path_tarot.get("life_path_card"):
            life_card = life_path_tarot["life_path_card"]
            tree_path = life_card.get("tree_path")
            
            path_work["primary_path"] = {
                "path_number": tree_path,
                "tarot_card": life_card.get("name"),
                "hebrew_letter": life_card.get("hebrew_letter"),
                "spiritual_work": f"Develop the qualities of {life_card.get('meaning', 'spiritual growth')}",
                "meditation_focus": life_card.get("keywords", ["wisdom", "growth"])[0],
                "practical_exercises": get_path_exercises(life_card.get("name", ""))
            }
        
        # Progressive phases
        path_work["phases"] = [
            {
                "phase": 1,
                "name": "Foundation and Grounding",
                "focus": "Establish daily spiritual practice",
                "duration": "3 months",
                "practices": ["Daily meditation", "Tree of Life study", "Tarot journaling"]
            },
            {
                "phase": 2,
                "name": "Active Development",
                "focus": "Work with primary sephirah and path",
                "duration": "4 months", 
                "practices": ["Path working", "Sephirah meditation", "Correspondence study"]
            },
            {
                "phase": 3,
                "name": "Integration and Mastery",
                "focus": "Synthesize all spiritual insights",
                "duration": "5 months",
                "practices": ["Cross-system synthesis", "Teaching others", "Advanced practices"]
            }
        ]
        
        return path_work
        
    except Exception as e:
        logger.error(f"Error generating path working: {e}")
        return {"error": str(e)}

def get_path_exercises(card_name: str) -> List[str]:
    """Get practical exercises for specific tarot card path"""
    exercises = {
        "The Fool": ["Practice mindful risk-taking", "Explore new experiences", "Trust intuitive guidance"],
        "The Magician": ["Set clear intentions", "Practice manifestation techniques", "Develop communication skills"],
        "The High Priestess": ["Keep a dream journal", "Practice silent meditation", "Study lunar cycles"],
        "The Empress": ["Create something beautiful", "Spend time in nature", "Practice nurturing others"],
        "The Emperor": ["Take on leadership roles", "Create structure in life", "Practice discipline"],
        "The Hierophant": ["Study spiritual traditions", "Find a mentor", "Practice teaching others"],
        "The Lovers": ["Make conscious choices", "Work on relationships", "Practice harmony"],
        "The Chariot": ["Set and achieve goals", "Practice self-control", "Overcome obstacles"],
        "Strength": ["Practice patience", "Work with fears gently", "Develop inner courage"],
        "The Hermit": ["Practice solitude", "Seek inner wisdom", "Guide others spiritually"]
    }
    return exercises.get(card_name, ["Practice spiritual development", "Study correspondences", "Meditate daily"])

def get_hermetic_correspondences(
    daily_tarot: Dict[str, Any], 
    kabbalah_analysis: Dict[str, Any]
) -> HermeticCorrespondenceDict:
    """Get traditional Hermetic correspondences"""
    try:
        correspondences = {}
        
        # Daily card Hermetic correspondences
        daily_card = daily_tarot.get("daily_card", {}).get("daily_card")
        if daily_card:
            correspondences["daily_hermetic"] = {
                "tarot": daily_card.get("name"),
                "hebrew_letter": daily_card.get("hebrew_letter"),
                "astrological": daily_card.get("astrology"),
                "numerological": daily_card.get("numerology"),
                "elemental": get_card_element(daily_card.get("name", "")),
                "traditional_meaning": daily_card.get("meaning"),
                "golden_dawn_title": get_golden_dawn_title(daily_card.get("name", ""))
            }
        
        # Primary sephirah correspondences
        primary_seph = kabbalah_analysis.get("primary_sephirah")
        if primary_seph:
            correspondences["sephirah_hermetic"] = {
                "sephirah": primary_seph.get("name"),
                "hebrew": primary_seph.get("hebrew"),
                "planetary": primary_seph.get("astrology"),
                "elemental": primary_seph.get("element"),
                "gematria": primary_seph.get("gematria"),
                "divine_name": get_divine_name(primary_seph.get("name", "")),
                "archangel": get_archangel(primary_seph.get("name", "")),
                "magical_image": get_magical_image(primary_seph.get("name", ""))
            }
        
        result: HermeticCorrespondenceDict = {
            "sephirah_hermetic": correspondences
        }
        return result
        
    except Exception as e:
        logger.error(f"Error getting Hermetic correspondences: {e}")
        return {"error": str(e)}

def get_card_element(card_name: str) -> str:
    """Get elemental correspondence for tarot card"""
    elements = {
        "The Fool": "Air", "The Magician": "Air", "The High Priestess": "Water",
        "The Empress": "Earth", "The Emperor": "Fire", "The Hierophant": "Earth",
        "The Lovers": "Air", "The Chariot": "Water", "Strength": "Fire",
        "The Hermit": "Earth", "Wheel of Fortune": "Fire", "Justice": "Air",
        "The Hanged Man": "Water", "Death": "Water", "Temperance": "Fire",
        "The Devil": "Earth", "The Tower": "Fire", "The Star": "Air",
        "The Moon": "Water", "The Sun": "Fire", "Judgement": "Fire", "The World": "Earth"
    }
    return elements.get(card_name, "Unknown")

def get_golden_dawn_title(card_name: str) -> str:
    """Get Golden Dawn ceremonial title for tarot card"""
    titles = {
        "The Fool": "Spirit of the Mighty Aether",
        "The Magician": "Magus of Power",
        "The High Priestess": "Priestess of the Silver Star",
        "The Empress": "Daughter of the Mighty Ones",
        "The Emperor": "Son of the Morning, Chief among the Mighty",
        "The Hierophant": "Magus of the Eternal",
        "The Lovers": "Children of the Voice Divine",
        "The Chariot": "Child of the Powers of the Waters",
        "Strength": "Daughter of the Flaming Sword",
        "The Hermit": "Magus of the Voice of Light"
    }
    return titles.get(card_name, "Seeker of the Light")

def get_divine_name(sephirah_name: str) -> str:
    """Get divine name for sephirah"""
    names = {
        "Kether": "Eheieh (I AM)",
        "Chokmah": "Yah",
        "Binah": "YHVH Elohim",
        "Chesed": "El",
        "Geburah": "Elohim Gibor",
        "Tiphareth": "YHVH Eloah Ve Daath",
        "Netzach": "YHVH Tzabaoth",
        "Hod": "Elohim Tzabaoth",
        "Yesod": "Shaddai El Chai",
        "Malkuth": "Adonai ha Aretz"
    }
    return names.get(sephirah_name, "Divine Name")

def get_archangel(sephirah_name: str) -> str:
    """Get archangel for sephirah"""
    archangels = {
        "Kether": "Metatron",
        "Chokmah": "Raziel",
        "Binah": "Tzaphkiel",
        "Chesed": "Tzadkiel",
        "Geburah": "Kamael",
        "Tiphareth": "Raphael",
        "Netzach": "Haniel",
        "Hod": "Michael",
        "Yesod": "Gabriel",
        "Malkuth": "Sandalphon"
    }
    return archangels.get(sephirah_name, "Archangel")

def get_magical_image(sephirah_name: str) -> str:
    """Get magical image for sephirah"""
    images = {
        "Kether": "Ancient bearded king in profile",
        "Chokmah": "Bearded male figure",
        "Binah": "Mature woman, also a mother",
        "Chesed": "Mighty crowned and throned king",
        "Geburah": "Mighty warrior in his chariot",
        "Tiphareth": "Majestic king, child, sacrificed god",
        "Netzach": "Beautiful naked woman",
        "Hod": "Hermaphrodite",
        "Yesod": "Beautiful naked man, very strong",
        "Malkuth": "Young woman crowned and throned"
    }
    return images.get(sephirah_name, "Divine Image")

def get_active_correspondences(
    kabbalah_analysis: Dict[str, Any], 
    daily_tarot: Dict[str, Any], 
    life_path_tarot: Dict[str, Any]
) -> Dict[str, Any]:
    """Get currently active correspondences for Tree visualization"""
    active: Dict[str, Any] = {}
    
    # Daily card correspondences
    daily_card = daily_tarot.get("daily_card", {}).get("daily_card")
    if daily_card:
        active["daily"] = {
            "card": daily_card.get("name"),
            "path": daily_card.get("tree_path"),
            "energy": "active_today"
        }
    
    # Life path correspondences  
    life_card = life_path_tarot.get("life_path_card", {}).get("life_path_card")
    if life_card:
        active["life_path"] = {
            "card": life_card.get("name"),
            "path": life_card.get("tree_path"),
            "energy": "life_theme"
        }
    
    # Primary sephirah
    primary_seph = kabbalah_analysis.get("primary_sephirah")
    if primary_seph:
        active["primary_sephirah"] = {
            "sephirah": primary_seph.get("name"),
            "energy": "developmental_focus"
        }
    
    return active

# Helper function to get card by name
def get_tarot_card_by_name(card_name: str) -> Optional[TarotCardDict]:
    """Get tarot card by name"""
    for card in MAJOR_ARCANA:
        if card["name"].lower() == card_name.lower():
            return card
    return None

# Helper function to get sephirah by name
def get_sephirah_by_name(seph_name: str) -> Optional[SephirahDict]:
    """Get sephirah by name"""
    for seph in SEPHIROT:
        if seph["name"].lower() == seph_name.lower():
            return seph
    return None

# Helper function to get path by number
def get_tree_path_by_number(path_number: int) -> Optional[TreePathDict]:
    """Get tree path by number"""
    for path in TREE_PATHS:
        if path["path"] == path_number:
            return path
    return None
