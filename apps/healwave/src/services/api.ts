import { getIdToken } from "firebase/auth";
import { auth } from "@cosmichub/auth";
import { FrequencyPreset } from "@cosmichub/frequency";
import { ok, fail, toFailure, ErrorCode, type ApiResult } from "@cosmichub/config";

function isFrequencyPreset(value: unknown): value is FrequencyPreset {
  return typeof value === 'object' && value !== null && 'name' in value;
}

async function parseJsonSafe<T>(resp: Response): Promise<T> {
  const data: unknown = await resp.json();
  return data as T; // caller will validate
}

export async function savePreset(preset: FrequencyPreset): Promise<ApiResult<FrequencyPreset>> {
  try {
    const token = await getIdToken(auth.currentUser!);
    const response = await fetch("https://your-render-domain.com/healwave/presets", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(preset),
    });
    if (!response.ok) {
      return toFailure({ response: { status: response.status } }, {
        auth: "Authentication required to save preset",
        notFound: "Preset endpoint not found",
        validation: "Invalid preset data",
        defaultMsg: "Failed to save preset"
      });
    }
    const data = await parseJsonSafe<unknown>(response);
  if (isFrequencyPreset(data)) return ok(data);
  return fail("Invalid preset response shape", ErrorCode.INVALID_SHAPE);
  } catch (error) {
    return toFailure(error, {
      auth: "Authentication required to save preset",
      notFound: "Preset endpoint not found",
      validation: "Invalid preset data",
      defaultMsg: "Failed to save preset"
    });
  }
}

export async function getPresets(): Promise<ApiResult<FrequencyPreset[]>> {
  try {
    const token = await getIdToken(auth.currentUser!);
    const response = await fetch("https://your-render-domain.com/healwave/presets", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      return toFailure({ response: { status: response.status } }, {
        auth: "Authentication required to fetch presets",
        notFound: "Preset list not found",
        validation: "Invalid request",
        defaultMsg: "Failed to fetch presets"
      });
    }
    const data = await parseJsonSafe<unknown>(response);
    if (Array.isArray(data)) {
      return ok(data.filter(isFrequencyPreset));
    }
    return ok([]);
  } catch (error) {
    return toFailure(error, {
      auth: "Authentication required to fetch presets",
      notFound: "Preset list not found",
      validation: "Invalid request",
      defaultMsg: "Failed to fetch presets"
    });
  }
}

export async function getUserPresets(): Promise<ApiResult<FrequencyPreset[]>> { return getPresets(); }

export async function deletePreset(presetId: string): Promise<ApiResult<null>> {
  try {
    const token = await getIdToken(auth.currentUser!);
    const response = await fetch(`https://your-render-domain.com/healwave/presets/${presetId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      return toFailure({ response: { status: response.status } }, {
        auth: "Authentication required to delete preset",
        notFound: "Preset not found",
        validation: "Invalid preset id",
        defaultMsg: "Failed to delete preset"
      });
    }
    return ok(null);
  } catch (error) {
    return toFailure(error, {
      auth: "Authentication required to delete preset",
      notFound: "Preset not found",
      validation: "Invalid preset id",
      defaultMsg: "Failed to delete preset"
    });
  }
}