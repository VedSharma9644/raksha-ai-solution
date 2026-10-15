import { getFirestore } from "firebase-admin/firestore";
import {
  expenseCategoryLabel,
  listAgencyExpenses,
  sumExpensesForPeriod,
} from "@raskha/money-out";
import { computeSiteClientRevenueMonthly } from "@raskha/site-management";

import {
  earningsSummaryToCsv,
  listMonthsInclusive,
  marginResult,
  resolveReportRange,
  roundMoney,
  type EarningsReportPeriod,
  type EarningsSummary,
  type SiteEarningsDetail,
  type SiteEarningsExpenseCost,
  type SiteEarningsGuardCost,
  type SiteEarningsReliefCost,
  type SiteEarningsRow,
  type YearMonth,
} from "./earningsTypes";

const SITES_COLLECTION = "sites";
const GUARDS_COLLECTION = "guards";
const PAYROLL_RUNS_COLLECTION = "payrollRuns";
const PAYROLL_RELIEF_BONUSES_COLLECTION = "payrollReliefBonuses";
const RELIEF_REQUESTS_COLLECTION = "reliefRequests";

type SiteDoc = {
  id: string;
  agencyId?: string;
  siteName?: string;
  clientName?: string;
  status?: string;
  clientRateMaleMonthly?: number;
  clientRateFemaleMonthly?: number;
};

type GuardDoc = {
  id: string;
  agencyId?: string;
  fullName?: string;
  employeeCode?: string;
  gender?: string;
  salary?: string;
  assignedSiteId?: string;
  status?: string;
};

type PayrollLineDoc = {
  guardId?: string;
  guardName?: string;
  employeeCode?: string;
  grossPay?: number;
};

function parseSalary(raw: string | undefined): number {
  if (raw == null) return 0;
  const n = Number(String(raw).replace(/[^\d.]/g, ""));
  return Number.isFinite(n) && n > 0 ? roundMoney(n) : 0;
}

function genderBucket(gender: string | undefined): "male" | "female" | "other" {
  const g = String(gender ?? "").toLowerCase();
  if (g === "female") return "female";
  if (g === "other") return "other";
  return "male";
}

function validateYearMonth(y: number, m: number): boolean {
  return (
    Number.isInteger(y) &&
    Number.isInteger(m) &&
    m >= 1 &&
    m <= 12 &&
    y >= 2000 &&
    y <= 2100
  );
}

async function loadPayrollGrossByGuard(params: {
  agencyId: string;
  year: number;
  month: number;
}): Promise<Map<string, number> | null> {
  const snap = await getFirestore()
    .collection(PAYROLL_RUNS_COLLECTION)
    .where("agencyId", "==", params.agencyId)
    .get();

  const run = snap.docs.find((d) => {
    const data = d.data() as { period?: { year?: number; month?: number } };
    return (
      data.period?.year === params.year && data.period?.month === params.month
    );
  });
  if (!run) return null;

  const linesSnap = await run.ref.collection("lines").get();
  const map = new Map<string, number>();
  for (const line of linesSnap.docs) {
    const data = line.data() as PayrollLineDoc;
    const guardId = String(data.guardId ?? "");
    if (!guardId) continue;
    map.set(guardId, roundMoney(Number(data.grossPay) || 0));
  }
  return map;
}

async function loadReliefCostsForAgencyMonth(params: {
  agencyId: string;
  year: number;
  month: number;
}): Promise<
  Array<{
    siteId: string;
    siteName: string;
    reliefRequestId: string;
    dutyDate: string;
    amount: number;
    assigneeName: string;
    note: string;
  }>
