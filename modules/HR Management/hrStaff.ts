import { Timestamp } from "firebase/firestore";

export type HrStaffStatus = "active" | "inactive";

export interface HrStaff {
  id: string;
  agencyId: string;
  fullName: string;
  employeeCode: string;
  phone: string;
  email: string;
  notes: string;
  status: HrStaffStatus;
  /** Branch IDs this HR staff member is allowed to access. */
  assignedBranchIds?: string[];
  /** Site IDs this HR staff member manages. When set, HR only sees these sites. */
  assignedSiteIds?: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export const HR_STAFF_COLLECTION = "hrStaff";
