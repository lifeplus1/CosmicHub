import React from 'react';
import * as Accordion from '@radix-ui/react-accordion';
import * as Tabs from '@radix-ui/react-tabs';

export interface MultiSystemChartData {
  birth_info?: {
    date?: string;
    time?: string;
    location?: {
      latitude?: number;
      longitude?: number;
      timezone?: string;
    };
  };
  western_tropical?: {
    planets: Record<string, {
      position: number;
      retrograde?: boolean;
    }>;
    aspects: Array<{
      point1: string;
      point2: string;
      aspect: string;
      orb: number;
      exact: boolean;
      point1_sign?: string;
      point2_sign?: string;
      point1_house?: number;
      point2_house?: number;
    }>;
  };
  vedic_sidereal?: {
    description?: string;
    ayanamsa?: number;
    analysis?: {
      moon_sign?: string;
      analysis?: string;
    };
    planets?: Record<string, {
      vedic_sign?: string;
      nakshatra?: {
        name?: string;
        pada?: string;
      };
    }>;
  };
  chinese?: {
    description?: string;
    year?: { animal?: string; element?: string; traits?: string };
    month?: { animal?: string };
    day?: { animal?: string };
    hour?: { animal?: string };
    four_pillars?: string;
    elements_analysis?: { analysis?: string };
    personality_summary?: string;
  };
  mayan?: {
    description?: string;
    day_sign?: { symbol?: string; name?: string; meaning?: string; color?: string };
    sacred_number?: { number?: number; meaning?: string };
    galactic_signature?: string;
    wavespell?: { tone?: { name?: string }; position?: number; description?: string };
    long_count?: { date?: string };
    life_purpose?: string;
    spiritual_guidance?: string;
  };
  uranian?: {
    description?: string;
    uranian_planets?: Record<string, { symbol?: string; position?: number; meaning?: string }>;
    dial_aspects?: Array<{ body1?: string; body2?: string; angle?: number; orb?: number; meaning?: string }>;
  };
  synthesis?: {
    primary_themes?: string[];
    life_purpose?: string[];
    personality_integration?: Record<string, string[]>;
    spiritual_path?: string[];
  };
}

interface MultiSystemChartProps {
  chartData: MultiSystemChartData;
  isLoading?: boolean;
}

// Enhanced symbols for different systems
const planetSymbols = {
  sun: "☉", moon: "☽", mercury: "☿", venus: "♀", mars: "♂",
  jupiter: "♃", saturn: "♄", uranus: "♅", neptune: "♆", pluto: "♇",
  chiron: "⚷", ceres: "⚳", pallas: "⚴", juno: "⚵", vesta: "⚶",
  lilith: "⚸", vertex: "Vx", antivertex: "AVx", part_of_fortune: "⊗",
  rahu: "☊", ketu: "☋",
  // Uranian transneptunian points
  cupido: "♇⚷", hades: "♇⚸", zeus: "♇⚹", kronos: "♇⚺", 
  apollon: "♇⚻", admetos: "♇⚼", vulkanus: "♇⚽", poseidon: "♇⚾"
};

const aspectSymbols = {
  "Conjunction": "☌", "Opposition": "☍", "Trine": "△", "Square": "□",
  "Sextile": "⚹", "Quincunx": "⚻", "Semisextile": "⚺", "Semisquare": "∠"
};

const getZodiacSign = (position: number): string => {
  const zodiacSigns = [
    "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
    "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
  ];
  if (typeof position !== 'number' || isNaN(position)) return 'N/A';
  const sign = Math.floor(position / 30);
  const deg = position % 30;
  const signIndex = sign % 12;
  return `${deg.toFixed(2)}° ${zodiacSigns[signIndex] || 'Unknown'}`;
};

