import { useCallback, useEffect, useState } from "react";

import { useSiteList } from "../sites";
import { useBranchContext } from "../branches";
import { fetchAgencyAttendanceDay } from "./attendanceApi";
import type { AttendanceRecord, AttendanceStats } from "./attendanceTypes";

function todayIstDateKey(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

const EMPTY_STATS: AttendanceStats = {
  presentToday: 0,
  absentToday: 0,
  onShift: 0,
};

export function useAgencyAttendance() {
  const { sites, isLoading: sitesLoading, error: sitesError } = useSiteList();
  const { activeBranchId } = useBranchContext();
  const [date, setDate] = useState(todayIstDateKey);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [stats, setStats] = useState<AttendanceStats>(EMPTY_STATS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (selectedDate: string, branchId: string | null) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchAgencyAttendanceDay(selectedDate, branchId);
      setRecords(data.records ?? []);
      setStats(data.stats ?? EMPTY_STATS);
    } catch (err: unknown) {
      const e = err as { message?: string };
      setRecords([]);
      setStats(EMPTY_STATS);
      setError(e.message ?? "Failed to load attendance.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(date, activeBranchId);
  }, [date, activeBranchId, load]);

  return {
    date,
    setDate,
    records,
    stats,
    sites: sites.map((site) => ({ siteId: site.id, siteName: site.siteName })),
    isLoading: isLoading || sitesLoading,
    error: error ?? (sitesError || null),
    refresh: () => load(date, activeBranchId),
  };
}
