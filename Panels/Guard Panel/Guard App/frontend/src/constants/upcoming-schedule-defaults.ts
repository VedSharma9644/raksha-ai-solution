export const upcomingScheduleDefaults = {
  screenTitle: 'Upcoming Schedule',
} as const;

export type UpcomingShiftKind = 'confirmed' | 'night' | 'rest';

export type UpcomingDutyStatus =
  | 'coming'
  | 'on_duty'
  | 'late_login'
  | 'delayed'
  | 'completed'
  | 'missed'
  | 'scheduled'
  | 'rest';

export type UpcomingShiftItem = {
  id: string;
  kind: UpcomingShiftKind;
  dayLabel: string;
  dateLabel?: string;
  todayBadge?: boolean;
  tomorrowBadge?: boolean;
  siteName?: string;
  postName?: string;
  timeLabel?: string;
  statusLabel?: string;
  dutyStatus?: UpcomingDutyStatus;
  nightAllowanceLabel?: string;
  restTitle?: string;
  restMessage?: string;
};
