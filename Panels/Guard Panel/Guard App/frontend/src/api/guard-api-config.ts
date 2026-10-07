export const guardApiConfig = {
  baseUrl: (process.env.EXPO_PUBLIC_GUARD_API_URL ?? 'http://localhost:3005').replace(
    /\/$/,
    '',
  ),
} as const;
