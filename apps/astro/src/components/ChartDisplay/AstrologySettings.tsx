import React from 'react';
import { IoSettings } from 'react-icons/io5';

export interface AstrologySettings {
  __version?: number; // schema version for migrations
  houseSystem:
    | 'placidus'
    | 'koch'
    | 'equal'
    | 'whole-sign'
    | 'campanus'
    | 'regiomontanus';
  zodiacSystem: 'tropical' | 'sidereal';
  orbs: {
    major: number;
    minor: number;
    luminaries: number;
  };
  aspectsEnabled: {
    conjunction: boolean;
    opposition: boolean;
    trine: boolean;
    square: boolean;
    sextile: boolean;
    quincunx: boolean;
    semisextile: boolean;
    semisquare: boolean;
    sesquiquadrate: boolean;
    quintile: boolean;
    biquintile: boolean;
  };
  celestialBodies: {
    // Traditional celestial bodies
    traditionalPlanets: boolean; // Sun through Saturn
    modernPlanets: boolean; // Uranus, Neptune, Pluto

    // Asteroids and minor bodies
    majorAsteroids: boolean; // Big 5: Chiron, Ceres, Pallas, Juno, Vesta, Psyche
    minorAsteroids: boolean; // All other asteroids

    // Points and nodes
    lunarNodes: boolean; // North and South nodes
    lilithPoints: boolean; // Mean and True Lilith
    specialPoints: boolean; // Vertex, Antivertex, Part of Fortune
    hypotheticalPoints: boolean; // Uranian/Hamburg School points

    // Legacy compatibility (kept for backward compatibility)
    planets: boolean; // Maps to traditionalPlanets && modernPlanets
    asteroids: boolean; // Maps to majorAsteroids && minorAsteroids
    chiron: boolean; // Maps to majorAsteroids
    lilith: boolean; // Maps to lilithPoints
    points: boolean; // Maps to specialPoints
  };
  displayOptions: {
    showDegrees: boolean;
    showRetrograde: boolean;
    showAspectGrid: boolean;
    showMinorAspects: boolean;
  };
}

export const defaultAstrologySettings: AstrologySettings = {
  __version: 2,
  houseSystem: 'placidus',
  zodiacSystem: 'tropical',
  orbs: {
    major: 8,
    minor: 3,
    luminaries: 10,
  },
  aspectsEnabled: {
    conjunction: true,
    opposition: true,
    trine: true,
    square: true,
    sextile: true,
    quincunx: true,
    semisextile: false,
    semisquare: false,
    sesquiquadrate: false,
    quintile: false,
    biquintile: false,
  },
  celestialBodies: {
    // Modern granular controls
    traditionalPlanets: true, // Sun through Saturn
    modernPlanets: true, // Uranus, Neptune, Pluto
    majorAsteroids: true, // Big 6: Chiron, Ceres, Pallas, Juno, Vesta, Psyche
    minorAsteroids: true, // All other asteroids - ENABLED by default now
    lunarNodes: true, // North and South nodes
    lilithPoints: true, // Mean and True Lilith
    specialPoints: true, // Vertex, Antivertex, Part of Fortune
    hypotheticalPoints: true, // Uranian/Hamburg School points - now enabled by default

    // Legacy compatibility (computed properties)
    planets: true, // traditionalPlanets && modernPlanets
    asteroids: true, // majorAsteroids (minorAsteroids controlled separately)
    chiron: true, // included in majorAsteroids
    lilith: true, // maps to lilithPoints
    points: true, // maps to specialPoints
  },
  displayOptions: {
    showDegrees: true,
    showRetrograde: true,
    showAspectGrid: true,
    showMinorAspects: false,
  },
};

// Migration utility for persisted settings
export function migrateAstrologySettings(raw: unknown): AstrologySettings {
  const base = { ...defaultAstrologySettings };
  if (!raw || typeof raw !== 'object') return base;
  const obj = raw as Partial<AstrologySettings & { [k: string]: unknown }>;
  const version = typeof obj.__version === 'number' ? obj.__version : 0;
  let working: AstrologySettings = { ...base, ...obj, __version: base.__version };
  switch (version) {
    case 0: {
      // Pre-versioned: ensure new flags have safe defaults
      if (!('hypotheticalPoints' in (obj.celestialBodies || {}))) {
        working = {
          ...working,
          celestialBodies: {
            ...working.celestialBodies,
            hypotheticalPoints: true,
          },
        };
      }
      break;
    }
    case 1: {
      // Example future migration placeholder
      break;
    }
    default:
      break;
  }
  // Always stamp with current version
  working.__version = base.__version;
  return working;
}

