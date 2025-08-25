# backend/astro/calculations/synastry.py
import logging
from typing import Any, Dict, List

from .chart import calculate_chart

logger = logging.getLogger(__name__)


def calculate_angle_between_points(pos1: float, pos2: float) -> float:
    """Calculate the angle between two planetary positions"""
    diff = abs(pos1 - pos2)
    return min(diff, 360 - diff)


def get_composite_chart(
    chart1: Dict[str, Any], chart2: Dict[str, Any]
) -> Dict[str, Any]:
    """Calculate composite chart - midpoints between all planetary positions"""
    try:
        composite_planets = {}

        for planet in chart1.get("planets", {}):
            if planet in chart2.get("planets", {}):
                pos1 = chart1["planets"][planet]["position"]
                pos2 = chart2["planets"][planet]["position"]

                # Calculate midpoint, considering the shorter arc
                diff = abs(pos1 - pos2)
                if diff > 180:
                    # Use the longer arc, then take midpoint
                    midpoint = ((pos1 + pos2 + 360) / 2) % 360
                else:
                    midpoint = (pos1 + pos2) / 2

                composite_planets[planet] = {
                    "position": midpoint,
                    "retrograde": False,  # Composite doesn't have retrograde
                }

        return {
            "planets": composite_planets,
            "description": "Composite chart represents the relationship itself as an entity",  # noqa: E501
        }
    except Exception as e:
        logger.error(f"Error calculating composite chart: {str(e)}")
        return {"error": "Failed to calculate composite chart"}


def analyze_interaspects(
    chart1: Dict[str, Any], chart2: Dict[str, Any]
) -> List[Dict[str, Any]]:
    """Analyze aspects between two charts (cross-aspects)"""
    try:
        interaspects: List[Dict[str, Any]] = []

        # Aspect definitions with orbs
        aspects = [
            (0, "Conjunction", 8),
            (60, "Sextile", 6),
            (90, "Square", 8),
            (120, "Trine", 8),
            (180, "Opposition", 8),
        ]

        planets1 = chart1.get("planets", {})
        planets2 = chart2.get("planets", {})

        for planet1, data1 in planets1.items():
            for planet2, data2 in planets2.items():
                pos1 = data1["position"]
                pos2 = data2["position"]

                angle = calculate_angle_between_points(pos1, pos2)

                for aspect_angle, aspect_name, orb in aspects:
                    if abs(angle - aspect_angle) <= orb:
                        orb_exact = abs(angle - aspect_angle)

                        # Get interpretation
                        interpretation = get_synastry_interpretation(
                            planet1, planet2, aspect_name
                        )

                        interaspects.append(
                            {
                                "person1_planet": planet1,
                                "person2_planet": planet2,
                                "aspect": aspect_name,
                                "orb": orb_exact,
                                "strength": (
                                    "Strong"
                                    if orb_exact <= 3
                                    else (
                                        "Moderate"
                                        if orb_exact <= 6
                                        else "Weak"
                                    )
                                ),
                                "interpretation": interpretation,
                                "person1_position": pos1,
                                "person2_position": pos2,
                            }
                        )

        # Sort by orb (most exact first)
        interaspects.sort(key=lambda x: x["orb"])

        return interaspects[:20]  # Return top 20 most exact aspects

    except Exception as e:
        logger.error(f"Error analyzing interaspects: {str(e)}")
        return []


