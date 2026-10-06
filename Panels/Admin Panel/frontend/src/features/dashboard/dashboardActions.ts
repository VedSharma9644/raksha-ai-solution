export type DashboardActionId =
  | "add-guard"
  | "add-site"
  | "site-list"
  | "manage-inventory"
  | "employee-guard-list"
  | "add-hr"
  | "hr-list"
  | "form-builder";

export interface DashboardAction {
  id: DashboardActionId;
  title: string;
  description: string;
  iconLabel: string;
}

export const DASHBOARD_ACTIONS: DashboardAction[] = [
  {
    id: "form-builder",
    title: "Form Builder",
    description: "Customize Guard, HR, and Site intake forms for your agency.",
    iconLabel: "FB",
  },
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
    id: "site-list",
    title: "Site List",
    description: "View, edit, and manage all registered client sites.",
    iconLabel: "SL",
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
    id: "add-hr",
    title: "Add HR",
    description: "Add an HR user to manage leave, payroll, and records.",
    iconLabel: "H",
  },
  {
    id: "hr-list",
    title: "HR List",
    description: "View and manage all HR users in your agency.",
    iconLabel: "R",
  },
];