> {
  const { agencyId, year, month } = params;
  // Gregorian length — host-TZ independent (Cloud Run is UTC).
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const mm = String(month).padStart(2, "0");
  const startDate = `${year}-${mm}-01`;
  const endDate = `${year}-${mm}-${String(daysInMonth).padStart(2, "0")}`;
  const db = getFirestore();

  const bonusSnap = await db
    .collection(PAYROLL_RELIEF_BONUSES_COLLECTION)
    .where("agencyId", "==", agencyId)
    .get();

  const rows: Array<{
    siteId: string;
    siteName: string;
    reliefRequestId: string;
    dutyDate: string;
    amount: number;
    assigneeName: string;
    note: string;
  }> = [];

  for (const bonusDoc of bonusSnap.docs) {
    const bonus = bonusDoc.data() as {
      reliefRequestId?: string;
      dutyDate?: string;
      amount?: number;
      guardId?: string;
      requesterName?: string;
      siteName?: string;
    };
    const dutyDate = String(bonus.dutyDate ?? "");
    if (!dutyDate || dutyDate < startDate || dutyDate > endDate) continue;
    const amount = roundMoney(Number(bonus.amount) || 0);
    if (amount <= 0) continue;

    const reliefRequestId = String(bonus.reliefRequestId ?? "");
    let siteId = "";
    let siteName = String(bonus.siteName ?? "").trim();
    let assigneeName = "";
    let note = String(bonus.requesterName ?? "").trim();

    if (reliefRequestId && !reliefRequestId.startsWith("attOverride_")) {
      const reliefSnap = await db
        .collection(RELIEF_REQUESTS_COLLECTION)
        .doc(reliefRequestId)
        .get();
      if (reliefSnap.exists) {
        const relief = reliefSnap.data() as {
          siteId?: string;
          siteName?: string;
          assignedGuardName?: string;
          guardName?: string;
        };
        siteId = String(relief.siteId ?? "");
        siteName = String(relief.siteName ?? siteName).trim() || siteName;
        assigneeName = String(relief.assignedGuardName ?? "").trim();
        note = String(relief.guardName ?? note).trim() || note;
      }
    } else {
      siteName = siteName || "Admin correction";
      note = note || "Admin-recorded relief";
    }

    rows.push({
      siteId,
      siteName,
      reliefRequestId: reliefRequestId || bonusDoc.id,
      dutyDate,
      amount,
      assigneeName,
      note,
    });
  }

  return rows;
}

function buildSiteRow(params: {
  site: SiteDoc;
  assigned: GuardDoc[];
  monthCount: number;
  moneyOutGuards: number;
  moneyOutRelief: number;
  moneyOutExpenses: number;
}): SiteEarningsRow {
  const maleRate = roundMoney(Number(params.site.clientRateMaleMonthly) || 0);
  const femaleRate = roundMoney(
    Number(params.site.clientRateFemaleMonthly) || 0
  );
  let assignedMale = 0;
  let assignedFemale = 0;
  let assignedOther = 0;
  for (const g of params.assigned) {
    const bucket = genderBucket(g.gender);
    if (bucket === "female") assignedFemale += 1;
    else if (bucket === "other") assignedOther += 1;
    else assignedMale += 1;
  }

  const monthlyIn = computeSiteClientRevenueMonthly({
    maleRate,
    femaleRate,
    maleCount: assignedMale,
    femaleCount: assignedFemale,
    otherCount: assignedOther,
  });
  const moneyIn = roundMoney(monthlyIn * params.monthCount);
  const moneyOutGuards = roundMoney(params.moneyOutGuards);
  const moneyOutRelief = roundMoney(params.moneyOutRelief);
  const moneyOutExpenses = roundMoney(params.moneyOutExpenses);
  const moneyOut = roundMoney(
    moneyOutGuards + moneyOutRelief + moneyOutExpenses
  );
  const net = roundMoney(moneyIn - moneyOut);

  return {
    siteId: params.site.id,
    siteName: params.site.siteName?.trim() || "Site",
    clientName: params.site.clientName?.trim() || "",
    assignedMale,
    assignedFemale,
    assignedOther,
    clientRateMaleMonthly: maleRate,
    clientRateFemaleMonthly: femaleRate,
    moneyIn,
    moneyOutGuards,
    moneyOutRelief,
    moneyOutExpenses,
    moneyOut,
    net,
    result: marginResult(net),
  };
}

