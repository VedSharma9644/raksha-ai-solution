import { MaterialIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

import { showAlert } from '../../alerts/appAlert';
import { checkGeofence } from '../../api/guard-api';
import { useGuardDutyAssignment } from '../../hooks/useGuardDutyAssignment';
import { useGuardAppNavigation } from '../../navigation/useGuardAppNavigation';
import { rescheduleIntervalCheckinReminder } from '../../notifications/intervalCheckinReminders';
import { intervalCheckinBannerStyles as styles } from '../../styles/interval-checkin-banner.styles';
import { appColors } from '../../theme';
import { PrimaryActionButton } from '../shared/PrimaryActionButton';

function formatClock(iso: string | null | undefined): string {
  if (!iso) {
    return '';
  }
  return new Date(iso).toLocaleTimeString('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

/** Uses the shared /today duty provider — does not fetch on its own. */
export function IntervalCheckinBanner() {
  const {
    authToken,
    openPatrolSession,
    setCameraUnlocked,
    setLastKnownLocation,
    setPatrolMode,
  } = useGuardAppNavigation();
  const duty = useGuardDutyAssignment();
  const status = duty.intervalCheckin;

  const [checking, setChecking] = useState(false);
  const lastReminderKeyRef = useRef('');

  useEffect(() => {
    if (!duty.shiftActive || !status?.enabled) {
      lastReminderKeyRef.current = '';
      void rescheduleIntervalCheckinReminder(null).catch(() => undefined);
      return;
    }
    const reminderKey = `${status.status}|${status.dueAt ?? ''}|${status.nextDueAt ?? ''}|${status.completedCount}`;
    if (reminderKey === lastReminderKeyRef.current) {
      return;
    }
    lastReminderKeyRef.current = reminderKey;
    void rescheduleIntervalCheckinReminder(status, duty.siteName).catch(
      () => undefined,
    );
  }, [duty.shiftActive, duty.siteName, status]);

  const startCheckin = async () => {
    if (!authToken) {
      showAlert('Session', 'Please log in again to check in.');
      return;
    }
    setChecking(true);
    setPatrolMode('interval_checkin');
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (!permission.granted) {
        showAlert(
          'Location required',
          'Enable GPS to verify you are at the duty site before check-in.',
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
        'interval_checkin',
      );
      if (!result.unlocked) {
        showAlert(
          'Geofence',
          result.message || 'You are outside the site geofence.',
        );
        setCameraUnlocked(false);
        return;
      }

      setCameraUnlocked(true);
      openPatrolSession('interval_checkin');
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Unable to verify location.';
      showAlert('Geofence check failed', message);
    } finally {
      setChecking(false);
    }
  };

  if (!duty.shiftActive || !status?.enabled) {
    return null;
  }

  if (status.status === 'inactive') {
    return null;
  }

  const actionable = status.status === 'due' || status.status === 'late';
  const cardStyle =
    status.status === 'late'
      ? styles.cardLate
      : status.status === 'due'
        ? styles.cardDue
        : status.status === 'missed'
          ? styles.cardMissed
          : status.status === 'complete'
            ? styles.cardWaiting
            : styles.cardWaiting;

  const title =
    status.status === 'due'
      ? 'Interval check-in due'
      : status.status === 'late'
        ? 'Late check-in window'
        : status.status === 'missed'
          ? 'Check-in missed'
          : status.status === 'complete'
            ? 'Interval photos complete'
            : 'Next interval check-in';

  const body =
    status.status === 'due'
      ? `Capture a site selfie now. Late window closes ${formatClock(status.graceEndsAt)}.`
      : status.status === 'late'
        ? `You are past the due time (${formatClock(status.dueAt)}). Check in before ${formatClock(status.graceEndsAt)}.`
        : status.status === 'missed'
          ? `Missed check-in at ${formatClock(status.dueAt)}. Next window opens at ${formatClock(status.nextDueAt)}.`
          : status.status === 'complete'
            ? 'No more interval photos for this shift. End your shift when you are ready to leave.'
            : `Next photo check-in at ${formatClock(status.nextDueAt)} (every ${status.intervalMinutes} min).`;

  const icon =
    status.status === 'missed'
      ? 'event-busy'
      : status.status === 'complete'
        ? 'check-circle'
        : status.status === 'waiting'
          ? 'schedule'
          : 'camera-alt';

  return (
    <View style={[styles.card, cardStyle]}>
      <View style={styles.row}>
        <MaterialIcons name={icon} size={22} color={appColors.primary} />
        <View style={styles.copy}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.body}>{body}</Text>
          <Text style={styles.meta}>
            Completed this shift: {status.completedCount}
            {status.intervalMinutes
              ? ` · Every ${status.intervalMinutes} min`
              : ''}
          </Text>
        </View>
      </View>

      {actionable ? (
        checking ? (
          <ActivityIndicator color={appColors.primary} />
        ) : (
          <PrimaryActionButton
            label="Verify site & check in"
            icon="my-location"
            onPress={() => {
              void startCheckin();
            }}
            variant="light"
          />
        )
      ) : null}
    </View>
  );
}
