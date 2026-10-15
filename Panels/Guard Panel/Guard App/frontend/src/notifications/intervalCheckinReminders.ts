import {
  cancelScheduledNotificationAsync,
  getAllScheduledNotificationsAsync,
  scheduleNotificationAsync,
  SchedulableTriggerInputTypes,
} from './localNotifications';
import type { IntervalCheckinStatus } from '../api/guard-api';

const INTERVAL_PREFIX = 'raskha-interval-checkin';

export async function cancelIntervalCheckinReminders(): Promise<void> {
  const scheduled = await getAllScheduledNotificationsAsync();
  await Promise.all(
    scheduled
      .filter((item) => item.identifier.startsWith(INTERVAL_PREFIX))
      .map((item) => cancelScheduledNotificationAsync(item.identifier)),
  );
}

/**
 * Schedule a local notification when the next interval check-in becomes due.
 */
export async function rescheduleIntervalCheckinReminder(
  status: IntervalCheckinStatus | null | undefined,
  siteName?: string,
): Promise<void> {
  await cancelIntervalCheckinReminders();

  if (!status?.enabled) {
    return;
  }

  const site = siteName?.trim() || 'your site';
  const targetIso =
    status.status === 'waiting' || status.status === 'missed'
      ? status.nextDueAt
      : status.status === 'due' || status.status === 'late'
        ? null // already due — fire immediate reminder below
        : null;

  if (status.status === 'due' || status.status === 'late') {
    await scheduleNotificationAsync({
      identifier: `${INTERVAL_PREFIX}-now`,
      content: {
        title:
          status.status === 'late'
            ? 'Late check-in window'
            : 'Interval check-in due',
        body:
          status.status === 'late'
            ? `Check in at ${site} now — late window closes in ${status.graceMinutes} minutes after due.`
            : `Time for your regular site check-in photo at ${site}.`,
        data: { type: 'interval_checkin_due', screen: 'home' },
      },
      trigger: {
        type: SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 1,
        repeats: false,
      },
    });
    return;
  }

  if (!targetIso) {
    return;
  }

  const dueAt = new Date(targetIso);
  const ms = dueAt.getTime() - Date.now();
  if (ms <= 0 || ms > 24 * 60 * 60_000) {
    return;
  }

  await scheduleNotificationAsync({
    identifier: `${INTERVAL_PREFIX}-due`,
    content: {
      title: 'Interval check-in due',
      body: `Capture your check-in selfie at ${site}. You have ${status.graceMinutes} minutes after due time.`,
      data: { type: 'interval_checkin_due', screen: 'home' },
    },
    trigger: {
      type: SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: Math.max(1, Math.floor(ms / 1000)),
      repeats: false,
    },
  });
}
