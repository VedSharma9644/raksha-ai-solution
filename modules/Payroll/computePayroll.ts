import type { PayrollGeneralSettings, WeekdayId } from "./payrollSettings";
import { WEEKDAY_IDS } from "./payrollSettings";
import type {
  GuardMonthAttendanceStats,
  PayrollDayBreakdown,
  PayrollLine,
  PayrollPeriod,
} from "./payrollRun";

/**
 * Pure civil-calendar helpers (UTC). Keep browser-safe — this file is exported
 * via `client.ts` and must NOT import `@raskha/attendance` (firebase-admin).
 */
const IST_TIME_ZONE = "Asia/Kolkata";

const WEEKDAY_TO_JS: Record<WeekdayId, number> = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

export function parseSalaryAmount(raw: string | undefined | null): number | null {
  if (raw == null) return null;
  const cleaned = String(raw).replace(/[^\d.]/g, "");
  if (!cleaned) return null;
  const n = Number(cleaned);
  if (!Number.isFinite(n) || n <= 0) return null;
  return Math.round(n * 100) / 100;
}

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

/** Gregorian days-in-month — host-TZ independent. */
function daysInCalendarMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function addDaysToDutyDate(dateKey: string, days: number): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  const utc = new Date(Date.UTC(y, m - 1, d + days, 6, 30));
  return `${utc.getUTCFullYear()}-${pad2(utc.getUTCMonth() + 1)}-${pad2(utc.getUTCDate())}`;
}

/** JS getDay()-style weekday (0=Sun … 6=Sat) for a YYYY-MM-DD civil date. */
function jsWeekdayFromDutyDate(dutyDate: string): number {
  const [y, m, d] = dutyDate.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d, 6, 30)).getUTCDay();
}

function formatIstMonthLabel(year: number, month: number): string {
  return new Date(Date.UTC(year, month - 1, 1, 12)).toLocaleDateString("en-IN", {
    timeZone: IST_TIME_ZONE,
    month: "long",
    year: "numeric",
  });
}

function daysBetweenInclusive(start: string, end: string): number {
  const [ys, ms, ds] = start.split("-").map(Number);
  const [ye, me, de] = end.split("-").map(Number);
  const a = Date.UTC(ys, ms - 1, ds);
  const b = Date.UTC(ye, me - 1, de);
  return Math.floor((b - a) / 86400000) + 1;
}

/**
 * Pay period for a calendar year/month using settings.payCycleStartDay.
 * When start day is 1 → that calendar month.
 * When start day is N → from Nth of month through (N-1)th of next month.
 */
export function resolvePayPeriod(
  year: number,
  month: number,
  payCycleStartDay: number
): PayrollPeriod {
  const startDay = Math.min(28, Math.max(1, Math.round(payCycleStartDay) || 1));
  const monthLabel = formatIstMonthLabel(year, month);

  if (startDay === 1) {
    const daysInMonth = daysInCalendarMonth(year, month);
    return {
      year,
      month,
      label: monthLabel,
      startDate: `${year}-${pad2(month)}-01`,
      endDate: `${year}-${pad2(month)}-${pad2(daysInMonth)}`,
    };
  }

  const startDate = `${year}-${pad2(month)}-${pad2(startDay)}`;
  let endYear = year;
  let endMonth = month + 1;
  if (endMonth > 12) {
    endMonth = 1;
    endYear += 1;
  }
  const endDay = startDay - 1;
  const endDate = `${endYear}-${pad2(endMonth)}-${pad2(endDay)}`;

  return {
    year,
    month,
    label: monthLabel,
    startDate,
    endDate,
  };
}

/** Count how many times the given weekdays occur in [startDate, endDate]. */
export function countWeekdaysInPeriod(
  startDate: string,
  endDate: string,
  weekdays: string[]
): number {
  const wanted = new Set(
    weekdays.filter((d): d is WeekdayId =>
      (WEEKDAY_IDS as readonly string[]).includes(d)
    )
  );
  if (wanted.size === 0) return 0;

  let count = 0;
  let cursor = startDate;
  while (cursor <= endDate) {
    const jsDay = jsWeekdayFromDutyDate(cursor);
    for (const id of wanted) {
      if (WEEKDAY_TO_JS[id] === jsDay) {
        count += 1;
        break;
      }
    }
    cursor = addDaysToDutyDate(cursor, 1);
  }
  return count;
}

