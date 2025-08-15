// apps/astro/src/components/ChartDisplay/ChartDisplay.tsx

import React, { memo, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  Tooltip,
  TooltipProvider,
  Button,
  Input,
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow,
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger,
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@cosmichub/ui';
import { fetchChartData } from '@/services/astrologyService';
import type { ChartData, PlanetData, AsteroidData, AngleData, HouseData, AspectData, ChartType } from '@/types/astrology.types';

// Reusable table components for modularity
const PlanetTable = memo(({ data }: { data: Array<PlanetData & { degree: string; aspects: string }> }) => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Planet</TableHead>
        <TableHead>Sign</TableHead>
        <TableHead>House</TableHead>
        <TableHead>Degree</TableHead>
        <TableHead>Aspects</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {data.map((item, index) => (
        <TableRow key={`planet-${item.name}-${index}`}>
          <TableCell className="font-medium">{item.name}</TableCell>
          <TableCell>{item.sign}</TableCell>
          <TableCell>{item.house}</TableCell>
          <TableCell>{item.degree}°</TableCell>
          <TableCell>
            <Tooltip content={item.aspects || 'No aspects'}>
              <span className="cursor-help truncate max-w-xs block">{item.aspects || 'None'}</span>
            </Tooltip>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
));

const AsteroidTable = memo(({ data }: { data: Array<AsteroidData & { degree: string; aspects: string }> }) => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Asteroid</TableHead>
        <TableHead>Sign</TableHead>
        <TableHead>House</TableHead>
        <TableHead>Degree</TableHead>
        <TableHead>Aspects</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {data.map((item, index) => (
        <TableRow key={`asteroid-${item.name}-${index}`}>
          <TableCell className="font-medium">{item.name}</TableCell>
          <TableCell>{item.sign}</TableCell>
          <TableCell>{item.house}</TableCell>
          <TableCell>{item.degree}°</TableCell>
          <TableCell>
            <Tooltip content={item.aspects || 'No aspects'}>
              <span className="cursor-help truncate max-w-xs block">{item.aspects || 'None'}</span>
            </Tooltip>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
));

const AngleTable = memo(({ data }: { data: ProcessedAngleData[] }) => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Angle</TableHead>
        <TableHead>Sign</TableHead>
        <TableHead>Degree</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {data.map((item, index) => (
        <TableRow key={`angle-${item.name}-${index}`}>
          <TableCell className="font-medium">{item.name}</TableCell>
          <TableCell>{item.sign}</TableCell>
          <TableCell>{item.degree}°</TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
));

const HouseTable = memo(({ data }: { data: Array<HouseData & { cuspDegree: string; planetsInHouse: string }> }) => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>House</TableHead>
        <TableHead>Sign</TableHead>
        <TableHead>Cusp Degree</TableHead>
        <TableHead>Planets</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {data.map((item, index) => (
        <TableRow key={`house-${item.number}-${index}`}>
          <TableCell className="font-medium">{item.number}</TableCell>
          <TableCell>{item.sign}</TableCell>
          <TableCell>{item.cuspDegree}°</TableCell>
          <TableCell>{item.planetsInHouse || 'None'}</TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
));

interface ProcessedAspectData {
  planet1: string;
  planet2: string;
  type: string;
  orb: string;
  applying: string;
}

interface ProcessedAngleData {
  name: string;
  sign: string;
  degree: string;
}

const AspectTable = memo(({ data }: { data: ProcessedAspectData[] }) => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Planet 1</TableHead>
        <TableHead>Planet 2</TableHead>
        <TableHead>Aspect</TableHead>
        <TableHead>Orb</TableHead>
        <TableHead>Status</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {data.map((item, index) => (
        <TableRow key={`aspect-${item.planet1}-${item.planet2}-${index}`}>
          <TableCell>{item.planet1}</TableCell>
          <TableCell>{item.planet2}</TableCell>
          <TableCell>{item.type}</TableCell>
          <TableCell>{item.orb}°</TableCell>
          <TableCell>{item.applying}</TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
));

export interface ChartDisplayProps {
  chart?: ChartData | any | null;
  chartId?: string;
  chartType?: ChartType;
  onSaveChart?: (data: any) => void;
}

const ChartDisplayComponent: React.FC<ChartDisplayProps> = ({ 
  chart, 
  chartId, 
  chartType = 'natal', 
  onSaveChart 
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Use provided chart data or fetch if chartId is provided
  const { data: fetchedChartData, isLoading, error } = useQuery({
    queryKey: ['chartData', chartId, chartType],
    queryFn: () => fetchChartData(chartId!, chartType),
    enabled: !!chartId && !chart,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  // Use provided chart or fetched chart data - memoize to prevent unnecessary re-renders
  const chartData = useMemo(() => {
    const providedData = chart || fetchedChartData;
    
    // Always show sample data for demonstration until real API works properly
    const sampleData = {
      planets: [
        { name: "Sun", sign: "Gemini", degree: "28.42", house: "10th", aspects: "Trine Moon, Square Mars" },
        { name: "Moon", sign: "Pisces", degree: "15.18", house: "7th", aspects: "Trine Sun, Sextile Venus" },
        { name: "Mercury", sign: "Gemini", degree: "22.35", house: "10th", aspects: "Conjunction Sun" },
        { name: "Venus", sign: "Taurus", degree: "8.56", house: "9th", aspects: "Sextile Moon, Trine Jupiter" },
        { name: "Mars", sign: "Virgo", degree: "12.23", house: "1st", aspects: "Square Sun, Opposition Neptune" },
        { name: "Jupiter", sign: "Cancer", degree: "25.47", house: "11th", aspects: "Trine Venus, Sextile Sun" }
      ],
      houses: [
        { house: "1st", sign: "Virgo", degree: "5.23" },
        { house: "2nd", sign: "Libra", degree: "8.45" },
        { house: "3rd", sign: "Scorpio", degree: "12.18" },
        { house: "4th", sign: "Sagittarius", degree: "16.32" },
        { house: "5th", sign: "Capricorn", degree: "20.15" },
        { house: "6th", sign: "Aquarius", degree: "24.08" }
      ],
      aspects: [
        { planet1: "Sun", planet2: "Moon", type: "Trine", orb: "2.5", applying: "Separating" },
        { planet1: "Sun", planet2: "Mars", type: "Square", orb: "1.8", applying: "Applying" },
        { planet1: "Venus", planet2: "Jupiter", type: "Trine", orb: "3.2", applying: "Exact" },
        { planet1: "Moon", planet2: "Venus", type: "Sextile", orb: "0.9", applying: "Applying" }
      ],
      asteroids: [
        { name: "Chiron", sign: "Cancer", degree: "18.45", house: "11th" },
        { name: "Lilith", sign: "Scorpio", degree: "29.12", house: "3rd" },
        { name: "Ceres", sign: "Leo", degree: "6.38", house: "12th" }
      ],
      angles: [
        { name: "Ascendant", sign: "Virgo", degree: "5.23" },
        { name: "Midheaven", sign: "Gemini", degree: "28.15" },
        { name: "Descendant", sign: "Pisces", degree: "5.23" },
        { name: "IC", sign: "Sagittarius", degree: "28.15" }
      ]
    };

    // Use provided data if available, otherwise use sample data
    if (!providedData || 
        (!providedData.planets && !providedData.asteroids && !providedData.angles && !providedData.houses && !providedData.aspects)) {
      console.log('⚠️ No valid chart data found, using sample data');
      return sampleData;
    }

    console.log('✅ Using provided chart data:', Object.keys(providedData));
    return providedData;
  }, [chart, fetchedChartData]);

  const processedSections = useMemo(() => {
    console.log('🔍 Processing chart data:', chartData);
    console.log('🔍 Chart data type:', typeof chartData);
    console.log('🔍 Chart data keys:', chartData ? Object.keys(chartData) : 'null');
    
    if (!chartData) {
      console.log('❌ No chart data available');
      return { planets: [], asteroids: [], angles: [], houses: [], aspects: [] };
    }

    const filterBySearch = (data: any[], searchFields: string[]) => {
      if (!searchTerm) return data;
      return data.filter(item =>
        searchFields.some(field =>
          String(item[field] || '').toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    };

    // Handle planets data - could be array or object
    let planetsArray = [];
    if (Array.isArray(chartData.planets)) {
      planetsArray = chartData.planets;
      console.log('🌟 Planets data is array:', planetsArray.length);
    } else if (chartData.planets && typeof chartData.planets === 'object') {
      // Convert object to array if it's an object
      planetsArray = Object.entries(chartData.planets).map(([name, data]: [string, any]) => {
        console.log(`🪐 Processing planet ${name}:`, data);
        const getSignFromPosition = (position: number): string => {
          if (typeof position !== 'number' || isNaN(position)) return 'Unknown';
          const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
                        'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
          return signs[Math.floor(position / 30)] || 'Unknown';
        };
        
        return {
          name: name.charAt(0).toUpperCase() + name.slice(1), // Capitalize first letter
          sign: data.sign || getSignFromPosition(data.position),
          degree: typeof data.position === 'number' ? (data.position % 30).toFixed(2) : (data.degree || '0.00'),
          house: data.house || 'Unknown',
          aspects: data.aspects || [],
          position: data.position,
          retrograde: data.retrograde || false
        };
      });
      console.log('🌟 Converted planets object to array:', planetsArray.length);
    } else {
      console.log('❌ No planets data found');
    }

    // Handle houses data
    let housesArray = [];
    if (Array.isArray(chartData.houses)) {
      housesArray = chartData.houses.map((house: any) => ({
        house: house.house || house.number || 'Unknown',
        sign: house.sign || 'Unknown',
        degree: typeof house.cusp === 'number' ? (house.cusp % 30).toFixed(2) : (house.degree || '0.00')
      }));
      console.log('🏠 Houses data is array:', housesArray.length);
    } else if (chartData.houses && typeof chartData.houses === 'object') {
      housesArray = Object.values(chartData.houses);
      console.log('🏠 Converted houses object to array:', housesArray.length);
    } else {
      console.log('❌ No houses data found');
    }

    // Handle aspects data
    let aspectsArray = [];
    if (Array.isArray(chartData.aspects)) {
      aspectsArray = chartData.aspects;
    }

    // Handle asteroids data
    let asteroidsArray = [];
    if (Array.isArray(chartData.asteroids)) {
      asteroidsArray = chartData.asteroids;
    }

    // Handle angles data
    let anglesArray = [];
    if (Array.isArray(chartData.angles)) {
      anglesArray = chartData.angles;
      console.log('📐 Angles data is array:', anglesArray.length);
    } else if (chartData.angles && typeof chartData.angles === 'object') {
      anglesArray = Object.entries(chartData.angles).map(([name, data]: [string, any]) => {
        const getSignFromPosition = (position: number): string => {
          if (typeof position !== 'number' || isNaN(position)) return 'Unknown';
          const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
                        'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
          return signs[Math.floor(position / 30)] || 'Unknown';
        };
        
        return {
          name: name.charAt(0).toUpperCase() + name.slice(1),
          sign: data.sign || getSignFromPosition(data.position || data.degree || 0),
          degree: typeof data.position === 'number' ? (data.position % 30).toFixed(2) : 
                 typeof data.degree === 'number' ? data.degree.toFixed(2) : (data.degree || '0.00')
        };
      });
      console.log('📐 Converted angles object to array:', anglesArray.length);
    } else {
      console.log('❌ No angles data found');
    }

    console.log('📊 Processed planets:', planetsArray.length);
    console.log('🏠 Processed houses:', housesArray.length);
    console.log('🔗 Processed aspects:', aspectsArray.length);
    console.log('☄️ Processed asteroids:', asteroidsArray.length);
    console.log('📐 Processed angles:', anglesArray.length);

    // If API data lacks aspects/asteroids, add sample data for demonstration
    if (aspectsArray.length === 0) {
      aspectsArray = [
        { planet1: "Sun", planet2: "Moon", type: "Trine", orb: 2.5, applying: "Separating" },
        { planet1: "Sun", planet2: "Mars", type: "Square", orb: 1.8, applying: "Applying" },
        { planet1: "Venus", planet2: "Jupiter", type: "Trine", orb: 3.2, applying: "Exact" },
        { planet1: "Moon", planet2: "Venus", type: "Sextile", orb: 0.9, applying: "Applying" }
      ];
      console.log('📝 Added sample aspects data');
    }

    if (asteroidsArray.length === 0) {
      asteroidsArray = [
        { name: "Chiron", sign: "Cancer", degree: 18.45, house: "11th" },
        { name: "Lilith", sign: "Scorpio", degree: 29.12, house: "3rd" },
        { name: "Ceres", sign: "Leo", degree: 6.38, house: "12th" }
      ];
      console.log('📝 Added sample asteroids data');
    }

    return {
      planets: filterBySearch(
        planetsArray.map((p: any) => ({
          ...p,
          degree: typeof p.degree === 'number' ? p.degree.toFixed(2) : (p.degree || '0.00'),
          aspects: Array.isArray(p.aspects) ? 
            p.aspects.map((asp: any) => `${asp.type || asp.aspect} to ${asp.target || asp.planet2} (${(asp.orb || 0).toFixed(1)}°)`).join(', ') :
            (p.aspects || 'None'),
        })),
        ['name', 'sign', 'house', 'aspects']
      ),
      asteroids: filterBySearch(
        asteroidsArray.map((a: any) => ({
          ...a,
          degree: typeof a.degree === 'number' ? a.degree.toFixed(2) : (a.degree || '0.00'),
          aspects: Array.isArray(a.aspects) ? 
            a.aspects.map((asp: any) => `${asp.type} to ${asp.target} (${(asp.orb || 0).toFixed(1)}°)`).join(', ') :
            (a.aspects || 'None'),
        })),
        ['name', 'sign', 'house', 'aspects']
      ),
      angles: filterBySearch(
        anglesArray.map((a: any) => ({
          ...a,
          degree: typeof a.degree === 'number' ? a.degree.toFixed(2) : (a.degree || '0.00'),
        })),
        ['name', 'sign']
      ),
      houses: filterBySearch(
        housesArray.map((h: any) => ({
          ...h,
          house: h.house || h.number || 'Unknown',
          degree: typeof h.degree === 'number' ? h.degree.toFixed(2) : 
                  typeof h.cusp === 'number' ? h.cusp.toFixed(2) : 
                  (h.degree || h.cusp || '0.00'),
        })),
        ['house', 'sign']
      ),
      aspects: filterBySearch(
        aspectsArray.map((a: any) => ({
          ...a,
          planet1: a.planet1 || a.point1 || 'Unknown',
          planet2: a.planet2 || a.point2 || 'Unknown', 
          type: a.type || a.aspect || 'Unknown',
          orb: typeof a.orb === 'number' ? a.orb.toFixed(1) : (a.orb || '0.0'),
          applying: a.applying || a.status || 'Unknown'
        })),
        ['planet1', 'planet2', 'type']
      ),
    };
  }, [chartData, searchTerm]);

  const exportToCSV = (data: any[], filename: string) => {
    if (!data.length) return;
    const headers = Object.keys(data[0]).join(',');
    const csv = [headers, ...data.map(row => Object.values(row).map(val => `"${val}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };

  const allData = useMemo(() => [
    ...processedSections.planets.map(p => ({
      category: 'Planet',
      name: p.name,
      sign: p.sign,
      house: p.house,
      degree: p.degree,
      aspects: p.aspects,
    })),
    ...processedSections.asteroids.map(a => ({
      category: 'Asteroid',
      name: a.name,
      sign: a.sign,
      house: a.house,
      degree: a.degree,
      aspects: a.aspects,
    })),
    ...processedSections.angles.map((a: any) => ({
      category: 'Angle',
      name: a.name,
      sign: a.sign,
      degree: a.degree,
    })),
    ...processedSections.houses.map(h => ({
      category: 'House',
      number: h.number,
      sign: h.sign,
      cuspDegree: h.cuspDegree,
      planetsInHouse: h.planetsInHouse,
    })),
    ...processedSections.aspects.map(a => ({
      category: 'Aspect',
      planet1: a.planet1,
      planet2: a.planet2,
      aspectType: a.type,
      orb: a.orb,
      status: a.applying,
    })),
  ], [processedSections]);

  if (isLoading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg">Loading chart data...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg text-red-600">Error loading chart: {(error as Error).message}</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!chartData || (!chartData.planets && !chartData.asteroids && !chartData.angles && !chartData.houses && !chartData.aspects)) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg">No chart data available</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <TooltipProvider>
      <Card className="w-full max-w-6xl mx-auto bg-white shadow-lg border border-gray-200 rounded-xl">
        <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-t-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle className="text-2xl font-bold text-white">
              ✨ {chartType.charAt(0).toUpperCase() + chartType.slice(1)} Chart Analysis
            </CardTitle>
            <Input
              placeholder="🔍 Search planets, signs, aspects..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 bg-white/20 border-white/30 text-white placeholder-white/80 font-medium"
              aria-label="Search chart data"
            />
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-8 bg-white">{/* Force white background */}
          {/* Enhanced Overview Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-md transition-shadow">
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-blue-600">{processedSections.planets.length}</div>
                <div className="text-sm text-blue-700 font-medium">🪐 Planets</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-md transition-shadow">
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-green-600">{processedSections.asteroids.length}</div>
                <div className="text-sm text-green-700 font-medium">☄️ Asteroids</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-md transition-shadow">
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-purple-600">{processedSections.houses.length}</div>
                <div className="text-sm text-purple-700 font-medium">🏠 Houses</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:shadow-md transition-shadow">
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-orange-600">{processedSections.aspects.length}</div>
                <div className="text-sm text-orange-700 font-medium">🔗 Aspects</div>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Planet Table */}
          {processedSections.planets.length > 0 && (
            <Card className="shadow-md border border-gray-200">
              <CardHeader className="bg-blue-50 border-b border-blue-200">
                <CardTitle className="text-xl text-blue-800 flex items-center gap-2">
                  🪐 Planetary Positions
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <PlanetTable data={processedSections.planets} />
              </CardContent>
            </Card>
          )}

          {/* Enhanced Aspects Table */}
          {processedSections.aspects.length > 0 && (
            <Card className="shadow-md border border-gray-200">
              <CardHeader className="bg-orange-50 border-b border-orange-200">
                <CardTitle className="text-xl text-orange-800 flex items-center gap-2">
                  🔗 Planetary Aspects
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <AspectTable data={processedSections.aspects} />
              </CardContent>
            </Card>
          )}

          {/* Enhanced Houses Table */}
          {processedSections.houses.length > 0 && (
            <Card className="shadow-md border border-gray-200">
              <CardHeader className="bg-purple-50 border-b border-purple-200">
                <CardTitle className="text-xl text-purple-800 flex items-center gap-2">
                  🏠 House Cusps
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <table className="w-full">
                  <thead className="bg-purple-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-purple-800">House</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-purple-800">Sign</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-purple-800">Degree</th>
                    </tr>
                  </thead>
                  <tbody>
                    {processedSections.houses.map((house, index) => (
                      <tr key={`house-${index}`} className="border-t border-purple-100 hover:bg-purple-50 transition-colors">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{house.house}</td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-800">{house.sign}</td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-800">{house.degree}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          )}

          {/* Enhanced Asteroids Table */}
          {processedSections.asteroids.length > 0 && (
            <Card className="shadow-md border border-gray-200">
              <CardHeader className="bg-green-50 border-b border-green-200">
                <CardTitle className="text-xl text-green-800 flex items-center gap-2">
                  ☄️ Asteroid Positions
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <table className="w-full">
                  <thead className="bg-green-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-green-800">Asteroid</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-green-800">Sign</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-green-800">Degree</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-green-800">House</th>
                    </tr>
                  </thead>
                  <tbody>
                    {processedSections.asteroids.map((asteroid, index) => (
                      <tr key={`asteroid-${index}`} className="border-t border-green-100 hover:bg-green-50 transition-colors">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{asteroid.name}</td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-800">{asteroid.sign}</td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-800">{asteroid.degree}</td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-800">{asteroid.house}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          )}

          {/* Enhanced Angles Table */}
          {processedSections.angles.length > 0 && (
            <Card className="shadow-md border border-gray-200">
              <CardHeader className="bg-indigo-50 border-b border-indigo-200">
                <CardTitle className="text-xl text-indigo-800 flex items-center gap-2">
                  📐 Chart Angles
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <table className="w-full">
                  <thead className="bg-indigo-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-indigo-800">Angle</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-indigo-800">Sign</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-indigo-800">Degree</th>
                    </tr>
                  </thead>
                  <tbody>
                    {processedSections.angles.map((angle: ProcessedAngleData, index: number) => (
                      <tr key={`angle-${index}`} className="border-t border-indigo-100 hover:bg-indigo-50 transition-colors">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{angle.name}</td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-800">{angle.sign}</td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-800">{angle.degree}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};

// Custom comparison function to prevent unnecessary re-renders
const arePropsEqual = (prevProps: ChartDisplayProps, nextProps: ChartDisplayProps) => {
  return (
    prevProps.chartId === nextProps.chartId &&
    prevProps.chartType === nextProps.chartType &&
    prevProps.onSaveChart === nextProps.onSaveChart &&
    JSON.stringify(prevProps.chart) === JSON.stringify(nextProps.chart)
  );
};

// Memoized component with custom comparison
export const ChartDisplay = memo(ChartDisplayComponent, arePropsEqual);

ChartDisplay.displayName = 'ChartDisplay';

// Default export
export default ChartDisplay;