import { Timestamp } from "firebase/firestore";

export type GuardStatus = "active" | "inactive" | "on_leave";

export type GuardGender = "male" | "female" | "other";

export interface Guard {
  id: string;
  agencyId: string;

  // Personal details
  fullName: string;
  fatherName: string;
  gender: GuardGender;
  phone: string;
  email: string;
  address: string;
  caste: string;
  height: string;        // e.g. "5'8\""
  aadhaarNumber: string;
  panNumber: string;

  // Employment details
  employeeCode: string;
  // Password lives in Firebase Auth only (see createGuardAccount / Admin password route).
  post: string;          // e.g. "Senior Guard", "Supervisor"
  joiningDate: string;   // ISO date string e.g. "2024-01-15"
  salary: string;        // stored as string to avoid float precision issues
  experience: string;    // e.g. "3 years"
  education: string;     // e.g. "10th Pass", "Graduate"
  assignedSiteId: string;

  // Preferences
  guardType: "ex-serviceman" | "civilian";
  interestedCity: string;
  shiftFrom: string;   // HH:MM e.g. "08:00"
  shiftTo: string;     // HH:MM e.g. "20:00"

  // Profile picture (Firebase Storage URL)
  profilePictureUrl: string;

  // Documents (Firebase Storage URLs)
  characterCertificateUrl: string;
  policeVerificationUrl: string;

  // Financial / compliance
  bankAccount: string;
  esiNumber: string;
  pfNumber: string;

  notes: string;
  status: GuardStatus;
  /** Branch this guard belongs to. null/undefined = unassigned (agency-wide). */
  branchId?: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export const GUARDS_COLLECTION = "guards";
