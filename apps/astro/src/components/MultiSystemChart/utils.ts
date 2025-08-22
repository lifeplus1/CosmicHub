export const planetSymbols = {
  sun: "☉", moon: "☽", mercury: "☿", venus: "♀", mars: "♂",
  jupiter: "♃", saturn: "♄", uranus: "♅", neptune: "♆", pluto: "♇",
  chiron: "⚷", ceres: "⚳", pallas: "⚴", juno: "⚵", vesta: "⚶",
  lilith: "⚸", vertex: "Vx", antivertex: "AVx", part_of_fortune: "⊗",
  rahu: "☊", ketu: "☋",
  cupido: "♇⚷", hades: "♇⚸", zeus: "♇⚹", kronos: "♇⚺", 
  apollon: "♇⚻", admetos: "♇⚼", vulkanus: "♇⚽", poseidon: "♇⚾"
};

export const aspectSymbols = {
  "Conjunction": "☌", "Opposition": "☍", "Trine": "△", "Square": "□",
  "Sextile": "⚹", "Quincunx": "⚻", "Semisextile": "⚺", "Semisquare": "∠"
};

export const getZodiacSign = (position: number): string => {
  const zodiacSigns = [
    "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
    "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
  ];
  if (typeof position !== 'number' || isNaN(position)) return 'N/A';
  const sign = Math.floor(position / 30);
  const deg = position % 30;
  const signIndex = sign % 12;
  return `${deg.toFixed(2)}° ${zodiacSigns[signIndex] ?? 'Unknown'}`;
};