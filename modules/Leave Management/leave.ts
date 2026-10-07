import type { Timestamp } from "firebase-admin/firestore";

export const LEAVE_REQUESTS_COLLECTION = "leaveRequests";

export type LeaveTypeKey = "CL" | "SL" | "EL";

export type LeaveRequestStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "withdrawn";

export interface LeaveRequestRecord {
  id: string;
  guardId: string;
  agencyId: string;
  employeeCode: string;
  guardName: string;
  leaveType: LeaveTypeKey;
  startDate: string;
  endDate: string;
  dayCount: number;
  reason: string;
  note: string;
  status: LeaveRequestStatus;
  siteId: string;
  siteName: string;
  supervisorName: string;
  approvalNote?: string;
  approvalDetail?: string;
  rejectionRemark?: string;
  compensationNote?: string;
  appliedAt: Timestamp;
  updatedAt: Timestamp;
  decidedAt?: Timestamp;
}

/** Annual quotas (calendar year). EL has no fixed quota. */
export const DEFAULT_ANNUAL_LEAVE_QUOTA: Record<LeaveTypeKey, number | null> = {
  CL: 6,
  SL: 7,
  EL: null,
};

export const LEAVE_TYPE_LABELS: Record<LeaveTypeKey, string> = {
  CL: "Casual Leave (CL)",
  SL: "Sick Leave (SL)",
  EL: "Emergency Leave (EL)",
};

export type LeaveBalanceTypeDto = {
  key: LeaveTypeKey;
  title: string;
  quota: number | null;
  remaining: number | null;
  usedApproved: number;
  usedPending: number;
  valueLabel: string;
  valueSuffix?: string;
  subtitle?: string;
  badge: string;
  badgeTone: "paid" | "slip" | "urgent";
  highlighted?: boolean;
};

export type LeaveBalanceSummaryDto = {
  year: number;
  updatedLabel: string;
  daysLeft: number;
  daysTaken: number;
  daysPending: number;
  payrollNote: string;
  types: LeaveBalanceTypeDto[];
  coverSite: string;
  coverSupervisor: string;
};

export type LeaveRequestCardDto = {
  id: string;
  status: Exclude<LeaveRequestStatus, "withdrawn">;
  statusLabel: string;
  durationLabel: string;
  dateRange: string;
  leaveTypeLabel: string;
  reasonText: string;
  appliedMeta?: string;
  supervisorMeta?: string;
  approvalNote?: string;
  approvalDetail?: string;
  rejectionLabel?: string;
  compensationNote?: string;
  showPendingActions?: boolean;
};

export type LeaveRequestsResponse = {
  year: number;
  balance: LeaveBalanceSummaryDto;
  filterCounts: {
    all: number;
    pending: number;
    approved: number;
    rejected: number;
  };
  requests: LeaveRequestCardDto[];
};
