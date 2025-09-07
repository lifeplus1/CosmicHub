import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  SacredGeometryVisualizer,
  ColorSwatchGrid,
  ExpertModeSwitch,
  MetricCard,
  TimeBadgeGrid,
  DataSection,
  DataItem,
  SectionCard
} from '@cosmichub/ui';
import { 
  SacredGeometryDemoProps 
} from '../../types/sacred-geometry.types';

const mockSacredGeometryData: SacredGeometryLocalData = {
  golden_ratio_analysis: {
    primary_phi_ratio: 1.618033988749,
    resonance_strength: 0.87,
    optimal_meditation_times: ['6:00 AM', '12:00 PM', '6:00 PM', '12:00 AM']
  },
  platonic_solid_correspondences: {
    tetrahedron: { value: 'Fire - Creative Force' },
    cube: { value: 'Earth - Foundation' },
    octahedron: { value: 'Air - Mental Clarity' },
    icosahedron: { value: 'Water - Emotional Flow' },
    dodecahedron: { value: 'Ether - Spiritual Unity' }
  },
  mandala_data: {
    meditation_focus: 'Sacred Geometric Harmony',
    color_harmonics: ['#FF4444', '#FFAA00', '#88FF88', '#4444FF', '#AA44FF']
  },
  tcm_geometric_integration: {
    five_element_geometry: {
      fire: { resonance: 28, geometry: 'tetrahedron' },
      earth: { resonance: 22, geometry: 'cube' },
      metal: { resonance: 18, geometry: 'octahedron' },
      water: { resonance: 16, geometry: 'icosahedron' },
      wood: { resonance: 16, geometry: 'dodecahedron' }
    }
  }
};

interface SacredGeometryLocalData {
  golden_ratio_analysis: {
    primary_phi_ratio: number;
    resonance_strength: number;
    optimal_meditation_times: string[];
  };
  platonic_solid_correspondences: Record<string, { value: string }>;
  mandala_data: {
    meditation_focus: string;
    color_harmonics: string[];
  };
  tcm_geometric_integration: {
    five_element_geometry: Record<string, unknown>;
  };
}

