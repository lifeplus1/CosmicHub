/**
 * Unified Frequency Data Layer
 * Comprehensive healing frequencies library organized by category
 * Consolidates all frequency presets and eliminates redundancy
 */

import { 
  getAllPresets, 
  FrequencyPreset
} from '@cosmichub/integrations';
import { CHAKRA_FREQUENCIES, ChakraKey } from '../components/enhancements/chakraConstants';
import { 
  ValidatedFrequencyData,
  validateFrequencyData,
  safeValidateFrequencyData
} from '../schemas/frequencySchemas';

// Use ValidatedFrequencyData instead of importing from UI to ensure type consistency
type FrequencyData = ValidatedFrequencyData;

/**
 * Get color based on category
 */
const getCategoryColor = (category: string): string => {
  const colorMap: Record<string, string> = {
    solfeggio: '#ff6b6b',
    chakra: '#9333ea',
    brainwave: '#3b82f6',
    planetary: '#ffd700',
    stellar: '#87ceeb',
    metallic: '#c0c0c0',
    rife: '#a855f7',
    binaural: '#8b5cf6',
    elemental: '#22c55e',
    sacred_geometry: '#f59e0b',
    biological: '#ef4444',
    other: '#6b7280',
    custom: '#10b981'
  };
  return colorMap[category] ?? '#ffffff';
};

/**
 * Get chakra-specific colors
 */
const getChakraColor = (chakraKey: ChakraKey): string => {
  const chakra = CHAKRA_FREQUENCIES[chakraKey];
  return chakra?.color ?? '#ffffff';
};

/**
 * Convert FrequencyPreset to FrequencyData format
 * Handles both regular frequencies and binaural beats properly
 */
export const convertPresetToFrequencyData = (preset: FrequencyPreset): FrequencyData => {
  // For binaural beats, use the binaural beat frequency as the primary frequency
  // since that's what the brain perceives/entrains to
  const displayFrequency = preset.binauralBeat && preset.binauralBeat > 0 
    ? preset.binauralBeat 
    : preset.baseFrequency;
  
  // Create enhanced label for binaural beats
  const enhancedLabel = preset.binauralBeat && preset.binauralBeat > 0
    ? `${preset.name} (${preset.binauralBeat} Hz binaural)`
    : preset.name;

  const frequencyData = {
    frequency: displayFrequency,
    amplitude: 0.8,
    phase: 0,
    label: enhancedLabel,
    color: getCategoryColor(preset.category),
    category: preset.category as FrequencyData['category'],
    timestamp: Date.now(),
    benefits: preset.benefits ? [...preset.benefits] : [],
    // Store binaural beat metadata for UI components
    metadata: {
      ...preset.metadata,
      isBinaural: !!(preset.binauralBeat && preset.binauralBeat > 0),
      baseFrequency: preset.baseFrequency,
      binauralBeat: preset.binauralBeat,
      leftEar: preset.metadata?.leftEar || preset.baseFrequency,
      rightEar: preset.metadata?.rightEar || (preset.baseFrequency + (preset.binauralBeat || 0))
    }
  };

  // Validate the converted frequency data
  const validation = safeValidateFrequencyData(frequencyData);
  
  if (!validation.success) {
     
    // Frequency validation failed silently - remove console.warn for production    // Return a safe fallback with validated structure
    return validateFrequencyData({
      frequency: Math.max(1, Math.min(20000, displayFrequency || 440)), // Clamp to valid range
      amplitude: 0.8,
      phase: 0,
      label: enhancedLabel || 'Unknown Frequency',
      color: getCategoryColor('healing'), // Safe fallback category
      category: 'healing',
      timestamp: Date.now(),
      benefits: preset.benefits ? [...preset.benefits] : [],
      metadata: {
        isBinaural: false,
        baseFrequency: preset.baseFrequency || 440,
        binauralBeat: preset.binauralBeat,
        leftEar: preset.baseFrequency || 440,
        rightEar: (preset.baseFrequency || 440) + (preset.binauralBeat || 0),
        validationFailed: true
      }
    });
  }

  return validation.data;
};

/**
 * Frequency category interface for better organization
 */
interface FrequencyCategory {
  name: string;
  description: string;
  frequencies: FrequencyData[];
}

/**
 * Complete healing frequencies organized by category
 * Comprehensive library with systematic deduplication
 */
