import type { MaterialIcons } from '@expo/vector-icons';

export type ReliefMethodKey = 'swap' | 'cover';

export type ReliefReasonKey =
  | 'urgentFamily'
  | 'medical'
  | 'transport'
  | 'personalEmergency';

export type ReliefGuardOption = {
  id: string;
  name: string;
  initials: string;
  meta: string;
  primaryBadge: string;
  primaryBadgeTone: 'available' | 'neutral';
  secondaryBadge: string;
};

export const relieveAGuardDefaults = {
  brandEyebrow: 'Raksha Security',
  screenTitle: 'Relieve A Guard',
  guidanceTitle: 'Shift Relief & Handover',
  guidanceMessage:
    'Need someone to take your post? Request a verified guard to swap or cover. Field supervisor approves automatically.',
  policyChip: 'Policy: Submit ≥12 hrs before duty',
  currentGuardName: 'Rajesh Kumar (You)',
  currentGuardId: 'ID: RKS-8842',
  step1Title: 'Shift You Want Handed Over',
  changeShiftLabel: 'Change',
  shiftStatusBadge: 'Assigned Scheduled Duty',
  shiftWhenLabel: 'Tomorrow',
  shiftDate: 'Tuesday, 25 Oct 2024',
  shiftTime: '08:00 AM – 08:00 PM',
  shiftDurationBadge: '12h Day',
  siteName: 'ABC Green Valley Heights',
  postLabel: 'Post: Gate No. 3 (Main Entry & Visitor Screening)',
  reliefEligibleLabel: 'Relief Allowed (Eligible)',
  supervisorLabel: 'Supervisor: Amit Singh',
  step2Title: 'Choose How to Handle Relief',
  step3Title: 'Select Relief Guard',
  clusterLabel: 'Cluster: Sector 48',
  guardListHint: 'Showing certified personnel qualified for Gate No. 3 post:',
  broadcastLabel: 'Or Ask Supervisor to Broadcast to All Qualified Guards',
  step4Title: 'Reason for Relief',
  reasonHint: 'Select 1 quick reason for the field duty log:',
  voiceTitleIdle: 'Add Voice Note (Hindi / English)',
  voiceSubtitle: 'Tap to speak special instructions for post handover',
  voiceTitleRecording: 'Recording voice memo... (Tap to stop)',
  voiceTitleAttached: 'Voice Note Attached (0:14) • Tap to Replace',
  protocolTitle: 'Standard Relief Handover Protocol',
  protocolSupervisor: 'Amit Singh',
  protocolReviewWindow: '2 hours',
  protocolKeysNote: 'Gate 3 keys & visitor logbook will transfer automatically on physical sign-in.',
  historyLabel: 'View My Relief Request History (4 Completed)',
  toastTitle: 'Relief Request Sent!',
  toastMessage: 'Colleague and Supervisor Amit Singh notified via SMS.',
  submittingLabel: 'Dispatching Handover...',
  submittedLabel: 'Request Dispatched!',
} as const;

export const reliefMethodOptions: {
  key: ReliefMethodKey;
  title: string;
  description: string;
  recommended?: boolean;
}[] = [
  {
    key: 'swap',
    title: 'Swap Shift with Colleague',
    description:
      'Trade your Tuesday duty for one of their upcoming off-days or shifts. No roster deduction.',
    recommended: true,
  },
  {
    key: 'cover',
    title: 'Request Cover (One-Way Relief)',
    description:
      'Colleague takes your duty outright. Adjusted through leave balance or extra duty allowance.',
  },
];

export const reliefGuardOptions: ReliefGuardOption[] = [
  {
    id: 'RKS-7741',
    name: 'Vikram Rathore',
    initials: 'VR',
    meta: 'ID: RKS-7741 • 4.9 ★ (34 Reliefs Handled)',
    primaryBadge: 'Off-Duty Tomorrow',
    primaryBadgeTone: 'available',
    secondaryBadge: 'Gate 3 Certified',
  },
  {
    id: 'RKS-9012',
    name: 'Suniel Verma',
    initials: 'SV',
    meta: 'ID: RKS-9012 • 4.8 ★',
    primaryBadge: 'Night Squad Available',
    primaryBadgeTone: 'neutral',
    secondaryBadge: 'Site Verified',
  },
  {
    id: 'RKS-6634',
    name: 'Amitabh Yadav',
    initials: 'AY',
    meta: 'ID: RKS-6634 • 4.7 ★',
    primaryBadge: 'Roster Off',
    primaryBadgeTone: 'neutral',
    secondaryBadge: 'Senior Guard',
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

export function buildReliefCtaLabel(
  method: ReliefMethodKey,
  guardName: string,
): string {
  const shortName = guardName.split(' ')[0] ?? guardName;
  if (method === 'swap') {
    return `Send Shift Swap to ${shortName}`;
  }
  return `Send Cover Request to ${shortName}`;
}

export function buildProtocolMessage(guardName: string): string {
  return `Once ${guardName} accepts, Supervisor ${relieveAGuardDefaults.protocolSupervisor} will review and confirm roster update within ${relieveAGuardDefaults.protocolReviewWindow}. Both guards will receive an official SMS & app alert.`;
}
