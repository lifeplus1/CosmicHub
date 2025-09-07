/**
 * Educational content for TCM Chart components
 * Following Type Bridge System for consistent data structures
 */

export interface EducationalSection {
  title: string;
  content: string;
}

export interface EducationalContent {
  title: string;
  description: string;
  sections: EducationalSection[];
}

/**
 * Static educational content for various TCM concepts
 * Memoized for performance optimization
 */
export const educationalContent: Record<string, EducationalContent> = {
  'five-elements': {
    title: '🏮 Five Elements Theory (Wu Xing)',
    description: 'The foundation of Traditional Chinese Medicine',
    sections: [
      {
        title: 'What are the Five Elements?',
        content: 'Wood (木), Fire (火), Earth (土), Metal (金), and Water (水) represent fundamental energies that govern all natural phenomena, including human health and personality.'
      },
      {
        title: 'Element Cycles',
        content: 'Generative Cycle: Wood feeds Fire → Fire creates Earth → Earth bears Metal → Metal enriches Water → Water nourishes Wood. Destructive Cycle: Wood depletes Earth → Earth absorbs Water → Water extinguishes Fire → Fire melts Metal → Metal cuts Wood.'
      },
      {
        title: 'In Your Chart',
        content: 'Your astrological chart reveals which elements are dominant, deficient, or in balance, providing insights into your constitutional strengths and areas needing support.'
      }
    ]
  },
  'meridians': {
    title: '🌊 Meridian System',
    description: 'Energy pathways in Traditional Chinese Medicine',
    sections: [
      {
        title: 'What are Meridians?',
        content: 'Meridians are energy pathways (qi channels) that connect different parts of the body. There are 12 primary meridians, each associated with an organ system.'
      },
      {
        title: 'Astrological Correlation',
        content: 'Your birth chart planetary placements correspond to different meridian systems, revealing which energy pathways may be naturally strong or need attention.'
      },
      {
        title: 'Balancing Meridians',
        content: 'Through acupuncture, massage, movement, and lifestyle adjustments, meridian flow can be optimized for better health and vitality.'
      }
    ]
  },
  'constitution': {
    title: '🧬 Constitutional Types',
    description: 'Your fundamental TCM body-mind pattern',
    sections: [
      {
        title: 'Nine Constitutions',
        content: 'TCM recognizes 9 constitutional types: Balanced, Qi Deficiency, Yang Deficiency, Yin Deficiency, Phlegm-Dampness, Damp-Heat, Blood Stasis, Qi Stagnation, and Special Diathesis.'
      },
      {
        title: 'Birth Chart Correlation',
        content: 'Your astrological patterns reveal constitutional tendencies through planetary placements, seasonal birth timing, and elemental distributions in your chart.'
      },
      {
        title: 'Lifestyle Integration',
        content: 'Constitutional awareness guides food choices, exercise preferences, seasonal adjustments, and preventive health strategies aligned with your cosmic nature.'
      }
    ]
  },
  'health-recommendations': {
    title: '💚 Health & Wellness',
    description: 'Personalized health guidance based on your TCM profile',
    sections: [
      {
        title: 'Dietary Recommendations',
        content: 'Foods that support your constitutional type and current elemental balance, including seasonal eating patterns and therapeutic food combinations.'
      },
      {
        title: 'Lifestyle Practices',
        content: 'Exercise routines, sleep patterns, stress management techniques, and daily habits that align with your TCM constitution and current needs.'
      },
      {
        title: 'Preventive Care',
        content: 'Early intervention strategies, seasonal adjustments, and monitoring practices to maintain optimal health and prevent imbalances before they manifest as symptoms.'
      }
    ]
  },
  'synthesis': {
    title: '🌟 Integrated Analysis',
    description: 'Holistic view combining all TCM aspects',
    sections: [
      {
        title: 'Constitutional Integration',
        content: 'How your constitutional type, elemental balance, and meridian patterns work together to create your unique health and personality profile.'
      },
      {
        title: 'Astrological Alignment',
        content: 'The correspondence between your birth chart patterns and TCM analysis, revealing deeper insights into your cosmic-biological nature.'
      },
      {
        title: 'Practical Application',
        content: 'Daily, weekly, and seasonal practices that integrate all aspects of your TCM profile for optimal health, relationships, and life fulfillment.'
      }
    ]
  }
} as const;

export type EducationalTopic = keyof typeof educationalContent;

/**
 * Get educational content for a specific topic
 * @param topic - The educational topic to retrieve
 * @returns Educational content or null if not found
 */
export const getEducationalContent = (topic: string): EducationalContent | null => {
  return educationalContent[topic] ?? null;
};
