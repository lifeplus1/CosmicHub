# backend/astro/calculations/gene_keys.py
import logging
from typing import Any, Dict, Optional

from .human_design import calculate_human_design

logger = logging.getLogger(__name__)

# Gene Keys Golden Path Line Themes for each sphere
GOLDEN_PATH_LINE_THEMES = {
    "iq": {  # IQ Sphere - Activation Sequence (Mental Intelligence)
        1: "Attraction",
        2: "Orientation",
        3: "Activation",
        4: "Meditation",
        5: "Contemplation",
        6: "Illumination",
    },
    "eq": {  # EQ Sphere - Venus Sequence (Emotional Intelligence)
        1: "Survival",
        2: "Seduction",
        3: "Symbiosis",
        4: "Synthesis",
        5: "Synergy",
        6: "Synchronicity",
    },
    "sq": {  # SQ Sphere - Pearl Sequence (Spiritual Intelligence)
        1: "Foundation",
        2: "Stability",
        3: "Flexibility",
        4: "Permeability",
        5: "Fluidity",
        6: "Transparency",
    },
}

# Gene Keys - 64 Keys with Shadow, Gift, and Siddhi
GENE_KEYS = {
    1: {
        "name": "The Prime",
        "shadow": "Entropy",
        "gift": "Freshness",
        "siddhi": "Beauty",
        "description": "The creative force and divine spark within all things",
        "keynote": "From Entropy to Beauty",
        "codon": "TTT/TTC",
    },
    2: {
        "name": "The Orientation",
        "shadow": "Dislocation",
        "gift": "Orientation",
        "siddhi": "Unity",
        "description": "Finding your true direction in life",
        "keynote": "From Dislocation to Unity",
        "codon": "TTA/TTG",
    },
    3: {
        "name": "The Innovation",
        "shadow": "Chaos",
        "gift": "Innovation",
        "siddhi": "Innocence",
        "description": "The breakthrough that comes from ordering chaos",
        "keynote": "From Chaos to Innocence",
        "codon": "CTT/CTC",
    },
    4: {
        "name": "The Formulization",
        "shadow": "Intolerance",
        "gift": "Understanding",
        "siddhi": "Forgiveness",
        "description": "The wisdom that comes from true understanding",
        "keynote": "From Intolerance to Forgiveness",
        "codon": "CTA/CTG",
    },
    5: {
        "name": "The Rhythm",
        "shadow": "Impatience",
        "gift": "Patience",
        "siddhi": "Timelessness",
        "description": "Learning to flow with natural rhythms",
        "keynote": "From Impatience to Timelessness",
        "codon": "ATT/ATC",
    },
    6: {
        "name": "The Peacemaker",
        "shadow": "Conflict",
        "gift": "Diplomacy",
        "siddhi": "Peace",
        "description": "The art of bringing harmony to discord",
        "keynote": "From Conflict to Peace",
        "codon": "ATA/ATG",
    },
    7: {
        "name": "The Guide",
        "shadow": "Division",
        "gift": "Guidance",
        "siddhi": "Virtue",
        "description": "Leading others through wisdom and example",
        "keynote": "From Division to Virtue",
        "codon": "GTT/GTC",
    },
    8: {
        "name": "The Diamond",
        "shadow": "Mediocrity",
        "gift": "Style",
        "siddhi": "Exquisiteness",
        "description": "Expressing your unique creative style",
        "keynote": "From Mediocrity to Exquisiteness",
        "codon": "GTA/GTG",
    },
    9: {
        "name": "The Determiner",
        "shadow": "Inertia",
        "gift": "Determination",
        "siddhi": "Invincibility",
        "description": "The power to focus and achieve goals",
        "keynote": "From Inertia to Invincibility",
        "codon": "TCT/TCC",
    },
    10: {
        "name": "The Naturalist",
        "shadow": "Self-Obsession",
        "gift": "Naturalness",
        "siddhi": "Being",
        "description": "Authenticity and being true to yourself",
        "keynote": "From Self-Obsession to Being",
        "codon": "TCA/TCG",
    },
    11: {
        "name": "The Idealist",
        "shadow": "Obscurity",
        "gift": "Idealism",
        "siddhi": "Light",
        "description": "Illuminating new possibilities and visions",
        "keynote": "From Obscurity to Light",
        "codon": "CCT/CCC",
    },
    12: {
        "name": "The Purity",
        "shadow": "Vanity",
        "gift": "Discrimination",
        "siddhi": "Purity",
        "description": "The refinement of consciousness",
        "keynote": "From Vanity to Purity",
        "codon": "CCA/CCG",
    },
    13: {
        "name": "The Listener",
        "shadow": "Discord",
        "gift": "Discernment",
        "siddhi": "Empathy",
        "description": "Deep listening and understanding others",
        "keynote": "From Discord to Empathy",
        "codon": "ACT/ACC",
    },
    14: {
        "name": "The Bounteousness",
        "shadow": "Compromise",
        "gift": "Competence",
        "siddhi": "Bounteousness",
        "description": "Mastery and abundance through skill",
        "keynote": "From Compromise to Bounteousness",
        "codon": "ACA/ACG",
    },
    15: {
        "name": "The Magnetics",
        "shadow": "Dullness",
        "gift": "Magnetism",
        "siddhi": "Florescence",
        "description": "The power to attract and inspire",
        "keynote": "From Dullness to Florescence",
        "codon": "GCT/GCC",
    },
    16: {
        "name": "The Versatility",
        "shadow": "Indifference",
        "gift": "Versatility",
        "siddhi": "Mastery",
        "description": "Skilled adaptation and mastery",
        "keynote": "From Indifference to Mastery",
        "codon": "GCA/GCG",
    },
    17: {
        "name": "The Eye",
        "shadow": "Opinion",
        "gift": "Far-sightedness",
        "siddhi": "Omniscience",
        "description": "Seeing the bigger picture and future trends",
        "keynote": "From Opinion to Omniscience",
        "codon": "TAT/TAC",
    },
    18: {
        "name": "The Healing",
        "shadow": "Judgment",
        "gift": "Integrity",
        "siddhi": "Perfection",
        "description": "Healing through alignment and integrity",
        "keynote": "From Judgment to Perfection",
        "codon": "TAA/TAG",
    },
    19: {
        "name": "The Approach",
        "shadow": "Co-dependence",
        "gift": "Sensitivity",
        "siddhi": "Sacrifice",
        "description": "Sensitive awareness of others' needs",
        "keynote": "From Co-dependence to Sacrifice",
        "codon": "GAT/GAC",
    },
    20: {
        "name": "The Contemplation",
        "shadow": "Superficiality",
        "gift": "Self-Assurance",
        "siddhi": "Presence",
        "description": "Deep contemplation and presence",
        "keynote": "From Superficiality to Presence",
        "codon": "GAA/GAG",
    },
    21: {
        "name": "The Authority",
        "shadow": "Control",
        "gift": "Authority",
        "siddhi": "Valor",
        "description": "True authority comes from inner strength",
        "keynote": "From Control to Valor",
        "codon": "TGT/TGC",
    },
    22: {
        "name": "The Graciousness",
        "shadow": "Dishonor",
        "gift": "Graciousness",
        "siddhi": "Humility",
        "description": "Grace under pressure and elegant expression",
        "keynote": "From Dishonor to Humility",
        "codon": "TGA/TGG",
    },
    23: {
        "name": "The Alchemy",
        "shadow": "Complexity",
        "gift": "Simplicity",
        "siddhi": "Quintessence",
        "description": "Transforming complexity into simplicity",
        "keynote": "From Complexity to Quintessence",
        "codon": "CGT/CGC",
    },
    24: {
        "name": "The Return",
        "shadow": "Addiction",
        "gift": "Invention",
        "siddhi": "Silence",
        "description": "Returning to source through innovation",
        "keynote": "From Addiction to Silence",
        "codon": "CGA/CGG",
    },
    25: {
        "name": "The Spirit",
        "shadow": "Constriction",
        "gift": "Acceptance",
        "siddhi": "Universal Love",
        "description": "Unconditional love and acceptance",
        "keynote": "From Constriction to Universal Love",
        "codon": "AGT/AGC",
    },
    26: {
        "name": "The Artfulness",
        "shadow": "Pride",
        "gift": "Artfulness",
        "siddhi": "Invisibility",
        "description": "The art of subtle influence",
        "keynote": "From Pride to Invisibility",
        "codon": "AGA/AGG",
    },
    27: {
        "name": "The Altruism",
        "shadow": "Selfishness",
        "gift": "Altruism",
        "siddhi": "Selflessness",
        "description": "Caring for others without agenda",
        "keynote": "From Selfishness to Selflessness",
        "codon": "GGT/GGC",
    },
    28: {
        "name": "The Player",
        "shadow": "Purposelessness",
        "gift": "Totality",
        "siddhi": "Immortality",
        "description": "Playing the game of life with totality",
        "keynote": "From Purposelessness to Immortality",
        "codon": "GGA/GGG",
    },
    29: {
        "name": "The Leap",
        "shadow": "Half-heartedness",
        "gift": "Commitment",
        "siddhi": "Devotion",
        "description": "Full commitment leads to transcendence",
        "keynote": "From Half-heartedness to Devotion",
        "codon": "TTT/TTC",
    },
    30: {
        "name": "The Lightbringer",
        "shadow": "Desire",
        "gift": "Lightness",
        "siddhi": "Rapture",
        "description": "Bringing light to darkness",
        "keynote": "From Desire to Rapture",
        "codon": "TTA/TTG",
    },
    31: {
        "name": "The Leadership",
        "shadow": "Arrogance",
        "gift": "Leadership",
        "siddhi": "Humility",
        "description": "Leading through humble service",
        "keynote": "From Arrogance to Humility",
        "codon": "CTT/CTC",
    },
    32: {
        "name": "The Preservation",
        "shadow": "Failure",
        "gift": "Preservation",
        "siddhi": "Veneration",
        "description": "Preserving what is truly valuable",
        "keynote": "From Failure to Veneration",
        "codon": "CTA/CTG",
    },
    33: {
        "name": "The Mindfulness",
        "shadow": "Forgetting",
        "gift": "Mindfulness",
        "siddhi": "Revelation",
        "description": "Remembering your true nature",
        "keynote": "From Forgetting to Revelation",
        "codon": "ATT/ATC",
    },
    34: {
        "name": "The Power",
        "shadow": "Force",
        "gift": "Strength",
        "siddhi": "Majesty",
        "description": "True power comes from inner strength",
        "keynote": "From Force to Majesty",
        "codon": "ATA/ATG",
    },
    35: {
        "name": "The Wormhole",
        "shadow": "Hunger",
        "gift": "Adventure",
        "siddhi": "Boundlessness",
        "description": "Exploring infinite possibilities",
        "keynote": "From Hunger to Boundlessness",
        "codon": "GTT/GTC",
    },
    36: {
        "name": "The Becoming",
        "shadow": "Turbulence",
        "gift": "Humanity",
        "siddhi": "Compassion",
        "description": "Embracing the human journey",
        "keynote": "From Turbulence to Compassion",
        "codon": "GTA/GTG",
    },
    37: {
        "name": "The Equality",
        "shadow": "Weakness",
        "gift": "Equality",
        "siddhi": "Tenderness",
        "description": "Seeing the divine in everyone",
        "keynote": "From Weakness to Tenderness",
        "codon": "TCT/TCC",
    },
    38: {
        "name": "The Warrior",
        "shadow": "Struggle",
        "gift": "Perseverance",
        "siddhi": "Honor",
        "description": "Fighting for what is right",
        "keynote": "From Struggle to Honor",
        "codon": "TCA/TCG",
    },
    39: {
        "name": "The Liberation",
        "shadow": "Provocation",
        "gift": "Dynamism",
        "siddhi": "Liberation",
        "description": "Breaking free from limitations",
        "keynote": "From Provocation to Liberation",
        "codon": "CCT/CCC",
    },
    40: {
        "name": "The Resolve",
        "shadow": "Exhaustion",
        "gift": "Resolve",
        "siddhi": "Divine Will",
        "description": "Unwavering commitment to truth",
        "keynote": "From Exhaustion to Divine Will",
        "codon": "CCA/CCG",
    },
    41: {
        "name": "The Prime",
        "shadow": "Fantasy",
        "gift": "Anticipation",
        "siddhi": "Emanation",
        "description": "The source of all new experiences",
        "keynote": "From Fantasy to Emanation",
        "codon": "ACT/ACC",
    },
    42: {
        "name": "The Completion",
        "shadow": "Expectation",
        "gift": "Detachment",
        "siddhi": "Celebration",
        "description": "Completing cycles with celebration",
        "keynote": "From Expectation to Celebration",
        "codon": "ACA/ACG",
    },
    43: {
        "name": "The Insight",
        "shadow": "Deafness",
        "gift": "Insight",
        "siddhi": "Epiphany",
        "description": "Breakthrough insights and revelations",
        "keynote": "From Deafness to Epiphany",
        "codon": "GCT/GCC",
    },
    44: {
        "name": "The Synarchy",
        "shadow": "Interference",
        "gift": "Teamwork",
        "siddhi": "Synarchy",
        "description": "Collective intelligence and cooperation",
        "keynote": "From Interference to Synarchy",
        "codon": "GCA/GCG",
    },
    45: {
        "name": "The Communion",
        "shadow": "Dominance",
        "gift": "Synergy",
        "siddhi": "Communion",
        "description": "Unity through shared purpose",
        "keynote": "From Dominance to Communion",
        "codon": "TAT/TAC",
    },
    46: {
        "name": "The Delight",
        "shadow": "Seriousness",
        "gift": "Delight",
        "siddhi": "Ecstasy",
        "description": "Finding joy in the present moment",
        "keynote": "From Seriousness to Ecstasy",
        "codon": "TAA/TAG",
    },
    47: {
        "name": "The Transmutation",
        "shadow": "Oppression",
        "gift": "Transmutation",
        "siddhi": "Transfiguration",
        "description": "Transforming suffering into wisdom",
        "keynote": "From Oppression to Transfiguration",
        "codon": "GAT/GAC",
    },
    48: {
        "name": "The Depth",
        "shadow": "Inadequacy",
        "gift": "Wisdom",
        "siddhi": "Knowing",
        "description": "Deep wisdom from life experience",
        "keynote": "From Inadequacy to Knowing",
        "codon": "GAA/GAG",
    },
    49: {
        "name": "The Revolution",
        "shadow": "Reaction",
        "gift": "Revolution",
        "siddhi": "Rebirth",
        "description": "Revolutionary change and renewal",
        "keynote": "From Reaction to Rebirth",
        "codon": "TGT/TGC",
    },
    50: {
        "name": "The Equilibrium",
        "shadow": "Corruption",
        "gift": "Equilibrium",
        "siddhi": "Harmony",
        "description": "Balancing opposing forces",
        "keynote": "From Corruption to Harmony",
        "codon": "TGA/TGG",
    },
    51: {
        "name": "The Initiative",
        "shadow": "Agitation",
        "gift": "Initiative",
        "siddhi": "Awakening",
        "description": "The shock that leads to awakening",
        "keynote": "From Agitation to Awakening",
        "codon": "CGT/CGC",
    },
    52: {
        "name": "The Stillness",
        "shadow": "Stress",
        "gift": "Restraint",
        "siddhi": "Stillness",
        "description": "Finding peace in stillness",
        "keynote": "From Stress to Stillness",
        "codon": "CGA/CGG",
    },
    53: {
        "name": "The Evolution",
        "shadow": "Immaturity",
        "gift": "Superabundance",
        "siddhi": "Evolution",
        "description": "Gradual unfolding of potential",
        "keynote": "From Immaturity to Evolution",
        "codon": "AGT/AGC",
    },
    54: {
        "name": "The Aspiration",
        "shadow": "Greed",
        "gift": "Aspiration",
        "siddhi": "Ascension",
        "description": "Rising above material concerns",
        "keynote": "From Greed to Ascension",
        "codon": "AGA/AGG",
    },
    55: {
        "name": "The Freedom",
        "shadow": "Victimization",
        "gift": "Freedom",
        "siddhi": "Freedom",
        "description": "True freedom comes from within",
        "keynote": "From Victimization to Freedom",
        "codon": "GGT/GGC",
    },
    56: {
        "name": "The Stimulation",
        "shadow": "Distraction",
        "gift": "Stimulation",
        "siddhi": "Intoxication",
        "description": "Divine intoxication with life",
        "keynote": "From Distraction to Intoxication",
        "codon": "GGA/GGG",
    },
    57: {
        "name": "The Intuition",
        "shadow": "Unease",
        "gift": "Intuition",
        "siddhi": "Clarity",
        "description": "Clear intuitive awareness",
        "keynote": "From Unease to Clarity",
        "codon": "TTT/TTC",
    },
    58: {
        "name": "The Vitality",
        "shadow": "Dissatisfaction",
        "gift": "Vitality",
        "siddhi": "Bliss",
        "description": "Joyful vitality and life force",
        "keynote": "From Dissatisfaction to Bliss",
        "codon": "TTA/TTG",
    },
    59: {
        "name": "The Transparency",
        "shadow": "Dishonesty",
        "gift": "Transparency",
        "siddhi": "Transparency",
        "description": "Complete openness and honesty",
        "keynote": "From Dishonesty to Transparency",
        "codon": "CTT/CTC",
    },
    60: {
        "name": "The Justice",
        "shadow": "Limitation",
        "gift": "Justice",
        "siddhi": "Justice",
        "description": "Divine justice and right action",
        "keynote": "From Limitation to Justice",
        "codon": "CTA/CTG",
    },
    61: {
        "name": "The Sanctity",
        "shadow": "Psychosis",
        "gift": "Inspiration",
        "siddhi": "Sanctity",
        "description": "Sacred inspiration and truth",
        "keynote": "From Psychosis to Sanctity",
        "codon": "ATT/ATC",
    },
    62: {
        "name": "The Impeccability",
        "shadow": "Intellect",
        "gift": "Precision",
        "siddhi": "Impeccability",
        "description": "Perfect attention to detail",
        "keynote": "From Intellect to Impeccability",
        "codon": "ATA/ATG",
    },
    63: {
        "name": "The Truth",
        "shadow": "Doubt",
        "gift": "Inquiry",
        "siddhi": "Truth",
        "description": "The eternal quest for truth",
        "keynote": "From Doubt to Truth",
        "codon": "GTT/GTC",
    },
    64: {
        "name": "The Illumination",
        "shadow": "Confusion",
        "gift": "Imagination",
        "siddhi": "Illumination",
        "description": "Ultimate illumination and understanding",
        "keynote": "From Confusion to Illumination",
        "codon": "GTA/GTG",
    },
}

