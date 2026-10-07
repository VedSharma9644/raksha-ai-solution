import { MaterialIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useState } from 'react';
import { ActivityIndicator, Alert, Text, View } from 'react-native';

import { checkGeofence } from '../../api/guard-api';
import { useGuardAppNavigation } from '../../navigation/useGuardAppNavigation';
import { appColors } from '../../theme';
import { homeMarkAttendanceHeroStyles as styles } from '../../styles/home-mark-attendance-hero.styles';
import { PrimaryActionButton } from '../shared/PrimaryActionButton';

export function MarkAttendanceHero() {
  const {
    authToken,
    cameraUnlocked,
    openPatrolSession,
    setCameraUnlocked,
    setLastKnownLocation,
  } = useGuardAppNavigation();
  const [checking, setChecking] = useState(false);

  const handlePress = async () => {
    if (cameraUnlocked) {
      openPatrolSession();
      return;
    }

    if (!authToken) {
      Alert.alert('Session', 'Please log in again to mark attendance.');
      return;
    }

    setChecking(true);
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          'Location required',
          'Enable GPS to verify you are at the duty site before opening the camera.',
        );
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      const accuracyMeters = position.coords.accuracy ?? 5;

      setLastKnownLocation({ lat, lng, accuracyMeters });

      const result = await checkGeofence(authToken, lat, lng, accuracyMeters);
      if (!result.unlocked) {
        Alert.alert('Geofence', result.message || 'You are outside the site geofence.');
        setCameraUnlocked(false);
        return;
      }

      setCameraUnlocked(true);
      Alert.alert('Site verified', 'Camera unlocked. Capture your selfie to start the shift.', [
        { text: 'Open Camera', onPress: openPatrolSession },
      ]);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unable to verify location.';
      Alert.alert('Geofence check failed', message);
    } finally {
      setChecking(false);
    }
  };

  return (
    <View style={styles.card}>
      <View style={[styles.blob, styles.blobTopRight]} />
      <View style={[styles.blob, styles.blobBottomLeft]} />

      <View style={styles.pill}>
        <MaterialIcons name="verified-user" size={18} color={appColors.onPrimary} />
        <Text style={styles.pillText}>
          {cameraUnlocked ? 'CAMERA UNLOCKED • READY' : 'GEO-FENCED SITE CAMERA'}
        </Text>
      </View>

      <View style={styles.cameraCircle}>
        {checking ? (
          <ActivityIndicator size="large" color={appColors.primary} />
        ) : (
          <MaterialIcons name="photo-camera" size={42} color={appColors.primary} />
        )}
      </View>

      <Text style={styles.title}>MARK ATTENDANCE</Text>
      <Text style={styles.subtitle}>
        {cameraUnlocked
          ? 'Location verified. Take a live selfie to punch in and start your shift.'
          : 'Verify GPS at your site first — camera unlocks only after geofence pass.'}
      </Text>

      <View style={styles.lockRow}>
        <MaterialIcons
          name={cameraUnlocked ? 'lock-open' : 'lock'}
          size={18}
          color={appColors.onPrimaryContainer}
        />
        <Text style={styles.lockText}>
          {cameraUnlocked
            ? 'Geofence Passed • Capture selfie to start shift'
            : 'Live GPS check required • No Gallery Upload'}
        </Text>
      </View>

      <PrimaryActionButton
        label={
          checking
            ? 'Checking location...'
            : cameraUnlocked
              ? 'Tap to Open Camera'
              : 'Verify Location & Unlock'
        }
        icon={cameraUnlocked ? 'center-focus-strong' : 'my-location'}
        onPress={() => {
          void handlePress();
        }}
        variant="light"
      />
    </View>
  );
}
