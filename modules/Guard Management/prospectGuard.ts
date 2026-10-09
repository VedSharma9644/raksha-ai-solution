import { Timestamp } from "firebase/firestore";

// ─── Hiring pipeline ──────────────────────────────────────────────────────────

export type ProspectGuardStatus =
  | "applied"
  | "screening"
  | "interview"
  | "background_check"
  | "hired"
  | "rejected";

// ─── Application source ───────────────────────────────────────────────────────

export type ApplicationSource =
  | "referral"
  | "walk_in"
  | "online"
  | "job_portal"
  | "other";

// ─── Prospect guard ───────────────────────────────────────────────────────────

export interface ProspectGuard {
  id: string;
  agencyId: string;

  // Personal
  fullName: string;
  dateOfBirth: string | null;        // ISO date e.g. "1998-04-12"
  gender: "male" | "female" | "other" | "";
  city: string;

  // Contact
  phone: string;
  alternatePhone: string;
  email: string;

  // ID Documents
  aadhaarNumber: string;
  panNumber: string;

  // Experience
  yearsOfExperience: number | null;
  previousEmployer: string;

  // Physical
  height: string;                    // e.g. "5'8\""
  weight: string;                    // e.g. "70 kg"
  physicalFitness: "fit" | "unfit" | "pending" | "";

  // Interview
  interviewDate: string | null;      // ISO date
  interviewerName: string;

  // Pipeline
  applicationSource: ApplicationSource | string;
  status: ProspectGuardStatus;
  followUpDate: string | null;       // ISO date

  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ─── Progress note (subcollection: prospectGuards/{id}/notes) ─────────────────

export interface ProspectGuardNote {
  id: string;
  authorName: string;
  content: string;
  createdAt: Timestamp;
}

// ─── Firestore collection constants ──────────────────────────────────────────

export const PROSPECT_GUARDS_COLLECTION = "prospectGuards";
export const PROSPECT_GUARD_NOTES_SUBCOLLECTION = "notes";
