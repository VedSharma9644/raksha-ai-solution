import { useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { APP_ROUTES } from "../app/routePaths";
import {
  AttendanceListScreen,
  useAgencyAttendance,
} from "../features/attendance";
import { useGuardList } from "../features/guards";

function safeReturnPath(returnTo: string | null): string | null {
  if (!returnTo) return null;
  // Only allow in-app absolute paths (no open redirects).
  if (!returnTo.startsWith("/") || returnTo.startsWith("//")) return null;
  return returnTo;
}

export function AttendancePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {
    date,
    setDate,
    records,
    stats,
    sites,
    isLoading,
    error,
    refresh,
  } = useAgencyAttendance();
  const { guards, isLoading: guardsLoading } = useGuardList();

  const guardOptions = guards.map((g) => ({
    id: g.id,
    label: [g.fullName, g.employeeCode].filter(Boolean).join(" · "),
  }));

  const reviewPrefill = useMemo(() => {
    const guardId = searchParams.get("guardId")?.trim() || undefined;
    const yearRaw = searchParams.get("year");
    const monthRaw = searchParams.get("month");
    const year = yearRaw != null ? Number(yearRaw) : undefined;
    const month = monthRaw != null ? Number(monthRaw) : undefined;
    return {
      guardId,
      year:
        year != null && Number.isInteger(year) ? year : undefined,
      month:
        month != null &&
        Number.isInteger(month) &&
        month >= 1 &&
        month <= 12
          ? month
          : undefined,
    };
  }, [searchParams]);

  const returnTo = safeReturnPath(searchParams.get("returnTo"));
  const fromPayroll = Boolean(returnTo?.startsWith("/payroll"));

  return (
    <AttendanceListScreen
      records={records}
      stats={stats}
      sites={sites}
      guards={guardOptions}
      dateFilter={date}
      onDateFilterChange={setDate}
      isLoading={isLoading || guardsLoading}
      error={error}
      onCorrectionSaved={refresh}
      initialReviewGuardId={reviewPrefill.guardId}
      initialReviewYear={reviewPrefill.year}
      initialReviewMonth={reviewPrefill.month}
      backLabel={
        fromPayroll ? "Back to payroll" : "Back to manage schedule"
      }
      onBack={() => navigate(returnTo || APP_ROUTES.manageSchedule)}
    />
  );
}
