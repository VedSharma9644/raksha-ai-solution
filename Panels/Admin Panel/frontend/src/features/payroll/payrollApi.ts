import type {
  PayrollDayBreakdown,
  PayrollGeneralSettings,
  PayrollLine,
  PayrollPeriod,
  PayrollRun,
  ReliefDutyBonusRow,
} from "@raskha/payroll";
import {
  adminFetch,
  adminFetchBlob,
  resolveAdminApiBase,
} from "@raskha/shared";

export type PayrollPreviewLine = Omit<PayrollLine, "runId" | "status"> & {
  status: "preview";
};

export type PayrollPreview = {
  period: PayrollPeriod;
  settings: PayrollGeneralSettings;
  lines: PayrollPreviewLine[];
  guardCount: number;
  totalGross: number;
  totalNet?: number;
  totalAdvanceDeductions?: number;
  totalMonthlySalary: number;
  skippedWithoutSalary: number;
};

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
  advanceDeductions?: AdvanceDeductionRow[];
  advanceDeductionTotal?: number;
  estimatedGross: number;
  estimatedNet?: number;
};

export function payrollCsvUrl(runId: string): string {
  return `${resolveAdminApiBase()}/api/payroll/runs/${encodeURIComponent(runId)}/export.csv`;
}

export async function downloadPayrollCsv(runId: string): Promise<void> {
  const blob = await adminFetchBlob(
    `/api/payroll/runs/${encodeURIComponent(runId)}/export.csv`,
    { errorMessage: "You must be signed in to manage payroll." }
  );
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `payroll-${runId}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function fetchPayrollSettingsApi(): Promise<PayrollGeneralSettings> {
  const data = await adminFetch<{ settings: PayrollGeneralSettings }>(
    "/api/payroll/settings"
  );
  return data.settings;
}

export async function savePayrollSettingsApi(
  settings: PayrollGeneralSettings
): Promise<{ settings: PayrollGeneralSettings; warnings: string[] }> {
  const data = await adminFetch<{
    settings: PayrollGeneralSettings;
    warnings?: string[];
  }>("/api/payroll/settings", {
    method: "PUT",
    body: JSON.stringify({ settings }),
  });
  return {
    settings: data.settings,
    warnings: Array.isArray(data.warnings) ? data.warnings : [],
  };
}

export async function listPayrollRunsApi(): Promise<PayrollRun[]> {
  const data = await adminFetch<{ runs: PayrollRun[] }>("/api/payroll/runs");
  return data.runs ?? [];
}

export async function fetchPayrollPreviewApi(
  year?: number,
  month?: number
): Promise<PayrollPreview> {
  const params = new URLSearchParams();
  if (year != null) params.set("year", String(year));
  if (month != null) params.set("month", String(month));
  const qs = params.toString();
  const data = await adminFetch<{ preview: PayrollPreview }>(
    `/api/payroll/preview${qs ? `?${qs}` : ""}`
  );
  return data.preview;
}

export async function generatePayrollRunApi(
  year: number,
  month: number
): Promise<{ run: PayrollRun; lines: PayrollLine[] }> {
  return adminFetch<{ run: PayrollRun; lines: PayrollLine[] }>(
    "/api/payroll/runs",
    {
      method: "POST",
      body: JSON.stringify({ year, month }),
    }
  );
}

export async function fetchPayrollRunApi(
  runId: string
): Promise<{ run: PayrollRun; lines: PayrollLine[] }> {
  return adminFetch<{ run: PayrollRun; lines: PayrollLine[] }>(
    `/api/payroll/runs/${encodeURIComponent(runId)}`
  );
}

export async function markPayrollRunPaidApi(
  runId: string
): Promise<{ run: PayrollRun; lines: PayrollLine[] }> {
  return adminFetch<{ run: PayrollRun; lines: PayrollLine[] }>(
    `/api/payroll/runs/${encodeURIComponent(runId)}`,
    {
      method: "PATCH",
      body: JSON.stringify({ status: "paid" }),
    }
  );
}

export async function markPayrollLinePaidApi(
  runId: string,
  lineId: string
): Promise<{ run: PayrollRun; line: PayrollLine }> {
  return adminFetch<{ run: PayrollRun; line: PayrollLine }>(
    `/api/payroll/runs/${encodeURIComponent(runId)}/lines/${encodeURIComponent(lineId)}`,
    {
      method: "PATCH",
      body: JSON.stringify({ status: "paid" }),
    }
  );
}

/** Edit monthly salary on a saved payroll line (recomputes day rate + gross). */
export async function updatePayrollLineSalaryApi(
  runId: string,
  lineId: string,
  monthlySalary: number
): Promise<{ run: PayrollRun; line: PayrollLine }> {
  return adminFetch<{ run: PayrollRun; line: PayrollLine }>(
    `/api/payroll/runs/${encodeURIComponent(runId)}/lines/${encodeURIComponent(lineId)}`,
    {
      method: "PATCH",
      body: JSON.stringify({ monthlySalary }),
    }
  );
}

/** Update guard profile salary from the live payroll preview. */
export async function updateGuardSalaryFromPayrollApi(
  guardId: string,
  monthlySalary: number
): Promise<{ guardId: string; monthlySalary: number }> {
  return adminFetch<{ guardId: string; monthlySalary: number }>(
    `/api/payroll/guards/${encodeURIComponent(guardId)}/salary`,
    {
      method: "PATCH",
      body: JSON.stringify({ monthlySalary }),
    }
  );
}

export async function fetchGuardPayrollBreakdownApi(
  guardId: string,
  year: number,
  month: number
): Promise<GuardPayrollBreakdown> {
  const params = new URLSearchParams({
    year: String(year),
    month: String(month),
  });
  const data = await adminFetch<{ breakdown: GuardPayrollBreakdown }>(
    `/api/payroll/guards/${encodeURIComponent(guardId)}/breakdown?${params}`
  );
  return data.breakdown;
}

export async function saveGuardReliefBonusesApi(params: {
  guardId: string;
  year: number;
  month: number;
  entries: Array<{ reliefRequestId: string; amount: number }>;
}): Promise<GuardPayrollBreakdown> {
  const data = await adminFetch<{ breakdown: GuardPayrollBreakdown }>(
    `/api/payroll/guards/${encodeURIComponent(params.guardId)}/relief-bonuses`,
    {
      method: "PUT",
      body: JSON.stringify({
        year: params.year,
        month: params.month,
        entries: params.entries,
      }),
    }
  );
  return data.breakdown;
}
