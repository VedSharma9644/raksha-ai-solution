import Constants from 'expo-constants';

/** Production Guard API on Cloud Run (asia-south1). */
const LIVE_GUARD_API_URL =
  'https://raskha-guard-app-api-csz7pz4xsq-el.a.run.app';

/**
 * Resolve API base URL for Expo Go, local builds, and release APKs.
 * Priority: EXPO_PUBLIC_GUARD_API_URL → app.config extra → live Cloud Run.
 */
function resolveGuardApiBaseUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_GUARD_API_URL?.trim();
  const fromExtra = (
    Constants.expoConfig?.extra as { guardApiUrl?: string } | undefined
  )?.guardApiUrl?.trim();

  const raw = fromEnv || fromExtra || LIVE_GUARD_API_URL;
  return raw.replace(/\/$/, '');
}

export const guardApiConfig = {
  baseUrl: resolveGuardApiBaseUrl(),
} as const;
