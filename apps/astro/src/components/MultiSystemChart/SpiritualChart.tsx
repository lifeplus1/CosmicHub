import React, { useState } from 'react';
import type { UnifiedBirthData } from '@cosmichub/types';

// Updated TarotCard interface to match the actual data structure being passed
interface TarotCard {
  name: string;
  suit: string;
  arcana: 'major' | 'minor';
  upright_meaning: string;
  reversed_meaning: string;
  astrological_correlation: string;
  // Optional additional properties for future enhancement
  hebrew_letter?: string;
  astrology?: string;
  tree_path?: number;
  connects?: string;
  meaning?: string;
  number?: number;
  keywords?: string[];
  life_path_card?: TarotCard;
  secondary_influence?: TarotCard;
  life_path_number?: number;
  spiritual_purpose?: string;
  sephirah?: string;
  numerology?: number;
}

interface Sephirah {
  name: string;
  english: string;
  meaning: string;
  position: number | string;
  activation_level: number | string; // Can be number or 'inactive'/'primary'/'secondary'
  meditation_focus: string;
  hebrew?: string;
  astrology?: string;
  element?: string;
  gematria?: number;
  keywords?: string[];
}

// Keeping interface for future use
interface _TreePath {
  path: number;
  hebrew_letter: string;
  connects?: string[];
  major_arcana: string;
}

interface KabbalahData {
  primary_sephirah?: {
    name: string;
    hebrew_name: string;
    planetary_association: string;
    meaning: string;
    path_guidance: string;
  };
  secondary_sephirah?: {
    name: string;
    hebrew_name: string;
    planetary_association: string;
    meaning: string;
    path_guidance: string;
  };
  relevant_paths?: Array<{
    from: string;
    to: string;
    hebrew_letter: string;
    meaning: string;
    tarot_card: string;
  }>;
  spiritual_focus?: string;
  tree_guidance?: string;
}

interface TreeVisualizationData {
  sephirot?: Sephirah[];
  paths?: TarotCard[];
  tree_layout?: {
    path_connections?: Array<{ from: string; to: string }>;
    sephirot_positions?: Record<string, { x: number; y: number }>;
  };
  active_correspondences?: {
    daily?: { card: string; path: string };
    life_path?: { card: string; path: string };
    primary_sephirah?: { sephirah: string };
  };
}

interface PathWorkingData {
  primary_path?: {
    tarot_card: string;
    hebrew_letter: string;
    path_number: number;
    meditation_focus: string;
    spiritual_work: string;
    practical_exercises?: string[];
  };
  phases?: Array<{
    phase: number;
    name: string;
    duration: string;
    focus: string;
    practices: string[];
  }>;
}

interface HermeticCorrespondenceData {
  daily_hermetic?: {
    tarot: string;
    hebrew_letter: string;
    elemental: string;
    golden_dawn_title: string;
  };
  sephirah_hermetic?: {
    sephirah: string;
    divine_name: string;
    archangel: string;
    gematria: number;
    magical_image: string;
  };
}

interface SynthesisData {
  primary_themes?: string[];
  spiritual_guidance?: string;
  integration_focus?: string;
  daily_practice?: string;
  tree_visualization?: TreeVisualizationData;
  path_working?: PathWorkingData;
  hermetic_correspondences?: HermeticCorrespondenceData;
}

// Local correspondence interfaces for this component
interface DailyFocusCorrespondence {
  element: string;
  planet: string;
  theme: string;
  tarot?: string;
  hebrew_letter?: string;
  tree_path?: number;
  astrology?: string;
}

interface LifePurposeCorrespondence {
  primary_energy: string;
  spiritual_goal: string;
  manifestation_style: string;
}

interface SpiritualCenterCorrespondence {
  chakra: string;
  color: string;
  focus_area: string;
  sephirah?: string;
  astrology?: string;
  tarot_association?: string;
  element?: string;
}

interface LocalCorrespondences {
  daily_focus?: DailyFocusCorrespondence;
  life_purpose?: LifePurposeCorrespondence;
  spiritual_center?: SpiritualCenterCorrespondence;
}

