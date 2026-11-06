/**
 * Expo app config. Defaults the Guard API to Cloud Run so release APKs
 * work on real devices without depending on a local .env file (gitignored).
 */
const LIVE_GUARD_API_URL =
  'https://raskha-guard-app-api-lphv6wjfaq-el.a.run.app';

const guardApiUrl = (
  process.env.EXPO_PUBLIC_GUARD_API_URL || LIVE_GUARD_API_URL
).replace(/\/$/, '');

/** @type {import('expo/config').ExpoConfig} */
const config = {
  name: 'Amrat Security Agency',
  slug: 'amrat-security-agency',
  version: '1.0.3',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  scheme: 'amrat-security',
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.vedashtech.amratsecurity',
    infoPlist: {
      NSCameraUsageDescription:
        'Amrat Security Agency needs the camera to capture your duty punch-in selfie.',
      NSLocationWhenInUseUsageDescription:
        'Amrat Security Agency needs your location to verify you are at the assigned site.',
      UIBackgroundModes: ['remote-notification'],
    },
  },
  android: {
    package: 'com.vedashtech.amratsecurity',
    versionCode: 4,
    adaptiveIcon: {
      backgroundColor: '#000000',
      foregroundImage: './assets/android-icon-foreground.png',
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
    [
      'expo-splash-screen',
      {
        backgroundColor: '#000000',
        image: './assets/splash-icon.png',
        imageWidth: 280,
      },
    ],
    'expo-font',
    [
      'expo-build-properties',
      {
        android: {
          // Play vitals: R8 minify/obfuscate release DEX (needs a new AAB).
          enableMinifyInReleaseBuilds: true,
          enableShrinkResourcesInReleaseBuilds: true,
        },
      },
    ],
    [
      'expo-camera',
      {
        cameraPermission:
          'Allow Amrat Security Agency to use the camera for attendance selfies.',
        microphonePermission: false,
        recordAudioAndroid: false,
      },
    ],
    [
      'expo-location',
      {
        locationWhenInUsePermission:
          'Allow Amrat Security Agency to use your location to verify you are at the assigned site.',
      },
    ],
    [
      'expo-notifications',
      {
        icon: './assets/notification-icon.png',
        color: '#00464a',
        defaultChannel: 'amrat-security',
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