# Gene Keys Sequences
SEQUENCES: Dict[str, Dict[str, Any]] = {
    "activation": {
        "name": "Activation Sequence",
        "description": "Your core wound and gift - the foundation of your transformation",
        "gates": ["life_work", "evolution", "radiance", "purpose"],
    },
    "venus": {
        "name": "Venus Sequence",
        "description": "Your relationships and how you attract and give love",
        "gates": ["attraction", "iq", "eq", "sq"],
    },
    "pearl": {
        "name": "Pearl Sequence",
        "description": "Your prosperity and how you manifest abundance",
        "gates": ["vocation", "culture", "brand", "pearl"],
    },
}


def calculate_gene_keys_profile(
    year: int,
    month: int,
    day: int,
    hour: int,
    minute: int,
    lat: float,
    lon: float,
    timezone: str = "UTC",
) -> Dict[str, Any]:
    """
    Calculate complete Gene Keys profile including all sequences
    """
    try:
        logger.info(
            f"Calculating Gene Keys profile for {year}-{month}-{day} {hour}:{minute}"
        )

        # First get the Human Design data (Gene Keys uses same calculations)
        hd_data = calculate_human_design(
            year, month, day, hour, minute, lat, lon, timezone
        )

        if not hd_data:
            raise ValueError(
                "Failed to calculate Human Design data for Gene Keys"
            )

        # Extract the key gates for Gene Keys sequences
        gates_array = hd_data.get("gates", [])

        # Convert gates array to conscious/unconscious structure for Gene Keys
        conscious: Dict[str, Dict[str, int]] = {}
        unconscious: Dict[str, Dict[str, int]] = {}

        for gate in gates_array:
            planet = gate.get("planet", "")
            gate_number = gate.get("number", 1)
            line_number = gate.get("line", 1)
            gate_type = gate.get("type", "")

            if gate_type == "personality":  # Conscious
                conscious[planet] = {"gate": gate_number, "line": line_number}
            elif gate_type == "design":  # Unconscious
                unconscious[planet] = {
                    "gate": gate_number,
                    "line": line_number,
                }

        # Core Gates
        sun_gate: int = conscious.get("sun", {}).get("gate", 1)
        earth_gate: int = conscious.get("earth", {}).get("gate", 1)
        radiance_gate: int = unconscious.get("sun", {}).get("gate", 1)
        purpose_gate: int = unconscious.get("earth", {}).get("gate", 1)

        # Calculate the three main sequences
        activation_sequence: Dict[str, Any] = calculate_activation_sequence(
            conscious, unconscious
        )
        venus_sequence: Dict[str, Any] = calculate_venus_sequence(
            conscious, unconscious
        )
        pearl_sequence: Dict[str, Any] = calculate_pearl_sequence(
            conscious, unconscious
        )

        # Create comprehensive profile
        profile: Dict[str, Any] = {
            "life_work": get_gene_key_details(sun_gate),
            "evolution": get_gene_key_details(earth_gate),
            "radiance": get_gene_key_details(radiance_gate),
            "purpose": get_gene_key_details(purpose_gate),
            "attraction": venus_sequence.get("attraction", {}),
            # Expose individual Venus Sequence developmental spheres for direct access
            # Tests (test_gene_keys_line_themes.py) expect top-level keys 'iq', 'eq', 'sq'
            # including line_theme and sphere_context metadata produced by get_gene_key_details.
            "iq": venus_sequence.get("iq", {}),
            "eq": venus_sequence.get("eq", {}),
            "sq": venus_sequence.get("sq", {}),
            "core_wound": venus_sequence.get("core_wound", {}),
            "activation": {
                "name": activation_sequence.get("name", "Activation Sequence"),
                "description": activation_sequence.get("description", ""),
                "keys": [
                    activation_sequence.get("life_work", {}),
                    activation_sequence.get("evolution", {}),
                    activation_sequence.get("radiance", {}),
                    activation_sequence.get("purpose", {}),
                ],
            },
            "venus_sequence": {
                "name": venus_sequence.get("name", "Venus Sequence"),
                "description": venus_sequence.get("description", ""),
                "keys": [
                    venus_sequence.get("attraction", {}),
                    venus_sequence.get("iq", {}),
                    venus_sequence.get("eq", {}),
                    venus_sequence.get("sq", {}),
                ],
            },
            "pearl_sequence": {
                "name": pearl_sequence.get("name", "Pearl Sequence"),
                "description": pearl_sequence.get("description", ""),
                "keys": (
                    [
                        pearl_sequence.get("vocation", {}),
                        pearl_sequence.get("culture", {}),
                        pearl_sequence.get("brand", {}),
                        pearl_sequence.get("pearl", {}),
                    ]
                    if pearl_sequence.get("vocation")
                    else []
                ),
            },
            "contemplation_sequence": [
                f"Gene Key {sun_gate}",
                f"Gene Key {earth_gate}",
                f"Gene Key {radiance_gate}",
                f"Gene Key {purpose_gate}",
            ],
            "hologenetic_profile": {
                "description": "Your complete genetic blueprint and consciousness evolution path",
                "integration_path": [
                    f"Core Quartet Integration: {sun_gate}, {earth_gate}, {radiance_gate}, {purpose_gate}",
                    f"Venus Sequence Integration: IQ → EQ → SQ",
                    f"Hologenetic Synthesis: All planetary activations working as unified field",
                ],
            },
        }

        logger.info("Gene Keys profile calculated successfully")
        return profile

    except Exception as e:
        logger.error(f"Error calculating Gene Keys profile: {str(e)}")
        raise


