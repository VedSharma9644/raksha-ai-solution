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
