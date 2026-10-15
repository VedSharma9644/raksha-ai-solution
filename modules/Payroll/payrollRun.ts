import type { PayrollGeneralSettings } from "./payrollSettings";

export const PAYROLL_RUNS_COLLECTION = "payrollRuns";

export type PayrollRunStatus = "finalized" | "paid";
export type PayrollLineStatus = "unpaid" | "paid";

export interface PayrollPeriod {
  /** Inclusive start YYYY-MM-DD */
  startDate: string;
  /** Inclusive end YYYY-MM-DD */
  endDate: string;
  /** Display label e.g. "April 2026" */
  label: string;
  year: number;
  month: number;
}

export interface PayrollDayBreakdown {
  presentDays: number;
  halfDays: number;
  missedDays: number;
  leaveDays: number;
  weeklyOffDays: number;
  /** Sum of day credits used for pay (e.g. full=1, half=0.5). */
  payableDays: number;
}

export interface PayrollLine {
  id: string;
  runId: string;
  agencyId: string;
  guardId: string;
  guardName: string;
  employeeCode: string;
  monthlySalary: number;
  dayRate: number;
  breakdown: PayrollDayBreakdown;
  /** Extra-duty relief bonuses for the period (₹). */
  reliefBonusTotal: number;
  /** Attendance pay + relief bonuses. */
  grossPay: number;
  /** Advance recoveries deducted this period (₹). */
  advanceDeductionTotal: number;
  /** grossPay − advanceDeductionTotal (floored at 0). */
  netPay: number;
  status: PayrollLineStatus;
  notes?: string;
}

export interface PayrollRun {
  id: string;
  agencyId: string;
  period: PayrollPeriod;
  status: PayrollRunStatus;
  settingsSnapshot: PayrollGeneralSettings;
  guardCount: number;
  totalGross: number;
  createdAt?: unknown;
  updatedAt?: unknown;
  paidAt?: unknown;
}

export interface GuardMonthAttendanceStats {
  presentDays: number;
  halfDays: number;
  missedDays: number;
  leaveDays: number;
  weeklyOffDays: number;
  /** Calendar day statuses for the period (optional detail). */
  calendarDays?: Array<{ date: string; status: string }>;
}

/** One approved relief duty assigned to a guard, with optional bonus amount. */
export type ReliefDutyBonusRow = {
  reliefRequestId: string;
  dutyDate: string;
  siteName: string;
  postName: string;
  shiftFrom: string;
  shiftTo: string;
  requesterName: string;
  method: string;
  /** Saved bonus amount (0 if not entered yet). */
  amount: number;
};
