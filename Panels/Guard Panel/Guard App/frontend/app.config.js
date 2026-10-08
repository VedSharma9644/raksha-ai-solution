/**
 * Expo app config. Defaults the Guard API to Cloud Run so release APKs
 * work on real devices without depending on a local .env file (gitignored).
 */
const LIVE_GUARD_API_URL =
  'https://raskha-guard-app-api-csz7pz4xsq-el.a.run.app';

const guardApiUrl = (
  process.env.EXPO_PUBLIC_GUARD_API_URL || LIVE_GUARD_API_URL
).replace(/\/$/, '');

/** @type {import('expo/config').ExpoConfig} */
const config = {
  name: 'Raksha Guard',
  slug: 'raksha-guard',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  scheme: 'raksha-guard',
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.raksha.guard',
    infoPlist: {
      NSCameraUsageDescription:
        'Raksha needs the camera to capture your duty punch-in selfie.',
      NSLocationWhenInUseUsageDescription:
        'Raksha needs your location to verify you are at the assigned site.',
      UIBackgroundModes: ['remote-notification'],
    },
  },
  android: {
    package: 'com.raksha.guard',
    versionCode: 1,
    adaptiveIcon: {
      backgroundColor: '#E6F4FE',
      foregroundImage: './assets/android-icon-foreground.png',
      backgroundImage: './assets/android-icon-background.png',
      monochromeImage: './assets/android-icon-monochrome.png',
    },
    predictiveBackGestureEnabled: false,
    permissions: [
      'android.permission.CAMERA',
      'android.permission.ACCESS_COARSE_LOCATION',
      'android.permission.ACCESS_FINE_LOCATION',
      'android.permission.POST_NOTIFICATIONS',
      'android.permission.RECEIVE_BOOT_COMPLETED',
      'android.permission.VIBRATE',
      'android.permission.SCHEDULE_EXACT_ALARM',
    ],
  },
  web: {
    favicon: './assets/favicon.png',
  },
  plugins: [
    'expo-font',
    [
      'expo-camera',
      {
        cameraPermission: 'Allow Raksha to use the camera for attendance selfies.',
        microphonePermission: false,
        recordAudioAndroid: false,
      },
    ],
    [
      'expo-location',
      {
        locationWhenInUsePermission:
          'Allow Raksha to use your location to verify you are at the assigned site.',
      },
    ],
    [
      'expo-notifications',
      {
        icon: './assets/icon.png',
        color: '#00464a',
        defaultChannel: 'raskha-guard',
        sounds: [],
      },
    ],
  ],
  extra: {
    guardApiUrl,
    eas: {
      projectId: '1d25993b-f16a-4264-81cc-4ab5d69b7ce9',
    },
  },
};

module.exports = { expo: config };
