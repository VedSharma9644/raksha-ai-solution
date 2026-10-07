export type ShiftChecklistItem = {
  id: string;
  title: string;
  subtitle: string;
  done: boolean;
};

export const shiftDetailsDefaults = {
  screenTitle: 'Shift Details',
  gpsLiveLabel: 'GPS Live • Accurate to 4m',
  signalLabel: 'Signal: Strong',
  shiftReferenceLabel: 'Shift Reference',
  shiftReference: '#SFT-99201',
  activeStatusLabel: 'Active On Duty',
  dutyTitle: 'Day Duty (12 Hours)',
  dutyDate: 'Monday, 24 Oct 2024',
  dutyTimeRange: '08:00 AM – 08:00 PM',
  checkedInLabel: 'Checked-in:',
  checkedInTime: '07:55 AM',
  earlyBadge: '5m Early',
  assignedPostTitle: 'Assigned Post',
  perimeterSafeLabel: 'Perimeter Safe',
  radiusLabel: 'Inside Verified Radius (50m)',
  gpsTaggedLabel: 'GPS Tagged',
  siteName: 'ABC Green Valley Heights',
  siteAddress: 'Plot 12, Sector 62, Noida, Uttar Pradesh 201301',
  checkpointTitle: 'Checkpoint Gate No. 3',
  checkpointSubtitle: 'Main entry & visitor security screening terminal',
  siteDirectionsLabel: 'Site Directions',
  gateIntercomLabel: 'Gate Intercom',
  fieldCommandTitle: 'Field Command',
  fieldCommandStatus: '24x7 Active',
  supervisorName: 'Amit Singh',
  supervisorRole: 'Duty Supervisor (Zone 4)',
  supervisorPhoneDisplay: '+91 98765 43210',
  supervisorPhoneTel: '9876543210',
  callSupervisorLabel: 'Call Duty Supervisor',
  centralDeskLabel: 'Raksha Central Command Desk',
  centralDeskTel: '1800123456',
  checklistTitle: 'Shift Checklist',
  checklistIntro: 'Tap tasks as you execute mandatory procedures at Gate 3:',
  reliefTitle: 'Relief & Handover',
  reliefSquadLabel: 'Night Squad',
  reliefGuardName: 'Vikram Rathore',
  reliefGuardId: 'Guard ID: RKS-7741',
  reliefWindow: 'Relief: 07:45 PM – 08:00 PM',
  reliefRequestLabel: 'Request Relief Swap / Leave',
  checkoutLabel: 'Mark Check-Out / Shift End',
  sosHint: 'Press and hold SOS in header for sudden emergency',
} as const;

export const shiftChecklistSeedItems: ShiftChecklistItem[] = [
  {
    id: 'visitor-qr',
    title: 'Verify visitor QR entry pass',
    subtitle: 'All external delivery & guests',
    done: true,
  },
  {
    id: 'delivery-trucks',
    title: 'Inspect delivery trucks',
    subtitle: 'Material gate-pass validation',
    done: true,
  },
  {
    id: 'nfc-patrol',
    title: 'Perimeter NFC patrol scan',
    subtitle: 'Upcoming next: 11:00 AM round',
    done: false,
  },
  {
    id: 'parking-rfid',
    title: 'Log parking RFID stickers',
    subtitle: 'Basement 1 resident slot audits',
    done: false,
  },
];
