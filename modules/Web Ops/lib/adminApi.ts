/**
 * Re-export the shared Admin API client for web-ops features.
 * Prefer importing from `@raskha/shared` in new code.
 */
export {
  configureAdminApi,
  resolveAdminApiBase,
  adminAuthHeaders,
  adminFetch,
  adminFetchBlob,
  type GetIdToken,
  type AdminAuthHeaderOptions,
  type AdminFetchOptions,
} from "@raskha/shared";
