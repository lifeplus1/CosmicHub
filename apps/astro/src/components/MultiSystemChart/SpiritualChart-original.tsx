import React, { useState, useCallback, memo } from 'react';
import type { UnifiedBirthData } from '@cosmichub/types';
import type {
  SpiritualSystemsData,
  SpiritualSynthesisData,
  SephirahData,
  KabbalahSystemData,
  KabbalahPathData
} from './types';
import { Card, CardContent, CardHeader, CardTitle, Button, ErrorBoundary } from '@cosmichub/ui';

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

interface SpiritualChartProps {
  chartData?: SpiritualSystemsData;
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

  // Memoized tab handlers for performance
  const handleTarotTab = useCallback(() => setActiveTab('tarot'), []);
  const handleKabbalahTab = useCallback(() => setActiveTab('kabbalah'), []);
  const handleTreeTab = useCallback(() => setActiveTab('tree'), []);
  const handleSynthesisTab = useCallback(() => setActiveTab('synthesis'), []);

  // Note: error state removed as it's not currently used but may be needed for future error handling

  // Handle loading state
  if (isLoading) {
    return (
      <Card className="cosmic-glass border-cosmic-purple/30 bg-cosmic-dark/50">
        <CardContent className="p-8 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-cosmic-purple border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className='text-cosmic-silver'>
            Calculating spiritual guidance...
          </p>
        </CardContent>
      </Card>
    );
  }

  // Handle no data state
  if (!chartData) {
    return (
      <Card className="cosmic-glass border-cosmic-purple/30 bg-cosmic-dark/50">
        <CardContent className="p-8 text-center">
          <CardTitle className="text-2xl font-bold text-cosmic-gold mb-4 font-cinzel">
            🔮 SPIRITUAL-001 System Ready
          </CardTitle>
          <p className='text-cosmic-silver/70 text-lg mb-6'>
            Enter your birth details to receive comprehensive spiritual guidance
            from Tarot, Kabbalah Tree of Life, and Hermetic correspondences
          </p>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <Card className="border-cosmic-purple/20 bg-cosmic-purple/10">
              <CardContent className="p-4">
                <h4 className='text-cosmic-gold font-semibold mb-2'>🃏 Tarot</h4>
                <p className='text-cosmic-silver/60 text-sm'>
                  78-card system with Tree of Life paths
                </p>
              </CardContent>
            </Card>
            <Card className="border-cosmic-gold/20 bg-cosmic-gold/10">
              <CardContent className="p-4">
                <h4 className='text-cosmic-gold font-semibold mb-2'>🌟 Kabbalah</h4>
                <p className='text-cosmic-silver/60 text-sm'>
                  10 Sephirot + 22 paths visualization
                </p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="cosmic-glass border-cosmic-gold/20 shadow-2xl shadow-cosmic-purple/20">
      <CardHeader className="border-b border-cosmic-gold/10">
        <CardTitle className="text-3xl font-bold text-cosmic-gold font-cinzel flex items-center gap-3">
          <span>🔮</span>
          Spiritual Systems Analysis
          <span className='text-xs bg-cosmic-purple/20 text-cosmic-gold px-3 py-1 rounded-full border border-cosmic-purple/30'>
            SPIRITUAL-001
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-8">

        {/* Enhanced Tab Navigation */}
        <div className='flex flex-wrap gap-2 mb-8 p-2 bg-cosmic-dark/30 rounded-xl border border-cosmic-silver/10'>
          <Button
            onClick={handleTarotTab}
            variant={activeTab === 'tarot' ? 'cosmic' : 'outline'}
            size="sm"
            className="flex-1 min-w-0"
            aria-label="View Tarot analysis"
          >
            🃏 Tarot
          </Button>
          <Button
            onClick={handleKabbalahTab}
            variant={activeTab === 'kabbalah' ? 'cosmic' : 'outline'}
            size="sm"
            className="flex-1 min-w-0"
            aria-label="View Kabbalah analysis"
          >
            🌟 Kabbalah
          </Button>
          <Button
            onClick={handleTreeTab}
            variant={activeTab === 'tree' ? 'cosmic' : 'outline'}
            size="sm"
            className="flex-1 min-w-0"
            aria-label="View Tree of Life analysis"
          >
            🌳 Tree of Life
          </Button>
          <Button
            onClick={handleSynthesisTab}
            variant={activeTab === 'synthesis' ? 'cosmic' : 'outline'}
            size="sm"
            className="flex-1 min-w-0"
            aria-label="View Synthesis analysis"
          >
            ⚡ Synthesis
          </Button>
        </div>

        {/* Tab Content */}
        <main className='min-h-96' role="tabpanel" aria-label={`${activeTab} spiritual analysis`}>
          {activeTab === 'tarot' && (
            <section aria-labelledby="tarot-heading">
              <h2 id="tarot-heading" className="sr-only">Tarot Analysis</h2>
              <TarotSection data={chartData.tarot} />
            </section>
          )}
          {activeTab === 'kabbalah' && (
            <section aria-labelledby="kabbalah-heading">
              <h2 id="kabbalah-heading" className="sr-only">Kabbalah Analysis</h2>
              <KabbalahSection data={chartData.kabbalah} />
            </section>
          )}
          {activeTab === 'tree' && (
            <section aria-labelledby="tree-heading">
              <h2 id="tree-heading" className="sr-only">Tree of Life Analysis</h2>
              <TreeOfLifeSection data={chartData.synthesis?.tree_visualization} />
            </section>
          )}
          {activeTab === 'synthesis' && (
            <section aria-labelledby="synthesis-heading">
              <h2 id="synthesis-heading" className="sr-only">Synthesis Analysis</h2>
              <SynthesisSection
                data={chartData.synthesis}
                correspondences={chartData.correspondences}
              />
            </section>
          )}
        </main>
      </CardContent>
    </Card>
  );
};

// Enhanced Tarot Section Component
const TarotSection: React.FC<{ data?: SpiritualSystemsData['tarot'] }> = ({
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
const KabbalahSection: React.FC<{ data?: KabbalahSystemData }> = ({ data }) => {
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
            {relevantPaths.slice(0, 3).map((path: KabbalahPathData, index: number) => (
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
const TreeOfLifeSection: React.FC<{ data?: SpiritualSynthesisData['tree_visualization'] }> = ({
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
            {sephirot.map((seph: SephirahData, index: number) => {
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
          .filter((s: SephirahData) => s.activation_level !== 'inactive')
          .map((seph: SephirahData, index: number) => (
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
  data?: SpiritualSynthesisData;
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

// Memoized component for performance optimization
const MemoizedSpiritualChart = memo(SpiritualChart);

// Enhanced component with error boundary
const SpiritualChartWithErrorBoundary: React.FC<SpiritualChartProps> = (props) => (
  <ErrorBoundary fallback={<div className="cosmic-error p-8 text-center">Error loading spiritual chart</div>}>
    <MemoizedSpiritualChart {...props} />
  </ErrorBoundary>
);

export default SpiritualChartWithErrorBoundary;
export type { SpiritualChartProps };
