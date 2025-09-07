import { getIdToken, type User, type Auth } from 'firebase/auth';
import { auth } from '@cosmichub/auth';
import { FrequencyPreset } from '@cosmichub/integrations';
import {
  ok,
  fail,
  toFailure,
  ErrorCode,
  type ApiResult,
} from '@cosmichub/config';

function isFrequencyPreset(value: unknown): value is FrequencyPreset {
  return typeof value === 'object' && value !== null && 'name' in value;
}

async function parseJsonSafe<T>(resp: Response): Promise<T> {
  const data: unknown = await resp.json();
  return data as T; // caller will validate
}

// Centralized, type-safe accessor for current user to avoid repeated
// @typescript-eslint/no-unsafe-* lint rule triggers if the auth import
// is inferred as `any` in certain build edge cases.
function getSafeCurrentUser(): User | null {
  // If types resolve correctly, auth is already an Auth; otherwise assert.
  const a = auth as unknown as Auth | undefined;
  if (a && typeof a === 'object') {
    try {
      return a.currentUser ?? null;
    } catch {
      return null;
    }
  }
  return null;
}

// Vite exposes import.meta.env at build time; access defensively with a narrow type
const maybeEnv = import.meta?.env as
  | { VITE_HEALWAVE_API_BASE?: string }
  | undefined;
const API_BASE = (maybeEnv?.VITE_HEALWAVE_API_BASE ??
  process?.env?.VITE_HEALWAVE_API_BASE ??
  '');

function apiUrl(path: string): string {
  const base = API_BASE.replace(/\/$/, '');
  const p = path.startsWith('/') ? path : `/${path}`;
  return base ? `${base}${p}` : p;
}

export async function savePreset(
  preset: FrequencyPreset
): Promise<ApiResult<FrequencyPreset>> {
  try {
    const user = getSafeCurrentUser();
    if (!user) {
      return fail(ErrorCode.AUTH, 'User not authenticated'); // ALLOW_FAIL_USAGE
    }
    const token = await getIdToken(user);
    const response = await fetch(
      apiUrl('/healwave/presets'),
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preset),
      }
    );
    if (!response.ok) {
      return toFailure(
        { response: { status: response.status } },
        {
          auth: 'Authentication required to save preset',
          notFound: 'Preset endpoint not found',
          validation: 'Invalid preset data',
          defaultMsg: 'Failed to save preset',
        }
      );
    }
    const data = await parseJsonSafe<unknown>(response);
    if (isFrequencyPreset(data)) return ok(data);
    return fail('Invalid preset response shape', ErrorCode.INVALID_SHAPE);
  } catch (error) {
    return toFailure(error, {
      auth: 'Authentication required to save preset',
      notFound: 'Preset endpoint not found',
      validation: 'Invalid preset data',
      defaultMsg: 'Failed to save preset',
    });
  }
}

export async function getPresets(): Promise<ApiResult<FrequencyPreset[]>> {
  try {
    const user = getSafeCurrentUser();
    if (!user) {
      return fail(ErrorCode.AUTH, 'User not authenticated'); // ALLOW_FAIL_USAGE
    }
    const token = await getIdToken(user);
    const response = await fetch(
      apiUrl('/healwave/presets'),
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    if (!response.ok) {
      return toFailure(
        { response: { status: response.status } },
        {
          auth: 'Authentication required to fetch presets',
          notFound: 'Preset list not found',
          validation: 'Invalid request',
          defaultMsg: 'Failed to fetch presets',
        }
      );
    }
    const data = await parseJsonSafe<unknown>(response);
    if (Array.isArray(data)) {
      return ok(data.filter(isFrequencyPreset));
    }
    return ok([]);
  } catch (error) {
    return toFailure(error, {
      auth: 'Authentication required to fetch presets',
      notFound: 'Preset list not found',
      validation: 'Invalid request',
      defaultMsg: 'Failed to fetch presets',
    });
  }
}

export async function getUserPresets(): Promise<ApiResult<FrequencyPreset[]>> {
  return getPresets();
}

export async function deletePreset(presetId: string): Promise<ApiResult<null>> {
  try {
    const user = getSafeCurrentUser();
    if (!user) {
      return fail(ErrorCode.AUTH, 'User not authenticated'); // ALLOW_FAIL_USAGE
    }
    const token = await getIdToken(user);
    const response = await fetch(
      apiUrl(`/healwave/presets/${presetId}`),
      {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    if (!response.ok) {
      return toFailure(
        { response: { status: response.status } },
        {
          auth: 'Authentication required to delete preset',
          notFound: 'Preset not found',
          validation: 'Invalid preset id',
          defaultMsg: 'Failed to delete preset',
        }
      );
    }
    return ok(null);
  } catch (error) {
    return toFailure(error, {
      auth: 'Authentication required to delete preset',
      notFound: 'Preset not found',
      validation: 'Invalid preset id',
      defaultMsg: 'Failed to delete preset',
    });
  }
}