interface TarotData {
  daily_card?: TarotCard;
  life_path?: {
    card: string;
    meaning: string;
    guidance: string;
  };
  suits?: Array<{
    name: string;
    element: string;
    themes: string[];
    strength: number;
  }>;
}

interface SpiritualChartData {
  tarot?: TarotData;
  kabbalah?: KabbalahData;
  synthesis?: SynthesisData;
  correspondences?: LocalCorrespondences;
}

interface SpiritualChartProps {
  chartData?: SpiritualChartData;
  _birthData?: UnifiedBirthData; // Prefixed with _ to indicate intentionally unused
  isLoading?: boolean;
}

const SpiritualChart: React.FC<SpiritualChartProps> = ({
  chartData,
  _birthData,
  isLoading = false,
}) => {
  const [activeTab, setActiveTab] = useState<
    'tarot' | 'kabbalah' | 'tree' | 'synthesis'
  >('tarot');
  // Note: error state removed as it's not currently used but may be needed for future error handling

  // Handle loading state
  if (isLoading) {
    return (
      <div className='cosmic-card bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-500/30'>
        <div className='p-6 text-center'>
          <div className='animate-spin w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full mx-auto mb-4'></div>
          <p className='text-cosmic-silver'>
            Calculating spiritual guidance...
          </p>
        </div>
      </div>
    );
  }

  // Handle no data state
  if (!chartData) {
    return (
      <div className='cosmic-card bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-500/30'>
        <div className='p-6 text-center'>
          <h3 className='font-bold text-purple-400 mb-2'>
            🔮 SPIRITUAL-001 System Ready
          </h3>
          <p className='text-cosmic-silver/70 text-sm mb-4'>
            Enter your birth details to receive comprehensive spiritual guidance
            from Tarot, Kabbalah Tree of Life, and Hermetic correspondences
          </p>
          <div className='grid grid-cols-2 gap-4 text-xs'>
            <div className='bg-purple-900/20 p-3 rounded'>
              <span className='text-purple-300 font-medium'>🃏 Tarot</span>
              <p className='text-cosmic-silver/60'>
                78-card system with Tree of Life paths
              </p>
            </div>
            <div className='bg-yellow-900/20 p-3 rounded'>
              <span className='text-yellow-300 font-medium'>🌟 Kabbalah</span>
              <p className='text-cosmic-silver/60'>
                10 Sephirot + 22 paths visualization
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='cosmic-card bg-gradient-to-br from-purple-900/10 to-indigo-900/10 border border-purple-500/20'>
      <div className='p-6'>
        <h2 className='text-2xl font-bold text-purple-400 mb-6 flex items-center'>
          <span className='mr-3'>🔮</span>
          Spiritual Systems Analysis
          <span className='ml-2 text-xs bg-purple-500/20 px-2 py-1 rounded-full'>
            SPIRITUAL-001
          </span>
        </h2>

        {/* Enhanced Tab Navigation */}
        <div className='flex space-x-1 mb-6 bg-cosmic-black/30 p-1 rounded-lg'>
          <button
            onClick={() => setActiveTab('tarot')}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
              activeTab === 'tarot'
                ? 'bg-purple-500/30 text-purple-300 border border-purple-400/30'
                : 'text-cosmic-silver hover:text-purple-300 hover:bg-purple-500/10'
            }`}
          >
            🃏 Tarot
          </button>
          <button
            onClick={() => setActiveTab('kabbalah')}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
              activeTab === 'kabbalah'
                ? 'bg-yellow-500/30 text-yellow-300 border border-yellow-400/30'
                : 'text-cosmic-silver hover:text-yellow-300 hover:bg-yellow-500/10'
            }`}
          >
            🌟 Kabbalah
          </button>
          <button
            onClick={() => setActiveTab('tree')}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
              activeTab === 'tree'
                ? 'bg-green-500/30 text-green-300 border border-green-400/30'
                : 'text-cosmic-silver hover:text-green-300 hover:bg-green-500/10'
            }`}
          >
            🌳 Tree of Life
          </button>
          <button
            onClick={() => setActiveTab('synthesis')}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
              activeTab === 'synthesis'
                ? 'bg-teal-500/30 text-teal-300 border border-teal-400/30'
                : 'text-cosmic-silver hover:text-teal-300 hover:bg-teal-500/10'
            }`}
          >
            ⚡ Synthesis
          </button>
        </div>

        {/* Tab Content */}
        <div className='min-h-96'>
          {activeTab === 'tarot' && <TarotSection data={chartData.tarot} />}
          {activeTab === 'kabbalah' && (
            <KabbalahSection data={chartData.kabbalah} />
          )}
          {activeTab === 'tree' && (
            <TreeOfLifeSection data={chartData.synthesis?.tree_visualization} />
          )}
          {activeTab === 'synthesis' && (
            <SynthesisSection
              data={chartData.synthesis}
              correspondences={chartData.correspondences}
            />
          )}
        </div>
      </div>
    </div>
  );
};

