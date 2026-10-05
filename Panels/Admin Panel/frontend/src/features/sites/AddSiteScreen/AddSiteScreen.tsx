import { AppScreenLayout } from "../../../components/AppScreenLayout";
import { PageHeader } from "../../../components/PageHeader";
import type { SiteFormValues } from "../siteFormTypes";
import { AddSiteForm } from "../AddSiteForm";
import "./AddSiteScreen.css";

export interface AddSiteScreenProps {
  isSubmitting?: boolean;
  onBack: () => void;
  onCancel: () => void;
  onSubmit: (values: SiteFormValues) => void | Promise<void>;
}

export function AddSiteScreen({
  isSubmitting,
  onBack,
  onCancel,
  onSubmit,
}: AddSiteScreenProps) {
  return (
    <AppScreenLayout>
      <div className="app-screen-layout__content add-site-screen">
        <PageHeader
          title="Add Site"
          subtitle="Register a client location for attendance, patrols, and staffing."
          onBack={onBack}
          backLabel="Back to dashboard"
        />
        <AddSiteForm
          isSubmitting={isSubmitting}
          onCancel={onCancel}
          onSubmit={onSubmit}
        />
      </div>
    </AppScreenLayout>
  );
}