export async function buildEarningsSummary(params: {
  agencyId: string;
  from: YearMonth;
  to: YearMonth;
}): Promise<EarningsSummary> {
  const { agencyId, from, to } = params;
  if (!validateYearMonth(from.year, from.month) || !validateYearMonth(to.year, to.month)) {
    throw Object.assign(new Error("Provide a valid year and month range."), {
      statusCode: 400,
    });
  }
  if (from.year * 12 + from.month > to.year * 12 + to.month) {
    throw Object.assign(new Error("from must be on or before to."), {
      statusCode: 400,
    });
  }

  const months = listMonthsInclusive(from, to);
  const db = getFirestore();

  const [sitesSnap, guardsSnap] = await Promise.all([
    db.collection(SITES_COLLECTION).where("agencyId", "==", agencyId).get(),
    db.collection(GUARDS_COLLECTION).where("agencyId", "==", agencyId).get(),
  ]);

  const sites = sitesSnap.docs
    .map((d) => ({ id: d.id, ...d.data() }) as SiteDoc)
    .filter((s) => (s.status ?? "active") !== "inactive");

  const guards = guardsSnap.docs
    .map((d) => ({ id: d.id, ...d.data() }) as GuardDoc)
    .filter((g) => (g.status ?? "active") === "active");

  const guardsBySite = new Map<string, GuardDoc[]>();
  for (const g of guards) {
    const siteId = String(g.assignedSiteId ?? "").trim();
    if (!siteId) continue;
    const list = guardsBySite.get(siteId) ?? [];
    list.push(g);
    guardsBySite.set(siteId, list);
  }

  // Per-month payroll maps (null = no run → salary estimate)
  const payrollByMonth: Array<Map<string, number> | null> = [];
  for (const ym of months) {
    payrollByMonth.push(
      await loadPayrollGrossByGuard({
        agencyId,
        year: ym.year,
        month: ym.month,
      })
    );
  }

  const reliefAll: Array<{
    siteId: string;
    siteName: string;
    amount: number;
  }> = [];
  for (const ym of months) {
    const rows = await loadReliefCostsForAgencyMonth({
      agencyId,
      year: ym.year,
      month: ym.month,
    });
    for (const r of rows) {
      reliefAll.push({
        siteId: r.siteId,
        siteName: r.siteName,
        amount: r.amount,
      });
    }
  }

  const knownSiteIds = new Set(sites.map((s) => s.id));
  const expenseTotals = await sumExpensesForPeriod({
    agencyId,
    fromYear: from.year,
    fromMonth: from.month,
    toYear: to.year,
    toMonth: to.month,
    knownSiteIds,
  });

  const siteRows: SiteEarningsRow[] = [];
  for (const site of sites) {
    const assigned = guardsBySite.get(site.id) ?? [];
    let moneyOutGuards = 0;
    for (let i = 0; i < months.length; i += 1) {
      const payrollMap = payrollByMonth[i];
      for (const g of assigned) {
        if (payrollMap) {
          moneyOutGuards += payrollMap.get(g.id) ?? 0;
        } else {
          moneyOutGuards += parseSalary(g.salary);
        }
      }
    }

    let moneyOutRelief = 0;
    for (const r of reliefAll) {
      if (r.siteId && r.siteId === site.id) {
        moneyOutRelief += r.amount;
      } else if (
        !r.siteId &&
        r.siteName &&
        r.siteName.toLowerCase() === (site.siteName ?? "").trim().toLowerCase()
      ) {
        moneyOutRelief += r.amount;
      }
    }

    const moneyOutExpenses = expenseTotals.bySiteId.get(site.id) ?? 0;

    siteRows.push(
      buildSiteRow({
        site,
        assigned,
        monthCount: months.length,
        moneyOutGuards,
        moneyOutRelief,
        moneyOutExpenses,
      })
    );
  }

  siteRows.sort((a, b) => a.siteName.localeCompare(b.siteName));

  const unattributedExpenses: SiteEarningsExpenseCost[] = (
    expenseTotals.unattributedRows ?? []
  ).map((e) => ({
    expenseId: e.id,
    date: e.date,
    category: expenseCategoryLabel(e.category),
    amount: e.amount,
    guardName: e.guardName || "",
    note: e.note || "",
  }));

  // Prefer line-item sum so Net always matches what we list as general expenses.
  const generalFromRows = roundMoney(
    unattributedExpenses.reduce((s, e) => s + e.amount, 0)
  );
  const moneyOutUnattributedExpenses = roundMoney(
    generalFromRows > 0 ? generalFromRows : expenseTotals.unattributed
  );

  const moneyIn = roundMoney(siteRows.reduce((s, r) => s + r.moneyIn, 0));
  const siteMoneyOut = roundMoney(
    siteRows.reduce((s, r) => s + r.moneyOut, 0)
  );
  // Agency money out = all site costs + agency-level spend (no site / orphan site).
  const moneyOut = roundMoney(siteMoneyOut + moneyOutUnattributedExpenses);
  const net = roundMoney(moneyIn - moneyOut);

  return {
    from,
    to,
    monthCount: months.length,
    moneyIn,
    moneyOut,
    moneyOutExpenses: expenseTotals.total,
    moneyOutUnattributedExpenses,
    unattributedExpenses,
    net,
    result: marginResult(net),
    sites: siteRows,
  };
}

