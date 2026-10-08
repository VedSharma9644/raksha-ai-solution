import { Timestamp } from "firebase/firestore";

// ─── Lead status pipeline ────────────────────────────────────────────────────

export type ProspectStatus =
  | "initial_contact"
  | "in_discussion"
  | "proposal_sent"
  | "negotiation"
  | "converted"
  | "lost";

// ─── Lead source ─────────────────────────────────────────────────────────────

export type LeadSource = "referral" | "cold_call" | "walk_in" | "online" | "other";

// ─── Prospect client ─────────────────────────────────────────────────────────

export interface ProspectClient {
  id: string;
  agencyId: string;

  // Organisation
  orgName: string;
  city: string;
  expectedSiteType: string;   // matches SiteType keys e.g. "hospital", "hotel"
  expectedGuardCount: number | null;
  expectedMonthlyValue: string;  // stored as string to avoid float precision issues
  leadSource: LeadSource | string;

  // Contact
  contactName: string;
  contactDesignation: string;
  primaryPhone: string;
  alternatePhone: string;
  email: string;

  // CRM
  status: ProspectStatus;
  followUpDate: string | null;   // ISO date string e.g. "2026-11-15"

  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ─── Progress note (subcollection: prospectClients/{id}/notes) ────────────────

export interface ProspectNote {
  id: string;
  authorName: string;   // display name of the agency admin who added the note
  content: string;
  createdAt: Timestamp;
}

// ─── Firestore collection constants ──────────────────────────────────────────

export const PROSPECT_CLIENTS_COLLECTION = "prospectClients";
export const PROSPECT_NOTES_SUBCOLLECTION = "notes";
