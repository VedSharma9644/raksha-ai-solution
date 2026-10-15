/**
 * Full money-out module for backends (firebase-admin).
 * Frontends must use ./client.ts via the Vite alias.
 */
export * from "./client";

export {
  listEmployeeAdvances,
  getEmployeeAdvance,
  createEmployeeAdvance,
  voidEmployeeAdvance,
  recordAdvanceCashRepayment,
  listPendingAdvanceDeductionsForGuardMonth,
  sumPendingAdvanceDeductionsForGuardMonth,
  applyAdvanceDeductionsForPayrollRun,
  type PendingAdvanceDeductionRow,
} from "./advanceService";

export {
  listAgencyExpenses,
  getAgencyExpense,
  createAgencyExpense,
  updateAgencyExpense,
  voidAgencyExpense,
  sumExpensesForPeriod,
} from "./expenseService";
