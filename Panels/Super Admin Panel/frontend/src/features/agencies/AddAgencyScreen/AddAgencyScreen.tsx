import { AppScreenLayout } from "../../../components/AppScreenLayout";
import { PageHeader } from "../../../components/PageHeader";
import type { AgencyFormValues } from "../agencyTypes";
import { AddAgencyForm } from "../AddAgencyForm";
import "./AddAgencyScreen.css";

export interface AddAgencyScreenProps {
  isSubmitting?: boolean;
  onBack: () => void;
  onCancel: () => void;
  onSubmit: (values: AgencyFormValues) => void | Promise<void>;
}

export function AddAgencyScreen({
  isSubmitting,
  onBack,
  onCancel,
  onSubmit,
}: AddAgencyScreenProps) {
  return (
    <AppScreenLayout>
      <div className="app-screen-layout__content add-agency-screen">
        <PageHeader
          title="Add Agency"
          subtitle="Onboard a company and choose their starting subscription plan."
          onBack={onBack}
          backLabel="Back to dashboard"
        />
        <AddAgencyForm
          isSubmitting={isSubmitting}
          onCancel={onCancel}
          onSubmit={onSubmit}
        />
      </div>
    </AppScreenLayout>
  );
}
