export type LeaveTypeKey = 'CL' | 'SL' | 'EL';

export type LeaveBalanceCard = {
  key: LeaveTypeKey | 'EL';
  title: string;
  value: string;
  valueSuffix?: string;
  subtitle?: string;
  badge: string;
  badgeTone: 'paid' | 'slip' | 'urgent';
  highlighted?: boolean;
};

export type LeaveTypeOption = {
  key: LeaveTypeKey;
  title: string;
  subtitle: string;
  icon: 'flight-takeoff' | 'medical-services' | 'warning';
  paidBadge?: string;
  iconTone: 'paid' | 'neutral' | 'urgent';
};

export const applyForLeaveDefaults = {
  screenTitle: 'Apply For Leave',
  bannerTitle: 'Leave Application',
  bannerBadge: 'Guard Portal',
  bannerMessage:
    'Zero deduction on salary for approved casual & sick leaves. Quick supervisor sign-off.',
  balancesHeading: 'Your Available Leaves (Annual Balance)',
  quotaRulesLabel: 'Quota Rules',
  step1Title: 'Select Leave Type',
  step2Title: 'Select Dates',
  step2Hint: 'Tap to change',
  startDateLabel: 'START DATE',
  startDateValue: '28 Oct',
  startDateMeta: 'Monday (Next week)',
  endDateLabel: 'END DATE',
  endDateValue: '30 Oct',
  endDateMeta: 'Wednesday',
  durationLabel: 'Total Leave Duration:',
  durationValue: '3 Days',
  durationMeta: '(24 Duty Hrs)',
  step3Title: 'Reason for Leave',
  step3Hint: 'Quick 1-Tap Select',
  noteLabel: 'Note for Supervisor (Optional)',
  noteVoiceHint: 'Hindi / English OK',
  notePlaceholder: 'Example: Need to attend cousin wedding in Jaipur...',
  coverTitle: 'Automatic Duty Cover System',
  coverMessagePrefix: 'Reserve guard will be deployed to',
  coverSite: 'Zone 4 Main Gate',
  coverMessageMid: 'once approved by',
  coverSupervisor: 'Supervisor Amit Singh',
  submitLabel: 'Submit Leave Request',
  pastLeavesLabel: 'View Past Leaves & Status',
  urgentHelpPrefix: 'Need leave today within 12 hrs? Call',
  controlRoomLabel: 'Control Room 1800-100-200',
  controlRoomTel: '1800100200',
} as const;

export const leaveBalanceCards: LeaveBalanceCard[] = [
  {
    key: 'CL',
    title: 'Paid Casual (CL)',
    value: '4',
    valueSuffix: '/ 6 Left',
    badge: 'Paid 100%',
    badgeTone: 'paid',
    highlighted: true,
  },
  {
    key: 'SL',
    title: 'Medical (SL)',
    value: '5',
    valueSuffix: '/ 7 Left',
    badge: 'With Slip',
    badgeTone: 'slip',
  },
  {
    key: 'EL',
    title: 'Emergency (EL)',
    value: 'Instant',
    subtitle: 'Needs Approval',
    badge: 'Urgent',
    badgeTone: 'urgent',
  },
];

export const leaveTypeOptions: LeaveTypeOption[] = [
  {
    key: 'CL',
    title: 'Casual Leave (CL)',
    subtitle: 'Personal & family work (4 days left)',
    icon: 'flight-takeoff',
    paidBadge: 'Fully Paid',
    iconTone: 'paid',
  },
  {
    key: 'SL',
    title: 'Sick / Medical Leave',
    subtitle: 'Health issue, rest, or hospital visit',
    icon: 'medical-services',
    iconTone: 'neutral',
  },
  {
    key: 'EL',
    title: 'Emergency Leave',
    subtitle: 'Urgent village travel or unforeseen emergency',
    icon: 'warning',
    iconTone: 'urgent',
  },
];

export const leaveDatePresets = [
  { key: 'tomorrow', label: 'Tomorrow (1 Day)', icon: 'bolt' as const },
  { key: 'next2', label: 'Next 2 Days', icon: 'date-range' as const },
  { key: 'weekend', label: 'This Sat & Sun', icon: 'weekend' as const },
];

export const leaveReasonOptions = [
  'Family Function / Wedding',
  'Village / Native Home Visit',
  'Doctor / Health Checkup',
  'Personal Urgent Work',
] as const;
