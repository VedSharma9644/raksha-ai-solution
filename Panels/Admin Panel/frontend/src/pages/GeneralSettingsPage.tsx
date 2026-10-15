import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { PayrollGeneralSettings } from "@raskha/payroll";
import { APP_ROUTES } from "../app/routePaths";
import { useAuthContext } from "../features/authentication";
import {
  GeneralSettingsScreen,
  usePayrollSettings,
} from "../features/payroll";

export function GeneralSettingsPage() {
  const navigate = useNavigate();
  const { agency } = useAuthContext();
  const { settings, isLoading, isSaving, error, warnings, saveSettings } =
    usePayrollSettings(agency?.id);
  const [saveNotice, setSaveNotice] = useState("");

  function goBack() {
    navigate(APP_ROUTES.dashboard);
  }

  if (isLoading || !settings) {
    return null;
  }

  async function handleSubmit(next: PayrollGeneralSettings) {
    setSaveNotice("");
    await saveSettings(next);
    setSaveNotice("Settings saved.");
  }

  return (
    <GeneralSettingsScreen
      settings={settings}
      isSubmitting={isSaving}
      error={error}
      warnings={warnings}
      saveNotice={saveNotice}
      onBack={goBack}
      onSubmit={handleSubmit}
    />
  );
}
