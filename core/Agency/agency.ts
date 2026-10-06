import type { Timestamp } from "firebase/firestore";

export type AgencyStatus = "active" | "inactive";

export type AgencyPlan = "basic" | "standard" | "premium";

export interface Agency {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  plan: AgencyPlan;
  logo: string;
  ownerName: string;
  status: AgencyStatus;
  /** Last successful Super Admin (Raksha) login verification. Used for downtime grace. */
  lastRakshaVerifiedAt?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export const AGENCIES_COLLECTION = "agencies";
