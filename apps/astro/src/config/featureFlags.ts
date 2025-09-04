// Simple feature flag map for progressive rollout
export const featureFlags = {
  enableStandaloneTCM: true,
  enableStandalonePsychology: true,
  enableStandaloneSpiritual: true,
  deprecateMultiSystemTabs: false, // when true, hide tabs for extracted domains in hub
} as const;

export type FeatureFlagKey = keyof typeof featureFlags;

export function isFeatureEnabled(flag: FeatureFlagKey): boolean {
  return Boolean(featureFlags[flag]);
}
