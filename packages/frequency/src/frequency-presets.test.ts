import { getAllPresets, getPresetById, getPresetsByCategory, isValidFrequencyPreset } from './index';

(() => {
  const all = getAllPresets();
  if (all.length === 0) throw new Error('Expected presets to be non-empty');
  const sample = all[0];
  if (!isValidFrequencyPreset(sample)) throw new Error('First preset failed validation');

  const same = getPresetById(sample.id);
  if (!same || same.id !== sample.id) throw new Error('getPresetById did not return expected preset');

  const byCat = getPresetsByCategory(sample.category);
  if (!byCat.some(p => p.id === sample.id)) throw new Error('Category list missing sample preset');
})();
