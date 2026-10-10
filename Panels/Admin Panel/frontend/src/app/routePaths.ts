export const APP_ROUTES = {
  login: "/",
  dashboard: "/dashboard",
  formBuilder: "/form-builder",
  // Guards
  addGuard: "/guards/add",
  viewGuard: "/guards/:id",
  editGuard: "/guards/:id/edit",
  employeeList: "/employees",
  // Sites
  addSite: "/sites/add",
  siteList: "/sites",
  editSite: "/sites/:id/edit",
  assignGuards: "/sites/:id/assign-guards",
  // HR Staff
  hrList: "/hr",
  addHrStaff: "/hr/add",
  editHrStaff: "/hr/:id/edit",
  // Inventory
  inventoryList: "/inventory",
  addInventoryItem: "/inventory/add",
  editInventoryItem: "/inventory/:id/edit",
  inventoryBranchStock: "/inventory/:id/branch-stock",
  // Attendance
  attendance: "/attendance",
  // Leave
  manageLeave: "/leave",
  // Relief
  manageRelief: "/relief",
  // Scheduling
  scheduling: "/scheduling/:siteId",
  // Prospect Clients
  prospects: "/prospects",
  prospectDetail: "/prospects/:id",
  // Prospect Guards
  prospectGuards: "/prospect-guards",
  prospectGuardDetail: "/prospect-guards/:id",
  // Branches
  branchList: "/branches",
  addBranch: "/branches/add",
  editBranch: "/branches/:id/edit",
} as const;

export type AppRoutePath = (typeof APP_ROUTES)[keyof typeof APP_ROUTES];

/** Build the concrete view-guard URL for a specific guard ID */
export function viewGuardPath(guardId: string): string {
  return `/guards/${guardId}`;
}

/** Build the concrete edit-guard URL for a specific guard ID */
export function editGuardPath(guardId: string): string {
  return `/guards/${guardId}/edit`;
}

/** Build the concrete edit-HR-staff URL for a specific HR staff ID */
export function editHrStaffPath(hrStaffId: string): string {
  return `/hr/${hrStaffId}/edit`;
}

/** Build the concrete edit-site URL for a specific site ID */
export function editSitePath(siteId: string): string {
  return `/sites/${siteId}/edit`;
}

/** Build the assign-guards URL for a specific site ID */
export function assignGuardsPath(siteId: string): string {
  return `/sites/${siteId}/assign-guards`;
}

/** Build the concrete edit-inventory-item URL for a specific item ID */
export function editInventoryItemPath(itemId: string): string {
  return `/inventory/${itemId}/edit`;
}

export function inventoryBranchStockPath(itemId: string): string {
  return `/inventory/${itemId}/branch-stock`;
}

/** Build the scheduling URL for a specific site */
export function schedulingPath(siteId: string): string {
  return `/scheduling/${siteId}`;
}

/** Build the prospect detail URL for a specific prospect */
export function prospectDetailPath(prospectId: string): string {
  return `/prospects/${prospectId}`;
}

/** Build the prospect guard detail URL for a specific guard */
export function prospectGuardDetailPath(guardId: string): string {
  return `/prospect-guards/${guardId}`;
}

/** Build the edit-branch URL for a specific branch */
export function editBranchPath(branchId: string): string {
  return `/branches/${branchId}/edit`;
}
