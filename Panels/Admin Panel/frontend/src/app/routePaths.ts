export const APP_ROUTES = {
  login: "/",
  dashboard: "/dashboard",
  addGuard: "/guards/add",
  editGuard: "/guards/:id/edit",
  addSite: "/sites/add",
  employeeList: "/employees",
  addSupervisor: "/supervisors/add",
  addHr: "/hr/add",
} as const;

export type AppRoutePath = (typeof APP_ROUTES)[keyof typeof APP_ROUTES];

/** Build the concrete edit-guard URL for a specific guard ID */
export function editGuardPath(guardId: string): string {
  return `/guards/${guardId}/edit`;
}
