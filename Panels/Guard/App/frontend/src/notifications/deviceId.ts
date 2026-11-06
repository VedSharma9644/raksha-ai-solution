/**
 * Derives a stable device key from the Expo push token itself
 * so we do not need SecureStore/AsyncStorage for token upserts.
 */
export function deviceIdFromPushToken(expoPushToken: string): string {
  const cleaned = expoPushToken.replace(/[^a-zA-Z0-9]/g, '');
  return cleaned.slice(-40) || `device-${Date.now()}`;
}
