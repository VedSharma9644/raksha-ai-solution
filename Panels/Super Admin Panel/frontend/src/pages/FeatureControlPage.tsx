import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { APP_ROUTES } from "../app/routePaths";
import type { AgencyFeatureConfig } from "../features/features";
import {
  FeatureControlScreen,
  PLATFORM_FEATURES,
  SAMPLE_AGENCY_FEATURE_CONFIGS,
} from "../features/features";

export function FeatureControlPage() {
  const navigate = useNavigate();
  const [configs, setConfigs] = useState<AgencyFeatureConfig[]>(
    SAMPLE_AGENCY_FEATURE_CONFIGS,
  );

  function handleSave(agencyId: string, enabledFeatureIds: string[]) {
    setConfigs((current) =>
      current.map((config) =>
        config.agencyId === agencyId
          ? { ...config, enabledFeatureIds }
          : config,
      ),
    );
    console.info("Feature access saved", { agencyId, enabledFeatureIds });
  }

  return (
    <FeatureControlScreen
      agencies={configs}
      features={PLATFORM_FEATURES}
      onBack={() => navigate(APP_ROUTES.dashboard)}
      onSave={handleSave}
    />
  );
}
