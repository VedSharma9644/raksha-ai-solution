import type { ProspectStatus, LeadSource } from "@raskha/client-management";

// ─── Form values ──────────────────────────────────────────────────────────────

export interface ProspectFormValues {
  // Organisation
  orgName: string;
  city: string;
  expectedSiteType: string;
  expectedGuardCount: string;   // string for input, parsed to number on save
  expectedMonthlyValue: string;
  leadSource: LeadSource | string;

  // Contact
  contactName: string;
  contactDesignation: string;
  primaryPhone: string;
  alternatePhone: string;
  email: string;

  // Lead
  status: ProspectStatus;
  followUpDate: string;   // ISO date string or ""
}

export const EMPTY_PROSPECT_FORM: ProspectFormValues = {
  orgName: "",
  city: "",
  expectedSiteType: "",
  expectedGuardCount: "",
  expectedMonthlyValue: "",
  leadSource: "other",
  contactName: "",
  contactDesignation: "",
  primaryPhone: "",
  alternatePhone: "",
  email: "",
  status: "initial_contact",
  followUpDate: "",
};

// ─── Option lists ─────────────────────────────────────────────────────────────

export interface SelectOption { value: string; label: string; }

export const PROSPECT_STATUS_OPTIONS: SelectOption[] = [
  { value: "initial_contact", label: "Initial Contact" },
  { value: "in_discussion",   label: "In Discussion" },
  { value: "proposal_sent",   label: "Proposal Sent" },
  { value: "negotiation",     label: "Negotiation" },
  { value: "converted",       label: "Converted" },
  { value: "lost",            label: "Lost" },
];

export const LEAD_SOURCE_OPTIONS: SelectOption[] = [
  { value: "referral",   label: "Referral" },
  { value: "cold_call",  label: "Cold Call" },
  { value: "walk_in",    label: "Walk-in" },
  { value: "online",     label: "Online / Social Media" },
  { value: "other",      label: "Other" },
];

export const EXPECTED_SITE_TYPE_OPTIONS: SelectOption[] = [
  { value: "industrial",     label: "Industrial" },
  { value: "hospital",       label: "Hospital" },
  { value: "hotel",          label: "Hotel" },
  { value: "mall",           label: "Mall" },
  { value: "company",        label: "Company" },
  { value: "temple",         label: "Temple" },
  { value: "workshop",       label: "Workshop" },
  { value: "refinery",       label: "Refinery" },
  { value: "bank",           label: "Bank" },
  { value: "medical-college", label: "Medical College" },
  { value: "other",          label: "Other" },
];

// ─── Status display helpers ───────────────────────────────────────────────────

export function statusLabel(status: ProspectStatus | string): string {
  return PROSPECT_STATUS_OPTIONS.find((o) => o.value === status)?.label ?? status;
}

export function statusColorClass(status: ProspectStatus | string): string {
  const map: Record<string, string> = {
    initial_contact: "prospect-badge--initial",
    in_discussion:   "prospect-badge--discussion",
    proposal_sent:   "prospect-badge--proposal",
    negotiation:     "prospect-badge--negotiation",
    converted:       "prospect-badge--converted",
    lost:            "prospect-badge--lost",
  };
  return map[status] ?? "prospect-badge--initial";
}
