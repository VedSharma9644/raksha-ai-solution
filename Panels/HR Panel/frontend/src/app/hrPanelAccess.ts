/**
 * HR Panel access boundary.
 * HR can manage people operations, inventory stock counts, and leave.
 * HR may view payroll general settings (read-only) when the payroll module
 * is enabled. HR cannot edit those settings, run payroll, or see other
 * financial/money details.
 */
export const HR_PANEL_ACCESS = {
  canManageGuards: true,
  canManageInventory: true,
  canManageLeave: true,
  canAccessSites: false,
  canAccessFinancialDetails: false,
  canViewPayrollGeneralSettings: true,
} as const;
