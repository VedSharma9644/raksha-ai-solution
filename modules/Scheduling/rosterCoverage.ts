import type { DayOfWeek, GuardShiftAssignment } from "./shiftAssignment";

/** Minimal site shape needed for coverage checks (avoids coupling to site-management). */
export type CoverageSiteShift = {
  id: string;
  label?: string;
  requiredGuards?: number;
};

export type CoverageSite = {
  id: string;
  siteName: string;
  status?: string;
  shiftConfig?: {
    shifts?: CoverageSiteShift[];
  } | null;
};

const IST_TIME_ZONE = "Asia/Kolkata";
const JS_TO_DOW: DayOfWeek[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

export type RosterCoverageGap = {
  dutyDate: string;
  dayLabel: string;
  shiftId: string;
  shiftLabel: string;
  required: number;
  assigned: number;
  shortBy: number;
};

export type SiteRosterCoverage = {
  siteId: string;
  siteName: string;
  gapCount: number;
  /** Days in the window with at least one unstaffed / understaffed shift. */
  daysWithGaps: number;
  gaps: RosterCoverageGap[];
};

export type RosterCoverageReport = {
  from: string;
  to: string;
  days: number;
  sitesAtRisk: SiteRosterCoverage[];
};

/** Calendar duty date in IST (YYYY-MM-DD). */
export function toDutyDateKey(date: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: IST_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function addDaysToDutyDate(dutyDate: string, offsetDays: number): string {
  const [y, m, d] = dutyDate.split("-").map(Number);
  const utc = new Date(Date.UTC(y, m - 1, d + offsetDays, 6, 30));
  return toDutyDateKey(utc);
}

export function weekdayFromDutyDate(dutyDate: string): DayOfWeek {
  const [y, m, d] = dutyDate.split("-").map(Number);
  const utc = new Date(Date.UTC(y, m - 1, d, 6, 30));
  return JS_TO_DOW[utc.getUTCDay()] ?? "mon";
}

function formatDayLabel(dutyDate: string): string {
  const [y, m, d] = dutyDate.split("-").map(Number);
  const utc = new Date(Date.UTC(y, m - 1, d, 6, 30));
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: IST_TIME_ZONE,
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(utc);
}

export function assignmentCoversDutyDate(
  assignment: Pick<
    GuardShiftAssignment,
    "effectiveFrom" | "effectiveTo" | "recurringDays"
  >,
  dutyDate: string
): boolean {
  const from = String(assignment.effectiveFrom ?? "").trim();
  if (!from || dutyDate < from) {
    return false;
  }
  const to = assignment.effectiveTo ? String(assignment.effectiveTo).trim() : "";
  if (to && dutyDate > to) {
    return false;
  }
  const days = Array.isArray(assignment.recurringDays)
    ? assignment.recurringDays
    : [];
  return days.includes(weekdayFromDutyDate(dutyDate));
}

/**
 * Find understaffed shift-days for one site over [from, from+days-1].
 * A gap is when assigned guards for that shift on that duty date
 * are less than the site's requiredGuards for the slot.
 */
export function findSiteCoverageGaps(params: {
  site: CoverageSite;
  assignments: GuardShiftAssignment[];
  from?: string;
  days?: number;
}): SiteRosterCoverage {
  const from = params.from ?? toDutyDateKey();
  const days = Math.max(1, Math.min(params.days ?? 7, 31));
  const shifts: CoverageSiteShift[] = params.site.shiftConfig?.shifts ?? [];
  const gaps: RosterCoverageGap[] = [];
  const daysHit = new Set<string>();

  if (params.site.status === "inactive" || shifts.length === 0) {
    return {
      siteId: params.site.id,
      siteName: params.site.siteName,
      gapCount: 0,
      daysWithGaps: 0,
      gaps: [],
    };
  }

  for (let i = 0; i < days; i++) {
    const dutyDate = addDaysToDutyDate(from, i);
    for (const shift of shifts) {
      const required = Math.max(1, Number(shift.requiredGuards) || 1);
      const assigned = params.assignments.filter(
        (a) =>
          a.shiftId === shift.id &&
          assignmentCoversDutyDate(a, dutyDate)
      ).length;
      if (assigned >= required) {
        continue;
      }
      daysHit.add(dutyDate);
      gaps.push({
        dutyDate,
        dayLabel: formatDayLabel(dutyDate),
        shiftId: shift.id,
        shiftLabel: shift.label || "Duty",
        required,
        assigned,
        shortBy: required - assigned,
      });
    }
  }

  return {
    siteId: params.site.id,
    siteName: params.site.siteName,
    gapCount: gaps.length,
    daysWithGaps: daysHit.size,
    gaps,
  };
}

export function buildAgencyRosterCoverage(params: {
  sites: CoverageSite[];
  assignmentsBySiteId: Record<string, GuardShiftAssignment[]>;
  from?: string;
  days?: number;
}): RosterCoverageReport {
  const from = params.from ?? toDutyDateKey();
  const days = Math.max(1, Math.min(params.days ?? 7, 31));
  const to = addDaysToDutyDate(from, days - 1);
  const sitesAtRisk = params.sites
    .map((site) =>
      findSiteCoverageGaps({
        site,
        assignments: params.assignmentsBySiteId[site.id] ?? [],
        from,
        days,
      })
    )
    .filter((row) => row.gapCount > 0)
    .sort((a, b) => b.gapCount - a.gapCount);

  return { from, to, days, sitesAtRisk };
}

/** Short human summary for banners. */
export function summarizeSiteCoverageGaps(
  coverage: SiteRosterCoverage,
  windowLabel = "the next 7 days"
): string {
  if (coverage.gapCount === 0) {
    return "";
  }
  const empty = coverage.gaps.filter((g) => g.assigned === 0).length;
  if (empty === coverage.gapCount) {
    return `${coverage.gapCount} shift-day${coverage.gapCount === 1 ? "" : "s"} have no guard assigned in ${windowLabel}.`;
  }
  return `${coverage.gapCount} shift-day${coverage.gapCount === 1 ? "" : "s"} are understaffed in ${windowLabel} (${coverage.daysWithGaps} day${coverage.daysWithGaps === 1 ? "" : "s"} affected).`;
}