def get_synastry_interpretation(
    planet1: str, planet2: str, aspect: str
) -> str:
    """Get interpretation for synastry aspects"""
    interpretations = {
        # Sun aspects
        (
            "sun",
            "sun",
            "Conjunction",
        ): "Strong ego connection, similar life purposes, potential for mutual recognition",  # noqa: E501
        (
            "sun",
            "moon",
            "Conjunction",
        ): "Deep emotional understanding, man represents woman's ideal, powerful attraction",  # noqa: E501
        (
            "sun",
            "moon",
            "Trine",
        ): "Natural harmony between masculine and feminine energies, supportive relationship",  # noqa: E501
        (
            "sun",
            "moon",
            "Square",
        ): "Tension between ego and emotions, challenging but potentially transformative",  # noqa: E501
        (
            "sun",
            "venus",
            "Conjunction",
        ): "Strong romantic attraction, appreciation for each other's creativity",  # noqa: E501
        (
            "sun",
            "mars",
            "Conjunction",
        ): "Intense physical attraction, potential for conflict or dynamic action together",  # noqa: E501
        # Moon aspects
        (
            "moon",
            "moon",
            "Conjunction",
        ): "Deep emotional understanding, similar emotional needs and responses",  # noqa: E501
        (
            "moon",
            "venus",
            "Trine",
        ): "Natural affection, emotional harmony, nurturing love",
        (
            "moon",
            "mars",
            "Square",
        ): "Emotional volatility, passionate but potentially explosive dynamics",  # noqa: E501
        # Venus aspects
        (
            "venus",
            "venus",
            "Conjunction",
        ): "Shared values in love and beauty, similar romantic expressions",
        (
            "venus",
            "mars",
            "Conjunction",
        ): "Classic romantic and sexual attraction, complementary energies",
        (
            "venus",
            "mars",
            "Square",
        ): "Intense sexual chemistry with potential for relationship drama",
        # Mars aspects
        (
            "mars",
            "mars",
            "Conjunction",
        ): "Shared drive and energy, potential for both cooperation and competition",  # noqa: E501
        # Mercury aspects
        (
            "mercury",
            "mercury",
            "Conjunction",
        ): "Mental compatibility, easy communication and understanding",
        (
            "sun",
            "mercury",
            "Conjunction",
        ): "Good intellectual connection, stimulating conversations",
        # Jupiter aspects
        (
            "sun",
            "jupiter",
            "Trine",
        ): "Mutual growth, optimism, beneficial influence on each other",
        (
            "moon",
            "jupiter",
            "Trine",
        ): "Emotional expansion, generosity, protective feelings",
        # Saturn aspects
        (
            "sun",
            "saturn",
            "Conjunction",
        ): "Serious relationship potential, maturity, possible restrictions",
        (
            "moon",
            "saturn",
            "Square",
        ): "Emotional limitation, need for patience and commitment",
        # Outer planet aspects
        (
            "sun",
            "uranus",
            "Conjunction",
        ): "Exciting, unpredictable connection, catalyst for change",
        (
            "venus",
            "neptune",
            "Trine",
        ): "Romantic idealization, spiritual love, artistic inspiration",
        (
            "mars",
            "pluto",
            "Square",
        ): "Intense power struggles, transformative but potentially destructive",  # noqa: E501
    }

    # Try to find specific interpretation
    key = (planet1.lower(), planet2.lower(), aspect)
    if key in interpretations:
        return interpretations[key]

    # Try reverse order
    key_reverse = (planet2.lower(), planet1.lower(), aspect)
    if key_reverse in interpretations:
        return interpretations[key_reverse]

    # Generic interpretation based on aspect
    generic_aspects = {
        "Conjunction": f"{planet1.title()} and {planet2.title()} blend energies - intense connection",  # noqa: E501
        "Trine": f"{planet1.title()} and {planet2.title()} flow harmoniously - supportive aspect",  # noqa: E501
        "Sextile": f"{planet1.title()} and {planet2.title()} create opportunities - positive aspect",  # noqa: E501
        "Square": f"{planet1.title()} and {planet2.title()} create tension - challenging but growth-oriented",  # noqa: E501
        "Opposition": f"{planet1.title()} and {planet2.title()} oppose - need for balance and integration",  # noqa: E501
    }

    return generic_aspects.get(
        aspect,
        f"{planet1.title()} {aspect.lower()} {planet2.title()} - significant connection",  # noqa: E501
    )


