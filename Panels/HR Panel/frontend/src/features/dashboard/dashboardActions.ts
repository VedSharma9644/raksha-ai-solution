export type HrDashboardActionId =
  | "add-guard"
  | "guard-list"
  | "manage-inventory"
  | "manage-leave"
  | "site-list"
  | "attendance"
  | "scheduling";

export interface HrDashboardAction {
  id: HrDashboardActionId;
  title: string;
  description: string;
  iconLabel: string;
}

export const HR_DASHBOARD_ACTIONS: HrDashboardAction[] = [
  {
    id: "add-guard",
    title: "Add Guard",
    description: "Create a new guard profile for staffing and attendance.",
    iconLabel: "G",
  },
  {
    id: "guard-list",
    title: "Guard List",
    description: "Browse and search guards managed by HR.",
    iconLabel: "L",
  },
  {
    id: "manage-inventory",
    title: "Manage Inventory",
    description: "Track uniforms and equipment stock levels.",
    iconLabel: "I",
  },
  {
    id: "manage-leave",
    title: "Manage Leave",
    description: "Review upcoming and pending leave requests.",
    iconLabel: "V",
  },
  {
    id: "site-list",
    title: "Site List",
    description: "View all client sites and assign guards to each location.",
    iconLabel: "S",
  },
  {
    id: "attendance",
    title: "Attendance",
    description: "View daily punch-in and punch-out records for all guards.",
    iconLabel: "📋",
  },
  {
    id: "scheduling",
    title: "Scheduling",
    description: "Assign guards to shifts and view weekly or monthly rosters per site.",
    iconLabel: "📅",
  },
];
