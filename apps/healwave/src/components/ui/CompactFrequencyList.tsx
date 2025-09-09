/**
 * Compact Frequency List with Educational Content
 * Displays frequencies in a clean, compact format with detailed educational information
 */

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import * as Dialog from '@radix-ui/react-dialog';
import * as Tooltip from '@radix-ui/react-tooltip';
import { ValidatedFrequencyData as FrequencyData } from '../../schemas/frequencySchemas';
import { getFrequencyEducation, FrequencyEducation } from '../../data/frequencyEducation';

interface CompactFrequencyListProps {
  frequencies: FrequencyData[];
  selectedFrequency?: FrequencyData;
  onFrequencySelect: (frequency: FrequencyData) => void;
  categoryFilter?: string;
  className?: string;
}

export const CompactFrequencyList: React.FC<CompactFrequencyListProps> = ({
  frequencies,
  selectedFrequency,
  onFrequencySelect,
  categoryFilter = 'all',
  className = ''
}) => {
  const [selectedEducation, setSelectedEducation] = useState<FrequencyEducation | null>(null);
  const [isEducationOpen, setIsEducationOpen] = useState(false);

  // Filter and sort frequencies
  const filteredFrequencies = useMemo(() => {
    let filtered = frequencies;
    
    if (categoryFilter !== 'all') {
      filtered = frequencies.filter(freq => freq.category === categoryFilter);
    }
    
    return filtered.sort((a, b) => a.frequency - b.frequency);
  }, [frequencies, categoryFilter]);

  // Group frequencies by category for better organization
  const groupedFrequencies = useMemo(() => {
    const groups: Record<string, FrequencyData[]> = {};
    
    filteredFrequencies.forEach(freq => {
      if (!groups[freq.category]) {
        groups[freq.category] = [];
      }
      groups[freq.category]?.push(freq);
    });
    
    return groups;
  }, [filteredFrequencies]);

  const handleFrequencyClick = (frequency: FrequencyData) => {
    onFrequencySelect(frequency);
  };

  const handleEducationClick = (frequency: FrequencyData, event: React.MouseEvent) => {
    event.stopPropagation();
    const education = getFrequencyEducation(frequency.frequency);
    if (education) {
      setSelectedEducation(education);
      setIsEducationOpen(true);
    }
  };

  const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
      solfeggio: 'text-red-400 bg-red-500/10 border-red-500/30',
      chakra: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
      brainwave: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
      planetary: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
      stellar: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
      metallic: 'text-slate-400 bg-slate-500/10 border-slate-500/30',
      rife: 'text-green-400 bg-green-500/10 border-green-500/30',
      binaural: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
      elemental: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
      sacred_geometry: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
      biological: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
      other: 'text-zinc-400 bg-zinc-500/10 border-zinc-500/30',
      custom: 'text-teal-400 bg-teal-500/10 border-teal-500/30'
    };
    return colors[category] ?? 'text-gray-400 bg-gray-500/10 border-gray-500/30';
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Compact List View */}
      <div className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-track-cosmic-purple/10 scrollbar-thumb-cosmic-purple/30">
        {Object.entries(groupedFrequencies).map(([category, categoryFreqs]) => (
          <div key={category} className="mb-4">
            <div className={`text-xs font-semibold mb-2 px-2 py-1 rounded capitalize inline-block ${getCategoryColor(category)}`}>
              {category} ({categoryFreqs.length})
            </div>
            
            <div className="space-y-1">
              {categoryFreqs.map((frequency, index) => {
                const isSelected = selectedFrequency?.frequency === frequency.frequency;
                const hasEducation = !!getFrequencyEducation(frequency.frequency);
                
                return (
                  <motion.div
                    key={`${frequency.frequency}-${frequency.category}-${index}`}
                    className={`group flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? 'border-cosmic-gold bg-cosmic-gold/10 shadow-md'
                        : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                    }`}
                    onClick={() => handleFrequencyClick(frequency)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {/* Frequency Info */}
                    <div className="flex items-center space-x-3 flex-1">
                      <div
                        className="w-3 h-3 rounded-full border"
                        data-color={frequency.color}
                      />
                      <div>
                        <div className="text-sm font-medium text-white">
                          {frequency.frequency.toFixed(1)} Hz
                        </div>
                        <div className="text-xs text-cosmic-silver/70 truncate max-w-32">
                          {frequency.label}
                        </div>
                      </div>
                    </div>

                    {/* Benefits Preview */}
                    <div className="flex-1 px-2">
                      {frequency.benefits && frequency.benefits.length > 0 && (
                        <Tooltip.Provider>
                          <Tooltip.Root>
                            <Tooltip.Trigger asChild>
                              <div className="text-xs text-cosmic-silver/60 truncate">
                                {frequency.benefits.slice(0, 2).join(', ')}
                                {frequency.benefits.length > 2 && '...'}
                              </div>
                            </Tooltip.Trigger>
                            <Tooltip.Content className="max-w-xs p-2 text-xs text-white bg-black rounded-lg border border-white/20">
                              <div className="font-medium mb-1">Benefits:</div>
                              <ul className="list-disc list-inside space-y-1">
                                {frequency.benefits.map((benefit, index) => (
                                  <li key={index}>{benefit}</li>
                                ))}
                              </ul>
                            </Tooltip.Content>
                          </Tooltip.Root>
                        </Tooltip.Provider>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-2">
                      {hasEducation && (
                        <motion.button
                          onClick={(e) => handleEducationClick(frequency, e)}
                          className="p-1 text-cosmic-gold hover:text-yellow-300 transition-colors"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          title="View detailed information"
                        >
                          <span className="text-sm">📚</span>
                        </motion.button>
                      )}
                      
                      <motion.button
                        onClick={() => handleFrequencyClick(frequency)}
                        className={`px-2 py-1 text-xs rounded transition-colors ${
                          isSelected
                            ? 'bg-cosmic-gold text-black'
                            : 'bg-cosmic-purple/20 text-cosmic-purple hover:bg-cosmic-purple/30'
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {isSelected ? 'Active' : 'Select'}
                      </motion.button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Educational Content Modal */}
      <Dialog.Root open={isEducationOpen} onOpenChange={setIsEducationOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl max-h-[90vh] bg-gradient-to-b from-cosmic-purple/20 to-black/90 border border-cosmic-purple/30 rounded-xl p-6 z-50 overflow-y-auto scrollbar-thin scrollbar-track-cosmic-purple/10 scrollbar-thumb-cosmic-purple/30">
            {selectedEducation && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <Dialog.Title className="text-2xl font-bold text-cosmic-gold mb-2">
                      {selectedEducation.name}
                    </Dialog.Title>
                    <div className="flex items-center space-x-4 text-sm text-cosmic-silver">
                      <span className="font-mono text-lg text-white">
                        {selectedEducation.frequency} Hz
                      </span>
                      <span className={`px-2 py-1 rounded capitalize ${getCategoryColor(selectedEducation.category)}`}>
                        {selectedEducation.category}
                      </span>
                    </div>
                  </div>
                  <Dialog.Close className="text-cosmic-silver hover:text-white transition-colors">
                    <span className="text-2xl">×</span>
                  </Dialog.Close>
                </div>

                {/* Quick Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="text-sm font-medium text-cosmic-gold mb-2">Recommended Duration</div>
                    <div className="text-white">{selectedEducation.recommendedDuration}</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="text-sm font-medium text-cosmic-gold mb-2">Best Time</div>
                    <div className="text-white">{selectedEducation.bestTimeToUse}</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="text-sm font-medium text-cosmic-gold mb-2">Category</div>
                    <div className="text-white capitalize">{selectedEducation.category}</div>
                  </div>
                </div>

                {/* Description */}
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <h3 className="text-lg font-semibold text-cosmic-gold mb-3">Description</h3>
                  <p className="text-cosmic-silver leading-relaxed">
                    {selectedEducation.detailedDescription}
                  </p>
                </div>

                {/* Effects Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <EffectCard
                    title="💭 Mental Effects"
                    effects={selectedEducation.mentalEffects}
                    color="blue"
                  />
                  <EffectCard
                    title="💖 Emotional Effects"
                    effects={selectedEducation.emotionalEffects}
                    color="pink"
                  />
                  <EffectCard
                    title="🧘 Physical Effects"
                    effects={selectedEducation.physicalEffects}
                    color="green"
                  />
                  <EffectCard
                    title="✨ Spiritual Effects"
                    effects={selectedEducation.spiritualEffects}
                    color="purple"
                  />
                </div>

                {/* Scientific & Historical Context */}
                {(selectedEducation.scientificBasis || selectedEducation.historicalContext) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedEducation.scientificBasis && (
                      <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/30">
                        <h3 className="text-lg font-semibold text-blue-300 mb-3">🔬 Scientific Basis</h3>
                        <p className="text-cosmic-silver text-sm leading-relaxed">
                          {selectedEducation.scientificBasis}
                        </p>
                      </div>
                    )}
                    {selectedEducation.historicalContext && (
                      <div className="bg-amber-500/10 rounded-lg p-4 border border-amber-500/30">
                        <h3 className="text-lg font-semibold text-amber-300 mb-3">📜 Historical Context</h3>
                        <p className="text-cosmic-silver text-sm leading-relaxed">
                          {selectedEducation.historicalContext}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Usage Tips */}
                <div className="bg-cosmic-gold/10 rounded-lg p-4 border border-cosmic-gold/30">
                  <h3 className="text-lg font-semibold text-cosmic-gold mb-3">💡 Usage Tips</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm font-medium text-cosmic-gold mb-2">Use Cases:</div>
                      <ul className="text-cosmic-silver text-sm space-y-1">
                        {selectedEducation.useCases.map((useCase, index) => (
                          <li key={index}>• {useCase}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-cosmic-gold mb-2">Combination Tips:</div>
                      <ul className="text-cosmic-silver text-sm space-y-1">
                        {selectedEducation.combinationTips.map((tip, index) => (
                          <li key={index}>• {tip}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Precautions */}
                {selectedEducation.precautions && selectedEducation.precautions.length > 0 && (
                  <div className="bg-red-500/10 rounded-lg p-4 border border-red-500/30">
                    <h3 className="text-lg font-semibold text-red-300 mb-3">⚠️ Precautions</h3>
                    <ul className="text-cosmic-silver text-sm space-y-1">
                      {selectedEducation.precautions.map((precaution, index) => (
                        <li key={index}>• {precaution}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </motion.div>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
};

interface EffectCardProps {
  title: string;
  effects: string[];
  color: 'blue' | 'pink' | 'green' | 'purple';
}

const EffectCard: React.FC<EffectCardProps> = ({ title, effects, color }) => {
  const colorClasses = {
    blue: 'bg-blue-500/10 border-blue-500/30 text-blue-300',
    pink: 'bg-pink-500/10 border-pink-500/30 text-pink-300',
    green: 'bg-green-500/10 border-green-500/30 text-green-300',
    purple: 'bg-purple-500/10 border-purple-500/30 text-purple-300'
  };

  return (
    <div className={`rounded-lg p-4 border ${colorClasses[color]}`}>
      <h4 className="font-semibold mb-3 text-sm">{title}</h4>
      <ul className="text-cosmic-silver text-xs space-y-1">
        {effects.slice(0, 4).map((effect, index) => (
          <li key={index}>• {effect}</li>
        ))}
        {effects.length > 4 && (
          <li className="text-cosmic-silver/50">+{effects.length - 4} more...</li>
        )}
      </ul>
    </div>
  );
};

export default CompactFrequencyList;
