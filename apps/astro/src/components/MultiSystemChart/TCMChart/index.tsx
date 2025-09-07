import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button } from '@cosmichub/ui';
import { QuestionMarkCircledIcon } from '@radix-ui/react-icons';
import type { UnifiedBirthData as _UnifiedBirthData } from '@cosmichub/types';
import type { TCMChartData as MainTCMChartData } from '../types';

// Import extracted components
import { TCMEducationDialog } from './TCMEducationDialog';
import { ConstitutionTab } from './tabs/ConstitutionTab';
import { ElementsTab } from './tabs/ElementsTab';
import { MeridiansTab } from './tabs/MeridiansTab';
import { HealthTab } from './tabs/HealthTab';
import { SynthesisTab } from './tabs/SynthesisTab';

// Import utilities
import { getEducationalContent } from './utils/educationalContent';
import type { TCMChartProps, TCMTabType, EducationalDialogState } from './utils/types';

/**
 * Transform main TCM data structure to component-expected structure
 * This bridges the gap between backend and component types
 */
const transformTCMData = (data: MainTCMChartData): import('./utils/types').ComponentTCMChartData => {
  return {
    constitution: data.constitutional_analysis ? {
      primaryType: data.constitutional_analysis.primary_type.name || 'Unknown',
      secondaryType: data.constitutional_analysis.secondary_type?.name || undefined,
      traits: data.constitutional_analysis.primary_type.characteristics || [],
      strengths: [], // Default empty array, can be enhanced with additional data
      challenges: data.constitutional_analysis.primary_type.vulnerabilities ?? [],
      recommendations: data.constitutional_analysis.primary_type.recommendations ?? [],
    } : undefined,
    elements: data.five_elements ? {
      wood: data.five_elements.elements?.find(e => e.name === 'Wood')?.percentage ?? 0,
      fire: data.five_elements.elements?.find(e => e.name === 'Fire')?.percentage ?? 0,
      earth: data.five_elements.elements?.find(e => e.name === 'Earth')?.percentage ?? 0,
      metal: data.five_elements.elements?.find(e => e.name === 'Metal')?.percentage ?? 0,
      water: data.five_elements.elements?.find(e => e.name === 'Water')?.percentage ?? 0,
    } : undefined,
    meridians: data.meridian_system ? {
      primary: data.meridian_system.meridians?.slice(0, 6).map(m => m.name) ?? [],
      secondary: data.meridian_system.meridians?.slice(6).map(m => m.name) ?? [],
      blocked: data.meridian_system.blockage_areas ?? [],
      recommendations: data.meridian_system.flow_patterns?.flatMap(p => p.recommendations) ?? [],
    } : undefined,
    health: data.health_correlations ? {
      dietary: data.synthesis?.lifestyle_recommendations?.filter(r => r.category === 'diet')?.flatMap(r => r.recommendations) ?? [],
      lifestyle: data.synthesis?.lifestyle_recommendations?.filter(r => r.category === 'meditation' || r.category === 'sleep')?.flatMap(r => r.recommendations) ?? [],
      seasonal: Object.values(data.synthesis?.seasonal_adjustments ?? {}).flat(),
      exercise: data.synthesis?.lifestyle_recommendations?.filter(r => r.category === 'exercise')?.flatMap(r => r.recommendations) ?? [],
    } : undefined,
    synthesis: data.synthesis ? {
      overview: data.synthesis.tcm_astrology_integration ?? '',
      keyInsights: data.synthesis.personalized_wellness_plan?.slice(0, 3) ?? [],
      integration: data.synthesis.personalized_wellness_plan?.slice(3, 6) ?? [],
      practicalSteps: data.synthesis.personalized_wellness_plan?.slice(6) ?? [],
    } : undefined,
  };
};

/**
 * Main TCM Chart Component
 * Refactored for better performance and maintainability
 * Following Type Bridge System and component best practices
 */
