import type { MaterialIcons } from '@expo/vector-icons';

export type ReliefMethodKey = 'remaining' | 'swap' | 'cover';

export type ReliefReasonKey =
  | 'urgentFamily'
  | 'medical'
  | 'transport'
  | 'personalEmergency';

export const relieveAGuardDefaults = {
  brandEyebrow: 'Raksha Security',
  screenTitle: 'Relieve A Guard',
  guidanceTitle: 'Shift Relief & Handover',
  guidanceMessage:
    'Need someone to take your post? Request remaining-shift handover or relief. Admin or HR assigns a qualified guard and must approve before duty changes.',
  policyChip: 'Policy: Admin/HR approval required',
  step1Title: 'Shift You Want Handed Over',
  changeShiftLabel: 'Today',
  shiftStatusBadge: 'Assigned Scheduled Duty',
  reliefEligibleLabel: 'Relief Allowed (Eligible)',
  step2Title: 'Choose How to Handle Relief',
  step3Title: 'Replacement Guard',
  assignmentInfoTitle: 'Admin / HR will assign',
  assignmentInfoMessage:
    'You cannot choose a colleague. After you submit, Admin or HR picks a qualified guard and approves the request.',
  step4Title: 'Reason for Relief',
  reasonHint: 'Select 1 quick reason for the field duty log:',
  voiceTitleIdle: 'Add Voice Note (Hindi / English)',
  voiceSubtitle: 'Tap to speak special instructions for post handover',
  voiceTitleRecording: 'Recording voice memo... (Tap to stop)',
  voiceTitleAttached: 'Voice Note Attached (0:14) • Tap to Replace',
  protocolTitle: 'Standard Relief Handover Protocol',
  protocolReviewWindow: 'Admin/HR review',
  protocolKeysNote:
    'Site keys & visitor logbook transfer on physical sign-in of the assigned guard after approval.',
  historyLabel: 'View My Relief Request History',
  toastTitle: 'Relief Request Sent!',
  toastMessage: 'Pending Admin/HR approval and guard assignment.',
  submittingLabel: 'Submitting request…',
  submittedLabel: 'Request submitted!',
} as const;

export const reliefMethodOptions: {
  key: ReliefMethodKey;
  title: string;
  description: string;
  recommended?: boolean;
}[] = [
  {
    key: 'remaining',
    title: 'Hand over remaining / half shift',
    description:
      'Recommended for today: leave mid-duty. Admin/HR assigns who covers the rest of your shift.',
    recommended: true,
  },
  {
    key: 'cover',
    title: 'Request full shift cover',
    description:
      'Ask Admin/HR to assign another guard for your full upcoming duty. One-way relief — no swap.',
  },
  {
    key: 'swap',
    title: 'Swap shift with a colleague',
    description:
      'Request a roster swap. Admin/HR chooses the colleague and must approve — you do not pick them.',
  },
];

export const reliefReasonChips: {
  key: ReliefReasonKey;
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  iconTone: 'primary' | 'tertiary' | 'secondary' | 'error';
}[] = [
  { key: 'urgentFamily', label: 'Urgent Family Work', icon: 'family-restroom', iconTone: 'primary' },
  { key: 'medical', label: 'Medical / Unwell', icon: 'healing', iconTone: 'tertiary' },
  { key: 'transport', label: 'Transport Delay', icon: 'commute', iconTone: 'secondary' },
  { key: 'personalEmergency', label: 'Personal Emergency', icon: 'warning', iconTone: 'error' },
];

export function buildReliefCtaLabel(method: ReliefMethodKey): string {
  if (method === 'remaining') {
    return 'Request remaining-shift handover';
  }
  if (method === 'cover') {
    return 'Request full shift cover';
  }
  return 'Request shift swap';
}

export function buildProtocolMessage(): string {
  return `Once submitted, Admin or HR reviews the request, assigns a qualified guard, and confirms roster update. You and the assigned guard receive an official app alert. Typical review: ${relieveAGuardDefaults.protocolReviewWindow}.`;
}
