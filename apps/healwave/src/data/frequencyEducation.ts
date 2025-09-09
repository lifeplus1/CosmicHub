/**
 * Comprehensive Educational Content for Frequencies
 * Provides detailed information about each frequency's properties, benefits, and usage
 */

export interface FrequencyEducation {
  frequency: number;
  name: string;
  category: 'solfeggio' | 'chakra' | 'brainwave' | 'planetary' | 'rife' | 'custom';
  description: string;
  detailedDescription: string;
  benefits: string[];
  useCases: string[];
  scientificBasis?: string;
  historicalContext?: string;
  recommendedDuration: string;
  precautions?: string[];
  relatedFrequencies: number[];
  chakraAssociation?: string;
  planetaryAssociation?: string;
  emotionalEffects: string[];
  physicalEffects: string[];
  mentalEffects: string[];
  spiritualEffects: string[];
  bestTimeToUse: string;
  combinationTips: string[];
}

export const COMPREHENSIVE_FREQUENCY_EDUCATION: Record<number, FrequencyEducation> = {
  // Solfeggio Frequencies
  174: {
    frequency: 174,
    name: 'UT - Foundation & Pain Relief',
    category: 'solfeggio',
    description: 'The lowest of the Solfeggio frequencies, known for pain relief and creating a sense of security.',
    detailedDescription: 'The 174 Hz frequency acts as a natural anesthetic, reducing pain and providing a foundation of safety and security. This frequency is believed to work on the physical level, helping to reduce inflammation and promote healing.',
    benefits: ['Pain relief', 'Reduces physical tension', 'Promotes security', 'Natural anesthetic', 'Inflammation reduction'],
    useCases: ['Chronic pain management', 'Post-workout recovery', 'Stress-related tension', 'Anxiety relief', 'Physical healing sessions'],
    scientificBasis: 'Low-frequency vibrations have been shown to affect pain receptors and promote relaxation responses in the nervous system.',
    historicalContext: 'Part of the ancient Solfeggio scale used in Gregorian chants and believed to have healing properties by medieval monks.',
    recommendedDuration: '15-30 minutes daily',
    precautions: ['Start with lower volumes', 'Avoid during pregnancy without consultation'],
    relatedFrequencies: [285, 396],
    emotionalEffects: ['Increased sense of safety', 'Reduced anxiety', 'Emotional grounding'],
    physicalEffects: ['Pain reduction', 'Muscle relaxation', 'Improved circulation'],
    mentalEffects: ['Mental clarity', 'Reduced worry', 'Focus improvement'],
    spiritualEffects: ['Grounding', 'Connection to earth energy', 'Stability'],
    bestTimeToUse: 'Evening or during pain episodes',
    combinationTips: ['Combine with 285 Hz for enhanced healing', 'Use with meditation for deeper relaxation']
  },

  285: {
    frequency: 285,
    name: 'Quantum Cognition & Cellular Healing',
    category: 'solfeggio',
    description: 'Promotes cellular healing and tissue regeneration while enhancing quantum consciousness.',
    detailedDescription: 'The 285 Hz frequency is known for its ability to restructure damaged tissues and cells, working on both physical and energetic levels to promote healing and regeneration.',
    benefits: ['Cellular regeneration', 'Tissue healing', 'Energy field restructuring', 'Immune system boost', 'Wound healing'],
    useCases: ['Recovery from illness', 'Post-surgery healing', 'Skin condition improvement', 'Immune support', 'Athletic recovery'],
    scientificBasis: 'Specific frequencies may influence cellular metabolism and DNA repair mechanisms through resonance effects.',
    historicalContext: 'Ancient healing frequency used in sound therapy traditions across various cultures.',
    recommendedDuration: '20-40 minutes per session',
    relatedFrequencies: [174, 396],
    emotionalEffects: ['Emotional healing', 'Release of trauma', 'Inner peace'],
    physicalEffects: ['Accelerated healing', 'Cell regeneration', 'Improved tissue health'],
    mentalEffects: ['Enhanced intuition', 'Clearer thinking', 'Reduced mental fog'],
    spiritualEffects: ['Energy field alignment', 'Quantum consciousness', 'Higher awareness'],
    bestTimeToUse: 'Morning or during healing sessions',
    combinationTips: ['Excellent with 528 Hz for DNA repair', 'Combine with visualization for enhanced healing']
  },

  396: {
    frequency: 396,
    name: 'UT - Liberation from Fear & Root Chakra',
    category: 'solfeggio',
    description: 'Liberates from fear and guilt while activating the root chakra for grounding and security.',
    detailedDescription: 'This powerful frequency works to release deep-seated fears, guilt, and negative thought patterns while simultaneously activating and balancing the root chakra for improved grounding and security.',
    benefits: ['Fear release', 'Guilt elimination', 'Root chakra activation', 'Grounding', 'Security enhancement'],
    useCases: ['Overcoming phobias', 'Releasing guilt', 'Building confidence', 'Grounding practices', 'Security issues'],
    scientificBasis: 'Low-frequency vibrations affect the limbic system, which processes fear and emotional responses.',
    historicalContext: 'One of the core Solfeggio frequencies, associated with the musical note UT in ancient scales.',
    recommendedDuration: '15-30 minutes daily',
    chakraAssociation: 'Root Chakra (Muladhara)',
    relatedFrequencies: [174, 285, 417],
    emotionalEffects: ['Fear reduction', 'Guilt release', 'Emotional stability', 'Increased courage'],
    physicalEffects: ['Improved circulation', 'Better sleep', 'Reduced tension', 'Grounding sensations'],
    mentalEffects: ['Clearer decision making', 'Reduced anxiety', 'Improved focus'],
    spiritualEffects: ['Spiritual grounding', 'Connection to earth energy', 'Root chakra balance'],
    bestTimeToUse: 'Morning for grounding, evening for fear release',
    combinationTips: ['Powerful when combined with root chakra meditation', 'Use with affirmations for enhanced effect']
  },

  417: {
    frequency: 417,
    name: 'RE - Facilitating Change & Sacral Chakra',
    category: 'solfeggio',
    description: 'Facilitates positive change and transformation while activating the sacral chakra for creativity.',
    detailedDescription: 'The 417 Hz frequency is known for its ability to clear negative energy patterns and facilitate positive change in life circumstances while enhancing creativity and emotional balance.',
    benefits: ['Facilitates change', 'Clears negative patterns', 'Enhances creativity', 'Emotional balance', 'Sacral chakra activation'],
    useCases: ['Life transitions', 'Breaking bad habits', 'Creative blocks', 'Emotional healing', 'Relationship improvements'],
    scientificBasis: 'Frequencies in this range may influence brainwave patterns associated with creativity and emotional processing.',
    historicalContext: 'Associated with the note RE in ancient musical healing traditions.',
    recommendedDuration: '20-35 minutes per session',
    chakraAssociation: 'Sacral Chakra (Svadhisthana)',
    relatedFrequencies: [396, 528],
    emotionalEffects: ['Emotional cleansing', 'Increased creativity', 'Better relationships', 'Emotional flow'],
    physicalEffects: ['Improved reproductive health', 'Enhanced vitality', 'Better circulation'],
    mentalEffects: ['Clarity in change', 'Creative thinking', 'Problem solving'],
    spiritualEffects: ['Spiritual transformation', 'Energy clearing', 'Chakra alignment'],
    bestTimeToUse: 'During periods of change or creative work',
    combinationTips: ['Excellent with 528 Hz for transformation', 'Combine with intention setting']
  },

  528: {
    frequency: 528,
    name: 'MI - Love & DNA Repair (Miracle Frequency)',
    category: 'solfeggio',
    description: 'The "Love Frequency" and "Miracle Tone" - promotes DNA repair, transformation, and unconditional love.',
    detailedDescription: 'Perhaps the most famous Solfeggio frequency, 528 Hz is called the "Love Frequency" and "Miracle Tone." It\'s believed to repair DNA, promote transformation, and open the heart to love and miracles.',
    benefits: ['DNA repair', 'Heart chakra activation', 'Transformation', 'Love enhancement', 'Miracle manifestation'],
    useCases: ['Healing sessions', 'Meditation', 'Heart opening', 'Manifestation work', 'Relationship healing'],
    scientificBasis: 'Research suggests certain frequencies may influence DNA structure and cellular repair mechanisms.',
    historicalContext: 'Central frequency in the Solfeggio scale, used by ancient healers and in modern sound therapy.',
    recommendedDuration: '30-60 minutes for deep sessions',
    chakraAssociation: 'Heart Chakra (Anahata) and Solar Plexus Chakra (Manipura)',
    relatedFrequencies: [417, 639, 741],
    emotionalEffects: ['Unconditional love', 'Compassion', 'Joy', 'Peace', 'Emotional healing'],
    physicalEffects: ['DNA repair', 'Cellular regeneration', 'Heart health', 'Immune boost'],
    mentalEffects: ['Positive thinking', 'Clarity', 'Transformation mindset', 'Miracle thinking'],
    spiritualEffects: ['Spiritual transformation', 'Divine love connection', 'Miracles', 'Higher consciousness'],
    bestTimeToUse: 'During meditation, healing sessions, or manifestation work',
    combinationTips: ['Powerful alone or with 639 Hz for relationships', 'Combine with gratitude practices']
  },

  639: {
    frequency: 639,
    name: 'FA - Connecting Relationships & Heart Chakra',
    category: 'solfeggio',
    description: 'Enhances communication, relationships, and understanding while activating the heart chakra.',
    detailedDescription: 'This frequency is specifically attuned to harmonizing relationships, improving communication, and fostering understanding between people while opening and balancing the heart chakra.',
    benefits: ['Relationship harmony', 'Improved communication', 'Understanding', 'Heart chakra balance', 'Emotional healing'],
    useCases: ['Relationship counseling', 'Family harmony', 'Communication issues', 'Heart healing', 'Social anxiety'],
    scientificBasis: 'Frequencies affecting the heart chakra area may influence the vagus nerve and cardiovascular health.',
    historicalContext: 'FA note in ancient scales, traditionally used for healing relationships and social bonds.',
    recommendedDuration: '20-45 minutes per session',
    chakraAssociation: 'Heart Chakra (Anahata)',
    relatedFrequencies: [528, 741],
    emotionalEffects: ['Love', 'Compassion', 'Understanding', 'Forgiveness', 'Emotional connection'],
    physicalEffects: ['Heart health', 'Circulation improvement', 'Stress reduction', 'Nervous system balance'],
    mentalEffects: ['Clear communication', 'Empathy', 'Social understanding', 'Conflict resolution'],
    spiritualEffects: ['Heart opening', 'Universal love', 'Spiritual relationships', 'Compassion'],
    bestTimeToUse: 'Before important conversations or during relationship work',
    combinationTips: ['Excellent with 528 Hz for love work', 'Use with partner for relationship healing']
  },

  741: {
    frequency: 741,
    name: 'SOL - Expression & Throat Chakra Awakening',
    category: 'solfeggio',
    description: 'Promotes self-expression, awakens intuition, and activates the throat chakra for clear communication.',
    detailedDescription: 'The 741 Hz frequency is designed to awaken intuition, promote self-expression, and solve problems through enhanced communication and throat chakra activation.',
    benefits: ['Self-expression', 'Intuition awakening', 'Throat chakra activation', 'Problem solving', 'Clear communication'],
    useCases: ['Public speaking', 'Creative expression', 'Intuitive development', 'Throat chakra healing', 'Problem solving'],
    scientificBasis: 'Frequencies in this range may stimulate areas of the brain associated with creativity and verbal expression.',
    historicalContext: 'SOL note in ancient healing traditions, used to enhance expression and solve problems.',
    recommendedDuration: '15-40 minutes per session',
    chakraAssociation: 'Throat Chakra (Vishuddha)',
    relatedFrequencies: [639, 852],
    emotionalEffects: ['Confidence in expression', 'Reduced social anxiety', 'Authentic communication', 'Emotional clarity'],
    physicalEffects: ['Throat health', 'Vocal improvement', 'Neck tension relief', 'Thyroid balance'],
    mentalEffects: ['Clear thinking', 'Problem solving', 'Intuitive insights', 'Creative expression'],
    spiritualEffects: ['Authentic self-expression', 'Intuitive awakening', 'Truth speaking', 'Spiritual communication'],
    bestTimeToUse: 'Before presentations, creative work, or meditation',
    combinationTips: ['Combine with 852 Hz for enhanced intuition', 'Use with throat chakra visualization']
  },

  852: {
    frequency: 852,
    name: 'LA - Spiritual Order & Third Eye Activation',
    category: 'solfeggio',
    description: 'Returns to spiritual order, awakens intuition, and activates the third eye chakra.',
    detailedDescription: 'This frequency helps return to spiritual order, awakens inner strength and intuition, and is particularly effective for third eye chakra activation and spiritual insight development.',
    benefits: ['Spiritual order', 'Third eye activation', 'Intuition enhancement', 'Inner strength', 'Psychic abilities'],
    useCases: ['Meditation', 'Intuitive development', 'Psychic training', 'Spiritual practice', 'Third eye opening'],
    scientificBasis: 'Higher frequencies may influence brainwave patterns associated with altered states of consciousness.',
    historicalContext: 'LA note associated with spiritual awakening in ancient musical healing systems.',
    recommendedDuration: '20-50 minutes for deep work',
    chakraAssociation: 'Third Eye Chakra (Ajna)',
    relatedFrequencies: [741, 963],
    emotionalEffects: ['Inner peace', 'Spiritual confidence', 'Intuitive trust', 'Emotional clarity'],
    physicalEffects: ['Pineal gland activation', 'Improved sleep cycles', 'Headache relief', 'Eye health'],
    mentalEffects: ['Enhanced intuition', 'Psychic abilities', 'Clear perception', 'Spiritual insights'],
    spiritualEffects: ['Spiritual awakening', 'Psychic development', 'Higher consciousness', 'Divine connection'],
    bestTimeToUse: 'During meditation, especially evening or early morning',
    combinationTips: ['Powerful with 963 Hz for spiritual work', 'Use with third eye meditation practices']
  },

  963: {
    frequency: 963,
    name: 'SI - Divine Connection & Crown Chakra',
    category: 'solfeggio',
    description: 'Connects to divine consciousness, activates the crown chakra, and promotes spiritual enlightenment.',
    detailedDescription: 'The highest Solfeggio frequency, 963 Hz, is known as the "Frequency of the Gods." It connects directly to divine consciousness, activates the crown chakra, and promotes spiritual enlightenment and oneness.',
    benefits: ['Divine connection', 'Crown chakra activation', 'Spiritual enlightenment', 'Oneness experience', 'Higher consciousness'],
    useCases: ['Deep meditation', 'Spiritual awakening', 'Crown chakra work', 'Divine connection', 'Enlightenment practices'],
    scientificBasis: 'Very high frequencies may induce gamma brainwave states associated with heightened awareness and spiritual experiences.',
    historicalContext: 'SI note representing the highest spiritual achievement in ancient sound healing traditions.',
    recommendedDuration: '30-60 minutes for transformative sessions',
    chakraAssociation: 'Crown Chakra (Sahasrara)',
    relatedFrequencies: [852],
    emotionalEffects: ['Divine love', 'Pure bliss', 'Universal compassion', 'Transcendent peace'],
    physicalEffects: ['Nervous system harmony', 'Endocrine balance', 'Enhanced energy flow', 'Overall vitality'],
    mentalEffects: ['Expanded consciousness', 'Universal understanding', 'Transcendent thinking', 'Divine wisdom'],
    spiritualEffects: ['Divine union', 'Spiritual enlightenment', 'Cosmic consciousness', 'Oneness with all'],
    bestTimeToUse: 'During deep spiritual practice, preferably in quiet, sacred space',
    combinationTips: ['Best used alone for pure divine connection', 'Combine with silent meditation']
  }

  // Additional frequencies can be added following the same pattern
};

/**
 * Get educational content for a specific frequency
 */
export const getFrequencyEducation = (frequency: number): FrequencyEducation | undefined => {
  return COMPREHENSIVE_FREQUENCY_EDUCATION[frequency];
};

/**
 * Get all available educational frequencies
 */
export const getAllEducationalFrequencies = (): FrequencyEducation[] => {
  return Object.values(COMPREHENSIVE_FREQUENCY_EDUCATION);
};

/**
 * Search educational content by category
 */
export const getEducationByCategory = (category: string): FrequencyEducation[] => {
  return getAllEducationalFrequencies().filter(edu => edu.category === category);
};

/**
 * Get related frequencies for a given frequency
 */
export const getRelatedFrequencies = (frequency: number): FrequencyEducation[] => {
  const education = getFrequencyEducation(frequency);
  if (!education) return [];
  
  return education.relatedFrequencies
    .map(freq => getFrequencyEducation(freq))
    .filter((edu): edu is FrequencyEducation => edu !== undefined);
};
