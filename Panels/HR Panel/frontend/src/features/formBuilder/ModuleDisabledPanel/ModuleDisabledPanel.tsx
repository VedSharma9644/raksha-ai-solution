import { AppScreenLayout } from "../../../components/AppScreenLayout";
import { PageHeader } from "../../../components/PageHeader";
import "./ModuleDisabledPanel.css";

export interface ModuleDisabledPanelProps {
  title?: string;
  onBack: () => void;
  backLabel?: string;
}

export function ModuleDisabledPanel({
  title = "Custom Form",
  onBack,
  backLabel = "Back to dashboard",
}: ModuleDisabledPanelProps) {
  return (
    <AppScreenLayout>
      <div className="app-screen-layout__content">
        <PageHeader title={title} onBack={onBack} backLabel={backLabel} />
        <div className="module-disabled-panel" role="status">
          <div className="module-disabled-panel__badge">Module off</div>
          <h2 className="module-disabled-panel__heading">
            Custom form disabled
          </h2>
          <p className="module-disabled-panel__body">
            Please upgrade your plan to unlock Form Builder and customize intake
            forms for your agency.
          </p>
        </div>
      </div>
    </AppScreenLayout>
  );
}
