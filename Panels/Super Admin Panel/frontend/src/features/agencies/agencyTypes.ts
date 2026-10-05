export interface AgencyFormValues {
  agencyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  city: string;
  planId: string;
  notes: string;
}

export const EMPTY_AGENCY_FORM: AgencyFormValues = {
  agencyName: "",
  contactPerson: "",
  email: "",
  phone: "",
  city: "",
  planId: "",
  notes: "",
};

export type AgencyStatus = "active" | "trial" | "suspended";

export interface AgencyListItem {
  id: string;
  agencyName: string;
  contactPerson: string;
  email: string;
  city: string;
  planName: string;
  status: AgencyStatus;
  enabledFeatureCount: number;
}

export const SAMPLE_PLAN_OPTIONS = [
  { value: "plan-starter", label: "Starter" },
  { value: "plan-growth", label: "Growth" },
  { value: "plan-enterprise", label: "Enterprise" },
];

export const SAMPLE_AGENCIES: AgencyListItem[] = [
  {
    id: "agency-1",
    agencyName: "Shield Securitas",
    contactPerson: "Anil Mehta",
    email: "anil@shieldsecuritas.com",
    city: "Pune",
    planName: "Growth",
    status: "active",
    enabledFeatureCount: 5,
  },
  {
    id: "agency-2",
    agencyName: "NorthGuard Services",
    contactPerson: "Priya Nair",
    email: "priya@northguard.in",
    city: "Delhi",
    planName: "Enterprise",
    status: "active",
    enabledFeatureCount: 7,
  },
  {
    id: "agency-3",
    agencyName: "CityWatch Agency",
    contactPerson: "Rohit Verma",
    email: "rohit@citywatch.co",
    city: "Mumbai",
    planName: "Starter",
    status: "trial",
    enabledFeatureCount: 3,
  },
  {
    id: "agency-4",
    agencyName: "SafeZone Protections",
    contactPerson: "Kavita Shah",
    email: "kavita@safezone.in",
    city: "Ahmedabad",
    planName: "Growth",
    status: "suspended",
    enabledFeatureCount: 0,
  },
];
