import { Timestamp } from "firebase/firestore";

export type SiteStatus = "active" | "inactive";

// ─── Shift configuration types ──────────────────────────────────────────────

export type ShiftType = "day" | "night" | "custom";

/** Per-gender guard count breakdown for a shift slot */
export interface ShiftGenderRequirement {
  male: number;
  female: number;
  other: number;
}

export interface SiteShift {
  /** Unique within the site — use "day", "night", or a short uuid for custom shifts */
  id: string;
  label: string;        // e.g. "Day Shift", "Night Shift"
  shiftType: ShiftType;
  startTime: string;    // HH:MM  e.g. "07:00"
  endTime: string;      // HH:MM  e.g. "19:00"
  /** Total guards needed (sum of genderRequirements when provided) */
  requiredGuards: number;
  /** Optional per-gender breakdown. null/undefined = not specified */
  genderRequirements?: ShiftGenderRequirement | null;
}

export interface SiteShiftConfig {
  has24hSurveillance: boolean;
  shifts: SiteShift[];
}

// ─── Site type ───────────────────────────────────────────────────────────────

export type SiteType =
  | "industrial"
  | "hospital"
  | "hotel"
  | "mall"
  | "company"
  | "temple"
  | "workshop"
  | "refinery"
  | "bank"
  | "medical-college"
  | "other";

export interface Site {
  id: string;
  agencyId: string;

  // Basic info
  siteName: string;
  siteType: SiteType | "";
  clientName: string;
  address: string;
  city: string;

  // Manager
  managerName: string;
  managerContact: string;

  // HR contact at site
  hrName: string;
  hrContact: string;

  // Supervisor
  siteSupervisor: string;

  // Legacy / optional contact
  contactPerson: string;
  contactPhone: string;

  // Geofence / location
  latitude?: number | null;
  longitude?: number | null;
  geofenceRadiusMeters?: number | null;

  notes: string;
  status: SiteStatus;

  // ── Scheduling ──────────────────────────────────────────────────────────
  /** Minutes between mandatory interval check-ins (null = disabled) */
  intervalCheckinMinutes?: number | null;
  /** Shift slots and 24h surveillance flag */
  shiftConfig?: SiteShiftConfig | null;

  /** Branch this site belongs to. null/undefined = unassigned (agency-wide). */
  branchId?: string | null;

  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export const SITES_COLLECTION = "sites";