export function halfDayCredit(
  settings: Pick<
    PayrollGeneralSettings,
    "halfShiftDeduction" | "halfShiftCustomPercent"
  >
): number {
  switch (settings.halfShiftDeduction) {
    case "full_day":
      return 0;
    case "custom_percent": {
      const pct = Math.min(100, Math.max(0, settings.halfShiftCustomPercent));
      // Custom % is how much pay is *cut* → credit = 1 - cut
      return Math.max(0, 1 - pct / 100);
    }
    case "half_day":
    default:
      return 0.5;
  }
}

export function computeDayRate(params: {
  monthlySalary: number;
  settings: PayrollGeneralSettings;
  period: PayrollPeriod;
  expectedWeeklyOffs: number;
  paidLeaveDays: number;
}): number {
  const daysInPeriod = daysBetweenInclusive(
    params.period.startDate,
    params.period.endDate
  );

  if (params.settings.daySalaryMethod === "working_days") {
    const working = Math.max(
      1,
      daysInPeriod - params.expectedWeeklyOffs - params.paidLeaveDays
    );
    return Math.round((params.monthlySalary / working) * 100) / 100;
  }

  return Math.round((params.monthlySalary / Math.max(1, daysInPeriod)) * 100) / 100;
}

export function computePayableDays(
  stats: GuardMonthAttendanceStats,
  settings: PayrollGeneralSettings
): PayrollDayBreakdown {
  const halfCredit = halfDayCredit(settings);
  // presentDays from history includes half days; isolate full days
  const fullDays = Math.max(0, stats.presentDays - stats.halfDays);
  const payableDays =
    Math.round(
      (fullDays +
        stats.halfDays * halfCredit +
        stats.leaveDays) *
        100
    ) / 100;

  return {
    presentDays: fullDays,
    halfDays: stats.halfDays,
    missedDays: stats.missedDays,
    leaveDays: stats.leaveDays,
    weeklyOffDays: stats.weeklyOffDays,
    payableDays,
  };
}

export interface ComputeGuardPayrollLineInput {
  guardId: string;
  guardName: string;
  employeeCode: string;
  salaryRaw: string;
  weeklyOffDays: string[];
  agencyWeeklyOffCount: number;
  settings: PayrollGeneralSettings;
  period: PayrollPeriod;
  stats: GuardMonthAttendanceStats;
  /** Extra-duty relief bonuses already entered for this period. */
  reliefBonusTotal?: number;
  /** Pending advance recoveries for this period. */
  advanceDeductionTotal?: number;
}

/**
 * Recalculate day rate + gross when an admin edits monthly salary on a payroll line.
 * Day rate scales with salary (same attendance / settings as the original line).
 */
export function applyAdvanceDeduction(
  grossPay: number,
  advanceDeductionTotal: number
): { advanceDeductionTotal: number; netPay: number } {
  const gross = Math.round(Math.max(0, Number(grossPay) || 0) * 100) / 100;
  const requested =
    Math.round(Math.max(0, Number(advanceDeductionTotal) || 0) * 100) / 100;
  const applied = Math.min(gross, requested);
  return {
    advanceDeductionTotal: applied,
    netPay: Math.round((gross - applied) * 100) / 100,
  };
}

