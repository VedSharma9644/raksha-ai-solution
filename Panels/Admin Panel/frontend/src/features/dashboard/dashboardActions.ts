export type DashboardActionId =
  | "add-guard"
  | "add-site"
  | "manage-inventory"
  | "employee-guard-list"
  | "add-supervisor"
  | "add-hr";

export interface DashboardAction {
  id: DashboardActionId;
  title: string;
  description: string;
  iconLabel: string;
}

export const DASHBOARD_ACTIONS: DashboardAction[] = [
  {
    id: "add-guard",
    title: "Add Guard",
    description: "Create a new guard profile and assign them to duty.",
    iconLabel: "G",
  },
  {
    id: "add-site",
    title: "Add Site",
    description: "Register a new client site for patrol and attendance.",
    iconLabel: "S",
  },
  {
    id: "manage-inventory",
    title: "Manage Inventory",
    description: "Track uniforms, equipment, and site assets.",
    iconLabel: "I",
  },
  {
    id: "employee-guard-list",
    title: "Employee / Guard List",
    description: "Browse and search everyone working under this agency.",
    iconLabel: "L",
  },
  {
    id: "add-supervisor",
    title: "Add Supervisor",
    description: "Onboard a supervisor to oversee sites and shifts.",
    iconLabel: "V",
  },
  {
    id: "add-hr",
    title: "Add HR",
    description: "Add an HR user to manage leave, payroll, and records.",
    iconLabel: "H",
  },
];