const HEALING_FREQUENCIES: Record<string, FrequencyCategory> = {
  solfeggio: {
    name: "Solfeggio Frequencies",
    description: "Ancient tones derived from Gregorian chants, used for emotional and spiritual healing.",
    frequencies: [
      { frequency: 174, amplitude: 0.8, phase: 0, label: '174 Hz - Foundation', color: '#ff6b6b', category: 'solfeggio', timestamp: Date.now(), benefits: ['Pain relief', 'Security', 'Natural anesthetic', 'Grounding'] },
      { frequency: 285, amplitude: 0.8, phase: 0, label: '285 Hz - Quantum', color: '#ff8787', category: 'solfeggio', timestamp: Date.now(), benefits: ['Cellular healing', 'Tissue regeneration', 'Energy field restructuring', 'Immunity boost'] },
      { frequency: 396, amplitude: 0.8, phase: 0, label: '396 Hz - Liberation', color: '#ff6b6b', category: 'solfeggio', timestamp: Date.now(), benefits: ['Guilt release', 'Fear liberation', 'Root chakra alignment', 'Security building'] },
      { frequency: 417, amplitude: 0.8, phase: 0, label: '417 Hz - Change', color: '#ff8787', category: 'solfeggio', timestamp: Date.now(), benefits: ['Trauma clearing', 'Negative situation resolution', 'Creativity enhancement', 'Change facilitation'] },
      { frequency: 528, amplitude: 0.8, phase: 0, label: '528 Hz - Miracle', color: '#32cd32', category: 'solfeggio', timestamp: Date.now(), benefits: ['DNA repair', 'Love frequency', 'Transformation', 'Cellular regeneration'] },
      { frequency: 639, amplitude: 0.8, phase: 0, label: '639 Hz - Connection', color: '#ff6b6b', category: 'solfeggio', timestamp: Date.now(), benefits: ['Relationship harmony', 'Communication enhancement', 'Empathy fostering', 'Heart opening'] },
      { frequency: 741, amplitude: 0.8, phase: 0, label: '741 Hz - Awakening', color: '#ff8787', category: 'solfeggio', timestamp: Date.now(), benefits: ['Intuition awakening', 'Problem solving', 'Detoxification', 'Awareness sharpening'] },
      { frequency: 852, amplitude: 0.8, phase: 0, label: '852 Hz - Insight', color: '#ff6b6b', category: 'solfeggio', timestamp: Date.now(), benefits: ['Spiritual order', 'Third eye activation', 'Illusion dissolution', 'Enhanced insight'] },
      { frequency: 963, amplitude: 0.8, phase: 0, label: '963 Hz - Enlightenment', color: '#e67700', category: 'solfeggio', timestamp: Date.now(), benefits: ['Divine connection', 'Oneness', 'Spiritual awakening', 'Pineal activation'] },
      { frequency: 1074, amplitude: 0.8, phase: 0, label: '1074 Hz - Transcendence', color: '#ff6b6b', category: 'solfeggio', timestamp: Date.now(), benefits: ['Spiritual transcendence', 'Higher consciousness', 'Meditation depth'] },
      { frequency: 1285, amplitude: 0.8, phase: 0, label: '1285 Hz - Cleansing', color: '#ff8787', category: 'solfeggio', timestamp: Date.now(), benefits: ['Energy cleansing', 'Vibrational elevation', 'Flow promotion'] }
    ]
  },

  rife: {
    name: "Rife Frequencies",
    description: "Developed by Royal Rife for pathogen disruption and therapeutic healing.",
    frequencies: [
      // General Healing & Wellness
      { frequency: 20, amplitude: 0.6, phase: 0, label: 'General Balance', color: '#9333ea', category: 'rife', timestamp: Date.now(), benefits: ['Overall wellness', 'Balance', 'Harmony'] },
      { frequency: 95, amplitude: 0.6, phase: 0, label: 'Energy Boost', color: '#a855f7', category: 'rife', timestamp: Date.now(), benefits: ['Energy', 'Vitality', 'Cellular function'] },
      { frequency: 304, amplitude: 0.6, phase: 0, label: 'Immune Stimulation', color: '#9333ea', category: 'rife', timestamp: Date.now(), benefits: ['Boosts immunity', 'Supports recovery'] },
      { frequency: 465, amplitude: 0.6, phase: 0, label: 'Pain Relief', color: '#b967f8', category: 'rife', timestamp: Date.now(), benefits: ['Pain reduction', 'Inflammation', 'Relief'] },
      { frequency: 727, amplitude: 0.6, phase: 0, label: 'Universal Healing', color: '#daa520', category: 'rife', timestamp: Date.now(), benefits: ['Boosts vitality', 'Aids recovery', 'Digestive support'] },
      { frequency: 787, amplitude: 0.6, phase: 0, label: 'Universal Remedy', color: '#9333ea', category: 'rife', timestamp: Date.now(), benefits: ['Antibacterial', 'Immune support', 'Infection clearing'] },
      { frequency: 800, amplitude: 0.6, phase: 0, label: 'Cure-All', color: '#a855f7', category: 'rife', timestamp: Date.now(), benefits: ['Holistic healing', 'Energy balance', 'Overall wellness'] },
      { frequency: 880, amplitude: 0.6, phase: 0, label: 'Detox & Cleanse', color: '#f0e68c', category: 'rife', timestamp: Date.now(), benefits: ['Detoxification', 'Cellular cleanse', 'Stomach balance'] },
      { frequency: 1550, amplitude: 0.6, phase: 0, label: 'Pathogen Elimination', color: '#87ceeb', category: 'rife', timestamp: Date.now(), benefits: ['Viral disruption', 'Bacterial elimination', 'Lung function'] },
      { frequency: 4320, amplitude: 0.6, phase: 0, label: 'Cellular Regeneration', color: '#a855f7', category: 'rife', timestamp: Date.now(), benefits: ['Promotes cell growth', 'Reduces inflammation'] },
      { frequency: 5000, amplitude: 0.6, phase: 0, label: 'Deep Tissue Healing', color: '#a855f7', category: 'rife', timestamp: Date.now(), benefits: ['Wound healing', 'Nerve repair', 'Immune activation'] },
      { frequency: 10000, amplitude: 0.6, phase: 0, label: 'Cellular Repair', color: '#c078f9', category: 'rife', timestamp: Date.now(), benefits: ['Cellular healing', 'Regeneration', 'Vitality boost'] },

      // Immune System Support
      { frequency: 2720, amplitude: 0.6, phase: 0, label: 'Immune Boost', color: '#9333ea', category: 'rife', timestamp: Date.now(), benefits: ['Immune support', 'White blood cells', 'Natural defense'] },
      { frequency: 7280, amplitude: 0.6, phase: 0, label: 'Lymphatic Drainage', color: '#b967f8', category: 'rife', timestamp: Date.now(), benefits: ['Lymph flow', 'Detoxification', 'Immune circulation'] },

      // Organ-Specific Frequencies
      { frequency: 341, amplitude: 0.6, phase: 0, label: 'Heart Rhythm', color: '#dc143c', category: 'rife', timestamp: Date.now(), benefits: ['Heart health', 'Circulation', 'Cardiovascular support'] },
      { frequency: 440, amplitude: 0.6, phase: 0, label: 'Kidney Support', color: '#4169e1', category: 'rife', timestamp: Date.now(), benefits: ['Kidney function', 'Filtration', 'Water balance'] },
      { frequency: 524, amplitude: 0.6, phase: 0, label: 'Liver Support', color: '#228b22', category: 'rife', timestamp: Date.now(), benefits: ['Liver function', 'Detoxification', 'Bile production'] },

      // Brain & Nervous System
      { frequency: 1570, amplitude: 0.6, phase: 0, label: 'Memory Enhancement', color: '#9370db', category: 'rife', timestamp: Date.now(), benefits: ['Memory improvement', 'Cognitive function', 'Mental clarity'] },
      { frequency: 3040, amplitude: 0.6, phase: 0, label: 'Neural Regeneration', color: '#dda0dd', category: 'rife', timestamp: Date.now(), benefits: ['Nerve healing', 'Neural pathways', 'Brain repair'] },

      // Bone & Muscle
      { frequency: 2008, amplitude: 0.6, phase: 0, label: 'Bone Healing', color: '#f5f5dc', category: 'rife', timestamp: Date.now(), benefits: ['Bone repair', 'Calcium absorption', 'Fracture healing'] },
      { frequency: 6000, amplitude: 0.6, phase: 0, label: 'Joint Mobility', color: '#cd853f', category: 'rife', timestamp: Date.now(), benefits: ['Joint health', 'Mobility', 'Arthritis relief'] },

      // Hormonal & Endocrine
      { frequency: 625, amplitude: 0.6, phase: 0, label: 'Adrenal Support', color: '#ffb6c1', category: 'rife', timestamp: Date.now(), benefits: ['Adrenal health', 'Stress adaptation', 'Energy production'] },
      { frequency: 1335, amplitude: 0.6, phase: 0, label: 'Thyroid Balance', color: '#ffd1dc', category: 'rife', timestamp: Date.now(), benefits: ['Thyroid function', 'Metabolism', 'Energy balance'] },

      // Cellular & DNA
      { frequency: 2127, amplitude: 0.6, phase: 0, label: 'Stem Cell Activation', color: '#00ff7f', category: 'rife', timestamp: Date.now(), benefits: ['Stem cell growth', 'Regeneration', 'Tissue repair'] },
      { frequency: 9999, amplitude: 0.6, phase: 0, label: 'Cellular Resonance', color: '#7fffd4', category: 'rife', timestamp: Date.now(), benefits: ['Cell communication', 'Coherence', 'Optimal function'] }
    ]
  },

  planetary: {
    name: "Planetary Frequencies",
    description: "Based on orbital resonances and astrological associations. Complete solar system including lunar cycles.",
    frequencies: [
      { frequency: 32.312, amplitude: 0.8, phase: 0, label: '🌍 Earth (Schumann)', color: '#8b5000', category: 'planetary', timestamp: Date.now(), benefits: ['Grounding', 'Earth connection', 'Stability'] },
      { frequency: 126.22, amplitude: 0.8, phase: 0, label: '☉ Sun', color: '#ffd700', category: 'planetary', timestamp: Date.now(), benefits: ['Vitality', 'Life force', 'Solar energy', 'Leadership'] },
      { frequency: 136.1, amplitude: 0.8, phase: 0, label: 'Earth Year (OM)', color: '#8b5000', category: 'planetary', timestamp: Date.now(), benefits: ['Grounding', 'Meditative calm', 'Yearly rhythm'] },
      { frequency: 140.25, amplitude: 0.8, phase: 0, label: '♇ Pluto', color: '#800080', category: 'planetary', timestamp: Date.now(), benefits: ['Transformation', 'Rebirth', 'Deep healing', 'Power'] },
      { frequency: 141.27, amplitude: 0.8, phase: 0, label: '☿ Mercury', color: '#87ceeb', category: 'planetary', timestamp: Date.now(), benefits: ['Communication', 'Mental agility', 'Learning', 'Travel'] },
      { frequency: 144.72, amplitude: 0.8, phase: 0, label: '♂ Mars', color: '#ff4500', category: 'planetary', timestamp: Date.now(), benefits: ['Energy', 'Courage', 'Action', 'Strength'] },
      { frequency: 147.85, amplitude: 0.8, phase: 0, label: '♄ Saturn', color: '#708090', category: 'planetary', timestamp: Date.now(), benefits: ['Structure', 'Discipline', 'Responsibility', 'Time'] },
      { frequency: 183.58, amplitude: 0.8, phase: 0, label: '♃ Jupiter', color: '#daa520', category: 'planetary', timestamp: Date.now(), benefits: ['Expansion', 'Wisdom', 'Abundance', 'Growth'] },
      { frequency: 194.18, amplitude: 0.8, phase: 0, label: '🌑 Sidereal Moon', color: '#a9a9a9', category: 'planetary', timestamp: Date.now(), benefits: ['Lunar healing', 'Feminine energy', 'Tides'] },
      { frequency: 207.36, amplitude: 0.8, phase: 0, label: '♅ Uranus', color: '#4fd0e7', category: 'planetary', timestamp: Date.now(), benefits: ['Innovation', 'Awakening', 'Freedom', 'Change'] },
      { frequency: 210.42, amplitude: 0.8, phase: 0, label: '🌕 Synodic Moon', color: '#c0c0c0', category: 'planetary', timestamp: Date.now(), benefits: ['Emotional balance', 'Cycles', 'Intuition'] },
      { frequency: 211.44, amplitude: 0.8, phase: 0, label: '♆ Neptune', color: '#4169e1', category: 'planetary', timestamp: Date.now(), benefits: ['Intuition', 'Dreams', 'Spirituality', 'Imagination'] },
      { frequency: 221.23, amplitude: 0.8, phase: 0, label: '♀ Venus', color: '#ffc0cb', category: 'planetary', timestamp: Date.now(), benefits: ['Love', 'Beauty', 'Harmony', 'Relationships'] },
      { frequency: 442.46, amplitude: 0.8, phase: 0, label: '♀ Venus (Higher Octave)', color: '#ffc0cb', category: 'planetary', timestamp: Date.now(), benefits: ['Love', 'Beauty', 'Harmony', 'Relationships'] },

      // Extended Lunar Frequencies
      { frequency: 187.61, amplitude: 0.8, phase: 0, label: '🌘 Anomalistic Moon', color: '#b0c4de', category: 'planetary', timestamp: Date.now(), benefits: ['Perigee power', 'Intensity', 'Manifestation'] },
      { frequency: 192.25, amplitude: 0.8, phase: 0, label: '🌓 Draconic Moon', color: '#9370db', category: 'planetary', timestamp: Date.now(), benefits: ['Karmic healing', 'Soul purpose', 'Destiny'] }
    ]
  },

  stellar: {
    name: "Stellar Frequencies",
    description: "Cosmic star-based tones for higher consciousness and galactic connection.",
    frequencies: [
      { frequency: 7.83, amplitude: 0.9, phase: 0, label: 'Schumann Resonance', color: '#87ceeb', category: 'stellar', timestamp: Date.now(), benefits: ['Deep relaxation', 'Syncs brainwaves', 'Earth pulse'] },
      { frequency: 155.56, amplitude: 0.9, phase: 0, label: '⭐ Vega', color: '#e6e6fa', category: 'stellar', timestamp: Date.now(), benefits: ['Harmony', 'Music', 'Artistic inspiration'] },
      { frequency: 157.04, amplitude: 0.9, phase: 0, label: '⭐ Spica', color: '#90ee90', category: 'stellar', timestamp: Date.now(), benefits: ['Prosperity', 'Fortune', 'Harvest'] },
      { frequency: 160.18, amplitude: 0.9, phase: 0, label: '⭐ Betelgeuse', color: '#ff4500', category: 'stellar', timestamp: Date.now(), benefits: ['Power', 'Transformation', 'Cosmic energy'] },
      { frequency: 164.3, amplitude: 0.9, phase: 0, label: '⭐ Antares', color: '#dc143c', category: 'stellar', timestamp: Date.now(), benefits: ['Courage', 'Warrior energy', 'Protection'] },
      { frequency: 168.76, amplitude: 0.9, phase: 0, label: '⭐ Aldebaran', color: '#ff6347', category: 'stellar', timestamp: Date.now(), benefits: ['Leadership', 'Royal star', 'Success'] },
      { frequency: 172.06, amplitude: 0.9, phase: 0, label: '⭐ Rigel', color: '#add8e6', category: 'stellar', timestamp: Date.now(), benefits: ['Clarity', 'Illumination', 'Mental brilliance'] },
      { frequency: 250.56, amplitude: 0.9, phase: 0, label: 'Sirius Extended', color: '#87cefa', category: 'stellar', timestamp: Date.now(), benefits: ['Higher wisdom', 'Intuitive clarity'] },
      { frequency: 288.1, amplitude: 0.9, phase: 0, label: '⭐ Sirius', color: '#87cefa', category: 'stellar', timestamp: Date.now(), benefits: ['Wisdom', 'Higher knowledge', 'Spiritual awakening', 'Cosmic connection'] },
      { frequency: 315.8, amplitude: 0.9, phase: 0, label: 'Pleiades', color: '#b0e0e6', category: 'stellar', timestamp: Date.now(), benefits: ['Inspiration', 'Galactic connection', 'Creativity'] },
      { frequency: 423.07, amplitude: 0.9, phase: 0, label: '⭐ Polaris (North Star)', color: '#b0e0e6', category: 'stellar', timestamp: Date.now(), benefits: ['Direction', 'Purpose', 'Navigation', 'True north'] },
      { frequency: 432, amplitude: 0.9, phase: 0, label: 'Universal Stellar (432 Hz)', color: '#87ceeb', category: 'stellar', timestamp: Date.now(), benefits: ['Harmony with universe', 'Stress reduction', 'Cosmic alignment'] }
    ]
  },

  metallic: {
    name: "Metallic Frequencies",
    description: "Derived from metal tuning forks and singing bowls, tied to planetary metals and alchemical properties.",
    frequencies: [
      { frequency: 128.0, amplitude: 0.7, phase: 0, label: '🥇 Gold (Au)', color: '#ffd700', category: 'metallic', timestamp: Date.now(), benefits: ['Nobility', 'Healing', 'Spiritual gold', 'Purification'] },
      { frequency: 141.27, amplitude: 0.7, phase: 0, label: '🟫 Zinc (Zn)', color: '#708090', category: 'metallic', timestamp: Date.now(), benefits: ['Immune system', 'Healing', 'Growth', 'Regeneration'] },
      { frequency: 256.0, amplitude: 0.7, phase: 0, label: '🥈 Silver (Ag)', color: '#c0c0c0', category: 'metallic', timestamp: Date.now(), benefits: ['Intuition', 'Moon energy', 'Feminine healing', 'Protection'] },
      { frequency: 297.07, amplitude: 0.7, phase: 0, label: '⚫ Iron (Fe)', color: '#696969', category: 'metallic', timestamp: Date.now(), benefits: ['Strength', 'Mars energy', 'Blood health', 'Courage'] },
      { frequency: 320.0, amplitude: 0.7, phase: 0, label: '🔶 Copper (Cu)', color: '#b87333', category: 'metallic', timestamp: Date.now(), benefits: ['Conductivity', 'Venus energy', 'Love', 'Circulation'] },
      { frequency: 384.0, amplitude: 0.7, phase: 0, label: '🔵 Titanium (Ti)', color: '#c0c0c0', category: 'metallic', timestamp: Date.now(), benefits: ['Strength', 'Durability', 'Structural healing'] },
      { frequency: 384, amplitude: 0.7, phase: 0, label: 'Tin/Jupiter', color: '#daa520', category: 'metallic', timestamp: Date.now(), benefits: ['Abundance', 'Optimism', 'Expansion'] },
      { frequency: 480, amplitude: 0.7, phase: 0, label: 'Lead/Saturn', color: '#708090', category: 'metallic', timestamp: Date.now(), benefits: ['Structure', 'Resilience', 'Grounding'] },
      { frequency: 492.8, amplitude: 0.7, phase: 0, label: '🟪 Platinum (Pt)', color: '#e5e4e2', category: 'metallic', timestamp: Date.now(), benefits: ['High vibration', 'Spiritual attunement', 'Rare healing'] }
    ]
  },

  chakra: {
    name: "Chakra Frequencies",
    description: "Aligned with the energy centers including extended chakras (Earth Star, Soul Star).",
    frequencies: [
      { frequency: 194.18, amplitude: 0.8, phase: 0, label: 'Earth Star Chakra', color: '#8b4513', category: 'chakra', timestamp: Date.now(), benefits: ['Deep grounding', 'Ancestral connection', 'Root stability'] },
      { frequency: 396, amplitude: 0.8, phase: 0, label: 'Root Chakra (Muladhara)', color: '#dc143c', category: 'chakra', timestamp: Date.now(), benefits: ['Stability', 'Fear release', 'Survival instincts'] },
      { frequency: 417, amplitude: 0.8, phase: 0, label: 'Sacral Chakra (Svadhisthana)', color: '#ff8c00', category: 'chakra', timestamp: Date.now(), benefits: ['Emotional flow', 'Passion', 'Creativity'] },
      { frequency: 528, amplitude: 0.8, phase: 0, label: 'Solar Plexus Chakra (Manipura)', color: '#ffd700', category: 'chakra', timestamp: Date.now(), benefits: ['Confidence', 'Transformation', 'Personal power'] },
      { frequency: 639, amplitude: 0.8, phase: 0, label: 'Heart Chakra (Anahata)', color: '#32cd32', category: 'chakra', timestamp: Date.now(), benefits: ['Relationships', 'Forgiveness', 'Love'] },
      { frequency: 741, amplitude: 0.8, phase: 0, label: 'Throat Chakra (Vishuddha)', color: '#1e90ff', category: 'chakra', timestamp: Date.now(), benefits: ['Truth', 'Expression', 'Communication'] },
      { frequency: 852, amplitude: 0.8, phase: 0, label: 'Third Eye Chakra (Ajna)', color: '#4b0082', category: 'chakra', timestamp: Date.now(), benefits: ['Insight', 'Clarity', 'Intuition'] },
      { frequency: 963, amplitude: 0.8, phase: 0, label: 'Crown Chakra (Sahasrara)', color: '#9400d3', category: 'chakra', timestamp: Date.now(), benefits: ['Enlightenment', 'Unity', 'Spiritual connection'] },
      { frequency: 1074, amplitude: 0.8, phase: 0, label: 'Soul Star Chakra', color: '#ffffff', category: 'chakra', timestamp: Date.now(), benefits: ['Spiritual transcendence', 'Cosmic alignment', 'Higher self'] }
    ]
  },

  brainwave: {
    name: "Brainwave Entrainment Frequencies",
    description: "For binaural beats integration and brainwave synchronization.",
    frequencies: [
      { frequency: 0.5, amplitude: 0.7, phase: 0, label: 'Delta Sleep', color: '#1e40af', category: 'brainwave', timestamp: Date.now(), benefits: ['Deep sleep', 'Healing', 'Regeneration'] },
      { frequency: 2, amplitude: 0.7, phase: 0, label: 'Deep Delta', color: '#1e3a8a', category: 'brainwave', timestamp: Date.now(), benefits: ['Profound restorative sleep', 'Deep healing', 'Dreamless sleep'] },
      { frequency: 4, amplitude: 0.7, phase: 0, label: 'Theta Meditation', color: '#3b82f6', category: 'brainwave', timestamp: Date.now(), benefits: ['Deep meditation', 'Creativity', 'Memory'] },
      { frequency: 6, amplitude: 0.7, phase: 0, label: 'Theta Deep', color: '#60a5fa', category: 'brainwave', timestamp: Date.now(), benefits: ['Meditation', 'Creativity', 'Intuition'] },
      { frequency: 8, amplitude: 0.7, phase: 0, label: 'Alpha Relaxation', color: '#06b6d4', category: 'brainwave', timestamp: Date.now(), benefits: ['Relaxation', 'Creativity', 'Learning'] },
      { frequency: 10, amplitude: 0.7, phase: 0, label: 'Alpha (8-12 Hz)', color: '#06b6d4', category: 'brainwave', timestamp: Date.now(), benefits: ['Relaxed alertness', 'Stress relief', 'Learning'] },
      { frequency: 12, amplitude: 0.7, phase: 0, label: 'Beta Focus', color: '#10b981', category: 'brainwave', timestamp: Date.now(), benefits: ['Focus', 'Concentration', 'Alert thinking'] },
      { frequency: 14, amplitude: 0.7, phase: 0, label: 'High Alpha', color: '#059669', category: 'brainwave', timestamp: Date.now(), benefits: ['Enhanced learning', 'Cognitive clarity', 'Memory retention'] },
      { frequency: 20, amplitude: 0.7, phase: 0, label: 'Beta (12-30 Hz)', color: '#10b981', category: 'brainwave', timestamp: Date.now(), benefits: ['Active thinking', 'Focus', 'Problem-solving'] },
      { 
        frequency: 25, 
        amplitude: 0.7, 
        phase: 0, 
        label: 'Beta High Focus', 
        color: '#84cc16', 
        category: 'brainwave', 
        timestamp: Date.now(), 
        benefits: ['High performance', 'Problem solving', 'Peak alertness'],
        metadata: {
          isBinaural: true,
          baseFrequency: 250, // Carrier frequency for 25Hz binaural beat
          binauralBeat: 25,   // The binaural beat frequency
          leftEar: 250,
          rightEar: 275       // 250 + 25 = 275Hz
        }
      },
      { frequency: 40, amplitude: 0.7, phase: 0, label: 'Gamma Peak', color: '#f59e0b', category: 'brainwave', timestamp: Date.now(), benefits: ['Consciousness', 'Binding perception', 'Higher awareness'] }
    ]
  },

  binaural: {
    name: "Binaural Beat Presets",
    description: "Carrier frequencies with beat differences for entrainment.",
    frequencies: [
      { frequency: 4, amplitude: 0.7, phase: 0, label: 'Theta Binaural (4 Hz beat)', color: '#8b5cf6', category: 'binaural', timestamp: Date.now(), benefits: ['Meditation', 'Creativity', 'Deep relaxation'] },
      { frequency: 6, amplitude: 0.7, phase: 0, label: 'Theta Binaural (6 Hz beat)', color: '#8b5cf6', category: 'binaural', timestamp: Date.now(), benefits: ['Deep meditation', 'Creative visualization'] },
      { frequency: 10, amplitude: 0.7, phase: 0, label: 'Alpha Binaural (10 Hz beat)', color: '#8b5cf6', category: 'binaural', timestamp: Date.now(), benefits: ['Relaxation', 'Flow state'] },
      { frequency: 20, amplitude: 0.7, phase: 0, label: 'Beta Binaural (20 Hz beat)', color: '#8b5cf6', category: 'binaural', timestamp: Date.now(), benefits: ['Concentration', 'Alertness'] },
      { frequency: 40, amplitude: 0.7, phase: 0, label: 'Gamma Binaural (40 Hz beat)', color: '#8b5cf6', category: 'binaural', timestamp: Date.now(), benefits: ['Cognitive boost', 'Synchronicity'] }
    ]
  },

  elemental: {
    name: "Elemental Frequencies",
    description: "Tones inspired by the four classical elements for balance and harmony.",
    frequencies: [
      { frequency: 194.18, amplitude: 0.8, phase: 0, label: 'Earth Element', color: '#22c55e', category: 'elemental', timestamp: Date.now(), benefits: ['Stability', 'Physical connection', 'Grounding'] },
      { frequency: 417, amplitude: 0.8, phase: 0, label: 'Water Element', color: '#3b82f6', category: 'elemental', timestamp: Date.now(), benefits: ['Emotional release', 'Adaptability', 'Flow'] },
      { frequency: 639, amplitude: 0.8, phase: 0, label: 'Air Element', color: '#e5e7eb', category: 'elemental', timestamp: Date.now(), benefits: ['Mental lightness', 'Expression', 'Communication'] },
      { frequency: 741, amplitude: 0.8, phase: 0, label: 'Fire Element', color: '#dc2626', category: 'elemental', timestamp: Date.now(), benefits: ['Passion', 'Transformation', 'Energy'] }
    ]
  },

  sacred_geometry: {
    name: "Sacred Geometry Frequencies",
    description: "Inspired by geometric patterns for vibrational alignment.",
    frequencies: [
      { frequency: 172.06, amplitude: 0.8, phase: 0, label: 'Flower of Life', color: '#f59e0b', category: 'sacred_geometry', timestamp: Date.now(), benefits: ['Cosmic alignment', 'Energy flow', 'Universal patterns'] },
      { frequency: 256, amplitude: 0.8, phase: 0, label: 'Tetrahedron', color: '#f59e0b', category: 'sacred_geometry', timestamp: Date.now(), benefits: ['Dynamic change', 'Energy activation', 'Fire element'] },
      { frequency: 432, amplitude: 0.8, phase: 0, label: 'Dodecahedron', color: '#f59e0b', category: 'sacred_geometry', timestamp: Date.now(), benefits: ['Balance', 'Higher consciousness', 'Universal harmony'] }
    ]
  },

  biological: {
    name: "Biological Frequencies",
    description: "Aligned with biological rhythms and cellular processes.",
    frequencies: [
      { frequency: 1, amplitude: 0.8, phase: 0, label: 'Heart Rate Resonance', color: '#ef4444', category: 'biological', timestamp: Date.now(), benefits: ['Cardiovascular calm', 'Stress reduction', 'Heart rhythm sync'] },
      { frequency: 7.83, amplitude: 0.8, phase: 0, label: 'Schumann Biological', color: '#ef4444', category: 'biological', timestamp: Date.now(), benefits: ['Bio-rhythm sync', 'Mental clarity', 'Natural frequency'] },
      { frequency: 528, amplitude: 0.8, phase: 0, label: 'DNA Resonance', color: '#ef4444', category: 'biological', timestamp: Date.now(), benefits: ['Cellular healing', 'Genetic alignment', 'DNA repair'] }
    ]
  },

  other: {
    name: "Other Healing Frequencies",
    description: "Miscellaneous potent tones and universal harmonics.",
    frequencies: [
      { frequency: 111, amplitude: 0.8, phase: 0, label: '111 Hz - Cellular Activation', color: '#6b7280', category: 'other', timestamp: Date.now(), benefits: ['Endorphin release', 'Pain relief', 'Cellular activation'] },
      { frequency: 222, amplitude: 0.8, phase: 0, label: '222 Hz - Dream State', color: '#6b7280', category: 'other', timestamp: Date.now(), benefits: ['Lucid dreaming', 'Subconscious access', 'Sleep induction'] },
      { frequency: 4096, amplitude: 0.8, phase: 0, label: 'Crystal Resonance', color: '#6b7280', category: 'other', timestamp: Date.now(), benefits: ['Energy amplification', 'Clarity', 'Quartz vibrations'] }
    ]
  }
};

