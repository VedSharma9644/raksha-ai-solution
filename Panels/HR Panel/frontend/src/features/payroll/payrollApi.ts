import type { PayrollGeneralSettings } from "@raskha/payroll";
import { adminFetch } from "@raskha/shared";

export async function fetchPayrollSettingsApi(): Promise<PayrollGeneralSettings> {
  const data = await adminFetch<{ settings: PayrollGeneralSettings }>(
    "/api/payroll/settings",
    { errorMessage: "You must be signed in to manage payroll settings." }
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
    errorMessage: "You must be signed in to manage payroll settings.",
  });
  return {
    settings: data.settings,
    warnings: Array.isArray(data.warnings) ? data.warnings : [],
  };
}
