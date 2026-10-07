export const upcomingScheduleDefaults = {
  screenTitle: 'Upcoming Schedule',
  guardInitials: 'RK',
  guardName: 'Rajesh Kumar',
  guardId: 'RKS-8842',
  summaryPrompt: 'Where & when do you need to report?',
  shiftsAssignedLabel: '6 Shifts Assigned',
  daysOffLabel: '1 Day Off',
  controlRoomLabel: '24/7 Control Room:',
  controlRoomPhone: '1800-100-200',
  controlRoomTel: '1800100200',
  supervisorName: 'Amit Singh',
  supervisorRole: 'Shift Supervisor',
  supervisorPhone: '+919876543210',
} as const;

export type UpcomingShiftKind = 'confirmed' | 'night' | 'rest';

export type UpcomingShiftItem = {
  id: string;
  kind: UpcomingShiftKind;
  dayLabel: string;
  dateLabel?: string;
  tomorrowBadge?: boolean;
  siteName?: string;
  postName?: string;
  timeLabel?: string;
  statusLabel?: string;
  nightAllowanceLabel?: string;
  restTitle?: string;
  restMessage?: string;
};

export const upcomingShiftItems: UpcomingShiftItem[] = [
  {
    id: 'tue-25',
    kind: 'confirmed',
    dayLabel: 'Tue, 25 Oct',
    tomorrowBadge: true,
    siteName: 'ABC Green Valley Heights',
    postName: 'Gate No. 3 (Main Entry)',
    timeLabel: '08:00 AM – 08:00 PM (12 hrs)',
    statusLabel: 'Confirmed',
  },
  {
    id: 'wed-26',
    kind: 'confirmed',
    dayLabel: 'Wednesday, 26 Oct',
    siteName: 'ABC Green Valley Heights',
    postName: 'Gate No. 1 (Pedestrian & Resident)',
    timeLabel: '08:00 AM – 08:00 PM (12 hrs)',
    statusLabel: 'Confirmed',
  },
  {
    id: 'thu-27',
    kind: 'night',
    dayLabel: 'Thursday, 27 Oct',
    siteName: 'ABC Green Valley Heights',
    postName: 'Tower B Lobby & Elevators',
    timeLabel: '08:00 PM – 08:00 AM (12 hrs)',
    statusLabel: 'Night Duty',
    nightAllowanceLabel: 'Night Shift Allowance Applicable',
  },
  {
    id: 'fri-28',
    kind: 'rest',
    dayLabel: 'Friday, 28 Oct',
    statusLabel: 'Weekly Off',
    restTitle: 'Rest Day',
    restMessage: 'No duty assigned. Enjoy your rest day!',
  },
  {
    id: 'sat-29',
    kind: 'confirmed',
    dayLabel: 'Saturday, 29 Oct',
    siteName: 'ABC Green Valley Heights',
    postName: 'Gate No. 3 (Main Entry)',
    timeLabel: '08:00 AM – 08:00 PM (12 hrs)',
    statusLabel: 'Confirmed',
  },
];
