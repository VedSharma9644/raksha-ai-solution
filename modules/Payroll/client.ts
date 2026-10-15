/**
 * Browser-safe payroll exports (no firebase-admin).
 * Frontends should import from this entry (Vite aliases @raskha/payroll here).
 */
export {
  PAYROLL_SETTINGS_COLLECTION,
  WEEKDAY_IDS,
  WEEKDAY_LABELS,
  DEFAULT_PAYROLL_GENERAL_SETTINGS,
  defaultPayrollSettings,
  normalizePayrollSettings,
  mergePayrollSettings,
  type WeekdayId,
  type DaySalaryMethod,
  type HalfShiftDeduction,
  type PayrollCoveredRoles,
  type PayrollGeneralSettings,
  type NormalizePayrollSettingsResult,
} from "./payrollSettings";

export {
  PAYROLL_RUNS_COLLECTION,
  type PayrollRunStatus,
  type PayrollLineStatus,
  type PayrollPeriod,
  type PayrollDayBreakdown,
  type PayrollLine,
  type PayrollRun,
  type GuardMonthAttendanceStats,
  type ReliefDutyBonusRow,
} from "./payrollRun";

export {
  parseSalaryAmount,
  resolvePayPeriod,
  countWeekdaysInPeriod,
  halfDayCredit,
  computeDayRate,
  computePayableDays,
  computeGuardPayrollLine,
  applyAdvanceDeduction,
  applyMonthlySalaryToLine,
  linesToCsv,
  type ComputeGuardPayrollLineInput,
} from "./computePayroll";
