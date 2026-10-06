import { AppScreenLayout } from "../../../components/AppScreenLayout";
import { Button } from "../../../components/Button";
import { PageHeader } from "../../../components/PageHeader";
import { AddSiteForm } from "../AddSiteForm";
import type { SiteFormValues } from "../siteFormTypes";
import "./EditSiteScreen.css";

export interface EditSiteScreenProps {
  initialValues: SiteFormValues;
  isSubmitting?: boolean;
  isDeleting?: boolean;
  onBack: () => void;
  onCancel: () => void;
  onSubmit: (values: SiteFormValues) => void | Promise<void>;
  onDelete: () => void | Promise<void>;
}

export function EditSiteScreen({
  initialValues,
  isSubmitting,
  isDeleting,
  onBack,
  onCancel,
  onSubmit,
  onDelete,
}: EditSiteScreenProps) {
  return (
    <AppScreenLayout>
      <div className="app-screen-layout__content edit-site-screen">
        <PageHeader
          title="Edit Site"
          subtitle="Update the client site's details, contacts, and supervisor."
          onBack={onBack}
          backLabel="Back to site list"
          actions={
            <Button
              type="button"
              variant="secondary"
              onClick={onDelete}
              disabled={isDeleting || isSubmitting}
            >
              {isDeleting ? "Deleting…" : "Delete Site"}
            </Button>
          }
        />
        <AddSiteForm
          isSubmitting={isSubmitting}
          initialValues={initialValues}
          onCancel={onCancel}
          onSubmit={onSubmit}
        />
      </div>
    </AppScreenLayout>
  );
}
