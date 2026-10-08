export type ReliefRequestStatus = "pending" | "approved" | "rejected";

export type ReliefRequest = {
  id: string;
  guardId: string;
  guardName: string;
  employeeCode: string;
  methodLabel: string;
  reasonLabel: string;
  note: string;
  status: ReliefRequestStatus;
  siteName: string;
  postName: string;
  dutyDate: string;
  shiftFrom: string;
  shiftTo: string;
  handoverFrom?: string;
  assignedGuardId?: string;
  assignedGuardName?: string;
};
