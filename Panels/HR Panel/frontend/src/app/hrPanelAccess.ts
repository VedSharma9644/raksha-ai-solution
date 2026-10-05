/**
 * HR Panel access boundary.
 * HR can manage people operations, inventory stock counts, and leave.
 * HR cannot manage sites or any financial/payroll money details.
 */
export const HR_PANEL_ACCESS = {
  canManageGuards: true,
  canManageInventory: true,
  canManageLeave: true,
  canAccessSites: false,
  canAccessFinancialDetails: false,
} as const;
