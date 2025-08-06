import { getIdToken } from "firebase/auth";
import { auth } from "../firebase";

export async function savePreset(preset: {
  frequency: number;
  binaural_offset: number;
  waveform: string;
  name: string;
}) {
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

export async function getPresets() {
  const token = await getIdToken(auth.currentUser!);
  const response = await fetch("https://your-render-domain.com/healwave/presets", {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("Failed to fetch presets");
  return response.json();
}