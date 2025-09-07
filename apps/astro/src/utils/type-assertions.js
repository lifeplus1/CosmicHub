/**
 * Type assertion utilities to bridge backend/frontend type gaps
 * Following Type Bridge System principles for gradual migration
 * TODO: Remove these once backend types are fully aligned with frontend
 */
// Type guards for runtime validation
export function isPlanetLike(obj) {
    return obj !== null && typeof obj === 'object' && !Array.isArray(obj);
}
export function isAspectLike(obj) {
    return obj !== null && typeof obj === 'object' && !Array.isArray(obj);
}
export function isHouseLike(obj) {
    return obj !== null && typeof obj === 'object' && !Array.isArray(obj);
}
// Validation arrays for type safety
const VALID_PLANET_NAMES = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];
const VALID_ZODIAC_SIGNS = ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'];
const VALID_ASPECT_TYPES = ['conjunction', 'opposition', 'trine', 'square', 'sextile', 'quincunx', 'semi-sextile', 'semi-square', 'sesquiquadrate'];
const VALID_DIGNITIES = ['domicile', 'exaltation', 'fall', 'detriment'];
const VALID_ELEMENTS = ['fire', 'earth', 'air', 'water'];
const VALID_MODALITIES = ['cardinal', 'fixed', 'mutable'];
const VALID_HOUSE_POSITIONS = ['early', 'middle', 'late'];
// Type guard functions for validation
function isValidPlanetName(name) {
    return VALID_PLANET_NAMES.includes(name);
}
function isValidZodiacSign(sign) {
    return VALID_ZODIAC_SIGNS.includes(sign);
}
function isValidAspectType(type) {
    return VALID_ASPECT_TYPES.includes(type);
}
function isValidDignity(dignity) {
    return VALID_DIGNITIES.includes(dignity);
}
function isValidElement(element) {
    return VALID_ELEMENTS.includes(element);
}
function isValidModality(modality) {
    return VALID_MODALITIES.includes(modality);
}
function isValidHousePosition(position) {
    return VALID_HOUSE_POSITIONS.includes(position);
}
/**
 * Safely convert any planet-like object to a valid Planet
 * Provides defaults for required fields that might be missing from backend
 * @throws {Error} If input cannot be converted to a valid Planet
 */
export function assertPlanetType(obj) {
    if (!isPlanetLike(obj)) {
        throw new Error(`Invalid planet data: expected object, got ${typeof obj}`);
    }
    const name = typeof obj.name === 'string' ? obj.name.toLowerCase() : 'sun';
    const planetName = isValidPlanetName(name) ? name : 'sun';
    // Type-safe dignity validation
    const dignity = typeof obj.dignity === 'string' && isValidDignity(obj.dignity)
        ? obj.dignity
        : undefined;
    // Type-safe element validation
    const element = typeof obj.element === 'string' && isValidElement(obj.element)
        ? obj.element
        : undefined;
    // Type-safe modality validation
    const modality = typeof obj.modality === 'string' && isValidModality(obj.modality)
        ? obj.modality
        : undefined;
    // Type-safe house position validation
    const housePosition = typeof obj.house_position === 'string' && isValidHousePosition(obj.house_position)
        ? obj.house_position
        : undefined;
    // Type-safe zodiac sign validation
    const signStr = typeof obj.sign === 'string' ? obj.sign.toLowerCase() : 'aries';
    const sign = isValidZodiacSign(signStr) ? signStr : 'aries';
    return {
        name: planetName,
        position: Number(obj.position) || 0,
        degree: Number(obj.degree) ?? Number(obj.position) ?? 0,
        sign,
        house: typeof obj.house === 'string' ? (parseInt(obj.house, 10) || 1) : (Number(obj.house) || 1),
        retrograde: Boolean(obj.retrograde),
        speed: Number(obj.speed) || 0,
        dignity,
        essential_dignity: typeof obj.essential_dignity === 'number' ? obj.essential_dignity : undefined,
        aspects: Array.isArray(obj.aspects) ? obj.aspects : [],
        element,
        modality,
        house_position: housePosition
    };
}
// Default planet factory for invalid inputs (reserved for future use)
// eslint-disable-next-line no-unused-vars
function __getDefaultPlanet() {
    return {
        name: 'sun',
        position: 0,
        degree: 0,
        sign: 'aries',
        house: 1,
        retrograde: false,
        speed: 0,
        aspects: []
    };
}
/**
 * Safely convert any aspect-like object to a valid Aspect
 * @throws {Error} If input cannot be converted to a valid Aspect
 */
