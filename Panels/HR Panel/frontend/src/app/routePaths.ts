export const APP_ROUTES = {
  login: "/",
  dashboard: "/dashboard",
  addGuard: "/guards/add",
  guardList: "/guards",
  viewGuard: "/guards/:id",
  manageInventory: "/inventory",
  manageLeave: "/leave",
  manageRelief: "/relief",
  siteList: "/sites",
  assignGuards: "/sites/:id/assign-guards",
  // Attendance
  attendance: "/attendance",
  // Scheduling
  scheduling: "/scheduling/:siteId",
} as const;

export type AppRoutePath = (typeof APP_ROUTES)[keyof typeof APP_ROUTES];

export function viewGuardPath(guardId: string): string {
  return `/guards/${guardId}`;
}

export function assignGuardsPath(siteId: string): string {
  return `/sites/${siteId}/assign-guards`;
}

export function schedulingPath(siteId: string): string {
  return `/scheduling/${siteId}`;
}
