import type {
  EarningsReportPeriod,
  EarningsSummary,
  SiteEarningsDetail,
} from "@raskha/earnings";
import { auth } from "../../lib/firebase";

function resolveAdminApiBase(): string {
  const fromEnv = import.meta.env.VITE_ADMIN_API_URL?.replace(/\/$/, "");
  if (import.meta.env.DEV) {
    const forceRemote =
      import.meta.env.VITE_ADMIN_API_FORCE_REMOTE === "true";
    if (!forceRemote) {
      return "http://localhost:3001";
    }
  }
  return fromEnv || "http://localhost:3001";
}

const API_BASE = resolveAdminApiBase();

async function authHeaders(json = true): Promise<Headers> {
  const headers = new Headers();
  if (json) headers.set("Content-Type", "application/json");
  const user = auth.currentUser;
  if (!user) {
    throw new Error("You must be signed in to view earnings.");
  }
  const token = await user.getIdToken();
  headers.set("Authorization", `Bearer ${token}`);
  return headers;
}

async function adminFetch<T>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const headers = await authHeaders();
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
  });
  const data = (await response.json().catch(() => ({}))) as T & {
    error?: string;
  };
  if (!response.ok) {
    throw new Error(data.error ?? `Request failed (${response.status})`);
  }
  return data;
}

export async function fetchEarningsSummaryApi(params: {
  fromYear: number;
  fromMonth: number;
  toYear: number;
  toMonth: number;
}): Promise<EarningsSummary> {
  const qs = new URLSearchParams({
    fromYear: String(params.fromYear),
    fromMonth: String(params.fromMonth),
    toYear: String(params.toYear),
    toMonth: String(params.toMonth),
  });
  const data = await adminFetch<{ summary: EarningsSummary }>(
    `/api/earnings/summary?${qs}`
  );
  return data.summary;
}

export async function fetchSiteEarningsDetailApi(params: {
  siteId: string;
  fromYear: number;
  fromMonth: number;
  toYear: number;
  toMonth: number;
}): Promise<SiteEarningsDetail> {
  const qs = new URLSearchParams({
    fromYear: String(params.fromYear),
    fromMonth: String(params.fromMonth),
    toYear: String(params.toYear),
    toMonth: String(params.toMonth),
  });
  const data = await adminFetch<{ detail: SiteEarningsDetail }>(
    `/api/earnings/sites/${encodeURIComponent(params.siteId)}?${qs}`
  );
  return data.detail;
}

export async function downloadEarningsCsvApi(params: {
  period: EarningsReportPeriod;
  year: number;
  month: number;
}): Promise<void> {
  const headers = await authHeaders(false);
  const qs = new URLSearchParams({
    period: params.period,
    year: String(params.year),
    month: String(params.month),
  });
  const response = await fetch(`${API_BASE}/api/earnings/export.csv?${qs}`, {
    headers,
  });
  if (!response.ok) {
    const data = (await response.json().catch(() => ({}))) as {
      error?: string;
    };
    throw new Error(data.error ?? `CSV export failed (${response.status})`);
  }
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `earnings-${params.period}-${params.year}-${String(params.month).padStart(2, "0")}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
