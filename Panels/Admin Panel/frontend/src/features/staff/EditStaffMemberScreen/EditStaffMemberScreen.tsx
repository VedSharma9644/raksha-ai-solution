import type { ReactNode } from "react";
import { AppScreenLayout } from "../../../components/AppScreenLayout";
import { Button } from "../../../components/Button";
import { PageHeader } from "../../../components/PageHeader";
import type { StaffMemberFormValues, StaffRole } from "../staffFormTypes";
import { StaffMemberForm } from "../StaffMemberForm";
import "./EditStaffMemberScreen.css";

const SCREEN_COPY: Record<StaffRole, { title: string; subtitle: string }> = {
  guard: {
    title: "Edit Guard",
    subtitle: "Update the guard's profile.",
  },
  supervisor: {
    title: "Edit Supervisor",
    subtitle: "Update the supervisor's profile.",
  },
  hr: {
    title: "Edit HR User",
    subtitle: "Update the HR user's profile.",
  },
};

export interface EditStaffMemberScreenProps {
  role: StaffRole;
  initialValues: StaffMemberFormValues;
  isSubmitting?: boolean;
  isDeleting?: boolean;
  /** Optional inventory assignment panel rendered beside the form (guards only). */
  guardInventoryPanel?: ReactNode;
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
  guardInventoryPanel,
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
        <div
          className={
            guardInventoryPanel
              ? "edit-staff-member-screen__two-col"
              : undefined
          }
        >
          <div className="edit-staff-member-screen__form-col">
            <StaffMemberForm
              role={role}
              initialValues={initialValues}
              isSubmitting={isSubmitting}
              onCancel={onCancel}
              onSubmit={onSubmit}
            />
          </div>
          {guardInventoryPanel && (
            <aside className="edit-staff-member-screen__inventory-col">
              {guardInventoryPanel}
            </aside>
          )}
        </div>
      </div>
    </AppScreenLayout>
  );
}