/**
 * Convert healing frequencies to FrequencyData array
 */
const getAllHealingFrequencies = (): FrequencyData[] => {
  return Object.values(HEALING_FREQUENCIES).flatMap(category => category.frequencies);
};

/**
 * Get all unified frequency presets (integrations + comprehensive healing frequencies)
 */
export const getUnifiedFrequencyPresets = (): FrequencyData[] => {
  const integrationPresets = getAllPresets();
  
  // Debug: Check if we're getting integration presets
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    console.log('🔍 DEBUG: Integration presets count:', integrationPresets.length);
  }
  
  // Convert integration presets to FrequencyData format with validation
  const convertedIntegrationPresets = integrationPresets
    .map(preset => {
      try {
        // Handle chakra frequencies with enhanced colors
        if (preset.category === 'chakra' && preset.metadata?.chakra) {
          const chakraKey = preset.metadata.chakra as ChakraKey;
          const converted = convertPresetToFrequencyData(preset);
          return {
            ...converted,
            color: getChakraColor(chakraKey)
          };
        }
        
        return convertPresetToFrequencyData(preset);
      } catch {
        // Conversion failed silently - remove console.error for production
        return null;
      }
    })
    .filter((preset): preset is FrequencyData => preset !== null);

  // Get all healing frequencies with validation
  const healingFrequencies = getAllHealingFrequencies();
  
  // Debug: Check healing frequencies count
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    console.log('🔍 DEBUG: Healing frequencies count:', healingFrequencies.length);
    console.log('🔍 DEBUG: First 3 healing frequencies:', healingFrequencies.slice(0, 3));
  }
  
  const validatedHealingFrequencies = healingFrequencies
    .map(freq => {
      // Debug Beta High Focus specifically
      if (freq.label?.includes('Beta High Focus')) {
        // DEBUG: Found Beta High Focus frequency - logging removed for production
      }
      
      const validation = safeValidateFrequencyData(freq);
      if (!validation.success) {
        // Invalid healing frequency - warning removed for production
        return null;
      }
      
      // Debug successful Beta High Focus validation
      if (freq.label?.includes('Beta High Focus')) {
         
        // DEBUG: Beta High Focus passed validation - logging removed for production
      }
      
      return validation.data;
    })
    .filter((freq): freq is FrequencyData => freq !== null);

  // Combine and deduplicate (integration presets take priority for exact matches)
  const combinedFrequencies = [...convertedIntegrationPresets];
  
  validatedHealingFrequencies.forEach(healingFreq => {
    const existingIndex = combinedFrequencies.findIndex(existing => 
      Math.abs(existing.frequency - healingFreq.frequency) < 0.1
    );
    
    if (existingIndex === -1) {
      // No duplicate found, add the healing frequency
      combinedFrequencies.push(healingFreq);
    } else {
      // Duplicate found, merge benefits and keep integration preset structure
      const existing = combinedFrequencies[existingIndex];
      if (existing) {
        const mergedBenefits = Array.from(new Set([
          ...(existing.benefits || []),
          ...(healingFreq.benefits || [])
        ]));
        combinedFrequencies[existingIndex] = {
          ...existing,
          benefits: mergedBenefits,
          // Preserve healing frequency color and label if more descriptive
          color: healingFreq.color || existing.color,
          label: healingFreq.label.length > existing.label.length ? healingFreq.label : existing.label
        };
      }
    }
  });

  // Final validation of combined frequencies
  const finalValidatedFrequencies = combinedFrequencies
    .map(freq => {
      const validation = safeValidateFrequencyData(freq);
      if (!validation.success) {
        // Combined frequency failed final validation - warning removed for production
        return null;
      }
      return validation.data;
    })
    .filter((freq): freq is FrequencyData => freq !== null);

  // Debug category information
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    console.log('🎯 DEBUG: Final unified frequency presets:', finalValidatedFrequencies.length);
    const categories: Record<string, number> = {};
    finalValidatedFrequencies.forEach(f => {
      categories[f.category] = (categories[f.category] || 0) + 1;
    });
    console.log('🎯 DEBUG: Categories breakdown:', categories);
  }
  
  return finalValidatedFrequencies;
};

