import { Timestamp } from "firebase/firestore";

export type BranchStatus = "active" | "inactive";

export interface Branch {
  id: string;
  agencyId: string;
  name: string;          // e.g. "Agra Branch"
  city: string;
  address?: string;
  phone?: string;
  managerName?: string;
  status: BranchStatus;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export const BRANCHES_COLLECTION = "branches";
