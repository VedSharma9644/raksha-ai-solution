import { FieldValue, getFirestore } from "firebase-admin/firestore";
import {
  applyAdvanceDeductionsForPayrollRun,
  listPendingAdvanceDeductionsForGuardMonth,
  sumPendingAdvanceDeductionsForGuardMonth,
} from "@raskha/money-out";

import { buildPayrollPreview } from "./buildPayrollPreview";
import {
  applyAdvanceDeduction,
  applyMonthlySalaryToLine,
  computeGuardPayrollLine,
  computePayableDays,
  linesToCsv,
  parseSalaryAmount,
  resolvePayPeriod,
} from "./computePayroll";
import { getGuardMonthAttendanceStats } from "./payrollMonthStats";
import {
  listReliefDutiesForGuardMonth,
  saveReliefBonusAmounts,
  type ReliefDutyBonusRow,
} from "./payrollReliefBonus";
import {
  PAYROLL_RUNS_COLLECTION,
  type PayrollDayBreakdown,
  type PayrollLine,
  type PayrollPeriod,
  type PayrollRun,
} from "./payrollRun";
import {
  PAYROLL_SETTINGS_COLLECTION,
  mergePayrollSettings,
  normalizePayrollSettings,
  type PayrollGeneralSettings,
} from "./payrollSettings";

const GUARDS_COLLECTION = "guards";

function httpError(message: string, statusCode: number): Error {
  return Object.assign(new Error(message), { statusCode });
}

export async function getPayrollSettings(
  agencyId: string
): Promise<PayrollGeneralSettings> {
  const snap = await getFirestore()
    .collection(PAYROLL_SETTINGS_COLLECTION)
    .doc(agencyId)
    .get();

  return mergePayrollSettings(
    agencyId,
    snap.exists ? (snap.data() as Partial<PayrollGeneralSettings>) : null
  );
}

export async function savePayrollSettings(
  agencyId: string,
  body: unknown
): Promise<{ settings: PayrollGeneralSettings; warnings: string[] }> {
  const { settings, errors, warnings } = normalizePayrollSettings(
    agencyId,
    body
  );
  if (errors.length > 0) {
    throw httpError(errors[0], 400);
  }

  const ref = getFirestore()
    .collection(PAYROLL_SETTINGS_COLLECTION)
    .doc(agencyId);
  const existing = await ref.get();
  await ref.set(
    {
      ...settings,
      updatedAt: FieldValue.serverTimestamp(),
      createdAt: existing.exists
        ? existing.data()?.createdAt ?? FieldValue.serverTimestamp()
        : FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  return { settings, warnings };
}

export async function listPayrollRuns(
  agencyId: string
): Promise<PayrollRun[]> {
  const snap = await getFirestore()
    .collection(PAYROLL_RUNS_COLLECTION)
    .where("agencyId", "==", agencyId)
    .get();

  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }) as PayrollRun)
    .sort((a, b) => {
      if (a.period.year !== b.period.year) {
        return b.period.year - a.period.year;
      }
      return b.period.month - a.period.month;
    });
}

