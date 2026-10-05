export type SuperAdminDashboardActionId =
  | "add-agency"
  | "agency-list"
  | "feature-control"
  | "subscribers"
  | "charts";

export interface SuperAdminDashboardAction {
  id: SuperAdminDashboardActionId;
  title: string;
  description: string;
  iconLabel: string;
}

export const SUPER_ADMIN_DASHBOARD_ACTIONS: SuperAdminDashboardAction[] = [
  {
    id: "add-agency",
    title: "Add Agency",
    description: "Onboard a new company onto the Raskha platform.",
    iconLabel: "A",
  },
  {
    id: "agency-list",
    title: "Agencies",
    description: "Browse and manage every agency under your control.",
    iconLabel: "C",
  },
  {
    id: "feature-control",
    title: "Feature Control",
    description: "Enable or disable modules for each agency.",
    iconLabel: "F",
  },
  {
    id: "subscribers",
    title: "Subscribers",
    description: "Track active, trial, and expired agency subscriptions.",
    iconLabel: "S",
  },
  {
    id: "charts",
    title: "Charts & Insights",
    description: "Review platform growth, usage, and subscription health.",
    iconLabel: "X",
  },
];