def analyze_compatibility_score(
    interaspects: List[Dict[str, Any]],
) -> Dict[str, Any]:
    """Calculate overall compatibility score and breakdown"""
    try:
        if not interaspects:
            return {
                "overall_score": 0,
                "breakdown": {},
                "interpretation": "No significant aspects found",
            }

        scores = {
            "romantic": 0.0,
            "emotional": 0.0,
            "mental": 0.0,
            "physical": 0.0,
            "spiritual": 0.0,
        }

        weights = {
            "Conjunction": 10,
            "Trine": 8,
            "Sextile": 6,
            "Square": -4,
            "Opposition": -2,
        }

        for aspect in interaspects:
            planet1 = aspect["person1_planet"]
            planet2 = aspect["person2_planet"]
            aspect_type = aspect["aspect"]
            strength = aspect["strength"]

            # Base weight by aspect type
            base_weight = weights.get(aspect_type, 0)

            # Adjust by strength
            strength_multiplier = {
                "Strong": 1.0,
                "Moderate": 0.7,
                "Weak": 0.4,
            }.get(strength, 0.5)
            adjusted_weight = base_weight * strength_multiplier

            # Categorize by planet combinations
            planets = sorted([planet1, planet2])

            if any(p in ["sun", "moon", "venus", "mars"] for p in planets):
                if "venus" in planets or "mars" in planets:
                    scores["romantic"] += adjusted_weight
                if "sun" in planets or "moon" in planets:
                    scores["emotional"] += adjusted_weight
                if "mars" in planets:
                    scores["physical"] += adjusted_weight

            if "mercury" in planets:
                scores["mental"] += adjusted_weight

            if any(
                p in ["jupiter", "saturn", "uranus", "neptune", "pluto"]
                for p in planets
            ):
                scores["spiritual"] += adjusted_weight

        # Normalize scores to 0-100 scale
        max_possible = len(interaspects) * 10
        if max_possible > 0:
            for category in scores:
                scores[category] = max(
                    0, min(100, (scores[category] / max_possible) * 100 + 50)
                )

        overall_score = sum(scores.values()) / len(scores)

        # Generate interpretation
        if overall_score >= 80:
            interpretation = "Excellent compatibility - strong potential for lasting relationship"  # noqa: E501
        elif overall_score >= 70:
            interpretation = (
                "Very good compatibility - many harmonious aspects"
            )
        elif overall_score >= 60:
            interpretation = (
                "Good compatibility - solid foundation with some challenges"
            )
        elif overall_score >= 50:
            interpretation = (
                "Moderate compatibility - requires work and understanding"
            )
        else:
            interpretation = "Challenging compatibility - significant effort needed for harmony"  # noqa: E501

        return {
            "overall_score": round(overall_score, 1),
            "breakdown": {k: round(v, 1) for k, v in scores.items()},
            "interpretation": interpretation,
            "strongest_area": max(scores.keys(), key=lambda k: scores[k]),
            "weakest_area": min(scores.keys(), key=lambda k: scores[k]),
        }

    except Exception as e:
        logger.error(f"Error calculating compatibility score: {str(e)}")
        return {
            "overall_score": 0,
            "breakdown": {},
            "interpretation": "Error calculating compatibility",
        }


def calculate_synastry_chart(
    person1_data: Dict[str, Any], person2_data: Dict[str, Any]
) -> Dict[str, Any]:
    """Calculate complete synastry analysis between two birth charts"""
    try:
        # Calculate individual charts
        chart1 = calculate_chart(
            person1_data["year"],
            person1_data["month"],
            person1_data["day"],
            person1_data["hour"],
            person1_data["minute"],
            person1_data.get("lat"),
            person1_data.get("lon"),
            person1_data.get("timezone"),
            person1_data.get("city"),
        )

        chart2 = calculate_chart(
            person2_data["year"],
            person2_data["month"],
            person2_data["day"],
            person2_data["hour"],
            person2_data["minute"],
            person2_data.get("lat"),
            person2_data.get("lon"),
            person2_data.get("timezone"),
            person2_data.get("city"),
        )

        # Analyze interaspects
        interaspects = analyze_interaspects(chart1, chart2)

        # Calculate composite chart
        composite = get_composite_chart(chart1, chart2)

        # Calculate compatibility score
        compatibility = analyze_compatibility_score(interaspects)

        # Analyze house overlays (person1's planets in person2's houses)
        house_overlays = analyze_house_overlays(chart1, chart2)

        return {
            "person1_chart": chart1,
            "person2_chart": chart2,
            "interaspects": interaspects,
            "composite_chart": composite,
            "compatibility_analysis": compatibility,
            "house_overlays": house_overlays,
            "summary": {
                "total_aspects": len(interaspects),
                "strongest_connections": interaspects[:5],  # Top 5 aspects
                "overall_rating": compatibility["overall_score"],
                "key_themes": generate_relationship_themes(
                    interaspects, compatibility
                ),
            },
        }

    except Exception as e:
        logger.error(f"Error calculating synastry chart: {str(e)}")
        return {"error": f"Failed to calculate synastry: {str(e)}"}


