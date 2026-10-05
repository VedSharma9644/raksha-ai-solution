import { AppScreenLayout } from "../../../components/AppScreenLayout";
import { Button } from "../../../components/Button";
import { PageHeader } from "../../../components/PageHeader";
import type { StaffMemberFormValues, StaffRole } from "../staffFormTypes";
import { StaffMemberForm } from "../StaffMemberForm";
import "./EditStaffMemberScreen.css";

const SCREEN_COPY: Record<StaffRole, { title: string; subtitle: string }> = {
  guard: {
    title: "Edit Guard",
    subtitle: "Update the guard's profile and site assignment.",
  },
  supervisor: {
    title: "Edit Supervisor",
    subtitle: "Update the supervisor's profile and site assignment.",
  },
  hr: {
    title: "Edit HR User",
    subtitle: "Update the HR user's profile and office details.",
  },
};

export interface EditStaffMemberScreenProps {
  role: StaffRole;
  initialValues: StaffMemberFormValues;
  isSubmitting?: boolean;
  isDeleting?: boolean;
  onBack: () => void;
  onCancel: () => void;
  onSubmit: (values: StaffMemberFormValues) => void | Promise<void>;
  onDelete: () => void | Promise<void>;
}

export function EditStaffMemberScreen({
  role,
  initialValues,
  isSubmitting,
  isDeleting,
  onBack,
  onCancel,
  onSubmit,
  onDelete,
}: EditStaffMemberScreenProps) {
  const copy = SCREEN_COPY[role];

  return (
    <AppScreenLayout>
      <div className="app-screen-layout__content edit-staff-member-screen">
        <PageHeader
          title={copy.title}
          subtitle={copy.subtitle}
          onBack={onBack}
          backLabel="Back to list"
          actions={
            <Button
              type="button"
              variant="secondary"
              onClick={onDelete}
              disabled={isDeleting || isSubmitting}
            >
              {isDeleting ? "Deleting…" : "Delete Guard"}
            </Button>
          }
        />
        <StaffMemberForm
          role={role}
          initialValues={initialValues}
          isSubmitting={isSubmitting}
          onCancel={onCancel}
          onSubmit={onSubmit}
        />
      </div>
    </AppScreenLayout>
  );
}
