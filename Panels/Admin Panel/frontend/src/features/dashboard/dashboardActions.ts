export type DashboardActionId =
  | "site-list"
  | "manage-inventory"
  | "employee-guard-list"
  | "hr-list"
  | "form-builder"
  | "manage-schedule"
  | "prospect-leads"
  | "branches"
  | "payment-management";

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
    id: "site-list",
    title: "Sites",
    description:
      "Browse, manage, and add client sites for patrol and attendance.",
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
    title: "Guards",
    description:
      "Browse, search, and add guards working under this agency.",
    iconLabel: "G",
  },
  {
    id: "hr-list",
    title: "HR",
    description:
      "Browse, manage, and add HR users for leave, payroll, and records.",
    iconLabel: "H",
  },
  {
    id: "manage-schedule",
    title: "Manage schedule",
    description:
      "Attendance, leave, relief, and site scheduling in one place.",
    iconLabel: "📅",
  },
  {
    id: "prospect-leads",
    title: "Prospect leads",
    description:
      "Open client sales leads or guard hiring candidates from one place.",
    iconLabel: "PL",
  },
  {
    id: "branches",
    title: "Branches",
    description: "Create and manage your agency's branch offices across cities.",
    iconLabel: "🏢",
  },
  {
    id: "payment-management",
    title: "Payment management",
    description:
      "Payroll, invoices, earnings, and money out in one place.",
    iconLabel: "₹",
  },
];