export function applyMonthlySalaryToLine(
  line: Pick<
    PayrollLine,
    | "monthlySalary"
    | "dayRate"
    | "breakdown"
    | "reliefBonusTotal"
    | "advanceDeductionTotal"
  >,
  monthlySalaryRaw: number | string
): {
  monthlySalary: number;
  dayRate: number;
  grossPay: number;
  advanceDeductionTotal: number;
  netPay: number;
} {
  const monthlySalary =
    typeof monthlySalaryRaw === "number"
      ? Math.round(monthlySalaryRaw * 100) / 100
      : parseSalaryAmount(monthlySalaryRaw);

  if (monthlySalary == null || monthlySalary <= 0) {
    throw Object.assign(
      new Error("Monthly salary must be a positive number."),
      { statusCode: 400 }
    );
  }

  const previous = line.monthlySalary;
  const dayRate =
    previous > 0
      ? Math.round(line.dayRate * (monthlySalary / previous) * 100) / 100
      : line.dayRate;
  const attendancePay =
    Math.round(dayRate * line.breakdown.payableDays * 100) / 100;
  const reliefBonusTotal = Number(line.reliefBonusTotal) || 0;
  const grossPay =
    Math.round((attendancePay + reliefBonusTotal) * 100) / 100;
  const deducted = applyAdvanceDeduction(
    grossPay,
    Number(line.advanceDeductionTotal) || 0
  );

  return {
    monthlySalary,
    dayRate,
    grossPay,
    advanceDeductionTotal: deducted.advanceDeductionTotal,
    netPay: deducted.netPay,
  };
}

export function computeGuardPayrollLine(
  input: ComputeGuardPayrollLineInput
): Omit<PayrollLine, "id" | "runId" | "agencyId" | "status"> | null {
  const monthlySalary = parseSalaryAmount(input.salaryRaw);
  if (monthlySalary == null) return null;

  let offs = [...input.weeklyOffDays];
  if (
    input.agencyWeeklyOffCount > 0 &&
    offs.length > input.agencyWeeklyOffCount
  ) {
    offs = offs.slice(0, input.agencyWeeklyOffCount);
  }

  const expectedWeeklyOffs =
    offs.length > 0
      ? countWeekdaysInPeriod(
          input.period.startDate,
          input.period.endDate,
          offs
        )
      : Math.round(
          (daysBetweenInclusive(input.period.startDate, input.period.endDate) /
            7) *
            Math.max(0, input.agencyWeeklyOffCount)
        );

  const dayRate = computeDayRate({
    monthlySalary,
    settings: input.settings,
    period: input.period,
    expectedWeeklyOffs,
    paidLeaveDays: input.stats.leaveDays,
  });

  const breakdown = computePayableDays(input.stats, input.settings);
  const reliefBonusTotal =
    Math.round(Math.max(0, Number(input.reliefBonusTotal) || 0) * 100) / 100;
  const attendancePay =
    Math.round(dayRate * breakdown.payableDays * 100) / 100;
  const grossPay =
    Math.round((attendancePay + reliefBonusTotal) * 100) / 100;
  const deducted = applyAdvanceDeduction(
    grossPay,
    Number(input.advanceDeductionTotal) || 0
  );

  return {
    guardId: input.guardId,
    guardName: input.guardName,
    employeeCode: input.employeeCode,
    monthlySalary,
    dayRate,
    breakdown,
    reliefBonusTotal,
    grossPay,
    advanceDeductionTotal: deducted.advanceDeductionTotal,
    netPay: deducted.netPay,
  };
}

export function linesToCsv(lines: PayrollLine[]): string {
  const header = [
    "Employee Code",
    "Guard Name",
    "Monthly Salary",
    "Day Rate",
    "Present (full)",
    "Half",
    "Missed",
    "Leave",
    "Weekly Offs",
    "Payable Days",
    "Relief Bonus",
    "Gross Pay",
    "Advance Deduction",
    "Net Pay",
    "Status",
  ];
  const rows = lines.map((l) => [
    l.employeeCode,
    l.guardName,
    String(l.monthlySalary),
    String(l.dayRate),
    String(l.breakdown.presentDays),
    String(l.breakdown.halfDays),
    String(l.breakdown.missedDays),
    String(l.breakdown.leaveDays),
    String(l.breakdown.weeklyOffDays),
    String(l.breakdown.payableDays),
    String(l.reliefBonusTotal ?? 0),
    String(l.grossPay),
    String(l.advanceDeductionTotal ?? 0),
    String(l.netPay ?? l.grossPay),
    l.status,
  ]);
  const escape = (cell: string) => {
    if (/[",\n]/.test(cell)) return `"${cell.replace(/"/g, '""')}"`;
    return cell;
  };
  return [header, ...rows].map((r) => r.map(escape).join(",")).join("\n");
}
