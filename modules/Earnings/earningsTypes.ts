export type EarningsReportPeriod =
  | "monthly"
  | "bimonthly"
  | "halfyearly"
  | "yearly";

export type YearMonth = { year: number; month: number };

export type SiteEarningsGuardCost = {
  guardId: string;
  guardName: string;
  employeeCode: string;
  gender: string;
  /** Sum of payroll gross (or salary estimate) across the period. */
  amount: number;
  source: "payroll" | "salary_estimate";
};

export type SiteEarningsReliefCost = {
  reliefRequestId: string;
  dutyDate: string;
  amount: number;
  assigneeName: string;
  note: string;
};

export type SiteEarningsRow = {
  siteId: string;
  siteName: string;
  clientName: string;
  assignedMale: number;
  assignedFemale: number;
  assignedOther: number;
  clientRateMaleMonthly: number;
  clientRateFemaleMonthly: number;
  /** Client billing for the full period (monthly rates × months × headcount). */
  moneyIn: number;
  moneyOutGuards: number;
  moneyOutRelief: number;
  moneyOutExpenses: number;
  moneyOut: number;
  net: number;
  result: "profit" | "loss" | "break_even";
};

export type EarningsSummary = {
  from: YearMonth;
  to: YearMonth;
  monthCount: number;
  moneyIn: number;
  moneyOut: number;
  moneyOutExpenses: number;
  moneyOutUnattributedExpenses: number;
  net: number;
  result: "profit" | "loss" | "break_even";
  sites: SiteEarningsRow[];
};

export type SiteEarningsExpenseCost = {
  expenseId: string;
  date: string;
  category: string;
  amount: number;
  guardName: string;
  note: string;
};

export type SiteEarningsDetail = {
  site: SiteEarningsRow;
  from: YearMonth;
  to: YearMonth;
  guards: SiteEarningsGuardCost[];
  relief: SiteEarningsReliefCost[];
  expenses: SiteEarningsExpenseCost[];
  note: string;
};

export function marginResult(net: number): "profit" | "loss" | "break_even" {
  if (net > 0.005) return "profit";
  if (net < -0.005) return "loss";
  return "break_even";
}

export function roundMoney(n: number): number {
  return Math.round((Number(n) || 0) * 100) / 100;
}

/** Inclusive list of calendar months from → to. */
export function listMonthsInclusive(
  from: YearMonth,
  to: YearMonth
): YearMonth[] {
  const months: YearMonth[] = [];
  let y = from.year;
  let m = from.month;
  const endKey = to.year * 12 + to.month;
  while (y * 12 + m <= endKey) {
    months.push({ year: y, month: m });
    m += 1;
    if (m > 12) {
      m = 1;
      y += 1;
    }
  }
  return months;
}

/** Resolve report window ending at year/month. */
export function resolveReportRange(
  period: EarningsReportPeriod,
  year: number,
  month: number
): { from: YearMonth; to: YearMonth } {
  const to = { year, month };
  if (period === "monthly") {
    return { from: { ...to }, to };
  }
  if (period === "bimonthly") {
    let m = month - 1;
    let y = year;
    if (m < 1) {
      m += 12;
      y -= 1;
    }
    return { from: { year: y, month: m }, to };
  }
  if (period === "halfyearly") {
    let m = month - 5;
    let y = year;
    while (m < 1) {
      m += 12;
      y -= 1;
    }
    return { from: { year: y, month: m }, to };
  }
  // yearly — 12 months ending at selected month
  let m = month - 11;
  let y = year;
  while (m < 1) {
    m += 12;
    y -= 1;
  }
  return { from: { year: y, month: m }, to };
}

export function earningsSummaryToCsv(summary: EarningsSummary): string {
  const header = [
    "Site",
    "Client",
    "Assigned Male",
    "Assigned Female",
    "Assigned Other",
    "Male Rate",
    "Female Rate",
    "Money In",
    "Guard Pay Out",
    "Relief Bonus Out",
    "Expenses Out",
    "Total Out",
    "Net",
    "Result",
  ];
  const rows = summary.sites.map((s) => [
    s.siteName,
    s.clientName,
    String(s.assignedMale),
    String(s.assignedFemale),
    String(s.assignedOther),
    String(s.clientRateMaleMonthly),
    String(s.clientRateFemaleMonthly),
    String(s.moneyIn),
    String(s.moneyOutGuards),
    String(s.moneyOutRelief),
    String(s.moneyOutExpenses),
    String(s.moneyOut),
    String(s.net),
    s.result,
  ]);
  const totals = [
    "TOTAL",
    "",
    "",
    "",
    "",
    "",
    "",
    String(summary.moneyIn),
    "",
    "",
    String(summary.moneyOutExpenses),
    String(summary.moneyOut),
    String(summary.net),
    summary.result,
  ];
  const escape = (cell: string) => {
    if (/[",\n]/.test(cell)) return `"${cell.replace(/"/g, '""')}"`;
    return cell;
  };
  return [header, ...rows, totals]
    .map((r) => r.map(escape).join(","))
    .join("\n");
}
