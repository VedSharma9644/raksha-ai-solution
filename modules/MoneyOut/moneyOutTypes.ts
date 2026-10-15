export const EMPLOYEE_ADVANCES_COLLECTION = "employeeAdvances";
export const AGENCY_EXPENSES_COLLECTION = "agencyExpenses";

export type AdvanceRecoveryMode = "next_payroll" | "emi" | "cash";
export type AdvanceStatus = "open" | "settled" | "void";
export type InstallmentStatus = "pending" | "deducted" | "waived";
export type RepaymentMethod = "cash" | "payroll";

export type ExpenseCategory =
  | "transport"
  | "accommodation"
  | "food"
  | "miscellaneous";

export type ExpenseStatus = "active" | "void";

export type AdvanceInstallment = {
  id: string;
  year: number;
  month: number;
  amount: number;
  status: InstallmentStatus;
  payrollRunId?: string | null;
};

export type AdvanceRepayment = {
  id: string;
  date: string;
  amount: number;
  method: RepaymentMethod;
  note?: string;
  payrollRunId?: string | null;
};

export type EmployeeAdvance = {
  id: string;
  agencyId: string;
  guardId: string;
  guardName: string;
  amount: number;
  givenOn: string;
  purpose: string;
  recoveryMode: AdvanceRecoveryMode;
  emiMonths: number;
  /** First payroll month for EMI / next_payroll recovery. */
  recoveryStartYear?: number;
  recoveryStartMonth?: number;
  installmentAmount: number;
  installments: AdvanceInstallment[];
  repayments: AdvanceRepayment[];
  recoveredTotal: number;
  outstanding: number;
  status: AdvanceStatus;
  createdByUid: string;
  createdAt?: unknown;
  updatedAt?: unknown;
};

export type AgencyExpense = {
  id: string;
  agencyId: string;
  date: string;
  amount: number;
  category: ExpenseCategory;
  siteId: string;
  siteName: string;
  guardId: string;
  guardName: string;
  note: string;
  status: ExpenseStatus;
  createdByUid: string;
  createdAt?: unknown;
  updatedAt?: unknown;
};

export const EXPENSE_CATEGORY_OPTIONS: Array<{
  value: ExpenseCategory;
  label: string;
}> = [
  { value: "transport", label: "Transport" },
  { value: "accommodation", label: "Accommodation" },
  { value: "food", label: "Food" },
  { value: "miscellaneous", label: "Miscellaneous" },
];

export function roundMoney(n: number): number {
  return Math.round((Number(n) || 0) * 100) / 100;
}

export function newId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

export function expenseCategoryLabel(category: ExpenseCategory): string {
  return (
    EXPENSE_CATEGORY_OPTIONS.find((o) => o.value === category)?.label ??
    category
  );
}

/** Split total into N equal parts; remainder on last installment. */
export function splitEqualInstallments(
  total: number,
  months: number
): number[] {
  const n = Math.max(1, Math.floor(months));
  const amount = roundMoney(total);
  if (amount <= 0) return Array.from({ length: n }, () => 0);
  const base = Math.floor((amount / n) * 100) / 100;
  const parts = Array.from({ length: n }, () => base);
  const allocated = roundMoney(base * n);
  parts[n - 1] = roundMoney(parts[n - 1] + (amount - allocated));
  return parts;
}

export function addMonths(
  year: number,
  month: number,
  delta: number
): { year: number; month: number } {
  const idx = year * 12 + (month - 1) + delta;
  return {
    year: Math.floor(idx / 12),
    month: (idx % 12) + 1,
  };
}

/** First recovery month = calendar month of givenOn (shown on that month’s payroll). */
export function firstRecoveryMonth(givenOn: string): {
  year: number;
  month: number;
} {
  const [y, m] = givenOn.split("-").map(Number);
  if (Number.isFinite(y) && Number.isFinite(m)) {
    return { year: y, month: Math.min(12, Math.max(1, m)) };
  }
  return istYearMonth(new Date());
}

