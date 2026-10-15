/**
 * Full payroll module for backends (includes firebase-admin services).
 * Frontends must use ./client.ts via the Vite alias — not this file.
 */
export * from "./client";

export { getGuardMonthAttendanceStats } from "./payrollMonthStats";

export {
  buildPayrollPreview,
  type PayrollPreviewLine,
  type PayrollPreviewResult,
} from "./buildPayrollPreview";

export {
  getPayrollSettings,
  savePayrollSettings,
  listPayrollRuns,
  generatePayrollRun,
  getPayrollRun,
  markPayrollRunPaid,
  updateGuardSalaryForPayroll,
  updatePayrollLine,
  exportPayrollRunCsv,
  getGuardPayrollBreakdown,
  saveGuardReliefBonuses,
  type GuardPayrollBreakdown,
  type AdvanceDeductionRow,
} from "./payrollService";

export {
  listReliefDutiesForGuardMonth,
  sumReliefBonusesForGuardMonth,
  saveReliefBonusAmounts,
  type ReliefDutyBonusRow,
} from "./payrollReliefBonus";
