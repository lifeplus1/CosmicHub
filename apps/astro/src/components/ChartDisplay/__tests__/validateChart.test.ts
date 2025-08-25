import { describe, it, expect } from 'vitest';
import { validateChart } from '../validateChart';

describe('validateChart', () => {
  it('accepts object with at least one section', () => {
    const result = validateChart({ planets: {} });
    expect(result).not.toBeNull();
  });

  it('rejects object with no sections', () => {
    const result = validateChart({});
    expect(result).toBeNull();
  });

  it('rejects non-object input', () => {
    const result = validateChart(null);
    expect(result).toBeNull();
  });

  it('accepts minimal valid planets object with position', () => {
    const result = validateChart({ planets: { Sun: { position: 123.45 } } });
    expect(result).not.toBeNull();
  });

  it('rejects houses array longer than 12', () => {
    const houses = Array.from({ length: 13 }, (_, i) => ({
      number: i + 1,
      cusp: i * 10,
      sign: 'Aries',
    }));
    const result = validateChart({ houses });
    expect(result).toBeNull();
  });

  it('rejects house with invalid cusp > 360', () => {
    const houses = [{ number: 1, cusp: 400, sign: 'Aries' }];
    const result = validateChart({ houses });
    expect(result).toBeNull();
  });
});