interface WesternChartData {
  planets: Record<string, { position: number; retrograde?: boolean }>;
  aspects: Array<{
    point1: string;
    point2: string;
    aspect: string;
    orb: number;
    exact: boolean;
    point1_sign?: string;
    point2_sign?: string;
    point1_house?: number;
    point2_house?: number;
  }>;
}
const WesternChart: React.FC<{ data?: WesternChartData }> = ({ data }) => {
  if (!data || !data.planets) return <p className="text-cosmic-silver">No Western chart data available</p>;

  return (
    <div className="flex flex-col space-y-6">
      <div className="cosmic-card">
        <div className="p-6">
          <h3 className="mb-4 font-bold text-purple-300 text-md">
            Western Tropical Chart
          </h3>
          <p className="mb-6 text-sm text-cosmic-silver/90">
            Based on tropical zodiac, solar-focused approach emphasizing personality and life expression
          </p>
          
          <Accordion.Root type="single" collapsible>
            <Accordion.Item value="planets" className="rounded-lg cosmic-card border-purple-300/30">
              <Accordion.Trigger className="flex justify-between w-full p-4 transition-colors duration-300 bg-purple-500/20 hover:bg-purple-500/30 lg:p-6">
                <div className="flex space-x-2">
                  <span className="mb-0 font-bold">Planets & Positions</span>
                  <span className="px-2 py-1 text-sm text-white rounded bg-cosmic-purple">{Object.keys(data.planets).length}</span>
                </div>
                <Accordion.Icon />
              </Accordion.Trigger>
              <Accordion.Content className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full table-auto">
                    <thead>
                      <tr>
                        <th className="px-4 py-2 text-left min-w-32">Planet</th>
                        <th className="px-4 py-2 text-left min-w-48">Position</th>
                        <th className="px-4 py-2 text-left min-w-24">Retrograde</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(data.planets).map(([planet, info]: [string, { position: number; retrograde?: boolean }]) => (
                        <tr key={planet}>
                          <td className="px-4 py-2 border-b border-cosmic-gold/20">
                            <div className="flex space-x-2">
                              <span className="text-lg">{planetSymbols[planet as keyof typeof planetSymbols] || '●'}</span>
                              <span className="font-semibold text-white capitalize">{planet.replace('_', ' ')}</span>
                            </div>
                          </td>
                          <td className="px-4 py-2 font-mono border-b border-cosmic-gold/20 text-white/90">{getZodiacSign(info.position)}</td>
                          <td className="px-4 py-2 text-center border-b border-cosmic-gold/20">
                            {info.retrograde ? (
                              <span className="px-2 py-1 text-sm text-yellow-500 rounded bg-yellow-500/20">℞</span>
                            ) : (
                              <span className="text-white/60">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Accordion.Content>
            </Accordion.Item>

            <Accordion.Item value="aspects" className="mt-4 rounded-lg cosmic-card border-purple-300/30">
              <Accordion.Trigger className="flex justify-between w-full p-4 transition-colors duration-300 bg-purple-500/20 hover:bg-purple-500/30 lg:p-6">
                <div className="flex space-x-2">
                  <span className="mb-0 font-bold">Aspects</span>
                  <span className="px-2 py-1 text-sm rounded bg-cosmic-purple/20 text-cosmic-purple">{data.aspects?.length || 0}</span>
                </div>
                <Accordion.Icon />
              </Accordion.Trigger>
              <Accordion.Content className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full table-auto">
                    <thead>
                      <tr>
                        <th className="px-4 py-2 text-left min-w-32">Aspect Type</th>
                        <th className="px-4 py-2 text-left min-w-40">Planets</th>
                        <th className="px-4 py-2 text-left min-w-24">Orb</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(data.aspects || []).map((aspect: {
                        point1: string;
                        point2: string;
                        aspect: string;
                        orb: number;
                        exact: boolean;
                        point1_sign?: string;
                        point2_sign?: string;
                        point1_house?: number;
                        point2_house?: number;
                      }, idx: number) => (
                        <tr key={idx}>
                          <td className="px-4 py-2 border-b border-cosmic-gold/20">
                            <div className="flex space-x-2">
                              <span className="text-lg">{aspectSymbols[aspect.aspect as keyof typeof aspectSymbols] || '—'}</span>
                              <span className="font-semibold text-white">{aspect.aspect}</span>
                            </div>
                          </td>
                          <td className="px-4 py-2 border-b border-cosmic-gold/20">
                            <span className="text-white">{aspect.point1} - {aspect.point2}</span>
                            <p className="text-sm text-white/80">
                              {aspect.point1_sign} (H{aspect.point1_house}) - {aspect.point2_sign} (H{aspect.point2_house})
                            </p>
                          </td>
                          <td className="px-4 py-2 border-b border-cosmic-gold/20">
                            <span className={`${aspect.exact ? 'bg-green-500 text-white' : 'bg-cosmic-purple/20 text-cosmic-purple'} px-2 py-1 rounded text-sm`}>
                              {aspect.orb.toFixed(2)}°
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Accordion.Content>
            </Accordion.Item>
          </Accordion.Root>
        </div>
      </div>
    </div>
  );
};

interface VedicChartData {
  description?: string;
  ayanamsa?: number;
  analysis?: {
    moon_sign?: string;
    analysis?: string;
  };
  planets?: Record<string, {
    vedic_sign?: string;
    nakshatra?: {
      name?: string;
      pada?: string;
    };
  }>;
}
const VedicChart: React.FC<{ data: VedicChartData }> = ({ data }) => {
  if (!data) return <p className="text-cosmic-silver">No Vedic astrology data available</p>;

  return (
    <div className="flex flex-col space-y-4">
      <div className="cosmic-card bg-orange-50/95">
        <div className="p-4 text-gray-800">
          <h3 className="mb-4 font-bold text-orange-700 text-md">Vedic Sidereal Astrology</h3>
          <p className="mb-4 text-sm font-medium text-gray-700">
            {data.description}
          </p>
          <p className="mb-4 text-sm text-gray-700">
            <strong>Ayanamsa:</strong> {data.ayanamsa?.toFixed(4)}°
          </p>

          <Accordion.Root type="single" collapsible>
            <Accordion.Item value="0">
              <Accordion.Trigger className="flex justify-between w-full">
                <span className="font-bold">Lunar Analysis</span>
                <Accordion.Icon />
              </Accordion.Trigger>
              <Accordion.Content className="pb-4">
                <p className="mb-2 text-sm font-medium">Moon Sign (Rashi): {data.analysis?.moon_sign}</p>
                <p className="text-sm">{data.analysis?.analysis}</p>
              </Accordion.Content>
            </Accordion.Item>

            <Accordion.Item value="1">
              <Accordion.Trigger className="flex justify-between w-full">
                <span className="font-bold">Planets & Nakshatras</span>
                <Accordion.Icon />
              </Accordion.Trigger>
              <Accordion.Content className="pb-4">
                <table className="w-full text-sm table-auto">
                  <thead>
                    <tr>
                      <th className="py-2 text-left">Planet</th>
                      <th className="py-2 text-left">Sign</th>
                      <th className="py-2 text-left">Nakshatra</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(data.planets || {}).map(([planet, info]: [string, { vedic_sign?: string; nakshatra?: { name?: string; pada?: string } }]) => (
                      <tr key={planet}>
                        <td className="py-2 font-medium capitalize">{planet}</td>
                        <td className="py-2">{info.vedic_sign}</td>
                        <td className="py-2">{info.nakshatra?.name} (Pada {info.nakshatra?.pada})</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Accordion.Content>
            </Accordion.Item>
          </Accordion.Root>
        </div>
      </div>
    </div>
  );
};

interface ChineseChartData {
  description?: string;
  year?: { animal?: string; element?: string; traits?: string };
  month?: { animal?: string };
  day?: { animal?: string };
  hour?: { animal?: string };
  four_pillars?: string;
  elements_analysis?: { analysis?: string };
  personality_summary?: string;
}
const ChineseChart: React.FC<{ data: ChineseChartData }> = ({ data }) => {
  if (!data) return <p className="text-cosmic-silver">No Chinese astrology data available</p>;

  return (
    <div className="flex flex-col space-y-4">
      <div className="cosmic-card bg-red-50/95">
        <div className="p-4 text-gray-800">
          <h3 className="mb-4 font-bold text-red-700 text-md">Chinese Astrology</h3>
          <p className="mb-4 text-sm font-medium text-gray-700">
            {data.description}
          </p>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="mb-2 font-bold">Four Pillars</p>
              <p className="mb-2 text-sm"><strong>Year:</strong> {data.year?.element} {data.year?.animal}</p>
              <p className="mb-2 text-sm"><strong>Month:</strong> {data.month?.animal}</p>
              <p className="mb-2 text-sm"><strong>Day:</strong> {data.day?.animal}</p>
              <p className="mb-2 text-sm"><strong>Hour:</strong> {data.hour?.animal}</p>
            </div>
            <div>
              <p className="mb-2 font-bold">Bazi Chart</p>
              <p className="mb-2 font-mono text-sm">{data.four_pillars}</p>
              <p className="mb-2 font-bold">Elemental Balance</p>
              <p className="text-sm">{data.elements_analysis?.analysis}</p>
            </div>
          </div>

          <p className="mb-2 font-bold">Personality Traits</p>
          <p className="mb-4 text-sm">{data.year?.traits}</p>

          <p className="mb-2 font-bold">Overall Summary</p>
          <p className="text-sm">{data.personality_summary}</p>
        </div>
      </div>
    </div>
  );
};

interface MayanChartData {
  description?: string;
  day_sign?: { symbol?: string; name?: string; meaning?: string; color?: string };
  sacred_number?: { number?: number; meaning?: string };
  galactic_signature?: string;
  wavespell?: { tone?: { name?: string }; position?: number; description?: string };
  long_count?: { date?: string };
  life_purpose?: string;
  spiritual_guidance?: string;
}
const MayanChart: React.FC<{ data: MayanChartData }> = ({ data }) => {
  if (!data) return <p className="text-cosmic-silver">No Mayan astrology data available</p>;

  return (
    <div className="flex flex-col space-y-4">
      <div className="cosmic-card bg-green-50/95">
        <div className="p-4 text-gray-800">
          <h3 className="mb-4 font-bold text-green-700 text-md">Mayan Astrology</h3>
          <p className="mb-4 text-sm font-medium text-gray-700">
            {data.description}
          </p>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="mb-2 font-bold">Tzolk'in Signature</p>
              <p className="mb-2 text-2xl">{data.sacred_number?.number} {data.day_sign?.name}</p>
              <p className="mb-2 text-sm"><strong>Symbol:</strong> {data.day_sign?.symbol}</p>
              <p className="mb-2 text-sm"><strong>Color:</strong> {data.day_sign?.color}</p>
              <p className="mb-2 text-sm"><strong>Meaning:</strong> {data.day_sign?.meaning}</p>
            </div>
            <div>
              <p className="mb-2 font-bold">Wavespell</p>
              <p className="mb-2 text-sm"><strong>Tone:</strong> {data.wavespell?.tone?.name} ({data.wavespell?.position})</p>
              <p className="mb-4 text-sm">{data.wavespell?.description}</p>
              <p className="mb-2 font-bold">Long Count</p>
              <p className="font-mono text-sm">{data.long_count?.date}</p>
            </div>
          </div>

          <p className="mb-2 font-bold">Galactic Signature</p>
          <p className="mb-4 text-sm">{data.galactic_signature}</p>

          <p className="mb-2 font-bold">Life Purpose</p>
          <p className="mb-4 text-sm">{data.life_purpose}</p>

          <p className="mb-2 font-bold">Spiritual Guidance</p>
          <p className="text-sm">{data.spiritual_guidance}</p>
        </div>
      </div>
    </div>
  );
};

interface UranianChartData {
  description?: string;
  uranian_planets?: Record<string, { symbol?: string; position?: number; meaning?: string }>;
  dial_aspects?: Array<{ body1?: string; body2?: string; angle?: number; orb?: number; meaning?: string }>;
}
const UranianChart: React.FC<{ data: UranianChartData }> = ({ data }) => {
  if (!data) return <p className="text-cosmic-silver">No Uranian astrology data available</p>;

  return (
    <div className="flex flex-col space-y-4">
      <div className="cosmic-card bg-indigo-50/95">
        <div className="p-4 text-gray-800">
          <h3 className="mb-4 font-bold text-indigo-700 text-md">Uranian Astrology</h3>
          <p className="mb-4 text-sm font-medium text-gray-700">
            {data.description}
          </p>

          <Accordion.Root type="single" collapsible>
            <Accordion.Item value="0">
              <Accordion.Trigger className="flex justify-between w-full">
                <span className="font-bold">Transneptunian Points</span>
                <Accordion.Icon />
              </Accordion.Trigger>
              <Accordion.Content className="pb-4">
                <table className="w-full text-sm table-auto">
                  <thead>
                    <tr>
                      <th className="py-2 text-left">Planet</th>
                      <th className="py-2 text-left">Position</th>
                      <th className="py-2 text-left">Meaning</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(data.uranian_planets || {}).map(([planet, info]: [string, { symbol?: string; position?: number; meaning?: string }]) => (
                      <tr key={planet}>
                        <td className="py-2">
                          <div className="flex">
                            <span>{info.symbol}</span>
                            <span className="ml-2 font-medium">{planet.charAt(0).toUpperCase() + planet.slice(1)}</span>
                          </div>
                        </td>
                        <td className="py-2 font-mono">{info.position?.toFixed(2)}°</td>
                        <td className="py-2 text-xs">{info.meaning}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Accordion.Content>
            </Accordion.Item>

            <Accordion.Item value="1">
              <Accordion.Trigger className="flex justify-between w-full">
                <span className="font-bold">90° Dial Aspects</span>
                <Accordion.Icon />
              </Accordion.Trigger>
              <Accordion.Content className="pb-4">
                <table className="w-full text-sm table-auto">
                  <thead>
                    <tr>
                      <th className="py-2 text-left">Bodies</th>
                      <th className="py-2 text-left">Aspect</th>
                      <th className="py-2 text-left">Orb</th>
                      <th className="py-2 text-left">Meaning</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data.dial_aspects || []).slice(0, 8).map((aspect: { body1?: string; body2?: string; angle?: number; orb?: number; meaning?: string }, idx: number) => (
                      <tr key={idx}>
                        <td className="py-2 text-sm">{aspect.body1} - {aspect.body2}</td>
                        <td className="py-2">{aspect.angle}°</td>
                        <td className="py-2">{aspect.orb?.toFixed(2)}°</td>
                        <td className="py-2 text-xs">{aspect.meaning}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Accordion.Content>
            </Accordion.Item>
          </Accordion.Root>
        </div>
      </div>
    </div>
  );
};

interface SynthesisChartData {
  primary_themes?: string[];
  life_purpose?: string[];
  personality_integration?: Record<string, string[]>;
  spiritual_path?: string[];
}
const SynthesisChart: React.FC<{ data: SynthesisChartData }> = ({ data }) => {
  if (!data) return <p className="text-cosmic-silver">No synthesis data available</p>;

  return (
    <div className="flex flex-col space-y-4">
      <div className="cosmic-card bg-gradient-to-br from-white/95 to-cyan-50/95">
        <div className="p-4 text-gray-800">
          <h3 className="mb-4 font-bold text-teal-700 text-md">Integrated Analysis</h3>
          <p className="mb-4 text-sm text-white/80">
            Synthesis of insights from all astrological traditions
          </p>

          <Accordion.Root type="single" collapsible>
            <Accordion.Item value="themes">
              <Accordion.Trigger className="flex justify-between w-full">
                <span className="font-bold">Primary Themes</span>
                <Accordion.Icon />
              </Accordion.Trigger>
              <Accordion.Content className="pb-4">
                <div className="flex flex-col space-y-2">
                  {(data.primary_themes || []).map((theme: string, idx: number) => (
                    <span key={idx} className="p-2 border rounded-md border-cosmic-silver/30">
                      {theme}
                    </span>
                  ))}
                </div>
              </Accordion.Content>
            </Accordion.Item>

            <Accordion.Item value="purpose">
              <Accordion.Trigger className="flex justify-between w-full">
                <span className="font-bold">Life Purpose Integration</span>
                <Accordion.Icon />
              </Accordion.Trigger>
              <Accordion.Content className="pb-4">
                <div className="flex flex-col space-y-3">
                  {(data.life_purpose || []).map((purpose: string, idx: number) => (
                    <div key={idx} className="flex p-4 space-x-4 border border-blue-500 rounded-md bg-blue-900/50">
                      <span className="text-xl text-blue-500">ℹ️</span>
                      <p className="text-white/80">{purpose}</p>
                    </div>
                  ))}
                </div>
              </Accordion.Content>
            </Accordion.Item>

            <Accordion.Item value="personality">
              <Accordion.Trigger className="flex justify-between w-full">
                <span className="font-bold">Personality Integration</span>
                <Accordion.Icon />
              </Accordion.Trigger>
              <Accordion.Content className="pb-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {Object.entries(data.personality_integration || {}).map(([aspect, traits]: [string, string[]]) => (
                    <div key={aspect}>
                      <p className="mb-2 font-bold capitalize">
                        {aspect.replace('_', ' ')}:
                      </p>
                      <div className="flex flex-col space-y-1">
                        {(traits || []).map((trait: string, idx: number) => (
                          <p key={idx} className="text-sm text-white/80">
                            {trait}
                          </p>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </Accordion.Content>
            </Accordion.Item>

            <Accordion.Item value="path">
              <Accordion.Trigger className="flex justify-between w-full">
                <span className="font-bold">Spiritual Path</span>
                <Accordion.Icon />
              </Accordion.Trigger>
              <Accordion.Content className="pb-4">
                <div className="flex flex-col space-y-3">
                  {(data.spiritual_path || []).map((guidance: string, idx: number) => (
                    <div key={idx} className="flex p-4 space-x-4 border border-green-500 rounded-md bg-green-900/50">
                      <span className="text-xl text-green-500">✅</span>
                      <p className="text-white/80">{guidance}</p>
                    </div>
                  ))}
                </div>
              </Accordion.Content>
            </Accordion.Item>
          </Accordion.Root>
        </div>
      </div>
    </div>
  );
};

export const MultiSystemChartDisplay: React.FC<MultiSystemChartProps> = ({ chartData, isLoading = false }) => {
  const bgColor = "purple-50";
  const cardBg = "white";

  if (isLoading) {
    return (
      <div className={`p-4 bg-${bgColor} rounded-lg`}>
        <p className="text-center text-cosmic-silver">Calculating multi-system chart...</p>
      </div>
    );
  }

  if (!chartData) {
    return (
      <div className="p-4 border border-yellow-500 rounded-md bg-yellow-900/50">
        <div className="flex space-x-4">
          <span className="text-xl text-yellow-500">⚠️</span>
          <div>
            <h3 className="font-bold text-white">No Chart Data</h3>
            <p className="text-white/80">Please calculate a chart to see the multi-system analysis.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-${bgColor} rounded-lg p-4`}>
      <div className="flex flex-col space-y-6">
        {/* Birth Information Header */}
        <div className={`cosmic-card bg-${cardBg}`}>
          <div className="p-4">
            <h2 className="mb-4 text-lg font-bold text-center text-purple-700">
              Multi-System Astrological Analysis
            </h2>
            {chartData.birth_info && (
              <div className="flex flex-wrap justify-center gap-4">
                <p className="text-cosmic-silver"><strong>Date:</strong> {chartData.birth_info.date}</p>
                <p className="text-cosmic-silver"><strong>Time:</strong> {chartData.birth_info.time}</p>
                <p className="text-cosmic-silver"><strong>Coordinates:</strong> {chartData.birth_info.location?.latitude?.toFixed(2)}°, {chartData.birth_info.location?.longitude?.toFixed(2)}°</p>
                <p className="text-cosmic-silver"><strong>Timezone:</strong> {chartData.birth_info.location?.timezone}</p>
              </div>
            )}
          </div>
        </div>

        {/* Multi-System Tabs */}
        <Tabs.Root>
          <Tabs.List className="flex flex-wrap">
            <Tabs.Trigger value="western" className="px-4 py-2 data-[state=active]:bg-cosmic-purple/20 data-[state=active]:text-cosmic-purple">Western Tropical</Tabs.Trigger>
            <Tabs.Trigger value="vedic" className="px-4 py-2 data-[state=active]:bg-cosmic-purple/20 data-[state=active]:text-cosmic-purple">Vedic Sidereal</Tabs.Trigger>
            <Tabs.Trigger value="chinese" className="px-4 py-2 data-[state=active]:bg-cosmic-purple/20 data-[state=active]:text-cosmic-purple">Chinese</Tabs.Trigger>
            <Tabs.Trigger value="mayan" className="px-4 py-2 data-[state=active]:bg-cosmic-purple/20 data-[state=active]:text-cosmic-purple">Mayan</Tabs.Trigger>
            <Tabs.Trigger value="uranian" className="px-4 py-2 data-[state=active]:bg-cosmic-purple/20 data-[state=active]:text-cosmic-purple">Uranian</Tabs.Trigger>
            <Tabs.Trigger value="synthesis" className="px-4 py-2 data-[state=active]:bg-cosmic-purple/20 data-[state=active]:text-cosmic-purple">Synthesis</Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="western" className="pt-4"><WesternChart data={chartData.western_tropical} /></Tabs.Content>
          <Tabs.Content value="vedic" className="pt-4"><VedicChart data={chartData.vedic_sidereal ?? {}} /></Tabs.Content>
          <Tabs.Content value="chinese" className="pt-4"><ChineseChart data={chartData.chinese ?? {}} /></Tabs.Content>
          <Tabs.Content value="mayan" className="pt-4"><MayanChart data={chartData.mayan ?? {}} /></Tabs.Content>
          <Tabs.Content value="uranian" className="pt-4"><UranianChart data={chartData.uranian ?? {}} /></Tabs.Content>
          <Tabs.Content value="synthesis" className="pt-4"><SynthesisChart data={chartData.synthesis ?? {}} /></Tabs.Content>
        </Tabs.Root>

        {/* Footer with methodology */}
        <div className={`cosmic-card bg-${cardBg} border border-cosmic-silver/30`}>
          <div className="p-4">
            <p className="text-sm text-center text-white/80">
              This analysis combines Western tropical astrology, Vedic sidereal calculations, Chinese Four Pillars, 
              Mayan sacred calendar, and Uranian midpoint techniques to provide a comprehensive astrological perspective.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MultiSystemChartDisplay;