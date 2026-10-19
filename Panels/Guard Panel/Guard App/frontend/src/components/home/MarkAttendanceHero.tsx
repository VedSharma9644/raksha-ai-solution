import { MaterialIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

import { showAlert } from '../../alerts/appAlert';
import { checkGeofence, fetchTodayShift } from '../../api/guard-api';
import { useLanguage } from '../../i18n';
import { useGuardAppNavigation } from '../../navigation/useGuardAppNavigation';
import { appColors } from '../../theme';
import { homeMarkAttendanceHeroStyles as styles } from '../../styles/home-mark-attendance-hero.styles';
import { resolvePunchInBlockedMessage } from '../../utils/punch-in-window';
import { resolvePunchOutBlockedMessage } from '../../utils/punch-out-eligibility';
import { PrimaryActionButton } from '../shared/PrimaryActionButton';

export function MarkAttendanceHero() {
  const { t } = useLanguage();
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
  const [punchInClosedMessage, setPunchInClosedMessage] = useState<string | null>(
    null,
  );

  const applyTodayGate = useCallback(
    (today: Awaited<ReturnType<typeof fetchTodayShift>>) => {
      setShiftActive(today.shiftActive);
      const nextPunchedLabel = today.punchedAt
        ? new Date(today.punchedAt).toLocaleTimeString('en-IN', {
            timeZone: 'Asia/Kolkata',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          })
        : null;
      setPunchedAtLabel((current) =>
        current === nextPunchedLabel ? current : nextPunchedLabel,
      );
      const blocked = resolvePunchInBlockedMessage({
        shiftFrom: today.shiftFrom,
        shiftTo: today.shiftTo,
        dutyDate: today.dutyDate,
        shiftActive: today.shiftActive,
        serverOpen: today.punchInWindow?.open,
        serverMessage: today.punchInWindow?.message,
      });
      setPunchInClosedMessage((current) =>
        current === blocked ? current : blocked,
      );
      return blocked;
    },
    [setShiftActive],
  );

  const refreshShift = useCallback(async () => {
    if (!authToken) {
      setLoadingShift(false);
      return;
    }
    try {
      const today = await fetchTodayShift(authToken);
      applyTodayGate(today);
    } catch {
      // Keep last known shift state if /today fails
    } finally {
      setLoadingShift(false);
    }
  }, [applyTodayGate, authToken]);

  useEffect(() => {
    void refreshShift();
  }, [refreshShift]);

  const assertPunchInStillOpen = async (): Promise<boolean> => {
    if (!authToken) {
      showAlert('Session', 'Please log in again to mark attendance.');
      return false;
    }
    try {
      const today = await fetchTodayShift(authToken);
      const blocked = applyTodayGate(today);
      if (blocked) {
        showAlert('Punch-in not open', blocked);
        setCameraUnlocked(false);
        return false;
      }
      return true;
    } catch {
      showAlert(
        'Punch-in unavailable',
        'Could not verify your shift window. Check your connection and try again.',
      );
      return false;
    }
  };

  const assertPunchOutAllowed = async (): Promise<boolean> => {
    if (!authToken) {
      showAlert('Session', 'Please log in again to mark attendance.');
      return false;
    }
    try {
      const today = await fetchTodayShift(authToken);
      applyTodayGate(today);
      const blocked = resolvePunchOutBlockedMessage(today);
      if (blocked) {
        showAlert('Cannot end shift yet', blocked);
        setCameraUnlocked(false);
        return false;
      }
      return true;
    } catch {
      showAlert(
        'End shift unavailable',
        'Could not verify relief assignment. Check your connection and try again.',
      );
      return false;
    }
  };

  const verifySiteAndOpenCamera = async (mode: 'punch_in' | 'punch_out') => {
    if (!authToken) {
      showAlert('Session', 'Please log in again to mark attendance.');
      return;
    }

    setChecking(true);
    setPatrolMode(mode);
    try {
      if (mode === 'punch_in') {
        const allowed = await assertPunchInStillOpen();
        if (!allowed) {
          return;
        }
      }
      if (mode === 'punch_out') {
        const allowed = await assertPunchOutAllowed();
        if (!allowed) {
          return;
        }
      }

      const permission = await Location.requestForegroundPermissionsAsync();
      if (!permission.granted) {
        showAlert(
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

      const result = await checkGeofence(
        authToken,
        lat,
        lng,
        accuracyMeters,
        mode,
      );
      if (!result.unlocked) {
        showAlert(
          'Geofence',
          result.message ||
            (mode === 'punch_out'
              ? 'You must be at the duty site to end your shift.'
              : 'You are outside the site geofence.'),
        );
        setCameraUnlocked(false);
        return;
      }

      // Re-check after geofence so a long GPS wait cannot bypass gates.
      if (mode === 'punch_in') {
        const stillAllowed = await assertPunchInStillOpen();
        if (!stillAllowed) {
          return;
        }
      }
      if (mode === 'punch_out') {
        const stillAllowed = await assertPunchOutAllowed();
        if (!stillAllowed) {
          return;
        }
      }

      setCameraUnlocked(true);
      showAlert(
        'Site verified',
        mode === 'punch_out'
          ? 'Camera unlocked. Capture your end-shift selfie to finish duty. Photo is required.'
          : 'Camera unlocked. Capture your selfie to start the shift.',
        [{ text: 'Open Camera', onPress: () => openPatrolSession(mode) }],
      );
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Unable to verify location.';
      showAlert('Geofence check failed', message);
    } finally {
      setChecking(false);
    }
  };

  const handlePress = async () => {
    if (shiftActive) {
      await verifySiteAndOpenCamera('punch_out');
      return;
    }

    await verifySiteAndOpenCamera('punch_in');
  };

  if (loadingShift) {
    return (
      <View style={styles.card}>
        <ActivityIndicator size="large" color={appColors.onPrimary} />
        <Text style={[styles.subtitle, { marginTop: 12 }]}>
          Checking shift status…
        </Text>
      </View>
    );
  }

  const isEndShift = shiftActive;
  const punchInBlocked = !isEndShift && Boolean(punchInClosedMessage);

  return (
    <View
      style={[
        styles.card,
        isEndShift && { backgroundColor: '#5c3d2e' },
        punchInBlocked && { backgroundColor: '#4b5563' },
      ]}
    >
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
            ? t('home.onDutyPill')
            : punchInBlocked
              ? t('home.windowClosedPill')
              : cameraUnlocked
                ? t('home.cameraReady')
                : t('home.geoPill')}
        </Text>
      </View>

      <View style={styles.cameraCircle}>
        {checking ? (
          <ActivityIndicator size="large" color={appColors.primary} />
        ) : (
          <MaterialIcons
            name={
              isEndShift
                ? 'logout'
                : punchInBlocked
                  ? 'timer-off'
                  : 'photo-camera'
            }
            size={42}
            color={appColors.primary}
          />
        )}
      </View>

      <Text style={[styles.title, isEndShift && styles.titleOnDuty]}>
        {isEndShift
          ? t('home.endShift')
          : punchInBlocked
            ? t('home.checkInClosed')
            : t('home.markAttendance')}
      </Text>
      <Text style={[styles.subtitle, isEndShift && styles.subtitleOnDuty]}>
        {isEndShift
          ? punchedAtLabel
            ? `On duty since ${punchedAtLabel}. ${t('home.hintOnDuty')}`
            : t('home.hintOnDuty')
          : punchInBlocked
            ? punchInClosedMessage
            : cameraUnlocked
              ? t('home.hintUnlocked')
              : t('home.hintVerify')}
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
            ? t('home.checkingLocation')
            : isEndShift
              ? cameraUnlocked
                ? t('home.openCameraEnd')
                : t('home.verifyEnd')
              : punchInBlocked
                ? t('home.punchUnavailable')
                : cameraUnlocked
                  ? t('home.openCamera')
                  : t('home.verifyUnlock')
        }
        icon={
          isEndShift
            ? cameraUnlocked
              ? 'photo-camera'
              : 'my-location'
            : punchInBlocked
              ? 'block'
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
