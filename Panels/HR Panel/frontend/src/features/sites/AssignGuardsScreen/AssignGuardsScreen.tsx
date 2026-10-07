import { AppScreenLayout } from "../../../components/AppScreenLayout";
import { Button } from "../../../components/Button";
import { PageHeader } from "../../../components/PageHeader";
import { GuardAssignmentPicker } from "../GuardAssignmentPicker";
import type { Guard } from "@raskha/guard-management";
import "./AssignGuardsScreen.css";

export interface AssignGuardsScreenProps {
  siteName: string;
  siteId: string;
  siteNameById: Record<string, string>;
  guards: Guard[];
  isLoading: boolean;
  loadError: string;
  selectedIds: Set<string>;
  onToggle: (guardId: string) => void;
  onSave: () => Promise<void>;
  onBack: () => void;
  isSaving: boolean;
  saveError: string;
  isDirty: boolean;
}

export function AssignGuardsScreen({
  siteName,
  siteId,
  siteNameById,
  guards,
  isLoading,
  loadError,
  selectedIds,
  onToggle,
  onSave,
  onBack,
  isSaving,
  saveError,
  isDirty,
}: AssignGuardsScreenProps) {
  return (
    <AppScreenLayout>
      <div className="app-screen-layout__content assign-guards-screen">
        <PageHeader
          title="Assign Guards"
          subtitle={`Site: ${siteName}`}
          onBack={onBack}
          backLabel="Back to Site List"
        />

        {loadError && (
          <p className="assign-guards-screen__error" role="alert">
            {loadError}
          </p>
        )}

        {isLoading ? (
          <div className="assign-guards-screen__loading">
            <span className="assign-guards-screen__spinner" />
            Loading guards…
          </div>
        ) : (
          <>
            <div className="assign-guards-screen__body">
              <GuardAssignmentPicker
                guards={guards}
                siteId={siteId}
                siteNameById={siteNameById}
                selectedIds={selectedIds}
                onToggle={onToggle}
                disabled={isSaving}
              />
            </div>

            {saveError && (
              <p className="assign-guards-screen__error" role="alert">
                {saveError}
              </p>
            )}

            <div className="assign-guards-screen__footer">
              <Button
                type="button"
                variant="secondary"
                onClick={onBack}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={onSave}
                disabled={isSaving || !isDirty}
              >
                {isSaving ? "Saving…" : `Save Assignment (${selectedIds.size} guards)`}
              </Button>
            </div>
          </>
        )}
      </div>
    </AppScreenLayout>
  );
}
