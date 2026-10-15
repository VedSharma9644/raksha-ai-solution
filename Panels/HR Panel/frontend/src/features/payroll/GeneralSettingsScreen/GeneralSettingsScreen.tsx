import { AppScreenLayout } from "../../../components/AppScreenLayout";
import { PageHeader } from "../../../components/PageHeader";
import { PayrollGeneralSettingsForm } from "../PayrollGeneralSettingsForm";
import type { PayrollGeneralSettings } from "@raskha/payroll";

export interface GeneralSettingsScreenProps {
  settings: PayrollGeneralSettings;
  isSubmitting: boolean;
  readOnly?: boolean;
  error?: string;
  warnings?: string[];
  saveNotice?: string;
  onBack: () => void;
  onSubmit?: (settings: PayrollGeneralSettings) => void | Promise<void>;
}

export function GeneralSettingsScreen({
  settings,
  isSubmitting,
  readOnly = false,
  error = "",
  warnings = [],
  saveNotice = "",
  onBack,
  onSubmit,
}: GeneralSettingsScreenProps) {
  return (
    <AppScreenLayout>
      <div className="app-screen-layout__content">
        <PageHeader
          title="General settings"
          subtitle="Payroll rules for this agency — weekly offs, leave, and how day salary is worked out."
          onBack={onBack}
          backLabel="Back to dashboard"
        />
        {error ? (
          <p role="alert" style={{ color: "red", padding: "0 0 1rem" }}>
            {error}
          </p>
        ) : null}
        {saveNotice ? (
          <p role="status" style={{ color: "var(--color-primary, #0f766e)", padding: "0 0 1rem", fontWeight: 600 }}>
            {saveNotice}
          </p>
        ) : null}
        <PayrollGeneralSettingsForm
          initialSettings={settings}
          isSubmitting={isSubmitting}
          readOnly={readOnly}
          serverWarnings={warnings}
          onCancel={onBack}
          onSubmit={onSubmit}
        />
      </div>
    </AppScreenLayout>
  );
}
