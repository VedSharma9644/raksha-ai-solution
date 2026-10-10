import type { Timestamp } from "firebase-admin/firestore";

export const RELIEF_REQUESTS_COLLECTION = "reliefRequests";

export type ReliefMethodKey = "remaining" | "swap" | "cover";

export type ReliefReasonKey =
  | "urgentFamily"
  | "medical"
  | "transport"
  | "personalEmergency";

export type ReliefRequestStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "withdrawn";

export const RELIEF_METHOD_LABELS: Record<ReliefMethodKey, string> = {
  remaining: "Remaining shift handover",
  swap: "Swap shift with colleague",
  cover: "Full shift cover",
};

export const RELIEF_REASON_LABELS: Record<ReliefReasonKey, string> = {
  urgentFamily: "Urgent Family Work",
  medical: "Medical / Unwell",
  transport: "Transport Delay",
  personalEmergency: "Personal Emergency",
};

export interface ReliefRequestRecord {
  id: string;
  guardId: string;
  agencyId: string;
  employeeCode: string;
  guardName: string;
  method: ReliefMethodKey;
  reason: ReliefReasonKey;
  note: string;
  status: ReliefRequestStatus;
  siteId: string;
  siteName: string;
  postName: string;
  shiftFrom: string;
  shiftTo: string;
  dutyDate: string;
  /** ISO time when remaining handover starts (remaining method). */
  handoverFrom?: string;
  assignedGuardId?: string;
  assignedGuardName?: string;
  assignedEmployeeCode?: string;
  decidedByName?: string;
  approvalNote?: string;
  rejectionRemark?: string;
  /** Branch this relief request belongs to (inherited from guard's site). */
  branchId?: string | null;
  appliedAt: Timestamp;
  updatedAt: Timestamp;
  decidedAt?: Timestamp;
}

export type ReliefRequestCardDto = {
  id: string;
  status: Exclude<ReliefRequestStatus, "withdrawn">;
  statusLabel: string;
  method: ReliefMethodKey;
  methodLabel: string;
  reasonLabel: string;
  note: string;
  siteName: string;
  postName: string;
  dutyDate: string;
  shiftFrom: string;
  shiftTo: string;
  timeRangeLabel: string;
  handoverFrom?: string;
  assignedGuardName?: string;
  assignedEmployeeCode?: string;
  appliedAt: string | null;
  decidedByName?: string;
  rejectionRemark?: string;
  approvalNote?: string;
  /** True when this guard was assigned to cover someone else's shift. */
  isAssignment?: boolean;
  requesterName?: string;
};

export type ReliefRequestsResponse = {
  filterCounts: {
    all: number;
    pending: number;
    approved: number;
    rejected: number;
  };
  requests: ReliefRequestCardDto[];
  assignments: ReliefRequestCardDto[];
};
