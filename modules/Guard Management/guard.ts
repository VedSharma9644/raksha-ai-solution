import { Timestamp } from "firebase/firestore";

export type GuardStatus = "active" | "inactive" | "on_leave";

export interface Guard {
  id: string;
  agencyId: string;
  fullName: string;
  employeeCode: string;
  phone: string;
  email: string;
  assignedSiteId: string;
  notes: string;
  status: GuardStatus;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export const GUARDS_COLLECTION = "guards";
