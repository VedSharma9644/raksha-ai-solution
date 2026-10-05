import { AppScreenLayout } from "../../../components/AppScreenLayout";
import { PageHeader } from "../../../components/PageHeader";
import type { GuardFormValues } from "../guardTypes";
import { AddGuardForm } from "../AddGuardForm";
import "./AddGuardScreen.css";

export interface AddGuardScreenProps {
  isSubmitting?: boolean;
  onBack: () => void;
  onCancel: () => void;
  onSubmit: (values: GuardFormValues) => void | Promise<void>;
}

export function AddGuardScreen({
  isSubmitting,
  onBack,
  onCancel,
  onSubmit,
}: AddGuardScreenProps) {
  return (
    <AppScreenLayout>
      <div className="app-screen-layout__content add-guard-screen">
        <PageHeader
          title="Add Guard"
          subtitle="Create a guard profile for HR operations. Site placement stays with Agency."
          onBack={onBack}
          backLabel="Back to dashboard"
        />
        <AddGuardForm
          isSubmitting={isSubmitting}
          onCancel={onCancel}
          onSubmit={onSubmit}
        />
      </div>
    </AppScreenLayout>
  );
}
