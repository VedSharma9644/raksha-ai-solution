/**
 * Super Admin is the platform owner panel.
 * It controls agencies (companies), their enabled features/modules,
 * subscription state, and platform-wide analytics.
 */
export const SUPER_ADMIN_PANEL_ACCESS = {
  canManageAgencies: true,
  canControlFeaturesByAgency: true,
  canManageSubscribers: true,
  canViewPlatformCharts: true,
  canAccessAgencyOperationalData: true,
} as const;
