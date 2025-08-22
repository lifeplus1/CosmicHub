export const getCenterColor = (centerName: string, isActive: boolean): string => {
  const colors = {
    'Head': isActive ? 'bg-yellow-400' : 'bg-gray-200',
    'Ajna': isActive ? 'bg-green-400' : 'bg-gray-200',
    'Throat': isActive ? 'bg-brown-400' : 'bg-gray-200',
    'G': isActive ? 'bg-yellow-400' : 'bg-gray-200',
    'Heart': isActive ? 'bg-red-400' : 'bg-gray-200',
    'Spleen': isActive ? 'bg-brown-400' : 'bg-gray-200',
    'Solar Plexus': isActive ? 'bg-orange-400' : 'bg-gray-200',
    'Sacral': isActive ? 'bg-red-400' : 'bg-gray-200',
    'Root': isActive ? 'bg-brown-400' : 'bg-gray-200'
  };
  return colors[centerName as keyof typeof colors] ?? 'bg-gray-200';
};

export const getTypeColor = (type: string): string => {
  const colors = {
    'Manifestor': 'bg-red-500',
    'Generator': 'bg-orange-500',
    'Manifesting Generator': 'bg-orange-600',
    'Projector': 'bg-green-500',
    'Reflector': 'bg-blue-500'
  };
  return colors[type as keyof typeof colors] ?? 'bg-gray-500';
};

export const getCenterDescription = (centerName: string): string => {
  const descriptions: { [key: string]: string } = {
    'Head': 'Center of inspiration and mental pressure. Questions and doubts that drive contemplation.',
    'Ajna': 'Center of conceptualization and mental awareness. How you process and express thoughts.',
    'Throat': 'Center of communication and manifestation. How you express yourself to the world.',
    'G-Center': 'Center of identity and direction. Your sense of self and life path.',
    'Heart': 'Center of willpower and ego. Your drive, promises, and self-worth.',
    'Spleen': 'Center of intuition and survival instincts. Your body wisdom and immune system.',
    'Solar Plexus': 'Center of emotions and sensitivity. Your emotional intelligence and wave.',
    'Sacral': 'Center of life force and sexuality. Your creative and reproductive energy.',
    'Root': 'Center of pressure and adrenaline. Your drive to act and survive.'
  };
  return descriptions[centerName] ?? 'Energy center in the Human Design system.';
};

export const getTypeDescription = (type: string): string => {
  const descriptions: { [key: string]: string } = {
    'Manifestor': 'Natural initiators who can create and act independently. Make up about 9% of the population. Your role is to initiate and inform others of your actions.',
    'Generator': 'The life force of humanity with sustainable energy. Make up about 37% of the population. Your role is to respond to life and follow your gut feelings.',
    'Manifesting Generator': 'Multi-passionate beings who can initiate and respond. Make up about 33% of the population. Your role is to respond quickly and skip steps efficiently.',
    'Projector': 'Natural guides and leaders who see the big picture. Make up about 20% of the population. Your role is to wait for recognition and guide others.',
    'Reflector': 'Mirrors of their environment with deep wisdom. Make up about 1% of the population. Your role is to wait a lunar cycle before making decisions.'
  };
  return descriptions[type] ?? 'One of the five Human Design types that determines your strategy for life.';
};
