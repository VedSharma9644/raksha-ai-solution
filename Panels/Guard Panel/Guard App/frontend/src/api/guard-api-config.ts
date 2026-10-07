/**
 * For Expo Go on a physical device, set EXPO_PUBLIC_GUARD_API_URL to your PC
 * LAN IP (see frontend/.env). localhost only works on simulators / web.
 */
export const guardApiConfig = {
  baseUrl: (process.env.EXPO_PUBLIC_GUARD_API_URL ?? 'http://localhost:3005').replace(
    /\/$/,
    '',
  ),
} as const;
