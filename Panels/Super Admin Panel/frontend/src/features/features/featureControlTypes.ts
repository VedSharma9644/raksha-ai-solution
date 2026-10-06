/** Platform feature catalog controlled per agency by Super Admin. */
export interface PlatformFeature {
  id: string;
  name: string;
  description: string;
  dependencies: string[];
}

export const PLATFORM_FEATURES: PlatformFeature[] = [
  {
    id: "form_builder",
    name: "Form Builder",
    description: "Custom intake and onboarding forms for guards and sites.",
    dependencies: [],
  },
  {
    id: "employee_management",
    name: "Employee Management",
    description: "Guard and staff profiles, roster basics.",
    dependencies: [],
  },
  {
    id: "attendance",
    name: "Attendance",
    description: "Check-in, geo verification, and duty logs.",
    dependencies: ["employee_management"],
  },
  {
    id: "leave",
    name: "Leave",
    description: "Leave requests and approvals.",
    dependencies: ["employee_management"],
  },
  {
    id: "inventory",
    name: "Inventory",
    description: "Uniforms and equipment stock tracking.",
    dependencies: [],
  },
  {
    id: "payroll",
    name: "Payroll",
    description: "Salary runs and payout summaries.",
    dependencies: ["employee_management", "attendance"],
  },
  {
    id: "site_management",
    name: "Site Management",
    description: "Client sites, gates, and assignments.",
    dependencies: [],
  },
  {
    id: "reports",
    name: "Reports",
    description: "Operational and attendance reporting.",
    dependencies: ["attendance"],
  },
];

export interface AgencyFeatureConfig {
  agencyId: string;
  agencyName: string;
  enabledFeatureIds: string[];
}

export const SAMPLE_AGENCY_FEATURE_CONFIGS: AgencyFeatureConfig[] = [
  {
    agencyId: "agency-1",
    agencyName: "Shield Securitas",
    enabledFeatureIds: [
      "employee_management",
      "attendance",
      "leave",
      "inventory",
      "reports",
    ],
  },
  {
    agencyId: "agency-2",
    agencyName: "NorthGuard Services",
    enabledFeatureIds: [
      "employee_management",
      "attendance",
      "leave",
      "inventory",
      "payroll",
      "site_management",
      "reports",
    ],
  },
  {
    agencyId: "agency-3",
    agencyName: "CityWatch Agency",
    enabledFeatureIds: ["employee_management", "attendance", "leave"],
  },
  {
    agencyId: "agency-4",
    agencyName: "SafeZone Protections",
    enabledFeatureIds: [],
  },
];
