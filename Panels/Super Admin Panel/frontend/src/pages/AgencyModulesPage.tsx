import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { APP_ROUTES } from "../app/routePaths";
import { useAgencyList, useFormBuilderManager } from "../features/agencies";
import {
  FeatureControlScreen,
  PLATFORM_FEATURES,
  SAMPLE_AGENCY_FEATURE_CONFIGS,
} from "../features/features";
import type { AgencyFeatureConfig } from "../features/features";

export function AgencyModulesPage() {
  const navigate = useNavigate();
  const { agencyId = "" } = useParams();
  const { agencies, isLoading, error } = useAgencyList();
  const {
    isEnabled,
    toggleFormBuilder,
    isLoading: formBuilderLoading,
  } = useFormBuilderManager();

  const agencyConfigs = useMemo<AgencyFeatureConfig[]>(() => {
    if (agencies.length === 0) {
      return SAMPLE_AGENCY_FEATURE_CONFIGS;
    }

    return agencies.map((agency) => {
      const sample = SAMPLE_AGENCY_FEATURE_CONFIGS.find(
        (config) => config.agencyId === agency.id
      );
      return {
        agencyId: agency.id,
        agencyName: agency.agencyName,
        enabledFeatureIds: sample?.enabledFeatureIds ?? [
          "employee_management",
          "site_management",
        ],
      };
    });
  }, [agencies]);

  if (isLoading) {
    return (
      <FeatureControlScreen
        agencies={[]}
        features={PLATFORM_FEATURES}
        initialAgencyId={agencyId}
        lockAgency
        title="Modules"
        subtitle="Loading agency modules…"
        onBack={() => navigate(APP_ROUTES.agencyList)}
        onSave={() => undefined}
      />
    );
  }

  if (error || !agencyId) {
    return (
      <FeatureControlScreen
        agencies={[]}
        features={PLATFORM_FEATURES}
        lockAgency
        title="Modules"
        subtitle={error || "Agency not found."}
        onBack={() => navigate(APP_ROUTES.agencyList)}
        onSave={() => undefined}
      />
    );
  }

  return (
    <FeatureControlScreen
      agencies={agencyConfigs}
      features={PLATFORM_FEATURES}
      initialAgencyId={agencyId}
      lockAgency
      title="Modules"
      subtitle="Enable or disable modules for this agency."
      backLabel="Back to agencies"
      formBuilderEnabled={isEnabled(agencyId)}
      formBuilderLoading={formBuilderLoading}
      onToggleFormBuilder={(enabled) =>
        void toggleFormBuilder(agencyId, enabled)
      }
      onBack={() => navigate(APP_ROUTES.agencyList)}
      onSave={(id, enabledFeatureIds) => {
        console.info("Module access saved", { agencyId: id, enabledFeatureIds });
      }}
    />
  );
}
