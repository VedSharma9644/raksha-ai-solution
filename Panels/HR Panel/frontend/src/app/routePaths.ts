export const APP_ROUTES = {
  login: "/",
  dashboard: "/dashboard",
  addGuard: "/guards/add",
  guardList: "/guards",
  viewGuard: "/guards/:id",
  manageInventory: "/inventory",
  manageLeave: "/leave",
} as const;

export type AppRoutePath = (typeof APP_ROUTES)[keyof typeof APP_ROUTES];

export function viewGuardPath(guardId: string): string {
  return `/guards/${guardId}`;
}
