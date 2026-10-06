import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { APP_ROUTES } from "../app/routePaths";
import {
  FeatureControlScreen,
  PLATFORM_FEATURES,
  useAgencyModuleControl,
} from "../features/features";

export function FeatureControlPage() {
  const navigate = useNavigate();
  const {
    agencyConfigs,
    isLoading,
    error,
    isSaving,
    saveMessage,
    saveModuleAccess,
  } = useAgencyModuleControl();
  const [selectedAgencyId, setSelectedAgencyId] = useState("");

  useEffect(() => {
    if (!selectedAgencyId && agencyConfigs[0]?.agencyId) {
      setSelectedAgencyId(agencyConfigs[0].agencyId);
    }
  }, [agencyConfigs, selectedAgencyId]);

  const activeAgencyId = selectedAgencyId || agencyConfigs[0]?.agencyId || "";

  const subtitle = (() => {
    if (isLoading) return "Loading agencies and module access…";
    if (error && agencyConfigs.length === 0) return error;
    if (saveMessage) return saveMessage;
    if (error) return error;
    return "Turn modules on or off for each agency. Changes save when you toggle.";
  })();

  return (
    <FeatureControlScreen
      agencies={isLoading ? [] : agencyConfigs}
      features={PLATFORM_FEATURES}
      initialAgencyId={activeAgencyId}
      title="Modules"
      subtitle={subtitle}
      backLabel="Back to dashboard"
      isSaving={isSaving}
      onAgencyChange={setSelectedAgencyId}
      onBack={() => navigate(APP_ROUTES.dashboard)}
      onSave={(agencyId, enabledFeatureIds) => {
        setSelectedAgencyId(agencyId);
        void saveModuleAccess(agencyId, enabledFeatureIds);
      }}
    />
  );
}