/**
 * Get presets filtered by category
 */
export const getPresetsByCategory = (category: string): FrequencyData[] => {
  const allPresets = getUnifiedFrequencyPresets();
  
  if (category === 'all') {
    return allPresets;
  }
  
  return allPresets.filter((preset: FrequencyData) => preset.category === category);
};

/**
 * Get available categories
 */
export const getAvailableCategories = (): string[] => {
  const allPresets = getUnifiedFrequencyPresets();
  const categories = Array.from(new Set(allPresets.map(p => p.category)));
  const healingCategories = Object.keys(HEALING_FREQUENCIES);
  const allCategories = Array.from(new Set([...categories, ...healingCategories]));
  return ['all', ...allCategories.sort()];
};

/**
 * Get frequencies by specific healing category
 */
export const getFrequenciesByCategory = (category: keyof typeof HEALING_FREQUENCIES): FrequencyData[] => {
  return HEALING_FREQUENCIES[category]?.frequencies || [];
};

/**
 * Find preset by frequency
 */
export const findPresetByFrequency = (frequency: number): FrequencyData | undefined => {
  const allPresets = getUnifiedFrequencyPresets();
  return allPresets.find(preset => Math.abs(preset.frequency - frequency) < 0.1);
};

/**
 * Create custom frequency data
 */