def analyze_house_overlays(
    chart1: Dict[str, Any], chart2: Dict[str, Any]
) -> List[Dict[str, Any]]:
    """Analyze how person1's planets fall into person2's houses"""
    try:
        overlays: List[Dict[str, Any]] = []

        planets1 = chart1.get("planets", {})
        houses2 = chart2.get("houses", [])

        if not houses2:
            return []

        for planet, data in planets1.items():
            planet_position = data["position"]

            # Find which house this planet falls into
            house_number = 1
            for i, house in enumerate(houses2):
                start = house["cusp"]
                end = houses2[(i + 1) % len(houses2)]["cusp"]

                if start < end:
                    if start <= planet_position < end:
                        house_number = i + 1
                        break
                else:  # House crosses 0°
                    if planet_position >= start or planet_position < end:
                        house_number = i + 1
                        break

            # Get interpretation
            interpretation = get_house_overlay_interpretation(
                planet, house_number
            )

            overlays.append(
                {
                    "planet": planet,
                    "house": house_number,
                    "interpretation": interpretation,
                }
            )

        return overlays

    except Exception as e:
        logger.error(f"Error analyzing house overlays: {str(e)}")
        return []


def get_house_overlay_interpretation(planet: str, house: int) -> str:
    """Get interpretation for planet in house overlay"""
    interpretations = {
        ("sun", 1): "Strong personal identification, you see yourself in them",
        ("sun", 5): "Brings fun, creativity, and romance to their life",
        ("sun", 7): "Natural partnership energy, you complement each other",
        ("sun", 10): "You admire their achievements and public image",
        ("moon", 4): "Deep emotional security and home connection",
        ("moon", 7): "Emotional partnership, you nurture their relationships",
        ("moon", 8): "Intense emotional transformation and intimacy",
        ("moon", 12): "Subconscious emotional connection, karmic bond",
        (
            "venus",
            2,
        ): "You value their resources and bring beauty to their possessions",
        ("venus", 5): "Romance, creativity, and joy in their self-expression",
        ("venus", 7): "Classic marriage and partnership placement",
        ("venus", 8): "Deep, transformative love and shared resources",
        ("mars", 1): "You energize their personality and identity",
        ("mars", 3): "Stimulating communication and local activities",
        ("mars", 5): "Passionate, playful energy in romance and creativity",
        ("mars", 8): "Intense sexual and transformational energy",
    }

    key = (planet.lower(), house)
    if key in interpretations:
        return interpretations[key]

    # Generic interpretations by house
    house_meanings = {
        1: f"{planet.title()} influences their identity and first impressions",
        2: f"{planet.title()} affects their values and resources",
        3: f"{planet.title()} impacts their communication and daily life",
        4: f"{planet.title()} influences their home and emotional foundation",
        5: f"{planet.title()} brings energy to their creativity and romance",
        6: f"{planet.title()} affects their daily routine and health",
        7: f"{planet.title()} influences their partnerships and relationships",
        8: f"{planet.title()} brings transformation and shared resources",
        9: f"{planet.title()} expands their beliefs and higher learning",
        10: f"{planet.title()} impacts their career and public image",
        11: f"{planet.title()} influences their friendships and future goals",
        12: f"{planet.title()} affects their subconscious and spiritual life",
    }

    return house_meanings.get(
        house, f"{planet.title()} has an influence in their {house}th house"
    )


