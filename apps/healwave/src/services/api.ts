import { getIdToken } from "firebase/auth";
import { auth } from "@cosmichub/auth";
import { FrequencyPreset } from "@cosmichub/frequency";

export async function savePreset(preset: FrequencyPreset) {
  const token = await getIdToken(auth.currentUser!);
  const response = await fetch("https://your-render-domain.com/healwave/presets", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(preset),
  });
  if (!response.ok) throw new Error("Failed to save preset");
  return response.json();
}

export async function getPresets(): Promise<FrequencyPreset[]> {
  const token = await getIdToken(auth.currentUser!);
  const response = await fetch("https://your-render-domain.com/healwave/presets", {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("Failed to fetch presets");
  return response.json();
}

export async function getUserPresets(): Promise<FrequencyPreset[]> {
  // Same as getPresets for now, but could be filtered by user
  return getPresets();
}

export async function deletePreset(presetId: string): Promise<void> {
  const token = await getIdToken(auth.currentUser!);
  const response = await fetch(`https://your-render-domain.com/healwave/presets/${presetId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("Failed to delete preset");
}