def get_gene_key_details(
    gate_number: int, line_number: int = 1, sphere: Optional[str] = None
) -> Dict[str, Any]:
    """Get detailed information about a specific Gene Key with line themes"""
    key_data = GENE_KEYS.get(gate_number, {})
    if not key_data:
        return {"error": f"Gene Key {gate_number} not found"}

    result: Dict[str, Any] = {
        "number": gate_number,
        "line": line_number,
        "name": str(key_data.get("name", "Unknown")),
        "shadow": str(key_data.get("shadow", "")),
        "gift": str(key_data.get("gift", "")),
        "siddhi": str(key_data.get("siddhi", "")),
        "description": str(key_data.get("description", "")),
        "keynote": str(key_data.get("keynote", "")),
        "codon": str(key_data.get("codon", "")),
        "programming_partner": int(get_programming_partner(gate_number)),
        "sphere": str(get_sphere(gate_number)),
    }

    # Add sphere-specific line theme if sphere is specified
    if sphere and sphere in GOLDEN_PATH_LINE_THEMES:
        line_theme = GOLDEN_PATH_LINE_THEMES[sphere].get(
            line_number, f"Line {line_number}"
        )
        result["line_theme"] = str(line_theme)
        result["sphere_context"] = str(sphere.upper())

    return result


