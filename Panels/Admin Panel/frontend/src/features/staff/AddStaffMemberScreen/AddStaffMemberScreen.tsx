import { AppScreenLayout } from "../../../components/AppScreenLayout";
import { PageHeader } from "../../../components/PageHeader";
import type { StaffMemberFormValues, StaffRole } from "../staffFormTypes";
import type { StaffMemberFormProps } from "../StaffMemberForm";
import { StaffMemberForm } from "../StaffMemberForm";
import "./AddStaffMemberScreen.css";

const SCREEN_COPY: Record<
  StaffRole,
  { title: string; subtitle: string }
> = {
  guard: {
    title: "Add Guard",
    subtitle: "Create a guard profile and assign them to a site for duty.",
  },
  supervisor: {
    title: "Add Supervisor",
    subtitle: "Onboard a supervisor to oversee sites, shifts, and relief.",
  },
  hr: {
    title: "Add HR",
    subtitle: "Add an HR user who can manage leave, payroll, and staff records.",
  },
};

export interface AddStaffMemberScreenProps {
  role: StaffRole;
  initialValues?: StaffMemberFormValues;
  isSubmitting?: boolean;
  onBack: () => void;
  onCancel: () => void;
  onSubmit: (values: StaffMemberFormValues) => void | Promise<void>;
}

export function AddStaffMemberScreen({
  role,
  initialValues,
  isSubmitting,
  onBack,
  onCancel,
  onSubmit,
}: AddStaffMemberScreenProps) {
  const copy = SCREEN_COPY[role];

  return (
    <AppScreenLayout>
      <div className="app-screen-layout__content add-staff-member-screen">
        <PageHeader
          title={copy.title}
          subtitle={copy.subtitle}
          onBack={onBack}
          backLabel="Back to dashboard"
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
