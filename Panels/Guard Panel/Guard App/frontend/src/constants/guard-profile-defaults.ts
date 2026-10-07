import type { MaterialIcons } from '@expo/vector-icons';

import { brandAssets } from './brand-assets';

export type ProfileLanguage = 'EN' | 'HI';

export const guardProfileDefaults = {
  screenTitle: 'Guard Profile & Id',
  photoUri: brandAssets.scheduleHeaderAvatarUri,
  verifiedBarLabel: 'PSARA Verified Personnel',
  activeDutyLabel: 'Active Duty',
  credentialEyebrow: 'Government Reg. Credential',
  idCardTitle: 'Raksha Frontline ID',
  guardIdLabel: 'Guard ID',
  guardId: 'RKS-8842',
  guardName: 'Rajesh Kumar',
  guardRole: 'Senior Gate Security Officer',
  gradeLabel: 'Grade A',
  bloodType: 'B+ Pos',
  verifiedChip: 'Verified',
  qrTitle: 'Official Field Audit QR',
  qrHint: 'Scan for realtime server authentication & duty roster verification',
  qrValidTill: 'Valid till: 31 Mar 2025',
  qrTapLabel: 'Tap to Enlarge',
  downloadPdfLabel: 'Download PDF',
  fullBadgeLabel: 'Full Badge View',
  certifiedFooter: 'PSARA CERTIFIED 2024',
  hashFooter: 'HASH: 8F92-D03A-RKS',
  employerTitle: 'Employer & Placement',
  agencyLabel: 'Security Agency',
  agencyName: 'Apex Security & Facility Services Pvt. Ltd.',
  agencyLicense: 'PSARA License: #DL-PSARA-2019-8812',
  siteLabel: 'Current Site Deployment',
  siteName: 'ABC Green Valley Heights',
  sitePost: 'Gate No. 3 (Perimeter Zone 4)',
  shiftLabel: 'Shift Timing',
  shiftTime: '08:00 AM – 08:00 PM',
  shiftRoster: 'Day Roster',
  supervisorLabel: 'Duty Supervisor',
  supervisorName: 'Amit Singh',
  supervisorMeta: 'Sector 4 Area Command',
  supervisorTel: '+919876543210',
  complianceTitle: 'Compliance & Badges',
  complianceCount: '4 Verified',
  gearTitle: 'Issued Duty Gear',
  gearCount: '3 Logged Items',
  emergencyTitle: 'Emergency & ESIC Nominee',
  kinLabel: 'Next of Kin (Emergency Contact)',
  kinName: 'Sunita Kumar (Wife)',
  kinPhone: '+91 98112 34567',
  kinTel: '+919811234567',
  esicLabel: 'ESIC & Medical Scheme',
  esicNumber: '31009988221',
  esicCover: 'Raksha Frontline Comprehensive Cover',
  supportTitle: 'Support & Preferences',
  helplineTitle: '24/7 Field Guard Helpline',
  helplineSub: '1800-100-200 (Toll Free)',
  helplineTel: '1800100200',
  languageTitle: 'App Language',
  languageSub: 'English (Currently selected)',
  languageSubHi: 'हिन्दी (Currently selected)',
  securityTitle: 'Security PIN & Biometrics',
  securitySub: 'Manage screen lock and quick attendance PIN',
  logoutLabel: 'Log Out from Device',
  appVersion: 'Raksha Workforce Mobile • Version 4.2.18 (Build 884)',
  auditModalTitle: 'Audit Inspection Mode',
  auditVerified: 'Realtime Cryptographic Signature Verified',
  auditAgencyLine: 'Apex Security • DL-PSARA-2019-8812',
  brightnessNote: 'Display at maximum brightness for optical scanners',
  doneInspecting: 'Done Inspecting',
  logoutModalTitle: 'End Guard Shift Session?',
  logoutModalMessage:
    'Make sure your current gate patrol logs and visitor registers are synced before logging off.',
  logoutCancel: 'Cancel',
  logoutConfirm: 'Log Out',
  toastDownload: 'Official Digital ID Card PDF downloaded to Downloads.',
  toastSecurity: 'Opening biometric and PIN security settings...',
  toastLogout: 'Logging off guard profile...',
} as const;

export const profileComplianceItems: {
  id: string;
  title: string;
  meta: string;
  detail: string;
  status: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  tone: 'success' | 'neutral';
}[] = [
  {
    id: 'psara',
    title: 'State PSARA Security License',
    meta: 'PSARA-UP-24-99120',
    detail: 'Valid till Nov 2026',
    status: 'Active',
    icon: 'check-circle',
    tone: 'success',
  },
  {
    id: 'police',
    title: 'Police Clearance Verification',
    meta: 'Sec 62 Police Station • #POL-9921',
    detail: 'Full Background Cleared',
    status: 'Cleared',
    icon: 'verified-user',
    tone: 'success',
  },
  {
    id: 'aadhaar',
    title: 'Aadhaar Biometric Link',
    meta: 'UIDAI Verified Biometrics',
    detail: 'Linked via DigiLocker',
    status: 'Linked',
    icon: 'fingerprint',
    tone: 'success',
  },
  {
    id: 'fire',
    title: 'First Aid & Fire Safety Cert',
    meta: 'Civil Defence Level 2',
    detail: 'Certified First Responder',
    status: 'Level 2',
    icon: 'local-fire-department',
    tone: 'neutral',
  },
];

export const profileDutyGearItems: {
  id: string;
  title: string;
  meta: string;
  status: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  tone: 'success' | 'neutral';
}[] = [
  {
    id: 'radio',
    title: 'Motorola GP328 Radio',
    meta: 'Callsign: Echo-4 • Battery 94%',
    status: 'On Duty',
    icon: 'cell-tower',
    tone: 'success',
  },
  {
    id: 'rfid',
    title: 'RFID Wand & Gate Reader',
    meta: 'NFC Patrol Reader #RW-102',
    status: 'Active',
    icon: 'sensors',
    tone: 'neutral',
  },
  {
    id: 'uniform',
    title: 'Standard Uniform & Vest',
    meta: '2 Navy Sets + Hi-Vis Night Vest',
    status: 'Issued',
    icon: 'checkroom',
    tone: 'neutral',
  },
];
