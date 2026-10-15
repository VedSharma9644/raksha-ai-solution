import { getFirestore } from "firebase-admin/firestore";
import { sumPendingAdvanceDeductionsForGuardMonth } from "@raskha/money-out";

import {
  applyAdvanceDeduction,
  computeGuardPayrollLine,
  computePayableDays,
  resolvePayPeriod,
} from "./computePayroll";
import { getGuardMonthAttendanceStats } from "./payrollMonthStats";
import {
  sumReliefBonusesForGuardMonth,
} from "./payrollReliefBonus";
import type { PayrollLine, PayrollPeriod } from "./payrollRun";
import {
  PAYROLL_SETTINGS_COLLECTION,
  mergePayrollSettings,
  type PayrollGeneralSettings,
} from "./payrollSettings";

const GUARDS_COLLECTION = "guards";

type GuardRow = {
  id: string;
  agencyId?: string;
  fullName?: string;
  employeeCode?: string;
  salary?: string;
  status?: string;
  weeklyOffDays?: string[];
  shiftFrom?: string;
  shiftTo?: string;
};

export type PayrollPreviewLine = Omit<PayrollLine, "runId" | "status"> & {
  status: "preview";
};

export type PayrollPreviewResult = {
  period: PayrollPeriod;
  settings: PayrollGeneralSettings;
  lines: PayrollPreviewLine[];
  guardCount: number;
  totalGross: number;
  totalNet: number;
  totalAdvanceDeductions: number;
  totalMonthlySalary: number;
  skippedWithoutSalary: number;
};

/** Live payroll check from attendance + settings (does not save a run). */
export async function buildPayrollPreview(params: {
  agencyId: string;
  year: number;
  month: number;
}): Promise<PayrollPreviewResult> {
  const db = getFirestore();
  const { agencyId, year, month } = params;

  const settingsSnap = await db
    .collection(PAYROLL_SETTINGS_COLLECTION)
    .doc(agencyId)
    .get();
  const settings = mergePayrollSettings(
    agencyId,
    settingsSnap.exists
      ? (settingsSnap.data() as Partial<PayrollGeneralSettings>)
      : null
  );
  const period = resolvePayPeriod(year, month, settings.payCycleStartDay);

  const guardsSnap = await db
    .collection(GUARDS_COLLECTION)
    .where("agencyId", "==", agencyId)
    .get();

  const guards = guardsSnap.docs
    .map((d) => ({ id: d.id, ...d.data() }) as GuardRow)
    .filter((g) => (g.status ?? "active") === "active");

  const lines: PayrollPreviewLine[] = [];
  let skippedWithoutSalary = 0;

  for (const guard of guards) {
    try {
      const stats = await getGuardMonthAttendanceStats({
        guardId: guard.id,
        agencyId,
        year,
        month,
        shiftFrom: guard.shiftFrom,
        shiftTo: guard.shiftTo,
      });

      const reliefBonusTotal = await sumReliefBonusesForGuardMonth({
        agencyId,
        guardId: guard.id,
        year,
        month,
      });
      const advanceRequested =
        await sumPendingAdvanceDeductionsForGuardMonth({
          agencyId,
          guardId: guard.id,
          year,
          month,
        });

      const computed = computeGuardPayrollLine({
        guardId: guard.id,
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
        reliefBonusTotal,
        advanceDeductionTotal: advanceRequested,
      });

      if (!computed) {
        if (reliefBonusTotal <= 0 && advanceRequested <= 0) {
          skippedWithoutSalary += 1;
          continue;
        }
        // Bonus-only: no monthly salary, but relief duties with amounts.
        const breakdown = computePayableDays(stats, settings);
        const grossPay = reliefBonusTotal;
        const deducted = applyAdvanceDeduction(grossPay, advanceRequested);
        lines.push({
          id: `preview_${guard.id}`,
          agencyId,
          status: "preview",
          guardId: guard.id,
          guardName: guard.fullName?.trim() || "Guard",
          employeeCode: guard.employeeCode?.trim() || "",
          monthlySalary: 0,
          dayRate: 0,
          breakdown,
          reliefBonusTotal,
          grossPay,
          advanceDeductionTotal: deducted.advanceDeductionTotal,
          netPay: deducted.netPay,
        });
        continue;
      }

      lines.push({
        id: `preview_${guard.id}`,
        agencyId,
        status: "preview",
        ...computed,
      });
    } catch (guardErr: unknown) {
      const msg = (guardErr as { message?: string }).message ?? "unknown";
      console.warn(`[payroll preview] skip guard ${guard.id}: ${msg}`);
    }
  }

  lines.sort((a, b) => a.guardName.localeCompare(b.guardName));

  const totalGross =
    Math.round(lines.reduce((s, l) => s + l.grossPay, 0) * 100) / 100;
  const totalNet =
    Math.round(
      lines.reduce((s, l) => s + (l.netPay ?? l.grossPay), 0) * 100
    ) / 100;
  const totalAdvanceDeductions =
    Math.round(
      lines.reduce((s, l) => s + (l.advanceDeductionTotal ?? 0), 0) * 100
    ) / 100;
  const totalMonthlySalary =
    Math.round(lines.reduce((s, l) => s + l.monthlySalary, 0) * 100) / 100;

  return {
    period,
    settings,
    lines,
    guardCount: lines.length,
    totalGross,
    totalNet,
    totalAdvanceDeductions,
    totalMonthlySalary,
    skippedWithoutSalary,
  };
}
