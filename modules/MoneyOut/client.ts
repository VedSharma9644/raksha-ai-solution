/**
 * Browser-safe money-out exports (no firebase-admin).
 */
export {
  EMPLOYEE_ADVANCES_COLLECTION,
  AGENCY_EXPENSES_COLLECTION,
  EXPENSE_CATEGORY_OPTIONS,
  roundMoney,
  newId,
  expenseCategoryLabel,
  splitEqualInstallments,
  addMonths,
  firstRecoveryMonth,
  isValidRecoveryStartMonth,
  recoveryStartOptions,
  buildInstallmentSchedule,
  recomputeAdvanceBalances,
  type AdvanceRecoveryMode,
  type AdvanceStatus,
  type InstallmentStatus,
  type RepaymentMethod,
  type ExpenseCategory,
  type ExpenseStatus,
  type AdvanceInstallment,
  type AdvanceRepayment,
  type EmployeeAdvance,
  type AgencyExpense,
} from "./moneyOutTypes";
