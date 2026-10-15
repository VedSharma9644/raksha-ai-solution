import { useCallback, useEffect, useState } from "react";
import {
  defaultPayrollSettings,
  type PayrollGeneralSettings,
} from "@raskha/payroll";
import {
  fetchPayrollSettingsApi,
  savePayrollSettingsApi,
} from "./payrollApi";

export function usePayrollSettings(agencyId: string | undefined) {
  const [settings, setSettings] = useState<PayrollGeneralSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [warnings, setWarnings] = useState<string[]>([]);

  useEffect(() => {
    if (!agencyId) {
      setSettings(null);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError("");

    fetchPayrollSettingsApi()
      .then((result) => {
        if (!cancelled) setSettings(result);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const e = err as { message?: string };
        setError(e.message ?? "Failed to load payroll settings.");
        setSettings(defaultPayrollSettings(agencyId));
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [agencyId]);

  const saveSettings = useCallback(
    async (next: PayrollGeneralSettings) => {
      if (!agencyId) {
        throw new Error("Agency is not loaded.");
      }
      setIsSaving(true);
      setError("");
      setWarnings([]);
      try {
        const saved = await savePayrollSettingsApi(next);
        setSettings(saved.settings);
        setWarnings(saved.warnings);
        return saved;
      } catch (err: unknown) {
        const e = err as { message?: string };
        const message = e.message ?? "Failed to save payroll settings.";
        setError(message);
        throw err;
      } finally {
        setIsSaving(false);
      }
    },
    [agencyId]
  );

  return {
    settings,
    isLoading,
    isSaving,
    error,
    warnings,
    saveSettings,
  };
}