interface AstrologySettingsProps {
  settings: AstrologySettings;
  onSettingsChange: (settings: AstrologySettings) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export const AstrologySettingsPanel: React.FC<AstrologySettingsProps> = ({
  settings,
  onSettingsChange,
  isOpen,
  onToggle,
}) => {
  const updateSettings = (updates: Partial<AstrologySettings>) => {
    onSettingsChange({ ...settings, ...updates });
  };

  const updateNestedSettings = <T extends keyof AstrologySettings>(
    category: T,
    updates: Partial<AstrologySettings[T]>
  ) => {
    onSettingsChange({
      ...settings,
      [category]: { ...(settings[category] as Record<string, unknown>), ...updates },
    });
  };

  return (
    <div className='astrology-settings w-full'>
      <button
        onClick={onToggle}
        className='settings-toggle-btn flex items-center gap-2 px-4 py-2 bg-cosmic-purple/20 hover:bg-cosmic-purple/30 rounded-lg transition-colors border border-cosmic-purple/30 text-cosmic-silver hover:text-white'
      >
        <IoSettings size={16} />
        <span className='font-medium'>Advanced Settings</span>
        <span className='text-xs opacity-70'>{isOpen ? '▼' : '▶'}</span>
      </button>

      {isOpen && (
        <div className='settings-panel mt-4 p-6 bg-cosmic-dark/40 border border-cosmic-purple/30 rounded-xl backdrop-blur-sm shadow-lg'>
          <div className='space-y-6'>
            {/* House System */}
            <div>
              <label 
                htmlFor="house-system-select"
                className='block text-sm font-medium text-cosmic-gold mb-2'
              >
                House System
              </label>
              <select
                id="house-system-select"
                value={settings.houseSystem}
                onChange={e =>
                  updateSettings({ 
                    houseSystem: e.target.value as AstrologySettings['houseSystem']
                  })
                }
                aria-label='House System'
                className='w-full px-3 py-2 bg-cosmic-dark/60 border border-cosmic-purple/30 rounded-md text-cosmic-silver focus:outline-none focus:ring-2 focus:ring-cosmic-purple/50'
              >
                <option value='placidus'>Placidus</option>
                <option value='koch'>Koch</option>
                <option value='equal'>Equal House</option>
                <option value='whole-sign'>Whole Sign</option>
                <option value='campanus'>Campanus</option>
                <option value='regiomontanus'>Regiomontanus</option>
              </select>
            </div>

            {/* Zodiac System */}
            <fieldset>
              <legend className='block text-sm font-medium text-cosmic-gold mb-2'>
                Zodiac System
              </legend>
              <div className='flex gap-4'>
                <label className='flex items-center'>
                  <input
                    type='radio'
                    name='zodiacSystem'
                    value='tropical'
                    checked={settings.zodiacSystem === 'tropical'}
                    onChange={e =>
                      updateSettings({ 
                        zodiacSystem: e.target.value as AstrologySettings['zodiacSystem']
                      })
                    }
                    className='mr-2'
                  />
                  <span className='text-cosmic-silver'>Tropical</span>
                </label>
                <label className='flex items-center'>
                  <input
                    type='radio'
                    name='zodiacSystem'
                    value='sidereal'
                    checked={settings.zodiacSystem === 'sidereal'}
                    onChange={e =>
                      updateSettings({ 
                        zodiacSystem: e.target.value as AstrologySettings['zodiacSystem']
                      })
                    }
                    className='mr-2'
                  />
                  <span className='text-cosmic-silver'>Sidereal</span>
                </label>
              </div>
            </fieldset>

            {/* Orb Settings */}
            <fieldset>
              <legend className='block text-sm font-medium text-cosmic-gold mb-3'>
                Orb Tolerances (degrees)
              </legend>
              <div className='grid grid-cols-3 gap-4'>
                <div>
                  <label
                    htmlFor='major-orbs'
                    className='block text-xs text-cosmic-silver mb-1'
                  >
                    Major Aspects
                  </label>
                  <input
                    id='major-orbs'
                    type='number'
                    min='1'
                    max='15'
                    value={settings.orbs.major}
                    onChange={e =>
                      updateNestedSettings('orbs', {
                        major: Number(e.target.value),
                      })
                    }
                    className='w-full px-2 py-1 bg-cosmic-dark/60 border border-cosmic-purple/30 rounded text-cosmic-silver focus:outline-none focus:ring-2 focus:ring-cosmic-purple/50'
                  />
                </div>
                <div>
                  <label
                    htmlFor='minor-orbs'
                    className='block text-xs text-cosmic-silver mb-1'
                  >
                    Minor Aspects
                  </label>
                  <input
                    id='minor-orbs'
                    type='number'
                    min='1'
                    max='10'
                    value={settings.orbs.minor}
                    onChange={e =>
                      updateNestedSettings('orbs', {
                        minor: Number(e.target.value),
                      })
                    }
                    className='w-full px-2 py-1 bg-cosmic-dark/60 border border-cosmic-purple/30 rounded text-cosmic-silver focus:outline-none focus:ring-2 focus:ring-cosmic-purple/50'
                  />
                </div>
                <div>
                  <label
                    htmlFor='luminaries-orbs'
                    className='block text-xs text-cosmic-silver mb-1'
                  >
                    Luminaries
                  </label>
                  <input
                    id='luminaries-orbs'
                    type='number'
                    min='1'
                    max='20'
                    value={settings.orbs.luminaries}
                    onChange={e =>
                      updateNestedSettings('orbs', {
                        luminaries: Number(e.target.value),
                      })
                    }
                    className='w-full px-2 py-1 bg-cosmic-dark/60 border border-cosmic-purple/30 rounded text-cosmic-silver focus:outline-none focus:ring-2 focus:ring-cosmic-purple/50'
                  />
                </div>
              </div>
            </fieldset>

            {/* Celestial Bodies - Enhanced Granular Controls */}
            <fieldset>
              <legend className='block text-sm font-medium text-cosmic-gold mb-3'>
                Celestial Bodies to Display
              </legend>

              {/* Planets Section */}
              <div className='mb-4'>
                <h4 className='text-xs font-medium text-cosmic-silver/80 mb-2 uppercase tracking-wide'>
                  Planets
                </h4>
                <div className='grid grid-cols-2 gap-2 pl-2'>
                  <label className='flex items-center'>
                    <input
                      type='checkbox'
                      checked={settings.celestialBodies.traditionalPlanets}
                      onChange={e =>
                        updateNestedSettings('celestialBodies', {
                          traditionalPlanets: e.target.checked,
                        })
                      }
                      className='mr-2'
                    />
                    <span className='text-cosmic-silver text-sm'>
                      Traditional (☉-♄)
                    </span>
                  </label>
                  <label className='flex items-center'>
                    <input
                      type='checkbox'
                      checked={settings.celestialBodies.modernPlanets}
                      onChange={e =>
                        updateNestedSettings('celestialBodies', {
                          modernPlanets: e.target.checked,
                        })
                      }
                      className='mr-2'
                    />
                    <span className='text-cosmic-silver text-sm'>
                      Modern (♅♆♇)
                    </span>
                  </label>
                </div>
              </div>

              {/* Asteroids Section */}
              <div className='mb-4'>
                <h4 className='text-xs font-medium text-cosmic-silver/80 mb-2 uppercase tracking-wide'>
                  Asteroids
                </h4>
                <div className='grid grid-cols-1 gap-2 pl-2'>
                  <label className='flex items-center'>
                    <input
                      type='checkbox'
                      checked={settings.celestialBodies.majorAsteroids}
                      onChange={e =>
                        updateNestedSettings('celestialBodies', {
                          majorAsteroids: e.target.checked,
                        })
                      }
                      className='mr-2'
                    />
                    <span className='text-cosmic-silver text-sm'>
                      Major Asteroids (Big 6)
                    </span>
                  </label>
                  <label className='flex items-center'>
                    <input
                      type='checkbox'
                      checked={settings.celestialBodies.minorAsteroids}
                      onChange={e =>
                        updateNestedSettings('celestialBodies', {
                          minorAsteroids: e.target.checked,
                        })
                      }
                      className='mr-2'
                    />
                    <span className='text-cosmic-silver text-sm'>
                      Minor Asteroids (Extended)
                    </span>
                  </label>
                </div>
              </div>

              {/* Points Section */}
              <div className='mb-4'>
                <h4 className='text-xs font-medium text-cosmic-silver/80 mb-2 uppercase tracking-wide'>
                  Points & Nodes
                </h4>
                <div className='grid grid-cols-1 gap-2 pl-2'>
                  <label className='flex items-center'>
                    <input
                      type='checkbox'
                      checked={settings.celestialBodies.lunarNodes}
                      onChange={e =>
                        updateNestedSettings('celestialBodies', {
                          lunarNodes: e.target.checked,
                        })
                      }
                      className='mr-2'
                    />
                    <span className='text-cosmic-silver text-sm'>
                      Lunar Nodes (☊☋)
                    </span>
                  </label>
                  <label className='flex items-center'>
                    <input
                      type='checkbox'
                      checked={settings.celestialBodies.lilithPoints}
                      onChange={e =>
                        updateNestedSettings('celestialBodies', {
                          lilithPoints: e.target.checked,
                        })
                      }
                      className='mr-2'
                    />
                    <span className='text-cosmic-silver text-sm'>
                      Black Moon Lilith
                    </span>
                  </label>
                  <label className='flex items-center'>
                    <input
                      type='checkbox'
                      checked={settings.celestialBodies.specialPoints}
                      onChange={e =>
                        updateNestedSettings('celestialBodies', {
                          specialPoints: e.target.checked,
                        })
                      }
                      className='mr-2'
                    />
                    <span className='text-cosmic-silver text-sm'>
                      Special Points (Vertex, PoF)
                    </span>
                  </label>
                  <label className='flex items-center'>
                    <input
                      type='checkbox'
                      checked={settings.celestialBodies.hypotheticalPoints}
                      onChange={e =>
                        updateNestedSettings('celestialBodies', {
                          hypotheticalPoints: e.target.checked,
                        })
                      }
                      className='mr-2'
                    />
                    <span className='text-cosmic-silver text-sm'>
                      Uranian Points (Advanced)
                    </span>
                  </label>
                </div>
              </div>
            </fieldset>

            {/* Aspects */}
            <fieldset>
              <legend className='block text-sm font-medium text-cosmic-gold mb-3'>
                Enabled Aspects
              </legend>
              <div className='grid grid-cols-2 gap-2'>
                {Object.entries(settings.aspectsEnabled).map(
                  ([key, enabled]) => (
                    <label key={key} className='flex items-center'>
                      <input
                        type='checkbox'
                        checked={enabled}
                        onChange={e =>
                          updateNestedSettings('aspectsEnabled', {
                            [key]: e.target.checked,
                          })
                        }
                        className='mr-2'
                      />
                      <span className='text-cosmic-silver capitalize'>
                        {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                      </span>
                    </label>
                  )
                )}
              </div>
            </fieldset>

            {/* Display Options */}
            <fieldset>
              <legend className='block text-sm font-medium text-cosmic-gold mb-3'>
                Display Options
              </legend>
              <div className='grid grid-cols-2 gap-2'>
                {Object.entries(settings.displayOptions).map(
                  ([key, enabled]) => (
                    <label key={key} className='flex items-center'>
                      <input
                        type='checkbox'
                        checked={enabled}
                        onChange={e =>
                          updateNestedSettings('displayOptions', {
                            [key]: e.target.checked,
                          })
                        }
                        className='mr-2'
                      />
                      <span className='text-cosmic-silver capitalize'>
                        {key.replace(/([A-Z])/g, ' $1').replace('show', '')}
                      </span>
                    </label>
                  )
                )}
              </div>
            </fieldset>
          </div>

          <div className='mt-6 pt-4 border-t border-cosmic-purple/20'>
            <p className='text-xs text-cosmic-silver/70 italic'>
              Changes are applied immediately to the chart calculation and
              display.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
