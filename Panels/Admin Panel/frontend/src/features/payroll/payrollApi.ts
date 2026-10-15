import type {
  PayrollDayBreakdown,
  PayrollGeneralSettings,
  PayrollLine,
  PayrollPeriod,
  PayrollRun,
  ReliefDutyBonusRow,
} from "@raskha/payroll";
import { auth } from "../../lib/firebase";

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

function resolveAdminApiBase(): string {
  const fromEnv = import.meta.env.VITE_ADMIN_API_URL?.replace(/\/$/, "");
  if (import.meta.env.DEV) {
    const forceRemote =
      import.meta.env.VITE_ADMIN_API_FORCE_REMOTE === "true";
    if (!forceRemote) {
      return "http://localhost:3001";
    }
  }
  return fromEnv || "http://localhost:3001";
}

const API_BASE = resolveAdminApiBase();

async function authHeaders(json = true): Promise<Headers> {
  const headers = new Headers();
  if (json) headers.set("Content-Type", "application/json");
  const user = auth.currentUser;
  if (!user) {
    throw new Error("You must be signed in to manage payroll.");
  }
  const token = await user.getIdToken();
  headers.set("Authorization", `Bearer ${token}`);
  return headers;
}

async function adminFetch<T>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const headers = await authHeaders();
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
  });

  const data = (await response.json().catch(() => ({}))) as T & {
    error?: string;
  };

  if (!response.ok) {
    throw new Error(data.error ?? `Request failed (${response.status})`);
  }

  return data;
}

export function payrollCsvUrl(runId: string): string {
  return `${API_BASE}/api/payroll/runs/${encodeURIComponent(runId)}/export.csv`;
}

export async function downloadPayrollCsv(runId: string): Promise<void> {
  const headers = await authHeaders(false);
  const response = await fetch(
    `${API_BASE}/api/payroll/runs/${encodeURIComponent(runId)}/export.csv`,
    { headers }
  );
  if (!response.ok) {
    const data = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(data.error ?? `CSV export failed (${response.status})`);
  }
  const blob = await response.blob();
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