export const createCustomFrequencyData = (
  frequency: number, 
  label?: string, 
  amplitude = 0.8
): FrequencyData => ({
  frequency,
  amplitude,
  phase: 0,
  label: label ?? `Custom: ${frequency.toFixed(1)} Hz`,
  color: getCategoryColor('custom'),
  category: 'custom',
  timestamp: Date.now(),
  benefits: ['Custom healing frequency']
});

/**
 * Get quick frequency presets for sliders
 */
export const getQuickFrequencies = (): number[] => {
  const commonFrequencies = [174, 285, 396, 417, 528, 639, 741, 852, 963];
  return commonFrequencies;
};

/**
 * Validate frequencies array
 */
export const validateFrequencies = (freqs: FrequencyData[]): boolean => {
  return freqs.every(f => 
    typeof f.frequency === 'number' && 
    f.frequency > 0 && 
    f.label && 
    f.category
  );
};

/**
 * Suggest frequencies based on intent or purpose
 */
export const suggestFrequencyForPurpose = (purpose: string): FrequencyData[] => {
  const purposeMap: Record<string, string[]> = {
    healing: ['rife', 'solfeggio', 'biological'],
    meditation: ['brainwave', 'chakra', 'stellar'],
    energy: ['planetary', 'metallic', 'elemental'],
    transformation: ['solfeggio', 'chakra', 'sacred_geometry']
  };

  const categories = purposeMap[purpose.toLowerCase()] || ['other'];
  const suggestions: FrequencyData[] = [];

  categories.forEach(category => {
    const categoryFreqs = getFrequenciesByCategory(category);
    suggestions.push(...categoryFreqs.slice(0, 3)); // Top 3 from each category
  });

  return suggestions;
};

// Export the healing frequencies structure for advanced usage
export { HEALING_FREQUENCIES };
