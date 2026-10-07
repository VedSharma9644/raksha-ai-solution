export type IncomingReliefTab = 'incoming' | 'sent';

export const incomingReliefRequestsDefaults = {
  brandEyebrow: 'Raksha Security',
  screenTitle: 'Incoming Relief Requests',
  rosterName: 'Rajesh Kumar',
  rosterId: 'RKS-8842',
  rosterPost: 'Tower A Post',
  incomingTabLabel: 'Incoming',
  sentTabLabel: 'My Sent',
  incomingCount: 2,
  sentCount: 1,
  incentiveTitle: 'Duty Cover Incentive',
  incentiveRate: '1.25x Rate',
  incentiveMessage:
    'Covering colleague shifts earns extra roster rest credits & instant daily overtime allowance.',
  historyTitle: 'Completed Shift Handovers',
  historyMonth: 'October 2024',
  emergencyTitle: 'Emergency Live Relief Support',
  emergencyMessage:
    'Need immediate relief during an active shift due to medical illness or family emergency? Do not abandon post. Contact Central Dispatch directly.',
  supervisorCallLabel: 'Supervisor Amit',
  supervisorTel: '+919876543210',
  tollFreeLabel: 'Toll-Free 1800-100',
  tollFreeTel: '1800100200',
} as const;

export const urgentCoverRequest = {
  id: 'urgent-manoj',
  urgencyLabel: 'URGENT • NEEDS COVER TOMORROW',
  expiresLabel: 'Expires in 3h 20m',
  guardName: 'Manoj Tiwari',
  guardMeta: 'ID: RKS-5519 • Gate Guard',
  photoUri:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDvLzoOwX_Xo4DN0IWJWw9jSlWgy0TMrhBfu5XzxoSoEyeDU2twvJwTdC5bzd-B0iy-SuGRPrp-QwrmMEBeDVb4xbAyg5R5jCCxMgb1WYCoDyNMvtLyxPXDsjc7d3eiq6Xf3b18eq7xOpCctHyPWL1pwA9AOs5qHK3epxmPkb8CZSDDRd9BJojrKPXfAJKkxQXlgr5kEFxYS6nUcVpLscoHel-rzRuuru9eeNKSQC480WzBW9v15daGRg',
  tel: '+919876500123',
  siteName: 'ABC Green Valley Heights',
  postLabel: 'Tower B Main Lobby Post',
  shiftDate: 'Tuesday, 25 Oct 2024',
  shiftTime: '08:00 PM – 08:00 AM (12h Night Shift)',
  overtimeLabel: '+₹650 Night Overtime Allowance',
  reason:
    'Elder brother admitted to Alwar civil hospital. Need urgent night cover.',
  acceptToast: 'Accepted! Manoj Tiwari & Supervisor notified. Shift synced to roster.',
  declineToast: 'Request declined. Passback sent to field pool.',
} as const;

export const swapProposalRequest = {
  id: 'swap-vikram',
  tagLabel: 'SHIFT SWAP PROPOSAL',
  statusLabel: 'Awaiting Your Acceptance',
  guardName: 'Vikram Rathore',
  guardMeta: 'ID: RKS-7741 • Perimeter Lead',
  photoUri:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAcasB9BT1FcZq9vJJQCf0Vo8fpoL4RGqiITsrwlAOxCzMXiJIUUuVPwPUFXMLi5Q8q9ylPAof5EETv9VRQ_tFQyGEz7u-z1JhjtQssfVHNW65vR49K6PE6DwyYxrt7iR1I9HBVME5OD4xhdEkMURKWEWy25CyZ-gBvwyeyzFsmwEnsCEY9A9zXSR8pt-s8EfcqlzjBYhCmN0PH25uihupmCOVsf0e3OCp8BtTJPFMvnQp3BB5plqb0w',
  tel: '+919876500456',
  wantsLabel: 'He Wants Your Shift:',
  wantsShift: 'Thu, 27 Oct • Day Shift',
  wantsPost: 'Gate 3 Main Entrance (08:00 AM – 08:00 PM)',
  givesLabel: 'He Gives You His Shift:',
  givesShift: 'Sat, 29 Oct • Day Shift',
  givesPost: 'Gate 1 Barrier Post (08:00 AM – 08:00 PM)',
  note: 'Need Thursday daytime for Aadhaar biometric center token renewal.',
  acceptToast: 'Shift trade confirmed with Vikram Rathore! Updated on calendar.',
  rejectToast: 'Swap rejected. Vikram notified.',
} as const;

export const sentReliefRequest = {
  id: 'sent-broadcast',
  statusLabel: 'PENDING PEER RESPONSE',
  sentAgo: 'Sent 4h ago',
  title: 'You requested shift coverage',
  shiftMeta: 'Mon, 31 Oct • Night Shift (Gate 2 Checkpoint)',
  broadcastLabel: 'Broadcasted to 4 off-duty guards',
  activeLabel: 'Active',
  withdrawLabel: 'Withdraw Coverage Request',
  withdrawToast: 'Relief request canceled.',
} as const;

export const completedHandover = {
  approvalLabel: 'APPROVED BY SUPV. AMIT SINGH',
  dateLabel: '18 Oct 2024',
  title: 'Covered for Guard Suniel V.',
  siteMeta: 'Sector 4 Warehouse • Night Patrol',
  payAmount: '+₹600',
  paySub: 'Payroll Synced',
  timesheetNote: '12.0h duty credited to October timesheet',
} as const;
