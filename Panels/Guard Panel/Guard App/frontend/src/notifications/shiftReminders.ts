import {
  cancelScheduledNotificationAsync,
  getAllScheduledNotificationsAsync,
  scheduleNotificationAsync,
  SchedulableTriggerInputTypes,
} from './localNotifications';

const REMINDER_PREFIX = 'raskha-shift-';

type ShiftReminderPlan = {
  id: string;
  title: string;
  body: string;
  type: string;
  /** Minutes from now; must be > 0 */
  minutesFromNow: number;
};

function parseShiftToday(hhmm: string, now: Date): Date | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(hhmm.trim());
  if (!match) {
    return null;
  }
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
    return null;
  }
  const at = new Date(now);
  at.setSeconds(0, 0);
  at.setHours(hours, minutes, 0, 0);
  return at;
}

function minutesUntil(target: Date, now: Date): number {
  return Math.floor((target.getTime() - now.getTime()) / 60_000);
}

/**
 * Cancel previously scheduled shift reminders and schedule today's set.
 * Uses deep imports so Expo Go Android does not load remote-push side effects.
 */
export async function rescheduleShiftReminders(params: {
  shiftFrom: string;
  shiftTo: string;
  siteName?: string;
  shiftActive?: boolean;
}): Promise<void> {
  const scheduled = await getAllScheduledNotificationsAsync();
  await Promise.all(
    scheduled
      .filter((item) => item.identifier.startsWith(REMINDER_PREFIX))
      .map((item) => cancelScheduledNotificationAsync(item.identifier)),
  );

  const now = new Date();
  const start = parseShiftToday(params.shiftFrom, now);
  const end = parseShiftToday(params.shiftTo, now);
  if (!start || !end) {
    return;
  }

  // Overnight shift: end is next calendar day
  if (end <= start) {
    end.setDate(end.getDate() + 1);
  }

  const site = params.siteName?.trim() || 'your site';
  const plans: ShiftReminderPlan[] = [];

  // Early login opens 30 minutes before shift — spreads the morning API rush.
  const startMinus30 = minutesUntil(new Date(start.getTime() - 30 * 60_000), now);
  if (startMinus30 > 0 && !params.shiftActive) {
    plans.push({
      id: `${REMINDER_PREFIX}login`,
      type: 'login_reminder',
      title: 'Early login open',
      body: `Your shift at ${site} starts in 30 minutes (${params.shiftFrom}). Log in now — punch in when you arrive.`,
      minutesFromNow: startMinus30,
    });
  }

  if (params.shiftActive) {
    const endMinus15 = minutesUntil(new Date(end.getTime() - 15 * 60_000), now);
    if (endMinus15 > 0) {
      plans.push({
        id: `${REMINDER_PREFIX}end-soon`,
        type: 'shift_end_reminder',
        title: 'Shift ending soon',
        body: `Your shift ends in 15 minutes (${params.shiftTo}). Prepare to punch out.`,
        minutesFromNow: endMinus15,
      });
    }

    const signOutAt = minutesUntil(end, now);
    if (signOutAt > 0) {
      plans.push({
        id: `${REMINDER_PREFIX}sign-out`,
        type: 'sign_out_reminder',
        title: 'Punch-out reminder',
        body: `Shift ended at ${params.shiftTo}. Don't forget to punch out at ${site}.`,
        minutesFromNow: signOutAt,
      });
    }
  }

  for (const plan of plans) {
    await scheduleNotificationAsync({
      identifier: plan.id,
      content: {
        title: plan.title,
        body: plan.body,
        data: { type: plan.type, screen: 'shiftDetails' },
        sound: true,
      },
      trigger: {
        type: SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: Math.max(60, plan.minutesFromNow * 60),
        repeats: false,
      },
    });
  }
}

export async function cancelShiftReminders(): Promise<void> {
  const scheduled = await getAllScheduledNotificationsAsync();
  await Promise.all(
    scheduled
      .filter((item) => item.identifier.startsWith(REMINDER_PREFIX))
      .map((item) => cancelScheduledNotificationAsync(item.identifier)),
  );
}
