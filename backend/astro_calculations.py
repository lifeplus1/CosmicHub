import swisseph as swe
from datetime import datetime
import pytz
from geopy.geocoders import Nominatim
from timezonefinder import TimezoneFinder
import logging
import os

logger = logging.getLogger(__name__)

signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces']

def get_location(city, cities):
    logger.debug(f"Looking up location for city: {city}")
    if city in cities:
        logger.debug(f"Found city in cities.json: {cities[city]}")
        return cities[city]
    geolocator = Nominatim(user_agent="astrology_app")
    location = geolocator.geocode(city)
    if not location:
        logger.error(f"City not found: {city}")
        raise ValueError(f"City not found: {city}")
    tf = TimezoneFinder()
    timezone = tf.timezone_at(lat=location.latitude, lng=location.longitude)
    if not timezone:
        logger.error(f"Timezone not found for {city}")
        raise ValueError(f"Timezone not found for {city}")
    result = {
        "city": city,
        "latitude": location.latitude,
        "longitude": location.longitude,
        "timezone": timezone
    }
    logger.debug(f"Resolved location: {result}")
    return result

def calculate_house(lon, houses):
    for i, house in enumerate(houses):
        cusp = house["cusp_degrees"]
        next_cusp = houses[(i + 1) % 12]["cusp_degrees"]
        if next_cusp < cusp:  # Handle wrap-around at 360°
            if lon >= cusp or lon < next_cusp:
                return i + 1
        else:
            if cusp <= lon < next_cusp:
                return i + 1
    logger.warning(f"Could not determine house for longitude {lon}")
    return 1

def calculate_aspects(planets, angles=None):
    aspects = []
    all_points = {**planets}
    if angles:
        all_points.update(angles)
    aspect_types = [
        (0, "Conjunction", 10),
        (60, "Sextile", 6),
        (90, "Square", 8),
        (120, "Trine", 8),
        (180, "Opposition", 10)
    ]
    points = list(all_points.keys())
    for i, point1 in enumerate(points):
        for point2 in points[i+1:]:
            lon1 = all_points[point1]["lon"]
            lon2 = all_points[point2]["lon"]
            diff = abs(lon1 - lon2)
            if diff > 180:
                diff = 360 - diff
            for angle, aspect_name, orb in aspect_types:
                if abs(diff - angle) <= orb:
                    aspects.append({
                        "point1": point1,
                        "point2": point2,
                        "aspect": aspect_name,
                        "orb": abs(diff - angle)
                    })
    logger.debug(f"Calculated aspects: {aspects}")
    return aspects

def calculate_chart(year, month, day, hour, minute, lat, lon, timezone):
    logger.debug(f"Calculating chart for {year}-{month}-{day} {hour}:{minute} at {lat}, {lon}, {timezone}")
    ephe_path = './ephe'
    if not os.path.exists(ephe_path):
        logger.error(f"Ephemeris path {ephe_path} does not exist")
        raise FileNotFoundError(f"Ephemeris path {ephe_path} not found")
    swe.set_ephe_path(ephe_path)
    logger.debug(f"Set ephemeris path: {ephe_path}")

    try:
        tz = pytz.timezone(timezone)
        dt = datetime(year, month, day, hour, minute)
        dt_utc = tz.localize(dt).astimezone(pytz.UTC)
        logger.debug(f"UTC datetime: {dt_utc}")
        jd = swe.utc_to_jd(dt_utc.year, dt_utc.month, dt_utc.day, dt_utc.hour, dt_utc.minute, dt_utc.second, 1)
        if jd[0] != 0:
            logger.error(f"Invalid Julian day: {jd}")
            raise ValueError("Invalid date for Julian day calculation")
        jd = jd[1]
        logger.debug(f"Julian day: {jd}")
    except Exception as e:
        logger.error(f"Failed to calculate Julian day: {str(e)}")
        raise

    try:
        houses_cusps, ascmc = swe.houses(jd, lat, lon, b'P')
        houses = []
        for i, cusp in enumerate(houses_cusps):
            houses.append({
                "house": i + 1,
                "cusp": f"{int(cusp % 30)}°{signs[int(cusp / 30)]}{int((cusp % 30 - int(cusp % 30)) * 60)}'",
                "sign": signs[int(cusp / 30)],
                "cusp_degrees": cusp
            })
        logger.debug(f"Houses: {houses}")
    except Exception as e:
        logger.error(f"Failed to calculate houses: {str(e)}")
        raise

    planets = {}
    planet_ids = [
        (swe.SUN, "Sun"), (swe.MOON, "Moon"), (swe.MERCURY, "Mercury"), (swe.VENUS, "Venus"),
        (swe.MARS, "Mars"), (swe.JUPITER, "Jupiter"), (swe.SATURN, "Saturn"), (swe.URANUS, "Uranus"),
        (swe.NEPTUNE, "Neptune"), (swe.PLUTO, "Pluto"), (swe.CHIRON, "Chiron"),
        (swe.TRUE_NODE, "North Node")
    ]
    try:
        for planet_id, name in planet_ids:
            result = swe.calc_ut(jd, planet_id)
            lon = result[0]
            sign = signs[int(lon / 30)]
            house = calculate_house(lon, houses)
            retrograde = result[3] < 0 if len(result) > 3 else False
            planets[name] = {
                "position": f"{int(lon % 30)}°{sign}{int((lon % 30 - int(lon % 30)) * 60)}'",
                "sign": sign,
                "house": house,
                "retrograde": retrograde,
                "lon": lon
            }
            logger.debug(f"{name}: {planets[name]}")
        # South Node is opposite North Node
        north_node_lon = planets["North Node"]["lon"]
        south_node_lon = (north_node_lon + 180) % 360
        planets["South Node"] = {
            "position": f"{int(south_node_lon % 30)}°{signs[int(south_node_lon / 30)]}{int((south_node_lon % 30 - int(south_node_lon % 30)) * 60)}'",
            "sign": signs[int(south_node_lon / 30)],
            "house": calculate_house(south_node_lon, houses),
            "retrograde": False,
            "lon": south_node_lon
        }
        logger.debug(f"South Node: {planets['South Node']}")
    except Exception as e:
        logger.error(f"Failed to calculate planets: {str(e)}")
        raise

    try:
        angles = {
            "Ascendant": {
                "lon": ascmc[0],
                "position": f"{int(ascmc[0] % 30)}°{signs[int(ascmc[0] / 30)]}{int((ascmc[0] % 30 - int(ascmc[0] % 30)) * 60)}'",
                "sign": signs[int(ascmc[0] / 30)],
                "house": 1
            },
            "Midheaven": {
                "lon": ascmc[1],
                "position": f"{int(ascmc[1] % 30)}°{signs[int(ascmc[1] / 30)]}{int((ascmc[1] % 30 - int(ascmc[1] % 30)) * 60)}'",
                "sign": signs[int(ascmc[1] / 30)],
                "house": 10
            }
        }
        logger.debug(f"Angles: {angles}")
    except Exception as e:
        logger.error(f"Failed to calculate angles: {str(e)}")
        raise

    try:
        aspects = calculate_aspects(planets, angles)
    except Exception as e:
        logger.error(f"Failed to calculate aspects: {str(e)}")
        raise

    result = {
        "resolved_location": {"latitude": lat, "longitude": lon, "timezone": timezone},
        "planets": planets,
        "houses": houses,
        "angles": angles,
        "aspects": aspects
    }
    logger.debug(f"Chart result: {result}")
    return result
