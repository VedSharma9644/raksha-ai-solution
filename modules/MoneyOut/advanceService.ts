import { FieldValue, getFirestore } from "firebase-admin/firestore";

import {
  EMPLOYEE_ADVANCES_COLLECTION,
  addMonths,
  buildInstallmentSchedule,
  firstRecoveryMonth,
  isValidRecoveryStartMonth,
  newId,
  recomputeAdvanceBalances,
  roundMoney,
  type AdvanceInstallment,
  type AdvanceRecoveryMode,
  type AdvanceRepayment,
  type EmployeeAdvance,
} from "./moneyOutTypes";

function httpError(message: string, statusCode: number): Error {
  return Object.assign(new Error(message), { statusCode });
}

function mapAdvance(
  id: string,
  data: Record<string, unknown>
): EmployeeAdvance {
  const amount = roundMoney(Number(data.amount) || 0);
  const installments = Array.isArray(data.installments)
    ? (data.installments as AdvanceInstallment[])
    : [];
  const repayments = Array.isArray(data.repayments)
    ? (data.repayments as AdvanceRepayment[])
    : [];
  const balances = recomputeAdvanceBalances(amount, repayments, installments);
  const recoveryStartYear = Number(data.recoveryStartYear);
  const recoveryStartMonth = Number(data.recoveryStartMonth);
  return {
    id,
    agencyId: String(data.agencyId ?? ""),
    guardId: String(data.guardId ?? ""),
    guardName: String(data.guardName ?? ""),
    amount,
    givenOn: String(data.givenOn ?? ""),
    purpose: String(data.purpose ?? ""),
    recoveryMode: (data.recoveryMode as AdvanceRecoveryMode) || "next_payroll",
    emiMonths: Number(data.emiMonths) || 0,
    recoveryStartYear: Number.isFinite(recoveryStartYear)
      ? recoveryStartYear
      : undefined,
    recoveryStartMonth: Number.isFinite(recoveryStartMonth)
      ? recoveryStartMonth
      : undefined,
    installmentAmount: roundMoney(Number(data.installmentAmount) || 0),
    installments,
    repayments,
    recoveredTotal: balances.recoveredTotal,
    outstanding: balances.outstanding,
    status:
      data.status === "void"
        ? "void"
        : balances.status,
    createdByUid: String(data.createdByUid ?? ""),
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}

/**
 * After cash repayment, shrink/cancel future pending installments to match
 * remaining outstanding (FIFO from the end of the schedule).
 */
function shrinkPendingInstallments(
  installments: AdvanceInstallment[],
  outstanding: number
): AdvanceInstallment[] {
  let remaining = roundMoney(Math.max(0, outstanding));
  const pending = installments.filter((i) => i.status === "pending");
  const kept = installments.filter((i) => i.status !== "pending");

  const nextPending: AdvanceInstallment[] = [];
  for (const inst of pending) {
    if (remaining <= 0.005) break;
    const take = roundMoney(Math.min(inst.amount, remaining));
    if (take <= 0) continue;
    nextPending.push({ ...inst, amount: take });
    remaining = roundMoney(remaining - take);
  }
  return [...kept, ...nextPending];
}

export async function listEmployeeAdvances(params: {
  agencyId: string;
  guardId?: string;
  status?: EmployeeAdvance["status"] | "all";
  /** When set, only advances for guards in this branch + unassigned. */
  branchId?: string | null;
}): Promise<EmployeeAdvance[]> {
  const db = getFirestore();
  const snap = await db
    .collection(EMPLOYEE_ADVANCES_COLLECTION)
    .where("agencyId", "==", params.agencyId)
    .get();

  let rows = snap.docs.map((d) =>
    mapAdvance(d.id, (d.data() ?? {}) as Record<string, unknown>)
  );
  if (params.guardId) {
    rows = rows.filter((r) => r.guardId === params.guardId);
  }
  if (params.status && params.status !== "all") {
    rows = rows.filter((r) => r.status === params.status);
  }
  if (params.branchId) {
    const guardsSnap = await db
      .collection("guards")
      .where("agencyId", "==", params.agencyId)
      .get();
    const allowed = new Set(
      guardsSnap.docs
        .filter((d) => {
          const data = d.data() as { branchId?: string | null };
          const value =
            data.branchId == null ? "" : String(data.branchId).trim();
          return value === "" || value === params.branchId;
        })
        .map((d) => d.id)
    );
    rows = rows.filter((r) => allowed.has(r.guardId));
  }
  rows.sort((a, b) => {
    if (a.status !== b.status) {
      if (a.status === "open") return -1;
      if (b.status === "open") return 1;
    }
    return (b.givenOn || "").localeCompare(a.givenOn || "");
  });
  return rows;
}

export async function getEmployeeAdvance(params: {
  agencyId: string;
  advanceId: string;
}): Promise<EmployeeAdvance> {
  const snap = await getFirestore()
    .collection(EMPLOYEE_ADVANCES_COLLECTION)
    .doc(params.advanceId)
    .get();
  if (!snap.exists) throw httpError("Advance not found.", 404);
  const advance = mapAdvance(
    snap.id,
    (snap.data() ?? {}) as Record<string, unknown>
  );
  if (advance.agencyId !== params.agencyId) {
    throw httpError("Advance not found.", 404);
  }
  return advance;
}

export async function createEmployeeAdvance(params: {
  agencyId: string;
  guardId: string;
  amount: number;
  givenOn: string;
  purpose?: string;
  recoveryMode: AdvanceRecoveryMode;
  emiMonths?: number;
  /** First payroll month for EMI / next_payroll (this month … +5). */
  recoveryStartYear?: number;
  recoveryStartMonth?: number;
  createdByUid: string;
}): Promise<EmployeeAdvance> {
  const amount = roundMoney(Math.max(0, params.amount));
  if (amount <= 0) throw httpError("Advance amount must be greater than 0.", 400);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(params.givenOn)) {
    throw httpError("givenOn must be YYYY-MM-DD.", 400);
  }
  if (
    params.recoveryMode !== "next_payroll" &&
    params.recoveryMode !== "emi" &&
    params.recoveryMode !== "cash"
  ) {
    throw httpError("Invalid recovery mode.", 400);
  }
  if (params.recoveryMode === "emi") {
    const n = Math.floor(Number(params.emiMonths) || 0);
    if (n < 1 || n > 36) {
      throw httpError("EMI months must be between 1 and 36.", 400);
    }
  }

  let recoveryStartYear: number | undefined;
  let recoveryStartMonth: number | undefined;
  if (params.recoveryMode === "emi" || params.recoveryMode === "next_payroll") {
    const fallback = firstRecoveryMonth(params.givenOn);
    recoveryStartYear =
      params.recoveryStartYear != null
        ? Math.floor(Number(params.recoveryStartYear))
        : fallback.year;
    recoveryStartMonth =
      params.recoveryStartMonth != null
        ? Math.floor(Number(params.recoveryStartMonth))
        : fallback.month;
    if (!isValidRecoveryStartMonth(recoveryStartYear, recoveryStartMonth)) {
      throw httpError(
        "EMI start month must be this month or up to 5 months later.",
        400
      );
    }
  }

  const db = getFirestore();
  const guardSnap = await db.collection("guards").doc(params.guardId).get();
  if (!guardSnap.exists || guardSnap.data()?.agencyId !== params.agencyId) {
    throw httpError("Guard not found.", 404);
  }
  const guard = guardSnap.data() as { fullName?: string; status?: string };
  if ((guard.status ?? "active") !== "active") {
    throw httpError("Guard is not active.", 400);
  }

  const schedule = buildInstallmentSchedule({
    amount,
    recoveryMode: params.recoveryMode,
    emiMonths: Number(params.emiMonths) || 1,
    givenOn: params.givenOn,
    startYear: recoveryStartYear,
    startMonth: recoveryStartMonth,
  });

  const ref = db.collection(EMPLOYEE_ADVANCES_COLLECTION).doc();
  const advance: EmployeeAdvance = {
    id: ref.id,
    agencyId: params.agencyId,
    guardId: params.guardId,
    guardName: guard.fullName?.trim() || "Guard",
    amount,
    givenOn: params.givenOn,
    purpose: String(params.purpose ?? "").trim(),
    recoveryMode: params.recoveryMode,
    emiMonths: schedule.emiMonths,
    recoveryStartYear,
    recoveryStartMonth,
    installmentAmount: schedule.installmentAmount,
    installments: schedule.installments,
    repayments: [],
    recoveredTotal: 0,
    outstanding: amount,
    status: "open",
    createdByUid: params.createdByUid,
  };

  await ref.set({
    ...advance,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  return advance;
}

export async function voidEmployeeAdvance(params: {
  agencyId: string;
  advanceId: string;
}): Promise<EmployeeAdvance> {
  const existing = await getEmployeeAdvance(params);
  if (existing.status === "void") return existing;
  if (existing.recoveredTotal > 0.005) {
    throw httpError(
      "Cannot void an advance that already has recoveries. Record remaining as settled or adjust repayments.",
      400
    );
  }

  const installments = existing.installments.map((i) =>
    i.status === "pending" ? { ...i, status: "waived" as const } : i
  );
  await getFirestore()
    .collection(EMPLOYEE_ADVANCES_COLLECTION)
    .doc(params.advanceId)
    .set(
      {
        status: "void",
        installments,
        outstanding: 0,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

  return getEmployeeAdvance(params);
}

export async function recordAdvanceCashRepayment(params: {
  agencyId: string;
  advanceId: string;
  amount: number;
  date: string;
  note?: string;
}): Promise<EmployeeAdvance> {
  const existing = await getEmployeeAdvance(params);
  if (existing.status === "void") {
    throw httpError("Cannot repay a void advance.", 400);
  }
  if (existing.status === "settled") {
    throw httpError("Advance is already settled.", 400);
  }
  const amount = roundMoney(Math.max(0, params.amount));
  if (amount <= 0) throw httpError("Repayment amount must be greater than 0.", 400);
  if (amount > existing.outstanding + 0.005) {
    throw httpError("Repayment exceeds outstanding balance.", 400);
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(params.date)) {
    throw httpError("date must be YYYY-MM-DD.", 400);
  }

  const repayment: AdvanceRepayment = {
    id: newId("repay"),
    date: params.date,
    amount,
    method: "cash",
    note: String(params.note ?? "").trim() || undefined,
  };
  const repayments = [...existing.repayments, repayment];
  const balances = recomputeAdvanceBalances(
    existing.amount,
    repayments,
    existing.installments
  );
  const installments = shrinkPendingInstallments(
    existing.installments,
    balances.outstanding
  );
  const finalBalances = recomputeAdvanceBalances(
    existing.amount,
    repayments,
    installments
  );

  await getFirestore()
    .collection(EMPLOYEE_ADVANCES_COLLECTION)
    .doc(params.advanceId)
    .set(
      {
        repayments,
        installments,
        recoveredTotal: finalBalances.recoveredTotal,
        outstanding: finalBalances.outstanding,
        status: finalBalances.status,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

  return getEmployeeAdvance(params);
}

export type PendingAdvanceDeductionRow = {
  advanceId: string;
  installmentId: string;
  purpose: string;
  amount: number;
  recoveryMode: AdvanceRecoveryMode;
  /** 1-based index among installments on this advance. */
  installmentIndex: number;
  emiMonths: number;
  /** Human label e.g. "EMI 2/6 · Uniform". */
  label: string;
};

/**
 * Keep installments aligned to the stored recovery start when nothing has
 * been repaid yet. Does not rewrite advances that only have an implicit schedule.
 */
async function realignUntouchedAdvanceSchedule(
  adv: EmployeeAdvance
): Promise<EmployeeAdvance> {
  if (adv.recoveryMode === "cash" || adv.status !== "open") return adv;
  if (adv.repayments.length > 0) return adv;
  if (
    adv.recoveryStartYear == null ||
    adv.recoveryStartMonth == null
  ) {
    return adv;
  }
  if (
    adv.installments.length > 0 &&
    adv.installments.some((i) => i.status !== "pending")
  ) {
    return adv;
  }

  const start = {
    year: adv.recoveryStartYear,
    month: adv.recoveryStartMonth,
  };
  const first = adv.installments[0];
  if (
    first &&
    first.year === start.year &&
    first.month === start.month &&
    adv.installments.length ===
      (adv.recoveryMode === "next_payroll" ? 1 : Math.max(1, adv.emiMonths))
  ) {
    return adv;
  }

  const schedule = buildInstallmentSchedule({
    amount: adv.amount,
    recoveryMode: adv.recoveryMode,
    emiMonths: adv.emiMonths || 1,
    givenOn: adv.givenOn,
    startYear: start.year,
    startMonth: start.month,
  });

  await getFirestore()
    .collection(EMPLOYEE_ADVANCES_COLLECTION)
    .doc(adv.id)
    .set(
      {
        installments: schedule.installments,
        installmentAmount: schedule.installmentAmount,
        emiMonths: schedule.emiMonths,
        recoveryStartYear: start.year,
        recoveryStartMonth: start.month,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

  return {
    ...adv,
    installments: schedule.installments,
    installmentAmount: schedule.installmentAmount,
    emiMonths: schedule.emiMonths,
    recoveryStartYear: start.year,
    recoveryStartMonth: start.month,
  };
}

function deductionLabel(
  adv: EmployeeAdvance,
  installmentIndex: number
): string {
  const purpose = (adv.purpose || "Advance").trim() || "Advance";
  if (adv.recoveryMode === "emi") {
    const total = Math.max(1, adv.emiMonths || adv.installments.length || 1);
    return `EMI ${installmentIndex}/${total} · ${purpose}`;
  }
  if (adv.recoveryMode === "next_payroll") {
    return `Next payroll · ${purpose}`;
  }
  return purpose;
}

/** Pending payroll deductions for a guard in a calendar month. */
export async function listPendingAdvanceDeductionsForGuardMonth(params: {
  agencyId: string;
  guardId: string;
  year: number;
  month: number;
}): Promise<PendingAdvanceDeductionRow[]> {
  const advances = await listEmployeeAdvances({
    agencyId: params.agencyId,
    guardId: params.guardId,
    status: "open",
  });
  const rows: PendingAdvanceDeductionRow[] = [];
  for (const raw of advances) {
    const adv = await realignUntouchedAdvanceSchedule(raw);
    adv.installments.forEach((inst, idx) => {
      if (
        inst.status === "pending" &&
        inst.year === params.year &&
        inst.month === params.month &&
        inst.amount > 0
      ) {
        const installmentIndex = idx + 1;
        rows.push({
          advanceId: adv.id,
          installmentId: inst.id,
          purpose: adv.purpose || "Advance recovery",
          amount: roundMoney(inst.amount),
          recoveryMode: adv.recoveryMode,
          installmentIndex,
          emiMonths: adv.emiMonths || adv.installments.length || 1,
          label: deductionLabel(adv, installmentIndex),
        });
      }
    });
  }
  return rows;
}

export async function sumPendingAdvanceDeductionsForGuardMonth(params: {
  agencyId: string;
  guardId: string;
  year: number;
  month: number;
}): Promise<number> {
  const rows = await listPendingAdvanceDeductionsForGuardMonth(params);
  return roundMoney(rows.reduce((s, r) => s + r.amount, 0));
}

/**
 * Mark pending installments as deducted (FIFO), capped by `maxDeduct`.
 * Returns amount actually applied. Leftover installment amounts stay pending
 * (pushed to next month if partially applied).
 */
export async function applyAdvanceDeductionsForPayrollRun(params: {
  agencyId: string;
  guardId: string;
  year: number;
  month: number;
  payrollRunId: string;
  maxDeduct: number;
}): Promise<number> {
  const maxDeduct = roundMoney(Math.max(0, params.maxDeduct));
  if (maxDeduct <= 0) return 0;

  const listed = await listEmployeeAdvances({
    agencyId: params.agencyId,
    guardId: params.guardId,
    status: "open",
  });
  const advances: EmployeeAdvance[] = [];
  for (const raw of listed) {
    advances.push(await realignUntouchedAdvanceSchedule(raw));
  }

  let budget = maxDeduct;
  let applied = 0;
  const db = getFirestore();

  for (const adv of advances) {
    if (budget <= 0.005) break;
    let changed = false;
    const installments = [...adv.installments];
    const repayments = [...adv.repayments];

    for (let i = 0; i < installments.length; i += 1) {
      if (budget <= 0.005) break;
      const inst = installments[i];
      if (
        inst.status !== "pending" ||
        inst.year !== params.year ||
        inst.month !== params.month
      ) {
        continue;
      }
      const take = roundMoney(Math.min(inst.amount, budget));
      if (take <= 0) continue;

      if (take + 0.005 >= inst.amount) {
        installments[i] = {
          ...inst,
          status: "deducted",
          payrollRunId: params.payrollRunId,
        };
      } else {
        // Partial: mark taken portion deducted; leave remainder next month.
        const remainder = roundMoney(inst.amount - take);
        const next = addMonths(params.year, params.month, 1);
        installments[i] = {
          ...inst,
          amount: take,
          status: "deducted",
          payrollRunId: params.payrollRunId,
        };
        installments.push({
          id: newId("inst"),
          year: next.year,
          month: next.month,
          amount: remainder,
          status: "pending",
          payrollRunId: null,
        });
      }

      repayments.push({
        id: newId("repay"),
        date: `${params.year}-${String(params.month).padStart(2, "0")}-28`,
        amount: take,
        method: "payroll",
        note: `Payroll ${params.year}-${String(params.month).padStart(2, "0")}`,
        payrollRunId: params.payrollRunId,
      });

      budget = roundMoney(budget - take);
      applied = roundMoney(applied + take);
      changed = true;
    }

    if (!changed) continue;

    const balances = recomputeAdvanceBalances(
      adv.amount,
      repayments,
      installments
    );
    await db
      .collection(EMPLOYEE_ADVANCES_COLLECTION)
      .doc(adv.id)
      .set(
        {
          installments,
          repayments,
          recoveredTotal: balances.recoveredTotal,
          outstanding: balances.outstanding,
          status: balances.status,
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
  }

  return applied;
}

export { firstRecoveryMonth };