export async function generatePayrollRun(params: {
  agencyId: string;
  year: number;
  month: number;
}): Promise<{ run: PayrollRun; lines: PayrollLine[] }> {
  const { agencyId, year, month } = params;
  const db = getFirestore();

  const agencyRuns = await db
    .collection(PAYROLL_RUNS_COLLECTION)
    .where("agencyId", "==", agencyId)
    .get();
  const existing = agencyRuns.docs.filter((d) => {
    const run = d.data() as PayrollRun;
    return run.period?.year === year && run.period?.month === month;
  });

  if (existing.length > 0) {
    const paid = existing.find(
      (d) => (d.data() as PayrollRun).status === "paid"
    );
    if (paid) {
      throw Object.assign(
        new Error(
          "A paid payroll run already exists for this month. Create a new month or unpay is not supported."
        ),
        { statusCode: 409, runId: paid.id }
      );
    }
    const batch = db.batch();
    for (const docSnap of existing) {
      const lines = await docSnap.ref.collection("lines").get();
      for (const line of lines.docs) batch.delete(line.ref);
      batch.delete(docSnap.ref);
    }
    await batch.commit();
  }

  const preview = await buildPayrollPreview({ agencyId, year, month });
  const runRef = db.collection(PAYROLL_RUNS_COLLECTION).doc();
  const lines: PayrollLine[] = preview.lines.map((line) => ({
    ...line,
    id: `${runRef.id}_${line.guardId}`,
    runId: runRef.id,
    agencyId,
    status: "unpaid" as const,
    advanceDeductionTotal: line.advanceDeductionTotal ?? 0,
    netPay: line.netPay ?? line.grossPay,
  }));

  const run: PayrollRun = {
    id: runRef.id,
    agencyId,
    period: preview.period,
    status: "finalized",
    settingsSnapshot: preview.settings,
    guardCount: lines.length,
    totalGross: preview.totalGross,
  };

  const batch = db.batch();
  batch.set(runRef, {
    ...run,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  for (const line of lines) {
    batch.set(runRef.collection("lines").doc(line.id), line);
  }
  await batch.commit();

  // Persist recoveries on advance schedules (capped at each line's applied amount).
  for (const line of lines) {
    const maxDeduct = Number(line.advanceDeductionTotal) || 0;
    if (maxDeduct <= 0) continue;
    await applyAdvanceDeductionsForPayrollRun({
      agencyId,
      guardId: line.guardId,
      year,
      month,
      payrollRunId: runRef.id,
      maxDeduct,
    });
  }

  return { run, lines };
}

export async function getPayrollRun(params: {
  agencyId: string;
  runId: string;
}): Promise<{ run: PayrollRun; lines: PayrollLine[] }> {
  const runSnap = await getFirestore()
    .collection(PAYROLL_RUNS_COLLECTION)
    .doc(params.runId)
    .get();
  if (!runSnap.exists) {
    throw httpError("Payroll run not found.", 404);
  }
  const run = { id: runSnap.id, ...runSnap.data() } as PayrollRun;
  if (run.agencyId !== params.agencyId) {
    throw httpError("Payroll run not found.", 404);
  }

  const lines = (await runSnap.ref.collection("lines").get()).docs
    .map((d) => {
      const line = { id: d.id, ...d.data() } as PayrollLine;
      if (line.reliefBonusTotal == null) {
        line.reliefBonusTotal = 0;
      }
      if (line.advanceDeductionTotal == null) {
        line.advanceDeductionTotal = 0;
      }
      if (line.netPay == null) {
        line.netPay = Math.max(
          0,
          round2(line.grossPay - line.advanceDeductionTotal)
        );
      }
      return line;
    })
    .sort((a, b) => a.guardName.localeCompare(b.guardName));

  return { run, lines };
}

function round2(n: number): number {
  return Math.round((Number(n) || 0) * 100) / 100;
}

export type AdvanceDeductionRow = {
  advanceId: string;
  installmentId: string;
  purpose: string;
  amount: number;
  recoveryMode?: "emi" | "next_payroll" | "cash";
  installmentIndex?: number;
  emiMonths?: number;
  label?: string;
};

export type GuardPayrollBreakdown = {
  guardId: string;
  guardName: string;
  employeeCode: string;
  monthlySalary: number;
  period: PayrollPeriod;
  breakdown: PayrollDayBreakdown;
  dayRate: number;
  attendanceGross: number;
  reliefDuties: ReliefDutyBonusRow[];
  reliefBonusTotal: number;
  advanceDeductions: AdvanceDeductionRow[];
  advanceDeductionTotal: number;
  estimatedGross: number;
  estimatedNet: number;
};

export async function getGuardPayrollBreakdown(params: {
  agencyId: string;
  guardId: string;
  year: number;
  month: number;
}): Promise<GuardPayrollBreakdown> {
  const { agencyId, guardId, year, month } = params;
  const db = getFirestore();

  const guardSnap = await db.collection(GUARDS_COLLECTION).doc(guardId).get();
  if (!guardSnap.exists || guardSnap.data()?.agencyId !== agencyId) {
    throw httpError("Guard not found.", 404);
  }
  const guard = guardSnap.data() as {
    fullName?: string;
    employeeCode?: string;
    salary?: string;
    weeklyOffDays?: string[];
    shiftFrom?: string;
    shiftTo?: string;
  };

  const settings = await getPayrollSettings(agencyId);
  const period = resolvePayPeriod(year, month, settings.payCycleStartDay);
  const stats = await getGuardMonthAttendanceStats({
    guardId,
    agencyId,
    year,
    month,
    shiftFrom: guard.shiftFrom,
    shiftTo: guard.shiftTo,
  });
  const reliefDuties = await listReliefDutiesForGuardMonth({
    agencyId,
    guardId,
    year,
    month,
  });
  const reliefBonusTotal =
    Math.round(reliefDuties.reduce((s, r) => s + (r.amount || 0), 0) * 100) /
    100;
  const advanceDeductions = await listPendingAdvanceDeductionsForGuardMonth({
    agencyId,
    guardId,
    year,
    month,
  });
  const advanceRequested = await sumPendingAdvanceDeductionsForGuardMonth({
    agencyId,
    guardId,
    year,
    month,
  });

  const computed = computeGuardPayrollLine({
    guardId,
    guardName: guard.fullName?.trim() || "Guard",
    employeeCode: guard.employeeCode?.trim() || "",
    salaryRaw: guard.salary ?? "",
    weeklyOffDays: Array.isArray(guard.weeklyOffDays)
      ? guard.weeklyOffDays
      : [],
    agencyWeeklyOffCount: settings.weeklyOffCount,
    settings,
    period,
    stats,
    reliefBonusTotal: 0,
    advanceDeductionTotal: 0,
  });

  const breakdown = computed?.breakdown ?? computePayableDays(stats, settings);
  const dayRate = computed?.dayRate ?? 0;
  const attendanceGross = computed
    ? Math.round(dayRate * breakdown.payableDays * 100) / 100
    : 0;
  const monthlySalary = computed?.monthlySalary ?? 0;
  const estimatedGross =
    Math.round((attendanceGross + reliefBonusTotal) * 100) / 100;
  const deducted = applyAdvanceDeduction(estimatedGross, advanceRequested);

  return {
    guardId,
    guardName: guard.fullName?.trim() || "Guard",
    employeeCode: guard.employeeCode?.trim() || "",
    monthlySalary,
    period,
    breakdown,
    dayRate,
    attendanceGross,
    reliefDuties,
    reliefBonusTotal,
    advanceDeductions,
    advanceDeductionTotal: deducted.advanceDeductionTotal,
    estimatedGross,
    estimatedNet: deducted.netPay,
  };
}

export async function saveGuardReliefBonuses(params: {
  agencyId: string;
  guardId: string;
  year: number;
  month: number;
  entries: Array<{ reliefRequestId: string; amount: number }>;
}): Promise<GuardPayrollBreakdown> {
  await saveReliefBonusAmounts(params);
  return getGuardPayrollBreakdown(params);
}

export async function markPayrollRunPaid(params: {
  agencyId: string;
  runId: string;
}): Promise<{ run: PayrollRun; lines: PayrollLine[] }> {
  const db = getFirestore();
  const runRef = db.collection(PAYROLL_RUNS_COLLECTION).doc(params.runId);
  const runSnap = await runRef.get();
  if (!runSnap.exists || runSnap.data()?.agencyId !== params.agencyId) {
    throw httpError("Payroll run not found.", 404);
  }

  const linesSnap = await runRef.collection("lines").get();
  const batch = db.batch();
  batch.update(runRef, {
    status: "paid",
    paidAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  for (const line of linesSnap.docs) {
    batch.update(line.ref, { status: "paid" });
  }
  await batch.commit();

  return getPayrollRun(params);
}

export async function updateGuardSalaryForPayroll(params: {
  agencyId: string;
  guardId: string;
  monthlySalaryRaw: unknown;
}): Promise<{ guardId: string; monthlySalary: number }> {
  const monthlySalary = parseSalaryAmount(
    String(params.monthlySalaryRaw ?? "")
  );
  if (monthlySalary == null) {
    throw httpError("Provide a valid positive monthlySalary.", 400);
  }

  const guardRef = getFirestore()
    .collection(GUARDS_COLLECTION)
    .doc(params.guardId);
  const guardSnap = await guardRef.get();
  if (!guardSnap.exists || guardSnap.data()?.agencyId !== params.agencyId) {
    throw httpError("Guard not found.", 404);
  }

  await guardRef.update({
    salary: String(monthlySalary),
    updatedAt: FieldValue.serverTimestamp(),
  });

  return { guardId: params.guardId, monthlySalary };
}

export async function updatePayrollLine(params: {
  agencyId: string;
  runId: string;
  lineId: string;
  monthlySalary?: unknown;
  markPaid?: boolean;
}): Promise<{ run: PayrollRun; line: PayrollLine }> {
  const wantsPaid = params.markPaid === true;
  const hasSalaryEdit =
    params.monthlySalary != null && params.monthlySalary !== "";

  if (!wantsPaid && !hasSalaryEdit) {
    throw httpError(
      'Provide status "paid" and/or a monthlySalary to update.',
      400
    );
  }

  const db = getFirestore();
  const runRef = db.collection(PAYROLL_RUNS_COLLECTION).doc(params.runId);
  const runSnap = await runRef.get();
  if (!runSnap.exists || runSnap.data()?.agencyId !== params.agencyId) {
    throw httpError("Payroll run not found.", 404);
  }

  const runData = runSnap.data() as PayrollRun;
  const lineRef = runRef.collection("lines").doc(params.lineId);
  const lineSnap = await lineRef.get();
  if (!lineSnap.exists) {
    throw httpError("Payroll line not found.", 404);
  }

  const existing = {
    id: lineSnap.id,
    ...lineSnap.data(),
  } as PayrollLine;

  if (hasSalaryEdit) {
    if (runData.status === "paid" || existing.status === "paid") {
      throw httpError("Cannot edit salary on a paid payroll line.", 400);
    }

    const recomputed = applyMonthlySalaryToLine(
      existing,
      params.monthlySalary as string | number
    );

    await lineRef.update({
      monthlySalary: recomputed.monthlySalary,
      dayRate: recomputed.dayRate,
      grossPay: recomputed.grossPay,
      advanceDeductionTotal: recomputed.advanceDeductionTotal,
      netPay: recomputed.netPay,
    });

    const guardRef = db.collection(GUARDS_COLLECTION).doc(existing.guardId);
    const guardSnap = await guardRef.get();
    if (
      guardSnap.exists &&
      guardSnap.data()?.agencyId === params.agencyId
    ) {
      await guardRef.update({
        salary: String(recomputed.monthlySalary),
        updatedAt: FieldValue.serverTimestamp(),
      });
    }

    const allLinesSnap = await runRef.collection("lines").get();
    const totalGross =
      Math.round(
        allLinesSnap.docs.reduce((sum, d) => {
          const data = d.data() as PayrollLine;
          const gross =
            d.id === params.lineId ? recomputed.grossPay : data.grossPay;
          return sum + (Number(gross) || 0);
        }, 0) * 100
      ) / 100;

    await runRef.update({
      totalGross,
      updatedAt: FieldValue.serverTimestamp(),
    });

    existing.monthlySalary = recomputed.monthlySalary;
    existing.dayRate = recomputed.dayRate;
    existing.grossPay = recomputed.grossPay;
    existing.advanceDeductionTotal = recomputed.advanceDeductionTotal;
    existing.netPay = recomputed.netPay;
  }

  if (wantsPaid) {
    await lineRef.update({ status: "paid" });
    existing.status = "paid";

    const allLines = await runRef.collection("lines").get();
    const allPaid = allLines.docs.every(
      (d) =>
        (d.data() as PayrollLine).status === "paid" || d.id === params.lineId
    );
    if (allPaid) {
      await runRef.update({
        status: "paid",
        paidAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
    } else {
      await runRef.update({ updatedAt: FieldValue.serverTimestamp() });
    }
  } else if (!hasSalaryEdit) {
    await runRef.update({ updatedAt: FieldValue.serverTimestamp() });
  }

  const run = {
    id: runRef.id,
    ...(await runRef.get()).data(),
  } as PayrollRun;

  return { run, line: existing };
}

export async function exportPayrollRunCsv(params: {
  agencyId: string;
  runId: string;
}): Promise<{ csv: string; filename: string }> {
  const { run, lines } = await getPayrollRun(params);
  const csv = linesToCsv(lines);
  const filename = `payroll-${run.period.year}-${String(run.period.month).padStart(2, "0")}.csv`;
  return { csv, filename };
}