def get_gene_key_details_legacy(gate_number: int) -> Dict[str, Any]:
    """Legacy function for backward compatibility"""
    return get_gene_key_details(gate_number)


def calculate_activation_sequence(
    conscious: Dict[str, Any], unconscious: Dict[str, Any]
) -> Dict[str, Any]:
    """Calculate the Activation Sequence - your core transformation"""
    try:
        # Life Work (Conscious Sun)
        life_work_gate = conscious.get("sun", {}).get("gate", 1)

        # Evolution (Conscious Earth)
        evolution_gate = conscious.get("earth", {}).get("gate", 1)

        # Radiance (Unconscious Sun)
        radiance_gate = unconscious.get("sun", {}).get("gate", 1)

        # Purpose (Unconscious Earth)
        purpose_gate = unconscious.get("earth", {}).get("gate", 1)

        return {
            "name": "Activation Sequence",
            "description": "Your core wound and gift - the foundation of your transformation",
            "life_work": get_gene_key_details(life_work_gate),
            "evolution": get_gene_key_details(evolution_gate),
            "radiance": get_gene_key_details(radiance_gate),
            "purpose": get_gene_key_details(purpose_gate),
            "theme": "From Core Wound to Life Purpose",
        }
    except Exception as e:
        logger.error(f"Error calculating activation sequence: {str(e)}")
        return {"error": "Failed to calculate activation sequence"}


