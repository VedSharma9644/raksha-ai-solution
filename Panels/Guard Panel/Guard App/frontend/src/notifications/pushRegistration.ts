import Constants from 'expo-constants';
import * as Device from 'expo-device';
import { isRunningInExpoGo } from 'expo';
import { Platform } from 'react-native';

import { deviceIdFromPushToken } from './deviceId';
import {
  AndroidImportance,
  getPermissionsAsync,
  requestPermissionsAsync,
  setNotificationChannelAsync,
  setNotificationHandler,
} from './localNotifications';

setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Expo Go (SDK 53+) removed Android remote push.
 * Local scheduled notifications still work when we avoid the package root import.
 */
export function supportsRemotePush(): boolean {
  if (!Device.isDevice) {
    return false;
  }
  if (isRunningInExpoGo() && Platform.OS === 'android') {
    return false;
  }
  return Platform.OS === 'ios' || Platform.OS === 'android';
}

async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== 'android') {
    return;
  }
  await setNotificationChannelAsync('raskha-guard', {
    name: 'Raskha Guard',
    importance: AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#00464a',
    sound: 'default',
  });
}

function resolveProjectId(): string | undefined {
  return (
    Constants.easConfig?.projectId ??
    (Constants.expoConfig?.extra as { eas?: { projectId?: string } } | undefined)?.eas
      ?.projectId
  );
}

export type PushRegistrationResult = {
  expoPushToken: string | null;
  deviceId: string | null;
  platform: 'ios' | 'android' | 'web' | 'unknown';
  localReady: boolean;
  error?: string;
};

/**
 * Request permission + Android channel for local reminders.
 * Only fetches an Expo push token when remote push is supported (not Expo Go Android).
 */
export async function preparePushRegistration(): Promise<PushRegistrationResult> {
  const platform =
    Platform.OS === 'ios' || Platform.OS === 'android' || Platform.OS === 'web'
      ? Platform.OS
      : 'unknown';

  try {
    await ensureAndroidChannel();

    if (!Device.isDevice) {
      return {
        expoPushToken: null,
        deviceId: null,
        platform,
        localReady: false,
        error: 'Notifications require a physical device.',
      };
    }

    const current = await getPermissionsAsync();
    let status = current.status;
    if (status !== 'granted') {
      const requested = await requestPermissionsAsync();
      status = requested.status;
    }
    if (status !== 'granted') {
      return {
        expoPushToken: null,
        deviceId: null,
        platform,
        localReady: false,
        error: 'Notification permission not granted.',
      };
    }

    if (!supportsRemotePush()) {
      return {
        expoPushToken: null,
        deviceId: null,
        platform,
        localReady: true,
        error:
          'Remote push needs a development build on Android Expo Go. Local reminders are active.',
      };
    }

    // Deep-import only when remote push is allowed — this module pulls the
    // auto-registration side effect that throws inside Expo Go on Android.
    const { getExpoPushTokenAsync } = await import(
      'expo-notifications/build/getExpoPushTokenAsync'
    );
    const projectId = resolveProjectId();
    const tokenResponse = projectId
      ? await getExpoPushTokenAsync({ projectId })
      : await getExpoPushTokenAsync();

    const expoPushToken = tokenResponse.data;
    return {
      expoPushToken,
      deviceId: deviceIdFromPushToken(expoPushToken),
      platform,
      localReady: true,
    };
  } catch (error: unknown) {
    const err = error as { message?: string };
    const message = err.message ?? 'Failed to obtain push token.';
    const isExpoGoPushRemoval =
      /expo go/i.test(message) || /development build/i.test(message);

    return {
      expoPushToken: null,
      deviceId: null,
      platform,
      localReady: isExpoGoPushRemoval,
      error: message,
    };
  }
}
