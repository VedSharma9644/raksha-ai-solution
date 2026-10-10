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
  | "other"
  | "";

// ─── Shift form types ────────────────────────────────────────────────────────

export type ShiftTypeOption = "day" | "night" | "custom";

export interface SiteShiftRowValues {
  /** Temp client-side id for React key; will be used as SiteShift.id */
  id: string;
  label: string;
  shiftType: ShiftTypeOption;
  startTime: string; // HH:MM
  endTime: string;   // HH:MM
  requiredGuards: string; // string for input, parsed to number on save (auto-sum of gender fields)
  requiredMale: string;
  requiredFemale: string;
  requiredOther: string;
}

export const EMPTY_SHIFT_ROW = (): SiteShiftRowValues => ({
  id: crypto.randomUUID(),
  label: "",
  shiftType: "day",
  startTime: "06:00",
  endTime: "18:00",
  requiredGuards: "1",
  requiredMale: "1",
  requiredFemale: "0",
  requiredOther: "0",
});

// ─── Site form values ────────────────────────────────────────────────────────

export interface SiteFormValues {
  // Basic info
  siteName: string;
  siteType: SiteType;
  clientName: string;
  address: string;
  city: string;

  // Manager
  managerName: string;
  managerContact: string;

  // HR
  hrName: string;
  hrContact: string;

  // Site supervisor
  siteSupervisor: string;

  // Legacy contact (kept for backward compat)
  contactPerson: string;
  contactPhone: string;

  // Location
  latitude: string;
  longitude: string;

  notes: string;

  // ── Scheduling ────────────────────────────────────────────────────────────
  has24hSurveillance: boolean;
  intervalCheckinMinutes: string; // parsed to number on save; "" = disabled
  shifts: SiteShiftRowValues[];

  /** Branch this site belongs to. "" = unassigned (follows active branch on create). */
  branchId: string;
}

export const EMPTY_SITE_FORM: SiteFormValues = {
  siteName: "",
  siteType: "",
  clientName: "",
  address: "",
  city: "",
  managerName: "",
  managerContact: "",
  hrName: "",
  hrContact: "",
  siteSupervisor: "",
  contactPerson: "",
  contactPhone: "",
  latitude: "",
  longitude: "",
  notes: "",
  has24hSurveillance: false,
  intervalCheckinMinutes: "",
  shifts: [],
  branchId: "",
};

export const SITE_TYPE_OPTIONS = [
  { value: "industrial",     label: "Industrial" },
  { value: "hospital",       label: "Hospital" },
  { value: "hotel",          label: "Hotel" },
  { value: "mall",           label: "Mall" },
  { value: "company",        label: "Company" },
  { value: "temple",         label: "Temple" },
  { value: "workshop",       label: "Workshop" },
  { value: "refinery",       label: "Refinery" },
  { value: "bank",           label: "Bank" },
  { value: "medical-college",label: "Medical College" },
  { value: "other",          label: "Other" },
];
