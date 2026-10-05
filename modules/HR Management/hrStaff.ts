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
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export const HR_STAFF_COLLECTION = "hrStaff";
