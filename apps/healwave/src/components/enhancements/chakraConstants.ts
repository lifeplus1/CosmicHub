/**
 * Chakra frequency constants for HealWave therapeutic audio
 */

// Chakra frequency mappings based on traditional healing practices
export const CHAKRA_FREQUENCIES = {
  root: {
    name: 'Root Chakra',
    frequency: 396,
    color: '#FF0000',
    element: 'Earth',
    location: 'Base of spine',
    benefits: ['Grounding', 'Security', 'Survival instincts', 'Physical energy'],
    mantra: 'LAM',
    gemstones: ['Red Jasper', 'Garnet', 'Hematite'],
    essential_oils: ['Cedarwood', 'Patchouli', 'Vetiver'],
    binauralBeat: 4.0, // Delta/Theta for deep grounding
  },
  sacral: {
    name: 'Sacral Chakra',
    frequency: 417,
    color: '#FF8000',
    element: 'Water',
    location: 'Below navel',
    benefits: ['Creativity', 'Sexuality', 'Emotional balance', 'Relationships'],
    mantra: 'VAM',
    gemstones: ['Carnelian', 'Orange Calcite', 'Moonstone'],
    essential_oils: ['Sweet Orange', 'Ylang Ylang', 'Sandalwood'],
    binauralBeat: 6.0, // Theta for creativity
  },
  solar: {
    name: 'Solar Plexus Chakra',
    frequency: 528,
    color: '#FFFF00',
    element: 'Fire',
    location: 'Upper abdomen',
    benefits: ['Personal power', 'Confidence', 'Self-esteem', 'Transformation'],
    mantra: 'RAM',
    gemstones: ['Citrine', 'Yellow Topaz', "Tiger's Eye"],
    essential_oils: ['Lemon', 'Ginger', 'Chamomile'],
    binauralBeat: 8.0, // Alpha for confidence
  },
  heart: {
    name: 'Heart Chakra',
    frequency: 639,
    color: '#00FF00',
    element: 'Air',
    location: 'Center of chest',
    benefits: ['Love', 'Compassion', 'Relationships', 'Emotional healing'],
    mantra: 'YAM',
    gemstones: ['Rose Quartz', 'Green Aventurine', 'Malachite'],
    essential_oils: ['Rose', 'Geranium', 'Bergamot'],
    binauralBeat: 10.5, // Alpha for love and compassion
  },
  throat: {
    name: 'Throat Chakra',
    frequency: 741,
    color: '#00FFFF',
    element: 'Ether',
    location: 'Throat',
    benefits: ['Communication', 'Truth', 'Self-expression', 'Creativity'],
    mantra: 'HAM',
    gemstones: ['Blue Lace Agate', 'Sodalite', 'Turquoise'],
    essential_oils: ['Eucalyptus', 'Tea Tree', 'Chamomile'],
    binauralBeat: 12.0, // Alpha/Beta for clear communication
  },
  third_eye: {
    name: 'Third Eye Chakra',
    frequency: 852,
    color: '#4B0082',
    element: 'Light',
    location: 'Between eyebrows',
    benefits: ['Intuition', 'Wisdom', 'Spiritual insight', 'Psychic abilities'],
    mantra: 'OM',
    gemstones: ['Amethyst', 'Lapis Lazuli', 'Fluorite'],
    essential_oils: ['Frankincense', 'Clary Sage', 'Juniper'],
    binauralBeat: 6.3, // Theta for spiritual insight
  },
  crown: {
    name: 'Crown Chakra',
    frequency: 963,
    color: '#9400D3',
    element: 'Thought',
    location: 'Top of head',
    benefits: ['Spiritual connection', 'Enlightenment', 'Divine consciousness', 'Unity'],
    mantra: 'AH',
    gemstones: ['Clear Quartz', 'Amethyst', 'Selenite'],
    essential_oils: ['Lotus', 'Frankincense', 'Rosewood'],
    binauralBeat: 4.5, // Delta/Theta for transcendence
  },
} as const;

export type ChakraKey = keyof typeof CHAKRA_FREQUENCIES;