def generate_relationship_themes(
    interaspects: List[Dict[str, Any]], compatibility: Dict[str, Any]
) -> List[str]:
    """Generate key themes for the relationship"""
    themes: List[str] = []

    if not interaspects:
        return ["No significant astrological connections found"]

    # Analyze by strongest aspects
    strong_aspects = [a for a in interaspects if a["strength"] == "Strong"]

    if strong_aspects:
        # Look for romantic themes
        romantic_planets = ["sun", "moon", "venus", "mars"]
        romantic_aspects = [
            a
            for a in strong_aspects
            if a["person1_planet"] in romantic_planets
            or a["person2_planet"] in romantic_planets
        ]

        if romantic_aspects:
            themes.append("Strong romantic and emotional connection")

        # Look for mental compatibility
        mercury_aspects = [
            a
            for a in strong_aspects
            if "mercury" in [a["person1_planet"], a["person2_planet"]]
        ]
        if mercury_aspects:
            themes.append("Excellent mental and communication compatibility")

        # Look for challenges
        challenging_aspects = [
            a for a in interaspects if a["aspect"] in ["Square", "Opposition"]
        ]
        if len(challenging_aspects) > len(strong_aspects):
            themes.append(
                "Relationship requires work and mutual understanding"
            )

    # Analyze compatibility breakdown
    breakdown = compatibility.get("breakdown", {})
    if breakdown:
        strongest = compatibility.get("strongest_area", "")
        if strongest:
            themes.append(f"Particularly strong {strongest} compatibility")

    # Add overall theme based on score
    score = compatibility.get("overall_score", 0)
    if score >= 70:
        themes.append("Natural harmony and mutual support")
    elif score >= 50:
        themes.append("Balanced relationship with growth potential")
    else:
        themes.append("Significant challenges that can lead to growth")

    return themes[:5]  # Return top 5 themes


def get_element_compatibility(
    chart1: Dict[str, Any], chart2: Dict[str, Any]
) -> Dict[str, Any]:
    """Analyze elemental compatibility between charts"""
    try:
        elements = {"Fire": 0, "Earth": 0, "Air": 0, "Water": 0}
        sign_elements = {
            0: "Fire",
            1: "Earth",
            2: "Air",
            3: "Water",  # Aries, Taurus, Gemini, Cancer
            4: "Fire",
            5: "Earth",
            6: "Air",
            7: "Water",  # Leo, Virgo, Libra, Scorpio
            8: "Fire",
            9: "Earth",
            10: "Air",
            11: "Water",  # Sagittarius, Capricorn, Aquarius, Pisces
        }

        # Count elements for both charts
        chart1_elements = elements.copy()
        chart2_elements = elements.copy()

        for chart, element_count in [
            (chart1, chart1_elements),
            (chart2, chart2_elements),
        ]:
            for planet_data in chart.get("planets", {}).values():
                sign_index = int(planet_data["position"] // 30)
                element = sign_elements.get(sign_index, "Fire")
                element_count[element] += 1

        # Calculate compatibility
        total_harmony = 0
        for element in elements:
            # Same element = harmony, opposite element = challenge
            opposite = {
                "Fire": "Air",
                "Air": "Fire",
                "Earth": "Water",
                "Water": "Earth",
            }
            if chart1_elements[element] > 0 and chart2_elements[element] > 0:
                total_harmony += (
                    min(chart1_elements[element], chart2_elements[element]) * 2
                )
            elif (
                chart1_elements[element] > 0
                and chart2_elements.get(opposite.get(element, ""), 0) > 0
            ):
                total_harmony += (
                    min(
                        chart1_elements[element],
                        chart2_elements[opposite[element]],
                    )
                    * 1
                )

        return {
            "person1_elements": chart1_elements,
            "person2_elements": chart2_elements,
            "harmony_score": total_harmony,
            "analysis": f"Element harmony score: {total_harmony}/20",
        }

    except Exception as e:
        logger.error(f"Error analyzing element compatibility: {str(e)}")
        return {"error": "Failed to analyze elemental compatibility"}
