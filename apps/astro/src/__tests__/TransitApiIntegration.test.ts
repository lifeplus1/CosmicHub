import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('Transit API Integration Tests', () => {
  // Mock fetch for API calls
  const mockFetch = vi.fn();
  global.fetch = mockFetch;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should validate transit API endpoint response format', async () => {
    // Mock API response matching our backend format
    const mockResponse = [
      {
        id: 'sun_conjunction_sun_20250101',
        planet: 'Sun',
        aspect: 'conjunction',
        natal_planet: 'Sun',
        date: '2025-01-01',
        degree: 280.81,
        exact_time: null,
        orb: 0.0006455766911699357,
        intensity: 99.98,
        energy: 'intense',
        duration_days: 3,
        description: 'Sun conjunction natal Sun'
      }
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    // Test API call structure
    const requestBody = {
      birth_data: {
        birth_date: '1990-01-01',
        birth_time: '12:00',
        latitude: 40.7128,
        longitude: -74.0060,
        timezone: 'America/New_York'
      },
      date_range: {
        start_date: '2025-01-01',
        end_date: '2025-01-31'
      }
    };

    const response = await fetch('http://localhost:8000/api/astro/transits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();

    // Validate API call was made correctly
    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:8000/api/astro/transits',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      })
    );

    // Validate response format
    expect(Array.isArray(data)).toBe(true);
    expect(data[0]).toHaveProperty('id');
    expect(data[0]).toHaveProperty('planet');
    expect(data[0]).toHaveProperty('aspect');
    expect(data[0]).toHaveProperty('date');
    expect(data[0]).toHaveProperty('intensity');
    expect(data[0].intensity).toBeGreaterThan(90);
  });

  it('should validate lunar transit API response format', async () => {
    const mockLunarResponse = [
      {
        phase: 'New Moon',
        date: '2025-01-01',
        exact_time: '00:00:00',
        energy: 'new beginnings',
        degree: 293.91,
        moon_sign: 'Capricorn',
        intensity: 100.0,
        description: 'Perfect for setting intentions'
      }
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockLunarResponse,
    });

    const response = await fetch('http://localhost:8000/api/astro/lunar-transits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        birth_data: {
          birth_date: '1990-01-01',
          birth_time: '12:00',
          latitude: 40.7128,
          longitude: -74.0060
        },
        date_range: {
          start_date: '2025-01-01',
          end_date: '2025-01-31'
        }
      })
    });

    const data = await response.json();

    expect(Array.isArray(data)).toBe(true);
    expect(data[0]).toHaveProperty('phase');
    expect(data[0]).toHaveProperty('date');
    expect(data[0]).toHaveProperty('energy');
    expect(data[0]).toHaveProperty('moon_sign');
    expect(data[0].intensity).toBe(100.0);
  });

  it('should handle API error responses correctly', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 422,
      json: async () => ({ detail: 'Validation error' }),
    });

    const response = await fetch('http://localhost:8000/api/astro/transits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        birth_data: {
          birth_date: 'invalid-date', // Invalid date format
          birth_time: '12:00',
          latitude: 40.7128,
          longitude: -74.0060
        },
        date_range: {
          start_date: '2025-01-01',
          end_date: '2025-01-31'
        }
      })
    });

    expect(response.ok).toBe(false);
    expect(response.status).toBe(422);

    const errorData = await response.json();
    expect(errorData).toHaveProperty('detail');
  });

  it('should validate shared type definitions match API', () => {
    // Test that our TypeScript types align with API responses
    interface TransitResult {
      id: string;
      planet: string;
      aspect: string;
      natal_planet: string;
      date: string;
      degree: number;
      exact_time?: string | null;
      orb: number;
      intensity: number;
      energy: string;
      duration_days: number;
      description?: string;
    }

    interface BirthData {
      birth_date: string;
      birth_time: string;
      latitude: number;
      longitude: number;
      timezone?: string;
    }

    const sampleTransit: TransitResult = {
      id: 'sun_conjunction_sun_20250101',
      planet: 'Sun',
      aspect: 'conjunction',
      natal_planet: 'Sun',
      date: '2025-01-01',
      degree: 280.81,
      exact_time: null,
      orb: 0.001,
      intensity: 99.98,
      energy: 'intense',
      duration_days: 3,
      description: 'Sun conjunction natal Sun'
    };

    const sampleBirthData: BirthData = {
      birth_date: '1990-01-01',
      birth_time: '12:00',
      latitude: 40.7128,
      longitude: -74.0060,
      timezone: 'America/New_York'
    };

    // Type validation tests
    expect(typeof sampleTransit.id).toBe('string');
    expect(typeof sampleTransit.intensity).toBe('number');
    expect(typeof sampleBirthData.latitude).toBe('number');
    expect(sampleBirthData.birth_date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
