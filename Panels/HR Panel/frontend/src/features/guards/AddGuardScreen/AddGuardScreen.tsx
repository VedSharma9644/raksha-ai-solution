import { AppScreenLayout } from "../../../components/AppScreenLayout";
import { PageHeader } from "../../../components/PageHeader";
import type { GuardFormValues } from "../guardTypes";
import { AddGuardForm } from "../AddGuardForm";
import "./AddGuardScreen.css";

export interface AddGuardScreenProps {
  isSubmitting?: boolean;
  isNew?: boolean;
  onBack: () => void;
  onCancel: () => void;
  onSubmit: (values: GuardFormValues) => void | Promise<void>;
}

export function AddGuardScreen({
  isSubmitting,
  isNew = false,
  onBack,
  onCancel,
  onSubmit,
}: AddGuardScreenProps) {
  return (
    <AppScreenLayout>
      <div className="app-screen-layout__content add-guard-screen">
        <PageHeader
          title="Add Guard"
          subtitle="Create a guard profile. Site assignment is managed by the Agency Panel."
          onBack={onBack}
          backLabel="Back to dashboard"
        />
        <AddGuardForm
          isNew={isNew}
          isSubmitting={isSubmitting}
          onCancel={onCancel}
          onSubmit={onSubmit}
        />
      </div>
    </AppScreenLayout>
  );
}