const SacredGeometryDemo: React.FC<SacredGeometryDemoProps> = ({ 
  initialData = mockSacredGeometryData, 
  onDataUpdate 
}) => {
  const [data] = useState<SacredGeometryLocalData>(initialData);
  const [expertMode, setExpertMode] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch real sacred geometry data from backend
  const fetchSacredGeometryData = useCallback(async () => {
    setLoading(true);
    try {
      // For now, simulate the API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real implementation, validate the response data
      // const response = await fetch('/api/sacred-geometry');
      // const rawData = await response.json();
      // const validatedData = validateSacredGeometryData(rawData);
      // onDataUpdate?.(validatedData);
      
      console.log('Sacred geometry data loaded from SPIRITUAL-003.5 backend');
    } catch (error) {
      console.error('Failed to fetch sacred geometry data:', error);
    } finally {
      setLoading(false);
    }
  }, [onDataUpdate]);

  // Memoize expensive computations
  const platonicSolidsEntries = useMemo(() => 
    Object.entries(data.platonic_solid_correspondences), 
    [data.platonic_solid_correspondences]
  );

  const fiveElementEntries = useMemo(() => 
    Object.entries(data.tcm_geometric_integration.five_element_geometry), 
    [data.tcm_geometric_integration.five_element_geometry]
  );

  const resonancePercentage = useMemo(() => 
    Math.round(data.golden_ratio_analysis.resonance_strength * 100), 
    [data.golden_ratio_analysis.resonance_strength]
  );

  // Memoize ARIA attributes
  const colorSwatches = useMemo(() => 
    data.mandala_data.color_harmonics.map((color, index) => ({
      id: index,
      color
    })), 
    [data.mandala_data.color_harmonics]
  );

  const getElementColorClass = useCallback((element: string) => {
    const colorMap: Record<string, string> = {
      fire: 'text-red-300',
      earth: 'text-yellow-300',
      metal: 'text-gray-300',
      water: 'text-blue-300',
      wood: 'text-green-300'
    };
    return colorMap[element] ?? 'text-gray-300';
  }, []);

  // Keyboard event handlers for accessibility
  const handleRefreshKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      void fetchSacredGeometryData();
    }
  }, [fetchSacredGeometryData]);

  useEffect(() => {
    void fetchSacredGeometryData();
  }, [fetchSacredGeometryData]);

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-purple-300 mb-4">
            Sacred Geometry Visualization
          </h1>
          <p className="text-xl text-gray-300 mb-2">
            3D Interactive Sacred Geometry with Traditional Chinese Medicine Integration
          </p>
          <p className="text-gray-400">
            Powered by SPIRITUAL-003.5 Sacred Geometry Engine
          </p>
        </div>

        <div className="space-y-6">
          {/* Sacred Geometry Visualization */}
          <SectionCard title="Sacred Geometry Visualization">
            <div 
              className="h-96 bg-black rounded-lg"
              role="img"
              aria-label="Interactive sacred geometry visualization"
            >
              <SacredGeometryVisualizer
                data={data}
                expertMode={expertMode}
              />
            </div>
          </SectionCard>

          {/* Sacred Geometry Data Display */}
          <SectionCard title="Sacred Geometry Analysis">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DataSection title="Platonic Solids">
                {platonicSolidsEntries.map(([key, value]) => (
                  <DataItem 
                    key={key}
                    label={key}
                    value={value.value}
                  />
                ))}
              </DataSection>
              <DataSection title="Five Element Geometry">
                {fiveElementEntries.map(([element, info]) => {
                  const elementInfo = info as { resonance: number; geometry: string };
                  const colorClass = getElementColorClass(element);
                  return (
                    <DataItem
                      key={element}
                      label={`${element} (${elementInfo.geometry})`}
                      value={`${elementInfo.resonance}%`}
                      colorClass={colorClass}
                    />
                  );
                })}
              </DataSection>
            </div>
          </SectionCard>

          {/* Mandala & Color Harmonics */}
          <SectionCard title="Mandala & Color Harmonics">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-lg font-medium text-blue-300 mb-2">Meditation Focus</div>
                <div className="text-gray-300">{data.mandala_data.meditation_focus}</div>
              </div>
              <div>
                <h4 className="text-lg font-medium text-blue-300 mb-2">Color Harmonics</h4>
                <ColorSwatchGrid swatches={colorSwatches} />
              </div>
            </div>
          </SectionCard>

          {/* Golden Ratio */}
          <SectionCard title="Golden Ratio Analysis">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <MetricCard
                value={data.golden_ratio_analysis.primary_phi_ratio.toFixed(6)}
                label="Phi Constant"
                variant="default"
              />
              <MetricCard
                value={`${resonancePercentage}%`}
                label="Resonance Strength"
                variant="large"
              />
              <MetricCard
                value={`${data.golden_ratio_analysis.optimal_meditation_times.length} Times`}
                label="Optimal Meditation"
                variant="count"
              />
            </div>
            <TimeBadgeGrid times={data.golden_ratio_analysis.optimal_meditation_times} />
          </SectionCard>

          {/* Controls */}
          <SectionCard title="Controls">
            <div className="flex flex-wrap gap-4">
              <ExpertModeSwitch
                checked={expertMode}
                onCheckedChange={setExpertMode}
                disabled={loading}
              />
              <button
                onClick={() => void fetchSacredGeometryData()}
                onKeyDown={handleRefreshKeyDown}
                disabled={loading}
                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-500 transition-colors disabled:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Refresh sacred geometry data from server"
              >
                {loading ? 'Loading...' : 'Refresh Data'}
              </button>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
};

// Memoize the component to prevent unnecessary re-renders
const MemoizedSacredGeometryDemo = React.memo(SacredGeometryDemo);
MemoizedSacredGeometryDemo.displayName = 'SacredGeometryDemo';

export { MemoizedSacredGeometryDemo as SacredGeometryDemo };
export default MemoizedSacredGeometryDemo;
