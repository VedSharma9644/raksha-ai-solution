import { listAttendanceHistory } from "@raskha/attendance";

import type { GuardMonthAttendanceStats } from "./payrollRun";

/** Month attendance stats used when computing payroll lines. */
export async function getGuardMonthAttendanceStats(params: {
  guardId: string;
  agencyId: string;
  year: number;
  month: number;
  shiftFrom?: string;
  shiftTo?: string;
}): Promise<GuardMonthAttendanceStats> {
  const history = await listAttendanceHistory({
    guardId: params.guardId,
    agencyId: params.agencyId,
    year: params.year,
    month: params.month,
    shiftFrom: params.shiftFrom,
    shiftTo: params.shiftTo,
  });

  return {
    presentDays: history.stats.presentDays,
    halfDays: history.stats.halfDays,
    missedDays: history.stats.missedDays,
    leaveDays: history.stats.leaveDays,
    weeklyOffDays: history.stats.weeklyOffDays,
    calendarDays: history.calendarDays.map((d) => ({
      date: `${params.year}-${String(params.month).padStart(2, "0")}-${String(d.day).padStart(2, "0")}`,
      status: d.status,
    })),
  };
}