// Enhanced Tarot Section Component
const TarotSection: React.FC<{ data?: SpiritualChartData['tarot'] }> = ({
  data,
}) => {
  if (!data)
    return <div className='text-cosmic-silver'>No tarot data available</div>;

  const dailyCard = data.daily_card;
  const lifePathData = data.life_path;
  const secondaryInfluence = data.daily_card?.secondary_influence;

  return (
    <div className='space-y-6'>
      {/* Daily Card */}
      {dailyCard && (
        <div className='bg-purple-900/10 border border-purple-500/20 rounded-lg p-4'>
          <h3 className='text-lg font-semibold text-purple-300 mb-3 flex items-center'>
            <span className='mr-2'>🌅</span>
            Daily Card: {dailyCard.name}
          </h3>
          <div className='grid md:grid-cols-2 gap-4'>
            <div>
              <p className='text-cosmic-silver mb-2'>
                <span className='text-purple-400 font-medium'>
                  Hebrew Letter:
                </span>{' '}
                {dailyCard.hebrew_letter}
              </p>
              <p className='text-cosmic-silver mb-2'>
                <span className='text-purple-400 font-medium'>Astrology:</span>{' '}
                {dailyCard.astrology}
              </p>
              <p className='text-cosmic-silver mb-2'>
                <span className='text-purple-400 font-medium'>Tree Path:</span>{' '}
                {dailyCard.tree_path}
              </p>
              <p className='text-cosmic-silver mb-2'>
                <span className='text-purple-400 font-medium'>Connection:</span>{' '}
                {dailyCard.connects}
              </p>
            </div>
            <div>
              <p className='text-cosmic-silver mb-2'>
                <span className='text-purple-400 font-medium'>Meaning:</span>{' '}
                {dailyCard.meaning}
              </p>
              <div className='flex flex-wrap gap-1 mt-2'>
                {dailyCard.keywords?.map((keyword: string, index: number) => (
                  <span
                    key={index}
                    className='text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded'
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Secondary Influence (Minor Arcana) */}
      {secondaryInfluence && (
        <div className='bg-indigo-900/10 border border-indigo-500/20 rounded-lg p-4'>
          <h3 className='text-lg font-semibold text-indigo-300 mb-3 flex items-center'>
            <span className='mr-2'>🌊</span>
            Secondary Influence: {secondaryInfluence.name}
          </h3>
          <div className='grid md:grid-cols-2 gap-4'>
            <div>
              <p className='text-cosmic-silver mb-2'>
                <span className='text-indigo-400 font-medium'>Sephirah:</span>{' '}
                {secondaryInfluence.sephirah}
              </p>
              <p className='text-cosmic-silver mb-2'>
                <span className='text-indigo-400 font-medium'>Number:</span>{' '}
                {secondaryInfluence.number}
              </p>
            </div>
            <div>
              <p className='text-cosmic-silver mb-2'>
                <span className='text-indigo-400 font-medium'>Meaning:</span>{' '}
                {secondaryInfluence.meaning}
              </p>
              <div className='flex flex-wrap gap-1 mt-2'>
                {secondaryInfluence.keywords?.map(
                  (keyword: string, index: number) => (
                    <span
                      key={index}
                      className='text-xs bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded'
                    >
                      {keyword}
                    </span>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Life Path Card */}
      {lifePathData && (
        <div className='bg-rose-900/10 border border-rose-500/20 rounded-lg p-4'>
          <h3 className='text-lg font-semibold text-rose-300 mb-3 flex items-center'>
            <span className='mr-2'>🎯</span>
            Life Path: {lifePathData.card}
          </h3>
          <div className='grid md:grid-cols-2 gap-4'>
            <div>
              <p className='text-cosmic-silver mb-2'>
                <span className='text-rose-400 font-medium'>Meaning:</span>{' '}
                {lifePathData.meaning}
              </p>
            </div>
            <div>
              <p className='text-cosmic-silver mb-2'>
                <span className='text-rose-400 font-medium'>Guidance:</span>{' '}
                {lifePathData.guidance}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Enhanced Kabbalah Section Component
const KabbalahSection: React.FC<{ data?: KabbalahData }> = ({ data }) => {
  if (!data)
    return <div className='text-cosmic-silver'>No Kabbalah data available</div>;

  const primarySephirah = data.primary_sephirah;
  const secondarySephirah = data.secondary_sephirah;
  const relevantPaths = data.relevant_paths ?? [];

  return (
    <div className='space-y-6'>
      {/* Primary Sephirah */}
      {primarySephirah && (
        <div className='bg-yellow-900/10 border border-yellow-500/20 rounded-lg p-4'>
          <h3 className='text-lg font-semibold text-yellow-300 mb-3 flex items-center'>
            <span className='mr-2'>👑</span>
            Primary Sephirah: {primarySephirah.name}
          </h3>
          <div className='grid md:grid-cols-2 gap-4'>
            <div>
              <p className='text-cosmic-silver mb-2'>
                <span className='text-yellow-400 font-medium'>Hebrew Name:</span>{' '}
                {primarySephirah.hebrew_name}
              </p>
              <p className='text-cosmic-silver mb-2'>
                <span className='text-yellow-400 font-medium'>Planetary Association:</span>{' '}
                {primarySephirah.planetary_association}
              </p>
            </div>
            <div>
              <p className='text-cosmic-silver mb-2'>
                <span className='text-yellow-400 font-medium'>Meaning:</span>{' '}
                {primarySephirah.meaning}
              </p>
              <p className='text-cosmic-silver mb-2'>
                <span className='text-yellow-400 font-medium'>Path Guidance:</span>{' '}
                {primarySephirah.path_guidance}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Secondary Sephirah */}
      {secondarySephirah && (
        <div className='bg-orange-900/10 border border-orange-500/20 rounded-lg p-4'>
          <h3 className='text-lg font-semibold text-orange-300 mb-3 flex items-center'>
            <span className='mr-2'>⭐</span>
            Secondary Sephirah: {secondarySephirah.name}
          </h3>
          <div className='grid md:grid-cols-2 gap-4'>
            <div>
              <p className='text-cosmic-silver mb-2'>
                <span className='text-orange-400 font-medium'>Hebrew Name:</span>{' '}
                {secondarySephirah.hebrew_name}
              </p>
              <p className='text-cosmic-silver mb-2'>
                <span className='text-orange-400 font-medium'>Planetary Association:</span>{' '}
                {secondarySephirah.planetary_association}
              </p>
            </div>
            <div>
              <p className='text-cosmic-silver mb-2'>
                <span className='text-orange-400 font-medium'>Meaning:</span>{' '}
                {secondarySephirah.meaning}
              </p>
              <p className='text-cosmic-silver mb-2'>
                <span className='text-orange-400 font-medium'>Path Guidance:</span>{' '}
                {secondarySephirah.path_guidance}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Spiritual Focus */}
      {data.spiritual_focus && (
        <div className='bg-green-900/10 border border-green-500/20 rounded-lg p-4'>
          <h3 className='text-lg font-semibold text-green-300 mb-3 flex items-center'>
            <span className='mr-2'>🎯</span>
            Spiritual Focus
          </h3>
          <p className='text-cosmic-silver'>{data.spiritual_focus}</p>
          {data.tree_guidance && (
            <p className='text-green-300 mt-2 italic'>{data.tree_guidance}</p>
          )}
        </div>
      )}

      {/* Relevant Paths */}
      {relevantPaths.length > 0 && (
        <div className='bg-blue-900/10 border border-blue-500/20 rounded-lg p-4'>
          <h3 className='text-lg font-semibold text-blue-300 mb-3 flex items-center'>
            <span className='mr-2'>🛤️</span>
            Relevant Tree Paths
          </h3>
          <div className='space-y-3'>
            {relevantPaths.slice(0, 3).map((path, index: number) => (
              <div key={index} className='bg-blue-900/20 rounded-lg p-3'>
                <div className='flex justify-between items-start mb-2'>
                  <span className='text-blue-300 font-medium'>
                    Path {path.from} → {path.to}
                  </span>
                  <span className='text-xs text-blue-400'>
                    {path.hebrew_letter}
                  </span>
                </div>
                <p className='text-cosmic-silver text-sm'>
                  <span className='text-blue-400'>Meaning:</span>{' '}
                  {path.meaning}
                </p>
                <p className='text-cosmic-silver text-sm'>
                  <span className='text-blue-400'>Tarot Card:</span>{' '}
                  {path.tarot_card}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// New Interactive Tree of Life Section
const TreeOfLifeSection: React.FC<{ data?: TreeVisualizationData }> = ({
  data,
}) => {
  if (!data)
    return (
      <div className='text-cosmic-silver'>
        No Tree of Life visualization data available
      </div>
    );

  const sephirot = data.sephirot ?? [];
  const _paths = data.paths ?? [];
  const layout = data.tree_layout;
  const activeCorrespondences = data.active_correspondences ?? {};

  return (
    <div className='space-y-6'>
      {/* Tree Visualization */}
      <div className='bg-gradient-to-br from-green-900/10 to-blue-900/10 border border-green-500/20 rounded-lg p-6'>
        <h3 className='text-lg font-semibold text-green-300 mb-4 flex items-center'>
          <span className='mr-2'>🌳</span>
          Interactive Tree of Life
        </h3>

        {/* SVG Tree Visualization */}
        <div className='bg-cosmic-black/20 rounded-lg p-4 mb-4'>
          <svg viewBox='0 0 100 100' className='w-full h-96 max-w-md mx-auto'>
            {/* Render paths first (behind sephirot) */}
            {layout?.path_connections?.map((connection, index: number) => {
              const fromPos = layout.sephirot_positions?.[connection.from];
              const toPos = layout.sephirot_positions?.[connection.to];
              if (!fromPos || !toPos) return null;

              return (
                <line
                  key={index}
                  x1={fromPos.x}
                  y1={fromPos.y}
                  x2={toPos.x}
                  y2={toPos.y}
                  stroke='#4ade80'
                  strokeWidth='0.3'
                  opacity='0.6'
                />
              );
            })}

            {/* Render sephirot */}
            {sephirot.map((seph: Sephirah, index: number) => {
              const position = layout?.sephirot_positions?.[seph.name];
              if (!position) return null;

              const isActive = seph.activation_level !== 'inactive';
              const isPrimary = seph.activation_level === 'primary';
              const isSecondary = seph.activation_level === 'secondary';

              return (
                <g key={index}>
                  <circle
                    cx={position.x}
                    cy={position.y}
                    r={isPrimary ? '3' : isSecondary ? '2.5' : '2'}
                    fill={
                      isPrimary
                        ? '#fbbf24'
                        : isSecondary
                          ? '#fb923c'
                          : '#4ade80'
                    }
                    opacity={isActive ? '1' : '0.6'}
                    stroke={
                      isPrimary
                        ? '#f59e0b'
                        : isSecondary
                          ? '#ea580c'
                          : '#16a34a'
                    }
                    strokeWidth='0.2'
                  />
                  <text
                    x={position.x}
                    y={position.y + 6}
                    textAnchor='middle'
                    fontSize='2.5'
                    fill='#f3f4f6'
                    className='font-medium'
                  >
                    {seph.name}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Active Correspondences */}
        {Object.keys(activeCorrespondences).length > 0 && (
          <div className='grid md:grid-cols-2 gap-4'>
            {activeCorrespondences.daily && (
              <div className='bg-purple-900/20 rounded-lg p-3'>
                <h4 className='text-purple-300 font-medium mb-2'>
                  🌅 Today&apos;s Energy
                </h4>
                <p className='text-cosmic-silver text-sm'>
                  {activeCorrespondences.daily.card}
                </p>
                <p className='text-purple-400 text-xs'>
                  Path {activeCorrespondences.daily.path}
                </p>
              </div>
            )}
            {activeCorrespondences.life_path && (
              <div className='bg-rose-900/20 rounded-lg p-3'>
                <h4 className='text-rose-300 font-medium mb-2'>
                  🎯 Life Theme
                </h4>
                <p className='text-cosmic-silver text-sm'>
                  {activeCorrespondences.life_path.card}
                </p>
                <p className='text-rose-400 text-xs'>
                  Path {activeCorrespondences.life_path.path}
                </p>
              </div>
            )}
            {activeCorrespondences.primary_sephirah && (
              <div className='bg-yellow-900/20 rounded-lg p-3'>
                <h4 className='text-yellow-300 font-medium mb-2'>
                  👑 Developmental Focus
                </h4>
                <p className='text-cosmic-silver text-sm'>
                  {activeCorrespondences.primary_sephirah.sephirah}
                </p>
                <p className='text-yellow-400 text-xs'>Primary energy center</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sephirot Details */}
      <div className='grid md:grid-cols-2 gap-4'>
        {sephirot
          .filter((s: Sephirah) => s.activation_level !== 'inactive')
          .map((seph: Sephirah, index: number) => (
            <div
              key={index}
              className={`rounded-lg p-4 border ${
                seph.activation_level === 'primary'
                  ? 'bg-yellow-900/10 border-yellow-500/20'
                  : 'bg-orange-900/10 border-orange-500/20'
              }`}
            >
              <h4
                className={`font-semibold mb-2 ${
                  seph.activation_level === 'primary'
                    ? 'text-yellow-300'
                    : 'text-orange-300'
                }`}
              >
                {seph.name} - {seph.english}
              </h4>
              <p className='text-cosmic-silver text-sm mb-2'>{seph.meaning}</p>
              <p
                className={`text-xs italic ${
                  seph.activation_level === 'primary'
                    ? 'text-yellow-400'
                    : 'text-orange-400'
                }`}
              >
                {seph.meditation_focus}
              </p>
            </div>
          ))}
      </div>
    </div>
  );
};

// Enhanced Synthesis Section Component
const SynthesisSection: React.FC<{
  data?: SynthesisData;
  correspondences?: LocalCorrespondences;
}> = ({ data, correspondences }) => {
  if (!data)
    return (
      <div className='text-cosmic-silver'>No synthesis data available</div>
    );

  const pathWorking = data.path_working;
  const hermeticCorr = data.hermetic_correspondences;

  return (
    <div className='space-y-6'>
      {/* Primary Themes */}
      {data.primary_themes && (
        <div className='bg-teal-900/10 border border-teal-500/20 rounded-lg p-4'>
          <h3 className='text-lg font-semibold text-teal-300 mb-3 flex items-center'>
            <span className='mr-2'>🎭</span>
            Primary Spiritual Themes
          </h3>
          <div className='flex flex-wrap gap-2'>
            {data.primary_themes.map((theme: string, index: number) => (
              <span
                key={index}
                className='bg-teal-500/20 text-teal-300 px-3 py-1 rounded-full text-sm'
              >
                {theme}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Path Working Guidance */}
      {pathWorking && (
        <div className='bg-indigo-900/10 border border-indigo-500/20 rounded-lg p-4'>
          <h3 className='text-lg font-semibold text-indigo-300 mb-4 flex items-center'>
            <span className='mr-2'>🛤️</span>
            Path Working Guidance
          </h3>

          {/* Primary Path */}
          {pathWorking.primary_path && (
            <div className='bg-indigo-900/20 rounded-lg p-4 mb-4'>
              <h4 className='text-indigo-300 font-medium mb-2'>
                Primary Path: {pathWorking.primary_path.tarot_card}
              </h4>
              <div className='grid md:grid-cols-2 gap-4'>
                <div>
                  <p className='text-cosmic-silver text-sm mb-1'>
                    <span className='text-indigo-400'>Hebrew Letter:</span>{' '}
                    {pathWorking.primary_path.hebrew_letter}
                  </p>
                  <p className='text-cosmic-silver text-sm mb-1'>
                    <span className='text-indigo-400'>Path Number:</span>{' '}
                    {pathWorking.primary_path.path_number}
                  </p>
                  <p className='text-cosmic-silver text-sm'>
                    <span className='text-indigo-400'>Focus:</span>{' '}
                    {pathWorking.primary_path.meditation_focus}
                  </p>
                </div>
                <div>
                  <p className='text-cosmic-silver text-sm mb-2'>
                    <span className='text-indigo-400'>Spiritual Work:</span>{' '}
                    {pathWorking.primary_path.spiritual_work}
                  </p>
                  <div className='flex flex-wrap gap-1'>
                    {pathWorking.primary_path.practical_exercises?.map(
                      (exercise: string, index: number) => (
                        <span
                          key={index}
                          className='text-xs bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded'
                        >
                          {exercise}
                        </span>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Development Phases */}
          {pathWorking.phases && (
            <div className='space-y-3'>
              <h4 className='text-indigo-300 font-medium'>
                Development Phases:
              </h4>
              {pathWorking.phases.map(
                (
                  phase: {
                    phase: number;
                    name: string;
                    duration: string;
                    focus: string;
                    practices: string[];
                  },
                  index: number
                ) => (
                  <div key={index} className='bg-indigo-900/20 rounded-lg p-3'>
                    <div className='flex justify-between items-start mb-2'>
                      <span className='text-indigo-300 font-medium'>
                        Phase {phase.phase}: {phase.name}
                      </span>
                      <span className='text-xs text-indigo-400'>
                        {phase.duration}
                      </span>
                    </div>
                    <p className='text-cosmic-silver text-sm mb-2'>
                      {phase.focus}
                    </p>
                    <div className='flex flex-wrap gap-1'>
                      {phase.practices?.map((practice: string, idx: number) => (
                        <span
                          key={idx}
                          className='text-xs bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded'
                        >
                          {practice}
                        </span>
                      ))}
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      )}

      {/* Hermetic Correspondences */}
      {hermeticCorr && (
        <div className='bg-purple-900/10 border border-purple-500/20 rounded-lg p-4'>
          <h3 className='text-lg font-semibold text-purple-300 mb-4 flex items-center'>
            <span className='mr-2'>🔯</span>
            Hermetic Correspondences
          </h3>

          <div className='grid md:grid-cols-2 gap-4'>
            {/* Daily Hermetic */}
            {hermeticCorr.daily_hermetic && (
              <div className='bg-purple-900/20 rounded-lg p-4'>
                <h4 className='text-purple-300 font-medium mb-3'>
                  Daily Hermetic Focus
                </h4>
                <div className='space-y-2'>
                  <p className='text-cosmic-silver text-sm'>
                    <span className='text-purple-400'>Card:</span>{' '}
                    {hermeticCorr.daily_hermetic.tarot}
                  </p>
                  <p className='text-cosmic-silver text-sm'>
                    <span className='text-purple-400'>Hebrew:</span>{' '}
                    {hermeticCorr.daily_hermetic.hebrew_letter}
                  </p>
                  <p className='text-cosmic-silver text-sm'>
                    <span className='text-purple-400'>Element:</span>{' '}
                    {hermeticCorr.daily_hermetic.elemental}
                  </p>
                  <p className='text-cosmic-silver text-sm'>
                    <span className='text-purple-400'>Golden Dawn:</span>{' '}
                    {hermeticCorr.daily_hermetic.golden_dawn_title}
                  </p>
                </div>
              </div>
            )}

            {/* Sephirah Hermetic */}
            {hermeticCorr.sephirah_hermetic && (
              <div className='bg-yellow-900/20 rounded-lg p-4'>
                <h4 className='text-yellow-300 font-medium mb-3'>
                  Sephirah Correspondences
                </h4>
                <div className='space-y-2'>
                  <p className='text-cosmic-silver text-sm'>
                    <span className='text-yellow-400'>Sephirah:</span>{' '}
                    {hermeticCorr.sephirah_hermetic.sephirah}
                  </p>
                  <p className='text-cosmic-silver text-sm'>
                    <span className='text-yellow-400'>Divine Name:</span>{' '}
                    {hermeticCorr.sephirah_hermetic.divine_name}
                  </p>
                  <p className='text-cosmic-silver text-sm'>
                    <span className='text-yellow-400'>Archangel:</span>{' '}
                    {hermeticCorr.sephirah_hermetic.archangel}
                  </p>
                  <p className='text-cosmic-silver text-sm'>
                    <span className='text-yellow-400'>Gematria:</span>{' '}
                    {hermeticCorr.sephirah_hermetic.gematria}
                  </p>
                  <p className='text-cosmic-silver text-sm'>
                    <span className='text-yellow-400'>Image:</span>{' '}
                    {hermeticCorr.sephirah_hermetic.magical_image}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Spiritual Guidance */}
      {data.spiritual_guidance && (
        <div className='bg-emerald-900/10 border border-emerald-500/20 rounded-lg p-4'>
          <h3 className='text-lg font-semibold text-emerald-300 mb-3 flex items-center'>
            <span className='mr-2'>🧘</span>
            Spiritual Guidance
          </h3>
          <p className='text-cosmic-silver'>{data.spiritual_guidance}</p>
        </div>
      )}

      {/* Integration Focus */}
      {data.integration_focus && (
        <div className='bg-orange-900/10 border border-orange-500/20 rounded-lg p-4'>
          <h3 className='text-lg font-semibold text-orange-300 mb-3 flex items-center'>
            <span className='mr-2'>⚖️</span>
            Integration Focus
          </h3>
          <p className='text-cosmic-silver'>{data.integration_focus}</p>
        </div>
      )}

      {/* Daily Practice */}
      {data.daily_practice && (
        <div className='bg-green-900/10 border border-green-500/20 rounded-lg p-4'>
          <h3 className='text-lg font-semibold text-green-300 mb-3 flex items-center'>
            <span className='mr-2'>🌱</span>
            Daily Practice
          </h3>
          <p className='text-cosmic-silver'>{data.daily_practice}</p>
        </div>
      )}

      {/* Cross-System Correspondences */}
      {correspondences && (
        <div className='bg-blue-900/10 border border-blue-500/20 rounded-lg p-4'>
          <h3 className='text-lg font-semibold text-blue-300 mb-3 flex items-center'>
            <span className='mr-2'>🔗</span>
            Cross-System Correspondences
          </h3>
          <div className='space-y-3'>
            {correspondences.daily_focus && (
              <div className='bg-blue-900/20 rounded-lg p-3'>
                <p className='text-blue-300 font-medium mb-1'>Daily Focus</p>
                <p className='text-cosmic-silver text-sm'>
                  {correspondences.daily_focus.tarot} ↔{' '}
                  {correspondences.daily_focus.hebrew_letter}
                </p>
                <p className='text-blue-400 text-xs'>
                  Path {correspondences.daily_focus.tree_path} •{' '}
                  {correspondences.daily_focus.astrology}
                </p>
              </div>
            )}
            {correspondences.spiritual_center && (
              <div className='bg-blue-900/20 rounded-lg p-3'>
                <p className='text-blue-300 font-medium mb-1'>
                  Spiritual Center
                </p>
                <p className='text-cosmic-silver text-sm'>
                  {correspondences.spiritual_center.sephirah} ↔{' '}
                  {correspondences.spiritual_center.astrology}
                </p>
                <p className='text-blue-400 text-xs'>
                  {correspondences.spiritual_center.tarot_association} •{' '}
                  {correspondences.spiritual_center.element}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SpiritualChart;
export type { SpiritualChartData, SpiritualChartProps };