/** Current year/month in Asia/Kolkata (Cloud Run host is UTC). */
function istYearMonth(now: Date): { year: number; month: number } {
  const key = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
  }).format(now);
  const [year, month] = key.split("-").map(Number);
  return { year, month };
}

/** Allowed EMI / next-payroll start: this IST calendar month through +5 months. */
export function isValidRecoveryStartMonth(
  year: number,
  month: number,
  now: Date = new Date()
): boolean {
  if (!Number.isFinite(year) || !Number.isFinite(month)) return false;
  if (month < 1 || month > 12) return false;
  const current = istYearMonth(now);
  const currentIdx = current.year * 12 + (current.month - 1);
  const targetIdx = year * 12 + (month - 1);
  const delta = targetIdx - currentIdx;
  return delta >= 0 && delta <= 5;
}

export function recoveryStartOptions(
  now: Date = new Date()
): Array<{ year: number; month: number; label: string; value: string }> {
  const names = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const options: Array<{
    year: number;
    month: number;
    label: string;
    value: string;
  }> = [];
  const current = istYearMonth(now);
  for (let offset = 0; offset <= 5; offset += 1) {
    const idx = current.year * 12 + (current.month - 1) + offset;
    const year = Math.floor(idx / 12);
    const month = (idx % 12) + 1;
    const monthName = names[month - 1] ?? String(month);
    options.push({
      year,
      month,
      value: `${year}-${month}`,
      label:
        offset === 0
          ? `${monthName} ${year} (this month)`
          : `${monthName} ${year}`,
    });
  }
  return options;
}

export function buildInstallmentSchedule(params: {
  amount: number;
  recoveryMode: AdvanceRecoveryMode;
  emiMonths: number;
  givenOn: string;
  startYear?: number;
  startMonth?: number;
}): {
  installments: AdvanceInstallment[];
  installmentAmount: number;
  emiMonths: number;
} {
  const amount = roundMoney(Math.max(0, params.amount));
  const start =
    params.startYear != null && params.startMonth != null
      ? { year: params.startYear, month: params.startMonth }
      : firstRecoveryMonth(params.givenOn);

  if (params.recoveryMode === "cash" || amount <= 0) {
    return { installments: [], installmentAmount: 0, emiMonths: 0 };
  }

  if (params.recoveryMode === "next_payroll") {
    return {
      installments: [
        {
          id: newId("inst"),
          year: start.year,
          month: start.month,
          amount,
          status: "pending",
          payrollRunId: null,
        },
      ],
      installmentAmount: amount,
      emiMonths: 1,
    };
  }

  const emiMonths = Math.max(1, Math.min(36, Math.floor(params.emiMonths) || 1));
  const parts = splitEqualInstallments(amount, emiMonths);
  const installments = parts.map((part, i) => {
    const ym = addMonths(start.year, start.month, i);
    return {
      id: newId("inst"),
      year: ym.year,
      month: ym.month,
      amount: part,
      status: "pending" as const,
      payrollRunId: null,
    };
  });

  return {
    installments,
    installmentAmount: parts[0] ?? 0,
    emiMonths,
  };
}

/**
 * Recovered = sum of repayment rows (cash + payroll).
 * Deducted installments are mirrored by payroll repayments when applied.
 */
export function recomputeAdvanceBalances(
  amount: number,
  repayments: AdvanceRepayment[],
  _installments?: AdvanceInstallment[]
): { recoveredTotal: number; outstanding: number; status: AdvanceStatus } {
  void _installments;
  const recoveredTotal = roundMoney(
    repayments.reduce((s, r) => s + (Number(r.amount) || 0), 0)
  );
  const outstanding = roundMoney(Math.max(0, amount - recoveredTotal));
  return {
    recoveredTotal,
    outstanding,
    status: outstanding <= 0.005 ? "settled" : "open",
  };
}
