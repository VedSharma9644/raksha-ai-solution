import { MaterialIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { showAlert } from '../../alerts/appAlert';
import { checkGeofence, fetchTodayShift } from '../../api/guard-api';
import { useGuardDutyAssignment } from '../../hooks/useGuardDutyAssignment';
import { useGuardAppNavigation } from '../../navigation/useGuardAppNavigation';
import { appColors } from '../../theme';
import { shiftCheckoutActionsStyles as styles } from '../../styles/shift-checkout-actions.styles';
import { resolvePunchInBlockedMessage } from '../../utils/punch-in-window';
import { resolvePunchOutBlockedMessage } from '../../utils/punch-out-eligibility';

export function ShiftCheckoutActions() {
  const {
    openPatrolSession,
    authToken,
    setCameraUnlocked,
    setLastKnownLocation,
    setPatrolMode,
  } = useGuardAppNavigation();
  const duty = useGuardDutyAssignment();
  const ending = duty.shiftActive;
  const [checking, setChecking] = useState(false);

  const verifyAndOpen = async () => {
    const mode = ending ? 'punch_out' : 'punch_in';
    if (!authToken) {
      showAlert('Session', 'Please log in again to mark attendance.');
      return;
    }

    setChecking(true);
    setPatrolMode(mode);
    try {
      if (mode === 'punch_in') {
        const today = await fetchTodayShift(authToken);
        const blocked = resolvePunchInBlockedMessage({
          shiftFrom: today.shiftFrom ?? duty.shiftFrom,
          shiftTo: today.shiftTo ?? duty.shiftTo,
          dutyDate: today.dutyDate,
          shiftActive: today.shiftActive,
          serverOpen: today.punchInWindow?.open,
          serverMessage: today.punchInWindow?.message,
        });
        if (blocked) {
          showAlert('Punch-in not open', blocked);
          setCameraUnlocked(false);
          return;
        }
      }

      if (mode === 'punch_out') {
        const today = await fetchTodayShift(authToken);
        const blocked = resolvePunchOutBlockedMessage(today);
        if (blocked) {
          showAlert('Cannot end shift yet', blocked);
          setCameraUnlocked(false);
          return;
        }
      }

      const permission = await Location.requestForegroundPermissionsAsync();
      if (!permission.granted) {
        showAlert(
          'Location required',
          ending
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
            (ending
              ? 'You must be at the duty site to end your shift.'
              : 'You are outside the site geofence.'),
        );
        setCameraUnlocked(false);
        return;
      }

      if (mode === 'punch_in') {
        const today = await fetchTodayShift(authToken);
        const blocked = resolvePunchInBlockedMessage({
          shiftFrom: today.shiftFrom ?? duty.shiftFrom,
          shiftTo: today.shiftTo ?? duty.shiftTo,
          dutyDate: today.dutyDate,
          shiftActive: today.shiftActive,
          serverOpen: today.punchInWindow?.open,
          serverMessage: today.punchInWindow?.message,
        });
        if (blocked) {
          showAlert('Punch-in not open', blocked);
          setCameraUnlocked(false);
          return;
        }
      }

      if (mode === 'punch_out') {
        const today = await fetchTodayShift(authToken);
        const blocked = resolvePunchOutBlockedMessage(today);
        if (blocked) {
          showAlert('Cannot end shift yet', blocked);
          setCameraUnlocked(false);
          return;
        }
      }

      setCameraUnlocked(true);
      openPatrolSession(mode);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Unable to verify location.';
      showAlert('Geofence check failed', message);
    } finally {
      setChecking(false);
    }
  };

  return (
    <View style={styles.section}>
      <Pressable
        style={({ pressed }) => [
          styles.checkoutButton,
          pressed && styles.checkoutButtonPressed,
        ]}
        onPress={() => {
          void verifyAndOpen();
        }}
        disabled={checking}
      >
        {checking ? (
          <ActivityIndicator color={appColors.onPrimary} />
        ) : (
          <MaterialIcons
            name={ending ? 'logout' : 'login'}
            size={24}
            color={appColors.onPrimary}
          />
        )}
        <Text style={styles.checkoutLabel} numberOfLines={1}>
          {checking
            ? 'Verifying…'
            : ending
              ? 'End shift'
              : 'Punch in'}
        </Text>
      </Pressable>
      <Text style={styles.sosHintText}>
        Punch-in opens 15 minutes before shift start — GPS verify required
      </Text>
    </View>
  );
}
