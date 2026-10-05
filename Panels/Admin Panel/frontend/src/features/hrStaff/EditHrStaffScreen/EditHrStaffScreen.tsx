import { AppScreenLayout } from "../../../components/AppScreenLayout";
import { Button } from "../../../components/Button";
import { PageHeader } from "../../../components/PageHeader";
import { HrStaffForm } from "../HrStaffForm";
import type { HrStaffFormValues } from "../HrStaffForm";
import "./EditHrStaffScreen.css";

export interface EditHrStaffScreenProps {
  initialValues: HrStaffFormValues;
  isSubmitting?: boolean;
  isDeleting?: boolean;
  onBack: () => void;
  onCancel: () => void;
  onSubmit: (values: HrStaffFormValues) => void | Promise<void>;
  onDelete: () => void | Promise<void>;
}

export function EditHrStaffScreen({
  initialValues,
  isSubmitting,
  isDeleting,
  onBack,
  onCancel,
  onSubmit,
  onDelete,
}: EditHrStaffScreenProps) {
  return (
    <AppScreenLayout>
      <div className="app-screen-layout__content edit-hr-staff-screen">
        <PageHeader
          title="Edit HR User"
          subtitle="Update the HR user's profile. Enter a new password to send a reset email."
          onBack={onBack}
          backLabel="Back to HR list"
          actions={
            <Button
              type="button"
              variant="secondary"
              onClick={onDelete}
              disabled={isDeleting || isSubmitting}
            >
              {isDeleting ? "Deleting…" : "Delete HR User"}
            </Button>
          }
        />
        <HrStaffForm
          mode="edit"
          initialValues={initialValues}
          isSubmitting={isSubmitting}
          onCancel={onCancel}
          onSubmit={onSubmit}
        />
      </div>
    </AppScreenLayout>
  );
}
