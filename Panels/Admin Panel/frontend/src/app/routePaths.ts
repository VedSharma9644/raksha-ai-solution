export const APP_ROUTES = {
  login: "/",
  dashboard: "/dashboard",
  // Guards
  addGuard: "/guards/add",
  editGuard: "/guards/:id/edit",
  employeeList: "/employees",
  // Sites
  addSite: "/sites/add",
  // HR Staff
  hrList: "/hr",
  addHrStaff: "/hr/add",
  editHrStaff: "/hr/:id/edit",
} as const;

export type AppRoutePath = (typeof APP_ROUTES)[keyof typeof APP_ROUTES];

/** Build the concrete edit-guard URL for a specific guard ID */
export function editGuardPath(guardId: string): string {
  return `/guards/${guardId}/edit`;
}

/** Build the concrete edit-HR-staff URL for a specific HR staff ID */
export function editHrStaffPath(hrStaffId: string): string {
  return `/hr/${hrStaffId}/edit`;
}
