export const APP_ROUTES = {
  login: "/",
  selectBranch: "/select-branch",
  dashboard: "/dashboard",
  addGuard: "/guards/add",
  guardList: "/guards",
  viewGuard: "/guards/:id",
  manageInventory: "/inventory",
  addInventoryItem: "/inventory/add",
  editInventoryItem: "/inventory/:itemId/edit",
  manageLeave: "/leave",
  manageRelief: "/relief",
  siteList: "/sites",
  assignGuards: "/sites/:id/assign-guards",
  // Attendance
  attendance: "/attendance",
  // Scheduling
  scheduling: "/scheduling/:siteId",
  // Prospect Guards
  prospectGuards: "/prospect-guards",
  prospectGuardDetail: "/prospect-guards/:id",
} as const;

export type AppRoutePath = (typeof APP_ROUTES)[keyof typeof APP_ROUTES];

export function viewGuardPath(guardId: string): string {
  return `/guards/${guardId}`;
}

export function editInventoryItemPath(itemId: string): string {
  return `/inventory/${itemId}/edit`;
}

export function assignGuardsPath(siteId: string): string {
  return `/sites/${siteId}/assign-guards`;
}

export function schedulingPath(siteId: string): string {
  return `/scheduling/${siteId}`;
}

export function prospectGuardDetailPath(guardId: string): string {
  return `/prospect-guards/${guardId}`;
}
