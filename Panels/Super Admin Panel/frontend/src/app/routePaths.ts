export const APP_ROUTES = {
  login: "/",
  dashboard: "/dashboard",
  addAgency: "/agencies/add",
  editAgency: "/agencies/:agencyId/edit",
  agencyList: "/agencies",
  featureControl: "/features",
  subscribers: "/subscribers",
  charts: "/charts",
} as const;

export type AppRoutePath = (typeof APP_ROUTES)[keyof typeof APP_ROUTES];
