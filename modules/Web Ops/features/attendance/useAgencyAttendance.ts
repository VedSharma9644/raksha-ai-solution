import { useCallback, useEffect, useState } from "react";

import { useWebOps } from "../../context/WebOpsContext";
import { useSiteList } from "../sites/useSiteList";
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
  const { activeBranchId, role, assignedSiteIds } = useWebOps();
  const [date, setDate] = useState(todayIstDateKey);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [stats, setStats] = useState<AttendanceStats>(EMPTY_STATS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (selectedDate: string, branchId: string | null) => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchAgencyAttendanceDay(selectedDate, branchId);
        let nextRecords = data.records ?? [];
        if (role === "hr" && assignedSiteIds !== null) {
          const allowed = new Set(assignedSiteIds);
          nextRecords = nextRecords.filter((r) => allowed.has(r.siteId));
        }
        setRecords(nextRecords);
        if (role === "hr" && assignedSiteIds !== null) {
          const presentIds = new Set(nextRecords.map((r) => r.guardId));
          setStats({
            presentToday: presentIds.size,
            absentToday: 0,
            onShift: nextRecords.filter((r) => !r.punchOutTime).length,
          });
        } else {
          setStats(data.stats ?? EMPTY_STATS);
        }
      } catch (err: unknown) {
        const e = err as { message?: string };
        setRecords([]);
        setStats(EMPTY_STATS);
        setError(e.message ?? "Failed to load attendance.");
      } finally {
        setIsLoading(false);
      }
    },
    [role, assignedSiteIds]
  );

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
