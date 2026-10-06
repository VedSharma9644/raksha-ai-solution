import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { APP_ROUTES } from "../app/routePaths";
import {
  FeatureControlScreen,
  PLATFORM_FEATURES,
  useAgencyModuleControl,
} from "../features/features";

export function AgencyModulesPage() {
  const navigate = useNavigate();
  const { agencyId = "" } = useParams();
  const {
    agencyConfigs,
    isLoading,
    error,
    isSaving,
    saveMessage,
    saveModuleAccess,
  } = useAgencyModuleControl();

  const agency = agencyConfigs.find((item) => item.agencyId === agencyId);
  const lockedAgencies = useMemo(
    () => (agency ? [agency] : []),
    [agency]
  );

  const subtitle = (() => {
    if (isLoading) return "Loading agency modules…";
    if (!agencyId) return "Agency not found.";
    if (error && !agency) return error;
    if (saveMessage) return saveMessage;
    if (error) return error;
    return "Enable or disable modules for this agency. Changes save when you toggle.";
  })();

  return (
    <FeatureControlScreen
      agencies={lockedAgencies}
      features={PLATFORM_FEATURES}
      initialAgencyId={agencyId}
      lockAgency
      title="Modules"
      subtitle={subtitle}
      backLabel="Back to agencies"
      isSaving={isSaving}
      onBack={() => navigate(APP_ROUTES.agencyList)}
      onSave={(id, enabledFeatureIds) => {
        void saveModuleAccess(id, enabledFeatureIds);
      }}
    />
  );
}
