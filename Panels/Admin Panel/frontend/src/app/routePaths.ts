export const APP_ROUTES = {
  login: "/",
  dashboard: "/dashboard",
  addGuard: "/guards/add",
  addSite: "/sites/add",
  employeeList: "/employees",
  addSupervisor: "/supervisors/add",
  addHr: "/hr/add",
} as const;

export type AppRoutePath = (typeof APP_ROUTES)[keyof typeof APP_ROUTES];
