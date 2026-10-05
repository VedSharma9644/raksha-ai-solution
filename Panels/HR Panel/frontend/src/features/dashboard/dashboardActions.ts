export type HrDashboardActionId =
  | "add-guard"
  | "guard-list"
  | "manage-inventory"
  | "manage-leave";

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
];
