import { MaterialIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Text, View } from 'react-native';

import { checkGeofence, fetchTodayShift } from '../../api/guard-api';
import { useGuardAppNavigation } from '../../navigation/useGuardAppNavigation';
import { appColors } from '../../theme';
import { homeMarkAttendanceHeroStyles as styles } from '../../styles/home-mark-attendance-hero.styles';
import { PrimaryActionButton } from '../shared/PrimaryActionButton';

export function MarkAttendanceHero() {
  const {
    authToken,
    cameraUnlocked,
    shiftActive,
    openPatrolSession,
    setCameraUnlocked,
    setLastKnownLocation,
    setShiftActive,
    setPatrolMode,
  } = useGuardAppNavigation();
  const [checking, setChecking] = useState(false);
  const [loadingShift, setLoadingShift] = useState(true);
  const [punchedAtLabel, setPunchedAtLabel] = useState<string | null>(null);

  const refreshShift = useCallback(async () => {
    if (!authToken) {
      setLoadingShift(false);
      return;
    }
    try {
      const today = await fetchTodayShift(authToken);
      setShiftActive(today.shiftActive);
      if (today.punchedAt) {
        const punched = new Date(today.punchedAt);
        setPunchedAtLabel(
          punched.toLocaleTimeString('en-IN', {
            timeZone: 'Asia/Kolkata',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          }),
        );
      } else {
        setPunchedAtLabel(null);
      }
    } catch {
      // Keep last known shift state if /today fails
    } finally {
      setLoadingShift(false);
    }
  }, [authToken, setShiftActive]);

  useEffect(() => {
    void refreshShift();
  }, [refreshShift]);

  const verifySiteAndOpenCamera = async (mode: 'punch_in' | 'punch_out') => {
    if (!authToken) {
      Alert.alert('Session', 'Please log in again to mark attendance.');
      return;
    }

    setChecking(true);
    setPatrolMode(mode);
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          'Location required',
          mode === 'punch_out'
            ? 'Enable GPS to verify you are at the duty site before ending your shift.'
            : 'Enable GPS to verify you are at the duty site before opening the camera.',
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
        Alert.alert(
          'Geofence',
          result.message ||
            (mode === 'punch_out'
              ? 'You must be at the duty site to end your shift.'
              : 'You are outside the site geofence.'),
        );
        setCameraUnlocked(false);
        return;
      }

      setCameraUnlocked(true);
      Alert.alert(
        'Site verified',
        mode === 'punch_out'
          ? 'Camera unlocked. Capture your selfie to end the shift.'
          : 'Camera unlocked. Capture your selfie to start the shift.',
        [{ text: 'Open Camera', onPress: () => openPatrolSession(mode) }],
      );
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unable to verify location.';
      Alert.alert('Geofence check failed', message);
    } finally {
      setChecking(false);
    }
  };

  const handlePress = async () => {
    if (shiftActive) {
      if (cameraUnlocked) {
        openPatrolSession('punch_out');
        return;
      }
      await verifySiteAndOpenCamera('punch_out');
      return;
    }

    if (cameraUnlocked) {
      openPatrolSession('punch_in');
      return;
    }

    await verifySiteAndOpenCamera('punch_in');
  };

  if (loadingShift) {
    return (
      <View style={styles.card}>
        <ActivityIndicator size="large" color={appColors.onPrimary} />
        <Text style={[styles.subtitle, { marginTop: 12 }]}>Checking shift status…</Text>
      </View>
    );
  }

  const isEndShift = shiftActive;

  return (
    <View style={[styles.card, isEndShift && { backgroundColor: '#5c3d2e' }]}>
      <View style={[styles.blob, styles.blobTopRight]} />
      <View style={[styles.blob, styles.blobBottomLeft]} />

      <View style={styles.pill}>
        <MaterialIcons
          name={isEndShift ? 'schedule' : 'verified-user'}
          size={18}
          color={appColors.onPrimary}
        />
        <Text style={styles.pillText}>
          {isEndShift
            ? 'SHIFT ACTIVE • ON DUTY'
            : cameraUnlocked
              ? 'CAMERA UNLOCKED • READY'
              : 'GEO-FENCED SITE CAMERA'}
        </Text>
      </View>

      <View style={styles.cameraCircle}>
        {checking ? (
          <ActivityIndicator size="large" color={appColors.primary} />
        ) : (
          <MaterialIcons
            name={isEndShift ? 'logout' : 'photo-camera'}
            size={42}
            color={appColors.primary}
          />
        )}
      </View>

      <Text style={[styles.title, isEndShift && styles.titleOnDuty]}>
        {isEndShift ? 'END SHIFT' : 'MARK ATTENDANCE'}
      </Text>
      <Text style={[styles.subtitle, isEndShift && styles.subtitleOnDuty]}>
        {isEndShift
          ? punchedAtLabel
            ? `On duty since ${punchedAtLabel}. Verify site GPS and capture a selfie to end your shift.`
            : 'You are on duty. Verify site GPS and capture a selfie to end your shift.'
          : cameraUnlocked
            ? 'Location verified. Take a live selfie to punch in and start your shift.'
            : 'Verify GPS at your site first — camera unlocks only after geofence pass.'}
      </Text>

      <View style={styles.lockRow}>
        <MaterialIcons
          name={cameraUnlocked || isEndShift ? 'lock-open' : 'lock'}
          size={18}
          color={isEndShift ? '#FFFFFF' : appColors.onPrimaryContainer}
        />
        <Text style={[styles.lockText, isEndShift && styles.lockTextOnDuty]}>
          {isEndShift
            ? cameraUnlocked
              ? 'Geofence Passed • Capture selfie to end shift'
              : 'Must be at site to logout / end shift'
            : cameraUnlocked
              ? 'Geofence Passed • Capture selfie to start shift'
              : 'Live GPS check required • No Gallery Upload'}
        </Text>
      </View>

      <PrimaryActionButton
        label={
          checking
            ? 'Checking location...'
            : isEndShift
              ? cameraUnlocked
                ? 'Open Camera to End Shift'
                : 'Verify Site & End Shift'
              : cameraUnlocked
                ? 'Tap to Open Camera'
                : 'Verify Location & Unlock'
        }
        icon={
          isEndShift
            ? cameraUnlocked
              ? 'photo-camera'
              : 'my-location'
            : cameraUnlocked
              ? 'center-focus-strong'
              : 'my-location'
        }
        onPress={() => {
          void handlePress();
        }}
        variant="light"
      />
    </View>
  );
}
