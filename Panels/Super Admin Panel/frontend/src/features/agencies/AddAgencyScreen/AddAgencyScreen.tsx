import { AppScreenLayout } from "../../../components/AppScreenLayout";
import { PageHeader } from "../../../components/PageHeader";
import type { AgencyFormValues } from "../agencyTypes";
import { AddAgencyForm } from "../AddAgencyForm";
import "./AddAgencyScreen.css";

export interface AddAgencyScreenProps {
  isSubmitting?: boolean;
  requirePassword?: boolean;
  initialValues?: AgencyFormValues;
  submitLabel?: string;
  formError?: string;
  title?: string;
  subtitle?: string;
  onBack: () => void;
  onCancel: () => void;
  onSubmit: (values: AgencyFormValues) => void | Promise<void>;
}

export function AddAgencyScreen({
  isSubmitting,
  requirePassword = true,
  initialValues,
  submitLabel,
  formError,
  title = "Add Agency",
  subtitle = "Onboard a company and choose their starting subscription plan.",
  onBack,
  onCancel,
  onSubmit,
}: AddAgencyScreenProps) {
  return (
    <AppScreenLayout>
      <div className="app-screen-layout__content add-agency-screen">
        <PageHeader
          title={title}
          subtitle={subtitle}
          onBack={onBack}
          backLabel="Back"
        />
        <AddAgencyForm
          isSubmitting={isSubmitting}
          requirePassword={requirePassword}
          initialValues={initialValues}
          submitLabel={submitLabel}
          formError={formError}
          onCancel={onCancel}
          onSubmit={onSubmit}
        />
      </div>
    </AppScreenLayout>
  );
}