export async function getSiteEarningsDetail(params: {
  agencyId: string;
  siteId: string;
  from: YearMonth;
  to: YearMonth;
}): Promise<SiteEarningsDetail> {
  const summary = await buildEarningsSummary({
    agencyId: params.agencyId,
    from: params.from,
    to: params.to,
  });
  const siteRow = summary.sites.find((s) => s.siteId === params.siteId);
  if (!siteRow) {
    throw Object.assign(new Error("Site not found."), { statusCode: 404 });
  }

  const months = listMonthsInclusive(params.from, params.to);
  const db = getFirestore();
  const guardsSnap = await db
    .collection(GUARDS_COLLECTION)
    .where("agencyId", "==", params.agencyId)
    .get();
  const assigned = guardsSnap.docs
    .map((d) => ({ id: d.id, ...d.data() }) as GuardDoc)
    .filter(
      (g) =>
        (g.status ?? "active") === "active" &&
        String(g.assignedSiteId ?? "") === params.siteId
    );

  const guardCosts = new Map<string, SiteEarningsGuardCost>();
  for (const ym of months) {
    const payrollMap = await loadPayrollGrossByGuard({
      agencyId: params.agencyId,
      year: ym.year,
      month: ym.month,
    });
    for (const g of assigned) {
      const existing = guardCosts.get(g.id);
      const amount = payrollMap
        ? payrollMap.get(g.id) ?? 0
        : parseSalary(g.salary);
      const source = payrollMap ? "payroll" : "salary_estimate";
      if (existing) {
        existing.amount = roundMoney(existing.amount + amount);
        if (source === "salary_estimate") existing.source = "salary_estimate";
      } else {
        guardCosts.set(g.id, {
          guardId: g.id,
          guardName: g.fullName?.trim() || "Guard",
          employeeCode: g.employeeCode?.trim() || "",
          gender: genderBucket(g.gender),
          amount: roundMoney(amount),
          source,
        });
      }
    }
  }

  const relief: SiteEarningsReliefCost[] = [];
  const siteNameLower = siteRow.siteName.toLowerCase();
  for (const ym of months) {
    const rows = await loadReliefCostsForAgencyMonth({
      agencyId: params.agencyId,
      year: ym.year,
      month: ym.month,
    });
    for (const r of rows) {
      const match =
        r.siteId === params.siteId ||
        (!r.siteId && r.siteName.toLowerCase() === siteNameLower);
      if (!match) continue;
      relief.push({
        reliefRequestId: r.reliefRequestId,
        dutyDate: r.dutyDate,
        amount: r.amount,
        assigneeName: r.assigneeName,
        note: r.note,
      });
    }
  }

  const expenseDocs = await listAgencyExpenses({
    agencyId: params.agencyId,
    siteId: params.siteId,
  });
  const fromKey = params.from.year * 12 + params.from.month;
  const toKey = params.to.year * 12 + params.to.month;
  const expenses: SiteEarningsExpenseCost[] = expenseDocs
    .filter((e) => {
      const [y, m] = e.date.split("-").map(Number);
      if (!Number.isInteger(y) || !Number.isInteger(m)) return false;
      const key = y * 12 + m;
      return key >= fromKey && key <= toKey;
    })
    .map((e) => ({
      expenseId: e.id,
      date: e.date,
      category: expenseCategoryLabel(e.category),
      amount: e.amount,
      guardName: e.guardName || "",
      note: e.note || "",
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    site: siteRow,
    from: params.from,
    to: params.to,
    guards: [...guardCosts.values()].sort((a, b) =>
      a.guardName.localeCompare(b.guardName)
    ),
    relief: relief.sort((a, b) => a.dutyDate.localeCompare(b.dutyDate)),
    expenses,
    note: "Client billing (in) vs guard pay, relief bonuses, and logged expenses (out).",
  };
}

export async function exportEarningsCsv(params: {
  agencyId: string;
  period: EarningsReportPeriod;
  year: number;
  month: number;
}): Promise<{ csv: string; filename: string }> {
  const { from, to } = resolveReportRange(
    params.period,
    params.year,
    params.month
  );
  const summary = await buildEarningsSummary({
    agencyId: params.agencyId,
    from,
    to,
  });
  const csv = earningsSummaryToCsv(summary);
  const filename = `earnings-${params.period}-${params.year}-${String(params.month).padStart(2, "0")}.csv`;
  return { csv, filename };
}
