import { calculateHousePosition, getDegreeWithinSign, getRulerFromSign, getSignFromDegreesCapitalized, } from '../../utils/astrologyUtils';
import { assertPlanetType, assertAspectType, assertHouseType } from '../../utils/type-assertions';
// Helper to bridge between centralized utils and display components
const getSignFromDegree = getSignFromDegreesCapitalized;
export function isChartLike(obj) {
    if (obj === null || typeof obj !== 'object')
        return false;
    const c = obj;
    return ('planets' in c ||
        'houses' in c ||
        'aspects' in c ||
        'asteroids' in c ||
        'angles' in c ||
        'points' in c);
}
export function hasChartContent(chart) {
    return [
        chart.planets,
        chart.houses,
        chart.aspects,
        chart.asteroids,
        chart.angles,
        chart.points,
    ].some(section => {
        if (Array.isArray(section))
            return section.length > 0;
        return section !== null && section !== undefined;
    });
}
// Helpers -------------------------------------------------------
export const getAspectOrb = (aspectType, currentOrb) => {
    const aspectTypeLower = typeof aspectType === 'string' ? aspectType.toLowerCase() : '';
    if (currentOrb !== null &&
        currentOrb !== undefined &&
        Number.isNaN(currentOrb) === false)
        return currentOrb;
    if (aspectTypeLower.includes('conjunction') ||
        aspectTypeLower.includes('opposition'))
        return 10;
    return 8;
};
// Calculate which house a planet is in - helper that converts house objects to cusp array
const calculatePlanetHouse = (planetPosition, houses) => {
    if (houses.length === 0)
        return 1;
    // Extract cusp degrees from house objects
    const houseCusps = houses.map(h => h.cusp);
    return calculateHousePosition(planetPosition, houseCusps);
};
function __toPlanetArray(input, houses = []) {
    if (input === null || input === undefined)
        return [];
    if (Array.isArray(input))
        return input;
    if (typeof input === 'object') {
        return Object.entries(input).map(([name, data]) => {
            const pos = typeof data.position === 'number'
                ? data.position
                : typeof data.degree === 'number'
                    ? data.degree
                    : 0;
            const degWithinSign = pos % 30;
            const displaySign = data.sign ?? getSignFromDegree(pos);
            // Calculate house position if not provided
            const houseNumber = typeof data.house === 'number'
                ? data.house
                : typeof data.house === 'string' && !isNaN(Number(data.house))
                    ? Number(data.house)
                    : calculatePlanetHouse(pos, houses);
            return assertPlanetType({
                name: name,
                sign: displaySign,
                degree: degWithinSign,
                house: houseNumber,
                aspects: Array.isArray(data.aspects) ? data.aspects : [],
                position: pos,
                retrograde: Boolean(data.retrograde),
            });
        });
    }
    return [];
}
function __toHouseArray(input) {
    if (input === null || input === undefined)
        return [];
    const mapOne = (h, index) => {
        const cusp = typeof h.cusp === 'number'
            ? h.cusp
            : typeof h.degree === 'number'
                ? h.degree
                : typeof h === 'number'
                    ? h
                    : 0;
        const houseNumber = h.number ?? h.house ?? (index + 1) ?? 1;
        return assertHouseType({
            house: Number(houseNumber) || 1,
            number: Number(houseNumber) || 1,
            sign: h.sign ?? getSignFromDegree(cusp),
            degree: getDegreeWithinSign(cusp),
            cusp,
            ruler: h.ruler ?? getRulerFromSign(getSignFromDegree(cusp)),
        });
    };
    if (Array.isArray(input))
        return input.map(mapOne);
    if (typeof input === 'object') {
        return Object.entries(input).map(([key, house]) => {
            const houseNumber = key.replace('house_', '');
            const cusp = (typeof house === 'object' && house && typeof house.cusp === 'number')
                ? house.cusp
                : (typeof house === 'number' ? house : 0);
            return assertHouseType({
                house: Number(houseNumber.replace('house_', '')) || 1,
                number: Number(houseNumber.replace('house_', '')) || 1,
                cusp,
                sign: getSignFromDegree(cusp),
                degree: getDegreeWithinSign(cusp),
                ruler: getRulerFromSign(getSignFromDegree(cusp)),
            });
        });
    }
    return [];
}
function __toAspectArray(input) {
    if (input === null || input === undefined)
        return [];
    const mapOne = (a) => {
        // Try different field names that the API might use
        const type = a.type ?? a.aspect_type ?? a.aspect ?? 'Unknown';
        const rawOrb = typeof a.orb === 'number'
            ? a.orb
            : typeof a.orb === 'string'
                ? Number.isNaN(parseFloat(a.orb))
                    ? 0
                    : parseFloat(a.orb)
                : 0;
        const orb = getAspectOrb(type, rawOrb !== 0 ? rawOrb : undefined);
        return assertAspectType({
            type,
            planet1: a.planet1 ?? a.point1 ?? 'Unknown',
            planet2: a.planet2 ?? a.point2 ?? 'Unknown',
            orb,
            applying: a.applying ?? '',
        });
    };
    // Handle arrays (existing behavior)
    if (Array.isArray(input)) {
        return input.map(mapOne);
    }
    // Handle objects (new behavior to match toAsteroidArray pattern)
    if (typeof input === 'object') {
        return Object.values(input).map(mapOne);
    }
    return [];
}
function __toAsteroidArray(input, houses = []) {
    if (input === null || input === undefined)
        return [];
    if (Array.isArray(input)) {
        return input.map(a => ({
            name: a.name ?? 'Unknown',
            sign: a.sign ?? 'Unknown',
            degree: a.degree ?? 0,
            house: a.house ?? 'Unknown',
        }));
    }
    if (typeof input === 'object') {
        return Object.entries(input).map(([name, data]) => {
            const pos = typeof data.position === 'number'
                ? data.position
                : typeof data.degree === 'number'
                    ? data.degree
                    : 0;
            const degWithinSign = pos % 30;
            const displaySign = data.sign ?? getSignFromDegree(pos);
            // Calculate house position if not provided
            const houseNumber = typeof data.house === 'number'
                ? data.house
                : typeof data.house === 'string' && !isNaN(Number(data.house))
                    ? Number(data.house)
                    : calculatePlanetHouse(pos, houses);
            return {
                name: name.charAt(0).toUpperCase() + name.slice(1),
                sign: displaySign,
                degree: degWithinSign,
                house: houseNumber,
                position: pos,
            };
        });
    }
    return [];
}
function __toAngleArray(input) {
    if (Array.isArray(input))
        return input;
    if (input !== null && typeof input === 'object') {
        return Object.entries(input).map(([name, val]) => {
            let position = 0;
            if (typeof val === 'number')
                position = val;
            else if (typeof val === 'string')
                position = Number.isNaN(parseFloat(val)) ? 0 : parseFloat(val);
            else if (typeof val === 'object')
                position =
                    typeof val.position === 'number'
                        ? val.position
                        : typeof val.degree === 'number'
                            ? val.degree
                            : 0;
            const degree = parseFloat((position % 30).toFixed(2));
            return {
                name: name.charAt(0).toUpperCase() + name.slice(1),
                sign: getSignFromDegree(position),
                degree,
                position,
            };
        });
    }
    return [];
}
function __toPointArray(input, houses = []) {
    if (input === null || input === undefined)
        return [];
    if (Array.isArray(input))
        return input;
    if (typeof input === 'object') {
        return Object.entries(input).map(([name, data]) => {
            const pos = typeof data.position === 'number'
                ? data.position
                : typeof data.degree === 'number'
                    ? data.degree
                    : 0;
            const degWithinSign = pos % 30;
            const displaySign = data.sign ?? getSignFromDegree(pos);
            // Calculate house position if not provided
            const houseNumber = typeof data.house === 'number'
                ? data.house
                : typeof data.house === 'string' && !isNaN(Number(data.house))
                    ? Number(data.house)
                    : calculatePlanetHouse(pos, houses);
            return assertPlanetType({
                name: name,
                sign: displaySign,
                degree: degWithinSign,
                house: houseNumber,
                aspects: Array.isArray(data.aspects) ? data.aspects : [],
                position: pos,
                retrograde: Boolean(data.retrograde),
            });
        });
    }
    return [];
}
export function normalizeChart(raw) {
    if (!raw || typeof raw !== 'object') {
        return {
            planets: [],
            points: [],
            asteroids: [],
            angles: [],
            houses: [],
            aspects: [],
        };
    }
    // CRITICAL FIX: Use raw backend response if available (bypasses API transformation)
    const rawContainer = raw;
    const backendData = rawContainer.__raw_backend_response ?? raw;
    // TEMPORARY DEBUG: Log data structure for troubleshooting
    if (typeof window !== 'undefined' && window.console) {
        window.console.group('🔍 normalizeChart Debug');
        window.console.log('Input source:', rawContainer.__raw_backend_response
            ? 'NEW_CALCULATION (with __raw_backend_response)'
            : 'SAVED_CHART (direct data)');
        window.console.log('Raw input type:', typeof raw);
        window.console.log('Raw input keys:', raw ? Object.keys(raw) : 'null');
        window.console.log('Backend data type:', typeof backendData);
        window.console.log('Backend data keys:', backendData ? Object.keys(backendData) : 'null');
        window.console.log('Backend planets:', backendData?.planets);
        window.console.log('Backend asteroids:', backendData?.asteroids);
        window.console.log('Backend aspects:', backendData?.aspects);
        window.console.log('Backend houses:', backendData?.houses);
        window.console.groupEnd();
    }
    // Process houses first for house position calculations
    const houseData = backendData && typeof backendData === 'object' ? backendData.houses : undefined;
    const processedHouses = __toHouseArray(houseData);
    // Initialize collections
    const allCelestialBodies = [];
    const categorizedAsteroids = [];
    const categorizedPoints = [];
    // Process asteroids from backend 'asteroids' field
    const asteroidsData = backendData && typeof backendData === 'object' ? backendData.asteroids : undefined;
    const processedAsteroids = __toAsteroidArray(asteroidsData, processedHouses);
    categorizedAsteroids.push(...processedAsteroids);
    
    // Also add asteroids to all celestial bodies for potential point filtering
    const asteroidPlanets = __toPlanetArray(asteroidsData, processedHouses);
    allCelestialBodies.push(...asteroidPlanets);
    // Process points from backend 'points' field
    const pointsData = backendData && typeof backendData === 'object' ? backendData.points : undefined;
    const processedPoints = __toPointArray(pointsData, processedHouses);
    categorizedPoints.push(...processedPoints);
    allCelestialBodies.push(...processedPoints);
    // Process additional fields (uranian, hypothetical_points, etc.)
    ['uranian', 'hypothetical_points'].forEach(fieldName => {
        if (backendData[fieldName] && typeof backendData[fieldName] === 'object') {
            const additionalPoints = __toPointArray(backendData[fieldName], processedHouses);
            categorizedPoints.push(...additionalPoints);
            allCelestialBodies.push(...additionalPoints);
        }
    });
    // Process main planets from backend 'planets' field
    const planetsData = backendData && typeof backendData === 'object' ? backendData.planets : undefined;
    const processedMainPlanets = __toPlanetArray(planetsData, processedHouses);
    allCelestialBodies.push(...processedMainPlanets);
    
    // If planets are not main planets, also track as points for downstream consumers
    processedMainPlanets.forEach(planetEntry => {
        const lower = planetEntry.name.toLowerCase();
        const mainNames = [
            'sun',
            'moon',
            'mercury',
            'venus',
            'mars',
            'jupiter',
            'saturn',
            'uranus',
            'neptune',
            'pluto',
        ];
        if (!mainNames.includes(lower)) {
            categorizedPoints.push(planetEntry);
        }
    });
    // Process aspects
    const aspectsData = backendData && typeof backendData === 'object' ? backendData.aspects : undefined;
    const processedAspects = __toAspectArray(aspectsData);
    // Process angles
    const anglesData = backendData && typeof backendData === 'object' ? backendData.angles : undefined;
    const processedAngles = __toAngleArray(anglesData);
    // Final categorization complete
    // Filter planets vs points for final categorization
    const isMainPlanet = (body) => {
        const planetNames = [
            'sun',
            'moon',
            'mercury',
            'venus',
            'mars',
            'jupiter',
            'saturn',
            'uranus',
            'neptune',
            'pluto',
        ];
        return planetNames.includes(body.name.toLowerCase());
    };
    // Merge points into planets array for now (ChartDisplay will filter them)
    const allPlanets = allCelestialBodies.filter(isMainPlanet);
    // TEMPORARY DEBUG: Log final results
    if (typeof window !== 'undefined' && window.console) {
        window.console.group('✅ normalizeChart Results');
        window.console.log('Final planets count:', allPlanets.length);
        window.console.log('Final asteroids count:', categorizedAsteroids.length);
        window.console.log('Final houses count:', processedHouses.length);
        window.console.log('Final aspects count:', processedAspects.length);
        window.console.log('Final angles count:', processedAngles.length);
        if (allPlanets.length === 0) {
            window.console.warn('🚨 NO PLANETS FOUND - Check data structure');
            window.console.log('All celestial bodies:', allCelestialBodies);
        }
        window.console.groupEnd();
    }
    return {
        planets: allPlanets,
        points: categorizedPoints,
        asteroids: categorizedAsteroids,
        houses: processedHouses,
        aspects: processedAspects,
        angles: processedAngles,
    };
}
//# sourceMappingURL=normalizeChart.js.map