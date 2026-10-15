import type {
  EarningsReportPeriod,
  EarningsSummary,
  SiteEarningsDetail,
} from "@raskha/earnings";
import { adminFetch, adminFetchBlob } from "@raskha/shared";

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
    `/api/earnings/summary?${qs}`,
    { errorMessage: "You must be signed in to view earnings." }
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
    `/api/earnings/sites/${encodeURIComponent(params.siteId)}?${qs}`,
    { errorMessage: "You must be signed in to view earnings." }
  );
  return data.detail;
}

export async function downloadEarningsCsvApi(params: {
  period: EarningsReportPeriod;
  year: number;
  month: number;
}): Promise<void> {
  const qs = new URLSearchParams({
    period: params.period,
    year: String(params.year),
    month: String(params.month),
  });
  const blob = await adminFetchBlob(`/api/earnings/export.csv?${qs}`, {
    errorMessage: "You must be signed in to view earnings.",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `earnings-${params.period}-${params.year}-${String(params.month).padStart(2, "0")}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