export const TCMChart: React.FC<TCMChartProps> = React.memo(function TCMChart({ 
  data: rawData, 
  birthData: _birthData, 
  isLoading = false 
}) {
  // Transform the data to the expected format
  const data = rawData ? transformTCMData(rawData) : undefined;
  // Tab navigation state
  const [activeTab, setActiveTab] = useState<TCMTabType>('constitution');
  
  // Educational dialog state  
  const [educationalDialog, setEducationalDialog] = useState<EducationalDialogState>({
    isOpen: false,
    topic: '',
    content: null
  });

  // Memoized tab change handlers
  const handleConstitutionTab = useCallback(() => setActiveTab('constitution'), []);
  const handleElementsTab = useCallback(() => setActiveTab('elements'), []);
  const handleMeridiansTab = useCallback(() => setActiveTab('meridians'), []);
  const handleHealthTab = useCallback(() => setActiveTab('health'), []);
  const handleSynthesisTab = useCallback(() => setActiveTab('synthesis'), []);

  // Educational dialog handlers
  const openEducationalDialog = useCallback((topic: string) => {
    const content = getEducationalContent(topic);
    setEducationalDialog({
      isOpen: true,
      topic,
      content
    });
  }, []);

  const closeEducationalDialog = useCallback(() => {
    setEducationalDialog({
      isOpen: false,
      topic: '',
      content: null
    });
  }, []);

  // Specific educational help handlers
  const handleConstitutionHelp = useCallback(() => openEducationalDialog('constitution'), [openEducationalDialog]);
  const handleElementsHelp = useCallback(() => openEducationalDialog('five-elements'), [openEducationalDialog]);
  const handleMeridiansHelp = useCallback(() => openEducationalDialog('meridians'), [openEducationalDialog]);
  const handleHealthHelp = useCallback(() => openEducationalDialog('health-recommendations'), [openEducationalDialog]);
  const handleSynthesisHelp = useCallback(() => openEducationalDialog('synthesis'), [openEducationalDialog]);

  // Memoized tab button class generator
  const getTabButtonClass = useCallback((tabName: TCMTabType) => {
    return `p-3 rounded transition-colors ${
      activeTab === tabName
        ? 'bg-green-500/20 text-green-300 border border-green-500/30'
        : 'text-cosmic-silver hover:text-green-300 hover:bg-green-500/10'
    }`;
  }, [activeTab]);

  // Handle loading state
  if (isLoading) {
    return (
      <div className="cosmic-card bg-gradient-to-br from-green-900/20 to-yellow-900/20 border border-green-500/30">
        <div className="p-6 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-cosmic-silver">Analyzing your TCM constitutional patterns...</p>
        </div>
      </div>
    );
  }

  // Handle no data state
  if (!data) {
    return (
      <div className="cosmic-card bg-gradient-to-br from-green-900/20 to-yellow-900/20 border border-green-500/30">
        <div className="p-6 text-center">
          <p className="text-cosmic-silver">No TCM analysis data available</p>
        </div>
      </div>
    );
  }

  return (
    <Card className="cosmic-card bg-gradient-to-br from-green-900/20 to-yellow-900/20 border border-green-500/30">
      <CardHeader className="border-b border-green-500/20">
        <CardTitle className="cosmic-title text-green-300">
          <span className="mr-2">🏮</span>
          Traditional Chinese Medicine Analysis
          <span className="text-sm font-normal text-cosmic-silver block mt-1">
            Constitutional patterns and elemental balance from your birth chart
          </span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between mb-6">
          {/* Educational Help Button */}
          <Button
            onClick={handleConstitutionHelp}
            className="p-2 text-cosmic-purple hover:text-cosmic-gold transition-colors"
            variant="ghost"
            aria-label="Learn about TCM concepts"
          >
            <QuestionMarkCircledIcon className="w-6 h-6" />
          </Button>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Button
            onClick={handleConstitutionTab}
            className={getTabButtonClass('constitution')}
            variant="ghost"
          >
            👑 Constitution
          </Button>
          <Button
            onClick={handleElementsTab}
            className={getTabButtonClass('elements')}
            variant="ghost"
          >
            🏮 Five Elements
          </Button>
          <Button
            onClick={handleMeridiansTab}
            className={getTabButtonClass('meridians')}
            variant="ghost"
          >
            🌊 Meridians
          </Button>
          <Button
            onClick={handleHealthTab}
            className={getTabButtonClass('health')}
            variant="ghost"
          >
            💚 Health
          </Button>
          <Button
            onClick={handleSynthesisTab}
            className={getTabButtonClass('synthesis')}
            variant="ghost"
          >
            🔮 Synthesis
          </Button>
        </div>

        {/* Tab Content */}
        <div className="min-h-96">
          {activeTab === 'constitution' && (
            <ConstitutionTab 
              chartData={data} 
              isLoading={isLoading}
              onEducationalHelp={handleConstitutionHelp}
            />
          )}
          {activeTab === 'elements' && (
            <ElementsTab 
              chartData={data} 
              isLoading={isLoading}
              onEducationalHelp={handleElementsHelp}
            />
          )}
          {activeTab === 'meridians' && (
            <MeridiansTab 
              chartData={data} 
              isLoading={isLoading}
              onEducationalHelp={handleMeridiansHelp}
            />
          )}
          {activeTab === 'health' && (
            <HealthTab 
              chartData={data} 
              isLoading={isLoading}
              onEducationalHelp={handleHealthHelp}
            />
          )}
          {activeTab === 'synthesis' && (
            <SynthesisTab 
              chartData={data} 
              isLoading={isLoading}
              onEducationalHelp={handleSynthesisHelp}
            />
          )}
        </div>
      </CardContent>

      {/* Educational Dialog */}
      <TCMEducationDialog
        isOpen={educationalDialog.isOpen}
        topic={educationalDialog.topic}
        content={educationalDialog.content}
        onClose={closeEducationalDialog}
      />
    </Card>
  );
});

TCMChart.displayName = 'TCMChart';

export default TCMChart;
export type { TCMChartProps } from './utils/types';
