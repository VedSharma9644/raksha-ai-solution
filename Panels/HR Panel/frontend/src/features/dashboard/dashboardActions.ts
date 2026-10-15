export type HrDashboardActionId =
  | "guard-list"
  | "manage-inventory"
  | "site-list"
  | "manage-schedule"
  | "prospect-guards";

export interface HrDashboardAction {
  id: HrDashboardActionId;
  title: string;
  description: string;
  iconLabel: string;
}

export const HR_DASHBOARD_ACTIONS: HrDashboardAction[] = [
  {
    id: "guard-list",
    title: "Guards",
    description: "Browse, search, and add guards managed by HR.",
    iconLabel: "G",
  },
  {
    id: "site-list",
    title: "Sites",
    description: "View client sites and assign guards to each location.",
    iconLabel: "S",
  },
  {
    id: "manage-inventory",
    title: "Manage Inventory",
    description: "Track uniforms and equipment stock levels.",
    iconLabel: "I",
  },
  {
    id: "manage-schedule",
    title: "Manage schedule",
    description:
      "Attendance, leave, relief, and site scheduling in one place.",
    iconLabel: "📅",
  },
  {
    id: "prospect-guards",
    title: "Prospect guards",
    description:
      "Track and manage prospective guard candidates through the hiring pipeline.",
    iconLabel: "🛡️",
  },
];
