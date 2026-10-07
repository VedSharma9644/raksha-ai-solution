export type LeaveRequestStatus = 'pending' | 'approved' | 'rejected';

export type LeaveRequestFilter = 'all' | LeaveRequestStatus;

export type LeaveRequestCard = {
  id: string;
  status: LeaveRequestStatus;
  statusLabel: string;
  durationLabel: string;
  dateRange: string;
  leaveTypeLabel: string;
  reasonLabel?: string;
  reasonText: string;
  appliedMeta?: string;
  supervisorMeta?: string;
  approvalNote?: string;
  approvalDetail?: string;
  rejectionLabel?: string;
  compensationNote?: string;
  showPendingActions?: boolean;
};

export const leaveTimeOffDefaults = {
  screenTitle: 'Leave & Time Off',
  balanceTitle: '2024 Guard Leave Balance',
  balanceUpdated: 'Updated Today',
  daysLeftValue: '9',
  daysLeftLabel: 'Days Left',
  daysLeftSub: 'Available Total',
  takenValue: '3',
  takenLabel: 'Taken',
  takenSub: 'This Calendar Year',
  pendingValue: '1',
  pendingLabel: 'Pending',
  pendingSub: 'With Supervisor',
  payrollNote:
    'Leaves sync directly with monthly salary slip & attendance bonus. No deduction for approved casual leave.',
  applyButtonLabel: '+ Apply for New Leave',
  urgentTitle: 'Need urgent leave tomorrow?',
  urgentMessage:
    'For same-day emergencies or shift swaps, do not submit an online form. Directly notify the central dispatch team.',
  callDeskLabel: 'Call Command Desk (Toll-Free)',
  callDeskTel: '18001234567',
  supervisorTel: '9876543210',
} as const;

export const leaveRequestFilterTabs: {
  key: LeaveRequestFilter;
  label: string;
  count: number;
  badgeTone: 'neutral' | 'pending' | 'approved' | 'rejected';
}[] = [
  { key: 'all', label: 'All Requests', count: 4, badgeTone: 'neutral' },
  { key: 'pending', label: 'Pending', count: 1, badgeTone: 'pending' },
  { key: 'approved', label: 'Approved', count: 2, badgeTone: 'approved' },
  { key: 'rejected', label: 'Not Approved', count: 1, badgeTone: 'rejected' },
];

export const leaveRequestCards: LeaveRequestCard[] = [
  {
    id: 'pending-oct-28',
    status: 'pending',
    statusLabel: 'PENDING REVIEW',
    durationLabel: '3 Days',
    dateRange: '28 Oct – 30 Oct 2024',
    leaveTypeLabel: 'Casual Leave (CL) • Personal Work',
    reasonText: 'Family function at native village in Alwar',
    appliedMeta: 'Applied: Today, 24 Oct • 09:30 AM',
    supervisorMeta: 'Supervisor: Amit Singh (Sector 4 Officer)',
    showPendingActions: true,
  },
  {
    id: 'approved-oct-12',
    status: 'approved',
    statusLabel: 'APPROVED',
    durationLabel: '1 Day • Day Shift',
    dateRange: '12 Oct 2024',
    leaveTypeLabel: 'Sick Leave (SL)',
    reasonText: 'Medical checkup & severe viral fever',
    approvalNote: 'Approved by Amit Singh on 11 Oct',
    approvalDetail: 'Fully Paid • Duty relief assigned to Guard Suniel V.',
  },
  {
    id: 'approved-sep-15',
    status: 'approved',
    statusLabel: 'APPROVED',
    durationLabel: '2 Days',
    dateRange: '15 Sep – 16 Sep 2024',
    leaveTypeLabel: 'Casual Leave (CL)',
    reasonText: 'Aadhaar card update & bank paperwork',
    approvalNote: 'Approved by Field Officer R. Sharma on 13 Sep',
  },
  {
    id: 'rejected-oct-02',
    status: 'rejected',
    statusLabel: 'NOT APPROVED',
    durationLabel: '1 Day',
    dateRange: '02 Oct 2024',
    leaveTypeLabel: 'Casual Leave (CL)',
    reasonText:
      'National Holiday (Gandhi Jayanti) - Mandatory 100% security presence required at ABC Green Valley site.',
    rejectionLabel: 'Supervisor Remark',
    compensationNote: 'Special 1.5x Overtime bonus granted for reporting.',
  },
];