export function assertAspectType(obj) {
    if (!isAspectLike(obj)) {
        throw new Error(`Invalid aspect data: expected object, got ${typeof obj}`);
    }
    // Type-safe aspect type validation
    const aspectType = typeof obj.aspect_type === 'string' ? obj.aspect_type.toLowerCase()
        : typeof obj.type === 'string' ? obj.type.toLowerCase()
            : 'conjunction';
    const validAspectType = isValidAspectType(aspectType) ? aspectType : 'conjunction';
    // Type-safe planet name validation
    const planet1Str = typeof obj.planet1 === 'string' ? obj.planet1.toLowerCase()
        : typeof obj.point1 === 'string' ? obj.point1.toLowerCase()
            : 'sun';
    const planet2Str = typeof obj.planet2 === 'string' ? obj.planet2.toLowerCase()
        : typeof obj.point2 === 'string' ? obj.point2.toLowerCase()
            : 'moon';
    const planet1 = isValidPlanetName(planet1Str) ? planet1Str : 'sun';
    const planet2 = isValidPlanetName(planet2Str) ? planet2Str : 'moon';
    // Type-safe applying conversion
    const applying = typeof obj.applying === 'boolean' ? obj.applying
        : typeof obj.applying === 'string' ? (obj.applying.toLowerCase() === 'applying' || obj.applying.toLowerCase() === 'true')
            : false;
    // Type-safe dignity interaction validation
    const validDignityInteractions = ['enhancement', 'conflict', 'neutral'];
    function isValidDignityInteraction(value) {
        return validDignityInteractions.includes(value);
    }
    const dignityInteraction = typeof obj.dignity_interaction === 'string' && isValidDignityInteraction(obj.dignity_interaction)
        ? obj.dignity_interaction
        : undefined;
    // Type-safe timing validation
    const timing = obj.timing && typeof obj.timing === 'object' && obj.timing !== null
        ? obj.timing
        : undefined;
    return {
        aspect_type: validAspectType,
        planet1: planet1,
        planet2: planet2,
        orb: Number(obj.orb) || 0,
        applying,
        exact: Boolean(obj.exact),
        power: Number(obj.power) || 0.5,
        aspect_angle: Number(obj.aspect_angle) || 0,
        separating: typeof obj.separating === 'boolean' ? obj.separating : undefined,
        mutual_reception: typeof obj.mutual_reception === 'boolean' ? obj.mutual_reception : undefined,
        dignity_interaction: dignityInteraction,
        timing
    };
}
/**
 * Safely convert any house-like object to a valid House
 * @throws {Error} If input cannot be converted to a valid House
 */
export function assertHouseType(obj) {
    if (!isHouseLike(obj)) {
        throw new Error(`Invalid house data: expected object, got ${typeof obj}`);
    }
    const houseNum = typeof obj.house === 'number' ? obj.house
        : typeof obj.number === 'number' ? obj.number
            : typeof obj.house === 'string' ? parseInt(obj.house, 10)
                : typeof obj.number === 'string' ? parseInt(obj.number, 10)
                    : 1;
    const clampedHouseNum = Math.max(1, Math.min(12, houseNum));
    // Type-safe zodiac sign validation
    const signStr = typeof obj.sign === 'string' ? obj.sign.toLowerCase() : 'aries';
    const sign = isValidZodiacSign(signStr) ? signStr : 'aries';
    // Type-safe planet name validation for rulers
    const rulerStr = typeof obj.ruler === 'string' ? obj.ruler.toLowerCase() : '';
    const ruler = isValidPlanetName(rulerStr) ? rulerStr : undefined;
    const modernRulerStr = typeof obj.modern_ruler === 'string' ? obj.modern_ruler.toLowerCase() : '';
    const modernRuler = isValidPlanetName(modernRulerStr) ? modernRulerStr : undefined;
    // Type-safe planets array validation
    const containsPlanets = Array.isArray(obj.contains_planets)
        ? obj.contains_planets
            .filter((p) => typeof p === 'string' && isValidPlanetName(p.toLowerCase()))
            .map((p) => p.toLowerCase())
        : [];
    return {
        number: clampedHouseNum,
        cusp: Number(obj.cusp) || Number(obj.degree) || 0,
        sign,
        ruler: ruler,
        modern_ruler: modernRuler,
        degree: Number(obj.degree) || Number(obj.cusp) || 0,
        size: Number(obj.size) || 30,
        contains_planets: containsPlanets
    };
}
//# sourceMappingURL=type-assertions.js.map