def calculate_venus_sequence(
    conscious: Dict[str, Any], unconscious: Dict[str, Any]
) -> Dict[str, Any]:
    """Calculate the Venus Sequence - relationships and love"""
    try:
        # Attraction (Unconscious Moon)
        attraction_gate = unconscious.get("moon", {}).get("gate", 1)
        attraction_line = unconscious.get("moon", {}).get("line", 1)

        # IQ (Conscious Venus)
        iq_gate = conscious.get("venus", {}).get("gate", 1)
        iq_line = conscious.get("venus", {}).get("line", 1)

        # EQ (Conscious Mars)
        eq_gate = conscious.get("mars", {}).get("gate", 1)
        eq_line = conscious.get("mars", {}).get("line", 1)

        # SQ (Unconscious Venus)
        sq_gate = unconscious.get("venus", {}).get("gate", 1)
        sq_line = unconscious.get("venus", {}).get("line", 1)

        # Core Wound (Unconscious Mars)
        core_wound_gate = unconscious.get("mars", {}).get("gate", 1)
        core_wound_line = unconscious.get("mars", {}).get("line", 1)

        return {
            "name": "Venus Sequence",
            "description": "Your relationships and how you attract and give love",
            "attraction": get_gene_key_details(
                attraction_gate, attraction_line
            ),
            "iq": get_gene_key_details(iq_gate, iq_line, "iq"),
            "eq": get_gene_key_details(eq_gate, eq_line, "eq"),
            "sq": get_gene_key_details(sq_gate, sq_line, "sq"),
            "core_wound": get_gene_key_details(
                core_wound_gate, core_wound_line
            ),
            "theme": "The Art of Being in Relationship",
        }
    except Exception as e:
        logger.error(f"Error calculating venus sequence: {str(e)}")
        return {"error": "Failed to calculate venus sequence"}


