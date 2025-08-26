// Debug normalization with actual saved chart data
const savedChartData = {
  "id": "90864e12-68ac-4db5-97bb-bd925028c13c",
  "name": "Los Angeles 1985-12-25",
  "birth_date": "1985-12-25",
  "birth_time": "10:45",
  "birth_location": "Los Angeles",
  "chart_type": "natal",
  "birth_data": {
    "year": 1985,
    "month": 12,
    "day": 25,
    "hour": 10,
    "minute": 45,
    "city": "Los Angeles",
    "timezone": "America/Los_Angeles",
    "lat": 34.0522,
    "lon": -118.2437
  },
  "chart_data": {
    "julian_day": 2446425.281253711,
    "latitude": 34.0522,
    "longitude": -118.2437,
    "timezone": "America/Los_Angeles",
    "planets": {
      "sun": {"position": 273.93038351195577, "retrograde": false},
      "moon": {"position": 76.89457911765973, "retrograde": false},
      "mercury": {"position": 254.20110822944463, "retrograde": false},
      "venus": {"position": 267.9794256835168, "retrograde": false},
      "mars": {"position": 216.76317842221917, "retrograde": false},
      "jupiter": {"position": 316.952112146884, "retrograde": false},
      "saturn": {"position": 244.4959954687952, "retrograde": false},
      "uranus": {"position": 259.1340784030263, "retrograde": false},
      "neptune": {"position": 273.3513030644578, "retrograde": false},
      "pluto": {"position": 216.76192559205467, "retrograde": false}
    },
    "houses": [
      {"house": 1, "cusp": 340.5466836166724},
      {"house": 2, "cusp": 23.026824845084214},
      {"house": 3, "cusp": 54.03321605843689},
      {"house": 4, "cusp": 78.25210669415583},
      {"house": 5, "cusp": 100.72900456774698},
      {"house": 6, "cusp": 125.9973604078694},
      {"house": 7, "cusp": 160.54668361667245},
      {"house": 8, "cusp": 203.0268248450842},
      {"house": 9, "cusp": 234.0332160584369},
      {"house": 10, "cusp": 258.2521066941558},
      {"house": 11, "cusp": 280.729004567747},
      {"house": 12, "cusp": 305.9973604078694}
    ],
    "angles": {
      "ascendant": 340.5466836166724,
      "descendant": 160.54668361667245,
      "mc": 258.2521066941558,
      "ic": 78.25210669415583,
      "vertex": 171.5239501061036,
      "antivertex": 351.5239501061036
    },
    "aspects": []
  }
};

// Test the getSignFromDegree function
const getSignFromDegree = (degree) => {
  const signs = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
  ];
  const idx = Math.floor(degree / 30);
  const value = signs[idx];
  return typeof value === 'string' && value.length > 0 ? value : 'Unknown';
};

// Test with Sun position
const sunPosition = 273.93038351195577;
console.log(`Sun at ${sunPosition}° should be in:`, getSignFromDegree(sunPosition));
console.log(`Expected: Capricorn (273° / 30 = ${Math.floor(sunPosition / 30)} = index 9 = Capricorn)`);

// Test with Moon position  
const moonPosition = 76.89457911765973;
console.log(`Moon at ${moonPosition}° should be in:`, getSignFromDegree(moonPosition));
console.log(`Expected: Gemini (76° / 30 = ${Math.floor(moonPosition / 30)} = index 2 = Gemini)`);

// Test house calculation
const calculatePlanetHouse = (planetPosition, houses) => {
  if (!houses || houses.length === 0) return 1;
  
  // Normalize planet position to 0-360 range
  let normalizedPosition = planetPosition;
  while (normalizedPosition < 0) normalizedPosition += 360;
  while (normalizedPosition >= 360) normalizedPosition -= 360;
  
  console.log(`Calculating house for planet at ${planetPosition}° (normalized: ${normalizedPosition}°)`);
  
  for (let i = 0; i < houses.length; i++) {
    const currentHouse = houses[i];
    const nextHouse = houses[(i + 1) % houses.length];
    
    let currentCusp = currentHouse.cusp;
    let nextCusp = nextHouse.cusp;
    
    console.log(`Checking house ${currentHouse.house}: cusp at ${currentCusp}°, next cusp at ${nextCusp}°`);
    
    // Handle crossing 0 degrees (e.g., from 350° to 10°)
    if (nextCusp < currentCusp) {
      if (normalizedPosition >= currentCusp || normalizedPosition < nextCusp) {
        console.log(`Planet is in house ${currentHouse.house} (crossing 0°)`);
        return currentHouse.house;
      }
    } else {
      if (normalizedPosition >= currentCusp && normalizedPosition < nextCusp) {
        console.log(`Planet is in house ${currentHouse.house}`);
        return currentHouse.house;
      }
    }
  }
  
  console.log(`Defaulting to house 1`);
  return 1;
};

// Test Sun house calculation
console.log('\n--- Testing Sun House Calculation ---');
const sunHouse = calculatePlanetHouse(sunPosition, savedChartData.chart_data.houses);
console.log(`Sun house: ${sunHouse}`);

// Test Moon house calculation  
console.log('\n--- Testing Moon House Calculation ---');
const moonHouse = calculatePlanetHouse(moonPosition, savedChartData.chart_data.houses);
console.log(`Moon house: ${moonHouse}`);
