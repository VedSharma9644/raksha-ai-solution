import { useCallback, useEffect, useState } from "react";
import { listGuardsByAgency } from "@raskha/guard-management";
import { listSitesByAgency } from "@raskha/site-management";
import { fetchAgencyAttendanceDay } from "@raskha/web-ops";
import { db } from "../../lib/firebase";
import { useAuthContext } from "../authentication";
import { useBranchContext } from "../branches";
import { fetchEarningsSummaryApi } from "../earnings/earningsApi";

export type DashboardDateRange = {
  from: string; // YYYY-MM-DD
  to: string;
};

export type DashboardAnalytics = {
  loading: boolean;
  error: string | null;
  moneyIn: number;
  moneyOut: number;
  net: number;
  moneyInGrowthPct: number | null;
  netGrowthPct: number | null;
  activeGuards: number;
  siteCount: number;
  incomeBySite: Array<{ label: string; value: number }>;
  attendanceDays: Array<{
    label: string;
    present: number;
    absent: number;
    onShift: number;
  }>;
  attendanceToday: { present: number; absent: number; onShift: number } | null;
};

function parseYmd(ymd: string): Date {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(y!, m! - 1, d!);
}

function formatYmd(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function addDays(ymd: string, delta: number): string {
  const d = parseYmd(ymd);
  d.setDate(d.getDate() + delta);
  return formatYmd(d);
}

function dayCountInclusive(from: string, to: string): number {
  const a = parseYmd(from).getTime();
  const b = parseYmd(to).getTime();
  return Math.max(1, Math.round((b - a) / 86_400_000) + 1);
}

function monthSpan(from: string, to: string): {
  fromYear: number;
  fromMonth: number;
  toYear: number;
  toMonth: number;
} {
  const a = parseYmd(from);
  const b = parseYmd(to);
  return {
    fromYear: a.getFullYear(),
    fromMonth: a.getMonth() + 1,
    toYear: b.getFullYear(),
    toMonth: b.getMonth() + 1,
  };
}

function previousRange(from: string, to: string): DashboardDateRange {
  const days = dayCountInclusive(from, to);
  const prevTo = addDays(from, -1);
  const prevFrom = addDays(prevTo, -(days - 1));
  return { from: prevFrom, to: prevTo };
}

function shortLabel(ymd: string): string {
  const d = parseYmd(ymd);
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

/** Sample up to `maxPoints` evenly spaced days in [from, to]. */
function sampleDays(from: string, to: string, maxPoints: number): string[] {
  const total = dayCountInclusive(from, to);
  if (total <= maxPoints) {
    const out: string[] = [];
    for (let i = 0; i < total; i += 1) {
      out.push(addDays(from, i));
    }
    return out;
  }
  const out: string[] = [];
  for (let i = 0; i < maxPoints; i += 1) {
    const offset = Math.round((i * (total - 1)) / (maxPoints - 1));
    out.push(addDays(from, offset));
  }
  return out;
}

function pctChange(current: number, previous: number): number | null {
  if (previous === 0) {
    return current === 0 ? 0 : null;
  }
  return ((current - previous) / Math.abs(previous)) * 100;
}

const EMPTY: Omit<DashboardAnalytics, "loading" | "error"> = {
  moneyIn: 0,
  moneyOut: 0,
  net: 0,
  moneyInGrowthPct: null,
  netGrowthPct: null,
  activeGuards: 0,
  siteCount: 0,
  incomeBySite: [],
  attendanceDays: [],
  attendanceToday: null,
};

export function useDashboardAnalytics(range: DashboardDateRange): DashboardAnalytics {
  const { agency } = useAuthContext();
  const { activeBranchId } = useBranchContext();
  const [state, setState] = useState<DashboardAnalytics>({
    ...EMPTY,
    loading: true,
    error: null,
  });

  const load = useCallback(async () => {
    if (!agency?.id) {
      setState({ ...EMPTY, loading: false, error: null });
      return;
    }
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const branchId = activeBranchId;
      const currentMonths = monthSpan(range.from, range.to);
      const prev = previousRange(range.from, range.to);
      const prevMonths = monthSpan(prev.from, prev.to);

      const days = sampleDays(range.from, range.to, 14);
      const todayYmd = formatYmd(new Date());

      const [summary, prevSummary, guards, sites, attendanceResults] =
        await Promise.all([
          fetchEarningsSummaryApi({ ...currentMonths, branchId }).catch(
            () => null,
          ),
          fetchEarningsSummaryApi({ ...prevMonths, branchId }).catch(
            () => null,
          ),
          listGuardsByAgency(db, agency.id),
          listSitesByAgency(db, agency.id),
          Promise.all(
            days.map((date) =>
              fetchAgencyAttendanceDay(date, branchId)
                .then((res) => ({ date, res }))
                .catch(() => null),
            ),
          ),
        ]);

      const filteredGuards = branchId
        ? guards.filter((g) => g.branchId === branchId)
        : guards;
      const filteredSites = branchId
        ? sites.filter((s) => s.branchId === branchId)
        : sites;

      const moneyIn = summary?.moneyIn ?? 0;
      const moneyOut = summary?.moneyOut ?? 0;
      const net = summary?.net ?? 0;
      const prevIn = prevSummary?.moneyIn ?? 0;
      const prevNet = prevSummary?.net ?? 0;

      const incomeBySite = (summary?.sites ?? [])
        .slice()
        .sort((a, b) => b.moneyIn - a.moneyIn)
        .slice(0, 8)
        .map((s) => ({
          label: s.siteName?.trim() || "Site",
          value: s.moneyIn,
        }));

      const attendanceDays = attendanceResults
        .filter(Boolean)
        .map((row) => ({
          label: shortLabel(row!.date),
          present: row!.res.stats.presentToday,
          absent: row!.res.stats.absentToday,
          onShift: row!.res.stats.onShift,
        }));

      const todayRow = attendanceResults.find((r) => r?.date === todayYmd);
      const attendanceToday = todayRow
        ? {
            present: todayRow.res.stats.presentToday,
            absent: todayRow.res.stats.absentToday,
            onShift: todayRow.res.stats.onShift,
          }
        : attendanceDays.length > 0
          ? {
              present: attendanceDays[attendanceDays.length - 1]!.present,
              absent: attendanceDays[attendanceDays.length - 1]!.absent,
              onShift: attendanceDays[attendanceDays.length - 1]!.onShift,
            }
          : null;

      setState({
        loading: false,
        error: null,
        moneyIn,
        moneyOut,
        net,
        moneyInGrowthPct: pctChange(moneyIn, prevIn),
        netGrowthPct: pctChange(net, prevNet),
        activeGuards: filteredGuards.filter(
          (g) => (g.status ?? "active") !== "inactive",
        ).length,
        siteCount: filteredSites.length,
        incomeBySite,
        attendanceDays,
        attendanceToday,
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to load dashboard analytics.";
      setState({ ...EMPTY, loading: false, error: message });
    }
  }, [activeBranchId, agency?.id, range.from, range.to]);

  useEffect(() => {
    void load();
  }, [load]);

  return state;
}

export function defaultDashboardRange(): DashboardDateRange {
  const to = formatYmd(new Date());
  const from = addDays(to, -29);
  return { from, to };
}

export function presetRange(
  preset: "7d" | "30d" | "month",
): DashboardDateRange {
  const to = formatYmd(new Date());
  if (preset === "7d") return { from: addDays(to, -6), to };
  if (preset === "30d") return { from: addDays(to, -29), to };
  const now = new Date();
  const from = formatYmd(new Date(now.getFullYear(), now.getMonth(), 1));
  return { from, to };
}