def calculate_pearl_sequence(
    conscious: Dict[str, Any], unconscious: Dict[str, Any]
) -> Dict[str, Any]:
    """Calculate the Pearl Sequence - prosperity and abundance"""
    try:
        # Vocation (Conscious Moon)
        vocation_gate = conscious.get("moon", {}).get("gate", 1)

        # Culture (Unconscious Moon)
        culture_gate = unconscious.get("moon", {}).get("gate", 1)

        # Brand (Conscious Jupiter)
        brand_gate = conscious.get("jupiter", {}).get("gate", 1)

        # Pearl (Unconscious Jupiter)
        pearl_gate = unconscious.get("jupiter", {}).get("gate", 1)

        return {
            "name": "Pearl Sequence",
            "description": "Your prosperity and how you manifest abundance",
            "vocation": get_gene_key_details(vocation_gate),
            "culture": get_gene_key_details(culture_gate),
            "brand": get_gene_key_details(brand_gate),
            "pearl": get_gene_key_details(pearl_gate),
            "theme": "Manifesting Your Highest Prosperity",
        }
    except Exception as e:
        logger.error(f"Error calculating pearl sequence: {str(e)}")
        return {"error": "Failed to calculate pearl sequence"}


def calculate_hologenetic_profile(hd_data: Dict[str, Any]) -> Dict[str, Any]:
    """Calculate the Hologenetic Profile - your complete genetic makeup"""
    try:
        gates_array = hd_data.get("gates", [])

        # Convert gates array to conscious/unconscious structure
        conscious: Dict[str, Dict[str, int]] = {}
        unconscious: Dict[str, Dict[str, int]] = {}

        for gate in gates_array:
            planet = gate.get("planet", "")
            gate_number = gate.get("number", 1)
            gate_type = gate.get("type", "")
            line_number = gate.get("line", 1)

            if gate_type == "personality":  # Conscious
                conscious[planet] = {"gate": gate_number, "line": line_number}
            elif gate_type == "design":  # Unconscious
                unconscious[planet] = {
                    "gate": gate_number,
                    "line": line_number,
                }

        # All planetary gates
        planets = [
            "sun",
            "earth",
            "moon",
            "north_node",
            "south_node",
            "mercury",
            "venus",
            "mars",
            "jupiter",
            "saturn",
            "uranus",
            "neptune",
            "pluto",
        ]

        hologenetic: Dict[str, Any] = {
            "conscious": {},
            "unconscious": {},
            "all_gates": set(),
            "activated_centers": [],
            "genetic_codon_groups": {},
        }

        for planet in planets:
            if planet in conscious:
                gate_data = conscious[planet]
                gate = gate_data.get("gate", 1)
                line = gate_data.get("line", 1)
                hologenetic["conscious"][planet] = get_gene_key_details(
                    int(gate), int(line)
                )
                hologenetic["all_gates"].add(int(gate))

            if planet in unconscious:
                gate_data = unconscious[planet]
                gate = gate_data.get("gate", 1)
                line = gate_data.get("line", 1)
                hologenetic["unconscious"][planet] = get_gene_key_details(
                    int(gate), int(line)
                )
                hologenetic["all_gates"].add(int(gate))

        # Convert set to list for JSON serialization
        hologenetic["all_gates"] = list(hologenetic["all_gates"])

        return hologenetic

    except Exception as e:
        logger.error(f"Error calculating hologenetic profile: {str(e)}")
        return {"error": "Failed to calculate hologenetic profile"}


