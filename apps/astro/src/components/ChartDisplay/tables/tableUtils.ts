// Centralized symbol maps (superset merged from ChartDisplay + previous placeholder)
export const PLANET_SYMBOLS: Record<string, string> = {
	Sun: '☉', Moon: '☽', Mercury: '☿', Venus: '♀', Mars: '♂', Jupiter: '♃', Saturn: '♄',
	Uranus: '♅', Neptune: '♆', Pluto: '♇', 'North Node': '☊', 'South Node': '☋',
	Ascendant: 'AC', Descendant: 'DC', Midheaven: 'MC', IC: 'IC', MC: 'MC',
	'Imum Coeli': 'IC', 'Vertex': 'Vx', 'Antivertex': 'AVx'
};

export const SIGN_SYMBOLS: Record<string, string> = {
	Aries: '♈', Taurus: '♉', Gemini: '♊', Cancer: '♋', Leo: '♌', Virgo: '♍', Libra: '♎',
	Scorpio: '♏', Sagittarius: '♐', Capricorn: '♑', Aquarius: '♒', Pisces: '♓'
};

export const ASTEROID_SYMBOLS: Record<string, string> = {
	Ceres: '⚳', Pallas: '⚴', Juno: '⚵', Vesta: '⚶', Chiron: '⚷', Lilith: '⚸',
	'Lilith (Mean)': '⚸', 'Lilith (True)': '⚸', Eros: '♡', Psyche: '🦋', Fortuna: '⊗',
	Sedna: '♅₂', Eris: '⚸₂', default: '⁂'
};

export const ASPECT_SYMBOLS: Record<string, string> = {
	Conjunction: '☌', Opposition: '☍', Trine: '△', Square: '□', Sextile: '⚹', Quincunx: '⚻',
	Semisextile: '⚺', Semisquare: '∠', Sesquiquadrate: '⚼', Quintile: 'Q', Biquintile: 'bQ'
};

export type PlanetInterpretationFn = (planet: string, sign: string) => string;

export const getPlanetSymbol = (name: string): string => {
	if (typeof name !== 'string' || name.length === 0) return '●';
	return (PLANET_SYMBOLS[name] !== undefined && PLANET_SYMBOLS[name].length > 0)
		? PLANET_SYMBOLS[name]
		: (ASTEROID_SYMBOLS[name] !== undefined && ASTEROID_SYMBOLS[name].length > 0)
			? ASTEROID_SYMBOLS[name]
			: '●';
};
export const getSignSymbol = (sign: string): string => {
	if (typeof sign !== 'string' || sign.length === 0) return '○';
	return (SIGN_SYMBOLS[sign] !== undefined && SIGN_SYMBOLS[sign].length > 0) ? SIGN_SYMBOLS[sign] : '○';
};
export const getAspectSymbol = (aspect: string): string => {
	if (typeof aspect !== 'string' || aspect.length === 0) return '◇';
	if (ASPECT_SYMBOLS[aspect] !== undefined && ASPECT_SYMBOLS[aspect].length > 0) return ASPECT_SYMBOLS[aspect];
	const cap = capitalize(aspect);
	if (ASPECT_SYMBOLS[cap] !== undefined && ASPECT_SYMBOLS[cap].length > 0) return ASPECT_SYMBOLS[cap];
	return '◇';
};
export const getAsteroidSymbol = (name: string): string => {
	if (typeof name !== 'string' || name.length === 0) return ASTEROID_SYMBOLS.default;
	return (ASTEROID_SYMBOLS[name] !== undefined && ASTEROID_SYMBOLS[name].length > 0)
		? ASTEROID_SYMBOLS[name]
		: ASTEROID_SYMBOLS.default;
};

function capitalize(s: string){ return (typeof s === 'string' && s.length > 0) ? s[0].toUpperCase()+s.slice(1).toLowerCase() : s; }

// Lightweight interpretation subset (avoid pulling heavy logic)
const INTERPRETATIONS: Record<string, Record<string, string>> = {
	Sun: {
		Aries: 'Bold leadership drive', Taurus: 'Grounded creative force', Gemini: 'Curious communicator',
		Cancer: 'Protective and nurturing', Leo: 'Radiant self-expression', Virgo: 'Analytical purpose',
		Libra: 'Seeks relational harmony', Scorpio: 'Intense transformative will', Sagittarius: 'Adventurous seeker',
		Capricorn: 'Ambitious achiever', Aquarius: 'Innovative visionary', Pisces: 'Compassionate dreamer'
	},
	Moon: {
		Aries: 'Fast, reactive emotions', Taurus: 'Comfort in stability', Gemini: 'Changeable mental moods',
		Cancer: 'Deep emotional attunement', Leo: 'Expressive heart-centered feelings', Virgo: 'Practical emotional processing',
		Libra: 'Needs balance & partnership', Scorpio: 'Intense emotional depth', Sagittarius: 'Restless emotional freedom',
		Capricorn: 'Reserved emotional control', Aquarius: 'Detached intuitive insight', Pisces: 'Fluid empathic sensitivity'
	}
};

export const getPlanetInterpretation: PlanetInterpretationFn = (planet, sign) => {
	const interpPlanet = typeof planet === 'string' ? planet : 'Unknown';
	const interpSign = typeof sign === 'string' ? sign : 'Unknown';
	const planetMap = INTERPRETATIONS[interpPlanet];
		if (planetMap?.[interpSign] !== undefined && planetMap[interpSign].length > 0) {
		return planetMap[interpSign];
	}
	return `${interpPlanet} in ${interpSign}`;
};

// Degree formatting helper used across tables
export const formatDegree = (raw: string | number): string => {
	if (typeof raw === 'number') return raw.toFixed(2);
	if (/^\d+\.\d+°?$/.test(raw)) return raw.replace(/°$/, '');
	return raw;
};

// Aspect status color helper (UI class only)
export const aspectStatusClass = (status: string): string => {
	if (typeof status === 'string' && status === 'Exact') return 'text-cosmic-gold';
	if (typeof status === 'string' && status === 'Applying') return 'text-green-400';
	return 'text-cosmic-silver';
};
