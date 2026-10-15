export const APP_ROUTES = {
  login: "/",
  dashboard: "/dashboard",
  formBuilder: "/form-builder",
  generalSettings: "/general-settings",
  payroll: "/payroll",
  payrollRunDetail: "/payroll/:runId",
  earnings: "/earnings",
  earningsSiteDetail: "/earnings/sites/:siteId",
  invoices: "/invoices",
  invoiceDetail: "/invoices/:invoiceId",
  invoiceSettings: "/invoices/settings",
  moneyOut: "/money-out",
  paymentManagement: "/payment-management",
  manageSchedule: "/manage-schedule",
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
  // Prospect leads hub
  prospectLeads: "/prospect-leads",
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

/** Build the payroll run detail URL */
export function payrollRunPath(runId: string): string {
  return `/payroll/${runId}`;
}

/** Build earnings site detail URL with optional month query. */
export function earningsSitePath(
  siteId: string,
  opts?: { year?: number; month?: number }
): string {
  const base = `/earnings/sites/${encodeURIComponent(siteId)}`;
  if (opts?.year == null || opts?.month == null) return base;
  const qs = new URLSearchParams({
    year: String(opts.year),
    month: String(opts.month),
  });
  return `${base}?${qs}`;
}

/** Build invoice detail URL */
export function invoiceDetailPath(invoiceId: string): string {
  return `/invoices/${encodeURIComponent(invoiceId)}`;
}

/**
 * Deep-link into attendance "Fix missed / half days" with optional
 * guard + month preselected. `returnTo` is used for Back after fixing
 * (e.g. while working payroll).
 */
export function attendanceFixPath(params?: {
  guardId?: string;
  year?: number;
  month?: number;
  returnTo?: string;
}): string {
  const query = new URLSearchParams();
  if (params?.guardId) query.set("guardId", params.guardId);
  if (params?.year != null) query.set("year", String(params.year));
  if (params?.month != null) query.set("month", String(params.month));
  if (params?.returnTo) query.set("returnTo", params.returnTo);
  const qs = query.toString();
  return qs ? `${APP_ROUTES.attendance}?${qs}` : APP_ROUTES.attendance;
}