def calculate_golden_path(
    activation_sequence: Dict[str, Any],
) -> Dict[str, Any]:
    """Calculate the Golden Path - the journey of transformation"""
    try:
        if "error" in activation_sequence:
            return {
                "error": "Cannot calculate Golden Path without valid Activation Sequence"
            }

        life_work = activation_sequence.get("life_work", {})
        evolution = activation_sequence.get("evolution", {})

        return {
            "name": "Golden Path",
            "description": "Your personal journey from Shadow to Siddhi",
            "current_phase": "Shadow Integration",
            "shadow_work": {
                "primary_shadow": life_work.get("shadow", "Unknown"),
                "secondary_shadow": evolution.get("shadow", "Unknown"),
                "integration_practice": "Contemplation and awareness of reactive patterns",
            },
            "gift_emergence": {
                "primary_gift": life_work.get("gift", "Unknown"),
                "secondary_gift": evolution.get("gift", "Unknown"),
                "activation_practice": "Living your gifts in service to others",
            },
            "siddhi_realization": {
                "primary_siddhi": life_work.get("siddhi", "Unknown"),
                "secondary_siddhi": evolution.get("siddhi", "Unknown"),
                "embodiment_practice": "Surrender and divine service",
            },
            "guidance": "The Golden Path is walked step by step, through contemplation, living your gifts, and surrendering to your highest purpose.",
        }

    except Exception as e:
        logger.error(f"Error calculating golden path: {str(e)}")
        return {"error": "Failed to calculate golden path"}


