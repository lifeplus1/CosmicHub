import React from 'react';
import { IoSettings } from 'react-icons/io5';
import { AstrologySettings } from './AstrologySettings';

interface ViewSpecificSettingsProps {
  settings: AstrologySettings;
  onSettingsChange: (settings: AstrologySettings) => void;
  isOpen: boolean;
  onToggle: () => void;
  isUnifiedView: boolean;
}

export const ViewSpecificSettings: React.FC<ViewSpecificSettingsProps> = ({
  settings,
  onSettingsChange,
  isOpen,
  onToggle,
  isUnifiedView,
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
        <span className='font-medium'>
          {isUnifiedView ? 'Chart Settings' : 'Table Settings'}
        </span>
        <span className='text-xs opacity-70'>{isOpen ? '▼' : '▶'}</span>
      </button>

      {isOpen && (
        <div className='settings-panel mt-4 p-6 bg-cosmic-dark/40 border border-cosmic-purple/30 rounded-xl backdrop-blur-sm shadow-lg'>
          <div className='space-y-6'>
            {/* Universal Settings - Apply to Both Views */}
            <div className='border-b border-cosmic-purple/20 pb-4'>
              <h3 className='text-sm font-semibold text-cosmic-gold mb-4'>
                Chart Calculation
              </h3>

              {/* House System */}
              <div className='mb-4'>
                <label 
                  htmlFor="house-system-select-view"
                  className='block text-sm font-medium text-cosmic-silver mb-2'
                >
                  House System
                </label>
                <select
                  id="house-system-select-view"
                  value={settings.houseSystem}
                  onChange={e =>
                    updateSettings({ 
                      houseSystem: e.target.value as AstrologySettings['houseSystem']
                    })
                  }
                  aria-label='House System Selection'
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
                <legend className='block text-sm font-medium text-cosmic-silver mb-2'>
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
            </div>

            {/* Aspect Settings - Both Views */}
            <div className='border-b border-cosmic-purple/20 pb-4'>
              <h3 className='text-sm font-semibold text-cosmic-gold mb-4'>
                Aspect Configuration
              </h3>

              {/* Orb Settings */}
              <fieldset className='mb-4'>
                <legend className='block text-sm font-medium text-cosmic-silver mb-2'>
                  Orb Tolerances (degrees)
                </legend>
                <div className='grid grid-cols-3 gap-3'>
                  <div>
                    <label 
                      htmlFor="major-orbs-view"
                      className='block text-xs text-cosmic-silver/70 mb-1'
                    >
                      Major
                    </label>
                    <input
                      id="major-orbs-view"
                      type='number'
                      min='1'
                      max='15'
                      value={settings.orbs.major}
                      onChange={e =>
                        updateNestedSettings('orbs', {
                          major: Number(e.target.value),
                        })
                      }
                      aria-label='Major aspects orb tolerance'
                      className='w-full px-2 py-1 bg-cosmic-dark/60 border border-cosmic-purple/30 rounded text-cosmic-silver text-center focus:outline-none focus:ring-1 focus:ring-cosmic-purple/50'
                    />
                  </div>
                  <div>
                    <label 
                      htmlFor="minor-orbs-view"
                      className='block text-xs text-cosmic-silver/70 mb-1'
                    >
                      Minor
                    </label>
                    <input
                      id="minor-orbs-view"
                      type='number'
                      min='1'
                      max='10'
                      value={settings.orbs.minor}
                      onChange={e =>
                        updateNestedSettings('orbs', {
                          minor: Number(e.target.value),
                        })
                      }
                      aria-label='Minor aspects orb tolerance'
                      className='w-full px-2 py-1 bg-cosmic-dark/60 border border-cosmic-purple/30 rounded text-cosmic-silver text-center focus:outline-none focus:ring-1 focus:ring-cosmic-purple/50'
                    />
                  </div>
                  <div>
                    <label 
                      htmlFor="luminaries-orbs-view"
                      className='block text-xs text-cosmic-silver/70 mb-1'
                    >
                      Luminaries
                    </label>
                    <input
                      id="luminaries-orbs-view"
                      type='number'
                      min='1'
                      max='20'
                      value={settings.orbs.luminaries}
                      onChange={e =>
                        updateNestedSettings('orbs', {
                          luminaries: Number(e.target.value),
                        })
                      }
                      aria-label='Luminaries orb tolerance'
                      className='w-full px-2 py-1 bg-cosmic-dark/60 border border-cosmic-purple/30 rounded text-cosmic-silver text-center focus:outline-none focus:ring-1 focus:ring-cosmic-purple/50'
                    />
                  </div>
                </div>
              </fieldset>

              {/* Display Options for Aspects */}
              <div className='grid grid-cols-2 gap-3'>
                <label className='flex items-center'>
                  <input
                    type='checkbox'
                    checked={settings.displayOptions.showAspectGrid}
                    onChange={e =>
                      updateNestedSettings('displayOptions', {
                        showAspectGrid: e.target.checked,
                      })
                    }
                    className='mr-2'
                  />
                  <span className='text-cosmic-silver text-sm'>
                    Show Aspects Table
                  </span>
                </label>
                <label className='flex items-center'>
                  <input
                    type='checkbox'
                    checked={settings.displayOptions.showMinorAspects}
                    onChange={e =>
                      updateNestedSettings('displayOptions', {
                        showMinorAspects: e.target.checked,
                      })
                    }
                    className='mr-2'
                  />
                  <span className='text-cosmic-silver text-sm'>
                    Include Minor Aspects
                  </span>
                </label>
              </div>
            </div>

            {/* View-Specific Settings */}
            {isUnifiedView ? (
              // UNIFIED VIEW SPECIFIC SETTINGS
              <div>
                <h3 className='text-sm font-semibold text-cosmic-gold mb-4 flex items-center gap-2'>
                  <span className='text-lg'>🌌</span>
                  Unified View Settings
                </h3>

                {/* Celestial Bodies - All affect the unified table */}
                <div>
                  <div 
                    className='block text-sm font-medium text-cosmic-silver mb-3'
                    role="group"
                    aria-labelledby="celestial-bodies-heading"
                  >
                    <span id="celestial-bodies-heading">Celestial Bodies to Include</span>
                  </div>

                  <div className='grid grid-cols-2 gap-2 text-sm'>
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
                      <span className='text-cosmic-silver'>
                        Traditional Planets
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
                      <span className='text-cosmic-silver'>Modern Planets</span>
                    </label>
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
                      <span className='text-cosmic-silver'>
                        Major Asteroids
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
                      <span className='text-cosmic-silver'>
                        Minor Asteroids
                      </span>
                    </label>
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
                      <span className='text-cosmic-silver'>Lunar Nodes</span>
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
                      <span className='text-cosmic-silver'>Lilith Points</span>
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
                      <span className='text-cosmic-silver'>Special Points</span>
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
                      <span className='text-cosmic-silver'>Uranian Points</span>
                    </label>
                  </div>
                </div>

                {/* Display Options */}
                <div className='mt-4'>
                  <div className='grid grid-cols-2 gap-2 text-sm'>
                    <label className='flex items-center'>
                      <input
                        type='checkbox'
                        checked={settings.displayOptions.showDegrees}
                        onChange={e =>
                          updateNestedSettings('displayOptions', {
                            showDegrees: e.target.checked,
                          })
                        }
                        className='mr-2'
                      />
                      <span className='text-cosmic-silver'>
                        Show Precise Degrees
                      </span>
                    </label>
                    <label className='flex items-center'>
                      <input
                        type='checkbox'
                        checked={settings.displayOptions.showRetrograde}
                        onChange={e =>
                          updateNestedSettings('displayOptions', {
                            showRetrograde: e.target.checked,
                          })
                        }
                        className='mr-2'
                      />
                      <span className='text-cosmic-silver'>
                        Show Retrograde (R)
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            ) : (
              // SEPARATE VIEW SPECIFIC SETTINGS
              <div>
                <h3 className='text-sm font-semibold text-cosmic-gold mb-4 flex items-center gap-2'>
                  <span className='text-lg'>📊</span>
                  Separate Tables Settings
                </h3>

                {/* Table Visibility Controls */}
                <div>
                  <div 
                    className='block text-sm font-medium text-cosmic-silver mb-3'
                    role="group"
                    aria-labelledby="table-visibility-heading"
                  >
                    <span id="table-visibility-heading">Table Visibility Controls</span>
                  </div>

                  <div className='space-y-2'>
                    <label className='flex items-center justify-between p-2 bg-cosmic-purple/10 rounded-md'>
                      <span className='text-cosmic-silver text-sm'>
                        🔮 Uranian Points Table
                      </span>
                      <input
                        type='checkbox'
                        checked={settings.celestialBodies.hypotheticalPoints}
                        onChange={e =>
                          updateNestedSettings('celestialBodies', {
                            hypotheticalPoints: e.target.checked,
                          })
                        }
                        className='ml-2'
                      />
                    </label>
                    <label className='flex items-center justify-between p-2 bg-cosmic-purple/10 rounded-md'>
                      <span className='text-cosmic-silver text-sm'>
                        ☄️ Include Minor Asteroids
                      </span>
                      <input
                        type='checkbox'
                        checked={settings.celestialBodies.minorAsteroids}
                        onChange={e =>
                          updateNestedSettings('celestialBodies', {
                            minorAsteroids: e.target.checked,
                          })
                        }
                        className='ml-2'
                      />
                    </label>
                  </div>
                </div>

                {/* Basic Display Options */}
                <div className='mt-4'>
                  <div 
                    className='block text-sm font-medium text-cosmic-silver mb-2'
                    role="group"
                    aria-labelledby="display-preferences-heading"
                  >
                    <span id="display-preferences-heading">Display Preferences</span>
                  </div>
                  <div className='grid grid-cols-2 gap-2 text-sm'>
                    <label className='flex items-center'>
                      <input
                        type='checkbox'
                        checked={settings.displayOptions.showDegrees}
                        onChange={e =>
                          updateNestedSettings('displayOptions', {
                            showDegrees: e.target.checked,
                          })
                        }
                        className='mr-2'
                      />
                      <span className='text-cosmic-silver'>
                        Precise Degrees
                      </span>
                    </label>
                    <label className='flex items-center'>
                      <input
                        type='checkbox'
                        checked={settings.displayOptions.showRetrograde}
                        onChange={e =>
                          updateNestedSettings('displayOptions', {
                            showRetrograde: e.target.checked,
                          })
                        }
                        className='mr-2'
                      />
                      <span className='text-cosmic-silver'>Retrograde (R)</span>
                    </label>
                  </div>
                </div>

                <div className='mt-4 p-3 bg-cosmic-purple/10 rounded-md'>
                  <p className='text-xs text-cosmic-silver/80'>
                    💡 <strong>Tip:</strong> Use the unified view for
                    comprehensive celestial body filtering. Separate view
                    settings focus on table-specific visibility and display
                    preferences.
                  </p>
                </div>
              </div>
            )}

            <div className='mt-6 pt-4 border-t border-cosmic-purple/20'>
              <p className='text-xs text-cosmic-silver/70 italic text-center'>
                Settings are automatically saved and applied to chart
                calculations
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
