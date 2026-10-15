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

  /**
   * Client billing: ₹ the client pays per male guard per month.
   * Missing/0 on older sites until admin enters rates.
   */
  clientRateMaleMonthly?: number;
  /** Client billing: ₹ per female guard per month. */
  clientRateFemaleMonthly?: number;

  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export const SITES_COLLECTION = "sites";

/** Monthly client revenue from headcount × rates. `other` bills at male rate. */
export function computeSiteClientRevenueMonthly(params: {
  maleRate: number;
  femaleRate: number;
  maleCount: number;
  femaleCount: number;
  otherCount?: number;
}): number {
  const maleRate = Math.max(0, Number(params.maleRate) || 0);
  const femaleRate = Math.max(0, Number(params.femaleRate) || 0);
  const male = Math.max(0, Math.floor(Number(params.maleCount) || 0));
  const female = Math.max(0, Math.floor(Number(params.femaleCount) || 0));
  const other = Math.max(0, Math.floor(Number(params.otherCount) || 0));
  return (
    Math.round(
      (male * maleRate + female * femaleRate + other * maleRate) * 100
    ) / 100
  );
}

/** Sum required male/female/other across shift slots. */
export function sumShiftGenderRequirements(
  shifts: Array<{
    genderRequirements?: ShiftGenderRequirement | null;
    requiredGuards?: number;
  }>
): { male: number; female: number; other: number } {
  let male = 0;
  let female = 0;
  let other = 0;
  for (const s of shifts) {
    if (s.genderRequirements) {
      male += Math.max(0, Number(s.genderRequirements.male) || 0);
      female += Math.max(0, Number(s.genderRequirements.female) || 0);
      other += Math.max(0, Number(s.genderRequirements.other) || 0);
    } else {
      male += Math.max(0, Number(s.requiredGuards) || 0);
    }
  }
  return { male, female, other };
}
