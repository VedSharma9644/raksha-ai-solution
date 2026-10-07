export type AttendanceLogKind = 'onDuty' | 'present' | 'weeklyOff' | 'leave';

export type AttendanceFilterKey = 'all' | 'present' | 'weeklyOff';

export type AttendanceStatItem = {
  key: string;
  value: string;
  label: string;
  subtitle: string;
  icon: 'check-circle' | 'schedule' | 'event-busy' | 'hotel';
};

export type AttendanceLogItem = {
  id: string;
  kind: AttendanceLogKind;
  statusLabel: string;
  dateLabel: string;
  postLabel: string;
  postIcon: 'shield' | 'door-front' | 'weekend' | 'domain';
  detailPrimaryLabel?: string;
  detailPrimaryValue?: string;
  detailSecondaryLabel?: string;
  detailSecondaryValue?: string;
  detailTertiaryLabel?: string;
  detailTertiaryValue?: string;
  footerTags: string[];
};

export const attendanceHistoryDefaults = {
  screenTitle: 'Attendance History',
  monthLabel: 'October 2024',
  cycleLabel: 'Current Cycle',
  cycleNote: 'Cycle: 01 Oct - 31 Oct • Verified by Field Supervisor',
  punctualityTitle: '0 Days Absent • 100% Punctuality',
  punctualitySubtitle: 'Eligible for monthly attendance bonus',
  calendarTitle: 'Month Overview',
  disputeTitle: 'Attendance Dispute or Query?',
  callSupervisorLabel: 'Call Supervisor Amit Singh',
  callSupervisorTel: '+919876543210',
  raiseCorrectionLabel: 'Raise Attendance Correction',
} as const;

export const attendanceStatItems: AttendanceStatItem[] = [
  {
    key: 'present',
    value: '22',
    label: 'Present Days',
    subtitle: 'On-Duty & Verified',
    icon: 'check-circle',
  },
  {
    key: 'hours',
    value: '264',
    label: 'Total Hours',
    subtitle: 'Logged & Approved',
    icon: 'schedule',
  },
  {
    key: 'leave',
    value: '01',
    label: 'Leave Taken',
    subtitle: 'Approved Casual',
    icon: 'event-busy',
  },
  {
    key: 'off',
    value: '03',
    label: 'Weekly Off',
    subtitle: 'Roster Rest Days',
    icon: 'hotel',
  },
];

export const attendanceFilterTabs: { key: AttendanceFilterKey; label: string }[] = [
  { key: 'all', label: 'All Days (26)' },
  { key: 'present', label: 'Present (22)' },
  { key: 'weeklyOff', label: 'Weekly Off' },
];

/** Simplified October overview: days 1-31 with status markers for legend demo. */
export const attendanceCalendarDays: {
  day: number;
  status: 'present' | 'today' | 'off' | 'leave' | 'empty';
}[] = [
  ...Array.from({ length: 23 }, (_, i) => ({
    day: i + 1,
    status: 'present' as const,
  })),
  { day: 24, status: 'today' },
  { day: 25, status: 'off' },
  { day: 26, status: 'present' },
  { day: 27, status: 'present' },
  { day: 28, status: 'leave' },
  { day: 29, status: 'off' },
  { day: 30, status: 'present' },
  { day: 31, status: 'off' },
];

export const attendanceLogItems: AttendanceLogItem[] = [
  {
    id: 'oct-24',
    kind: 'onDuty',
    statusLabel: 'ON DUTY • TODAY',
    dateLabel: 'Thu, 24 Oct',
    postLabel: 'Gate 3 — Main Entrance',
    postIcon: 'shield',
    detailPrimaryLabel: 'Punch In',
    detailPrimaryValue: '07:55 AM',
    detailSecondaryLabel: 'Progress',
    detailSecondaryValue: '6h 45m',
    footerTags: ['Geofence Verified', 'Live Session'],
  },
  {
    id: 'oct-23',
    kind: 'present',
    statusLabel: 'PRESENT • FULL SHIFT',
    dateLabel: 'Wed, 23 Oct',
    postLabel: 'Gate 3 — Main Entrance',
    postIcon: 'door-front',
    detailPrimaryLabel: 'In',
    detailPrimaryValue: '07:52 AM',
    detailSecondaryLabel: 'Out',
    detailSecondaryValue: '08:04 PM',
    detailTertiaryLabel: 'Total',
    detailTertiaryValue: '12h 12m',
    footerTags: ['Geofence Verified', 'Payroll Synced'],
  },
  {
    id: 'oct-22',
    kind: 'present',
    statusLabel: 'PRESENT • FULL SHIFT',
    dateLabel: 'Tue, 22 Oct',
    postLabel: 'Gate 1 — Pedestrian Entry',
    postIcon: 'domain',
    detailPrimaryLabel: 'In',
    detailPrimaryValue: '07:58 AM',
    detailSecondaryLabel: 'Out',
    detailSecondaryValue: '08:05 PM',
    detailTertiaryLabel: 'Total',
    detailTertiaryValue: '12h 07m',
    footerTags: ['Supervisor Signed', 'Payroll Synced'],
  },
  {
    id: 'oct-21',
    kind: 'weeklyOff',
    statusLabel: 'WEEKLY OFF',
    dateLabel: 'Mon, 21 Oct',
    postLabel: 'Roster Rest Day',
    postIcon: 'weekend',
    footerTags: ['Planned Off'],
  },
];
