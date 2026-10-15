/**
 * Full earnings module for backends (includes firebase-admin services).
 * Frontends must use ./client.ts via the Vite alias — not this file.
 */
export * from "./client";

export {
  buildEarningsSummary,
  getSiteEarningsDetail,
  exportEarningsCsv,
} from "./earningsService";