def get_programming_partner(gate_number: int) -> int:
    """Get the programming partner gate (opposite in I Ching)"""
    # Programming partners are calculated based on I Ching opposites
    # This is a simplified calculation - full implementation would use hexagram structure
    if gate_number <= 32:
        return gate_number + 32
    else:
        return gate_number - 32


def get_sphere(gate_number: int) -> str:
    """Get the sphere (life area) this gate belongs to"""
    # Simplified sphere mapping - full implementation would use detailed Gene Keys mapping
    sphere_mapping = {
        range(1, 11): "Life Force",
        range(11, 21): "Relationships",
        range(21, 31): "Success",
        range(31, 41): "Service",
        range(41, 51): "Transformation",
        range(51, 65): "Illumination",
    }

    for gate_range, sphere in sphere_mapping.items():
        if gate_number in gate_range:
            return sphere

    return "Unknown"


def get_daily_contemplation(gene_key_number: int) -> Dict[str, Any]:
    """Get daily contemplation guidance for a specific Gene Key"""
    key_data = GENE_KEYS.get(gene_key_number, {})

    if not key_data:
        return {"error": "Gene Key not found"}

    return {
        "gene_key": gene_key_number,
        "name": key_data.get("name", ""),
        "focus": f"Contemplating the path from {key_data.get('shadow', '')} through {key_data.get('gift', '')} to {key_data.get('siddhi', '')}",
        "contemplation": {
            "shadow_inquiry": f"How does {key_data.get('shadow', '')} show up in my life today?",
            "gift_affirmation": f"I embody {key_data.get('gift', '')} in all my interactions",
            "siddhi_meditation": f"I am one with {key_data.get('siddhi', '')}",
            "daily_practice": f"Today I contemplate the frequency of {key_data.get('name', '')}",
        },
        "keynote": key_data.get("keynote", ""),
        "guidance": "Spend 10-15 minutes in quiet contemplation, allowing these frequencies to move through your awareness.",
    }
