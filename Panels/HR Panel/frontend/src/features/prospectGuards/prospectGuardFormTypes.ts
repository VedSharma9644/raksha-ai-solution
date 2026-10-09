import type { ProspectGuardStatus, ApplicationSource } from "@raskha/guard-management";

// ─── Form values ──────────────────────────────────────────────────────────────

export interface ProspectGuardFormValues {
  // Personal
  fullName: string;
  dateOfBirth: string;
  gender: string;
  city: string;
  // Contact
  phone: string;
  alternatePhone: string;
  email: string;
  // ID docs
  aadhaarNumber: string;
  panNumber: string;
  // Experience
  yearsOfExperience: string;   // string for input, parsed to number on save
  previousEmployer: string;
  // Physical
  height: string;
  weight: string;
  physicalFitness: string;
  // Interview
  interviewDate: string;
  interviewerName: string;
  // Pipeline
  applicationSource: ApplicationSource | string;
  status: ProspectGuardStatus;
  followUpDate: string;
}

export const EMPTY_PROSPECT_GUARD_FORM: ProspectGuardFormValues = {
  fullName: "",
  dateOfBirth: "",
  gender: "",
  city: "",
  phone: "",
  alternatePhone: "",
  email: "",
  aadhaarNumber: "",
  panNumber: "",
  yearsOfExperience: "",
  previousEmployer: "",
  height: "",
  weight: "",
  physicalFitness: "",
  interviewDate: "",
  interviewerName: "",
  applicationSource: "other",
  status: "applied",
  followUpDate: "",
};

// ─── Option lists ─────────────────────────────────────────────────────────────

export interface SelectOption { value: string; label: string; }

export const PROSPECT_GUARD_STATUS_OPTIONS: SelectOption[] = [
  { value: "applied",           label: "Applied" },
  { value: "screening",         label: "Screening" },
  { value: "interview",         label: "Interview" },
  { value: "background_check",  label: "Background Check" },
  { value: "hired",             label: "Hired" },
  { value: "rejected",          label: "Rejected" },
];

export const APPLICATION_SOURCE_OPTIONS: SelectOption[] = [
  { value: "referral",   label: "Referral" },
  { value: "walk_in",    label: "Walk-in" },
  { value: "online",     label: "Online / Social Media" },
  { value: "job_portal", label: "Job Portal" },
  { value: "other",      label: "Other" },
];

export const GENDER_OPTIONS: SelectOption[] = [
  { value: "male",   label: "Male" },
  { value: "female", label: "Female" },
  { value: "other",  label: "Other" },
];

export const PHYSICAL_FITNESS_OPTIONS: SelectOption[] = [
  { value: "pending", label: "Pending Assessment" },
  { value: "fit",     label: "Fit" },
  { value: "unfit",   label: "Unfit" },
];

// ─── Status display helpers ───────────────────────────────────────────────────

export function guardStatusLabel(status: ProspectGuardStatus | string): string {
  return PROSPECT_GUARD_STATUS_OPTIONS.find((o) => o.value === status)?.label ?? status;
}

export function guardStatusColorClass(status: ProspectGuardStatus | string): string {
  const map: Record<string, string> = {
    applied:          "guard-badge--applied",
    screening:        "guard-badge--screening",
    interview:        "guard-badge--interview",
    background_check: "guard-badge--bgcheck",
    hired:            "guard-badge--hired",
    rejected:         "guard-badge--rejected",
  };
  return map[status] ?? "guard-badge--applied";
}
