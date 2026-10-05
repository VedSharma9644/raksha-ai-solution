import { AppScreenLayout } from "../../../components/AppScreenLayout";
import { PageHeader } from "../../../components/PageHeader";
import { HrStaffForm } from "../HrStaffForm";
import type { HrStaffFormValues } from "../HrStaffForm";
import "./AddHrStaffScreen.css";

export interface AddHrStaffScreenProps {
  isSubmitting?: boolean;
  onBack: () => void;
  onCancel: () => void;
  onSubmit: (values: HrStaffFormValues) => void | Promise<void>;
}

export function AddHrStaffScreen({
  isSubmitting,
  onBack,
  onCancel,
  onSubmit,
}: AddHrStaffScreenProps) {
  return (
    <AppScreenLayout>
      <div className="app-screen-layout__content add-hr-staff-screen">
        <PageHeader
          title="Add HR User"
          subtitle="Create an HR account to manage leave, payroll, and staff records."
          onBack={onBack}
          backLabel="Back to dashboard"
        />
        <HrStaffForm
          mode="add"
          isSubmitting={isSubmitting}
          onCancel={onCancel}
          onSubmit={onSubmit}
        />
      </div>
    </AppScreenLayout>
  );
}
