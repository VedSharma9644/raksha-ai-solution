import { useMemo, useState } from "react";
import { AppScreenLayout } from "../../../components/AppScreenLayout";
import { Button } from "../../../components/Button";
import { PageHeader } from "../../../components/PageHeader";
import { SelectField } from "../../../components/SelectField";
import { ToggleSwitch } from "../../../components/ToggleSwitch";
import type { AgencyFeatureConfig, PlatformFeature } from "../featureControlTypes";
import "./FeatureControlScreen.css";

export interface FeatureControlScreenProps {
  agencies: AgencyFeatureConfig[];
  features: PlatformFeature[];
  onBack: () => void;
  onSave: (agencyId: string, enabledFeatureIds: string[]) => void;
}

export function FeatureControlScreen({
  agencies,
  features,
  onBack,
  onSave,
}: FeatureControlScreenProps) {
  const [selectedAgencyId, setSelectedAgencyId] = useState(
    agencies[0]?.agencyId ?? "",
  );
  const [draftEnabledIds, setDraftEnabledIds] = useState<string[]>(
    agencies[0]?.enabledFeatureIds ?? [],
  );

  const selectedAgency = useMemo(
    () => agencies.find((agency) => agency.agencyId === selectedAgencyId),
    [agencies, selectedAgencyId],
  );

  function handleAgencyChange(agencyId: string) {
    const agency = agencies.find((item) => item.agencyId === agencyId);
    setSelectedAgencyId(agencyId);
    setDraftEnabledIds(agency?.enabledFeatureIds ?? []);
  }

  function handleToggle(featureId: string, enabled: boolean) {
    setDraftEnabledIds((current) => {
      if (enabled) {
        return current.includes(featureId)
          ? current
          : [...current, featureId];
      }

      return current.filter((id) => id !== featureId);
    });
  }

  function isDependencyBlocked(feature: PlatformFeature): boolean {
    return feature.dependencies.some(
      (dependencyId) => !draftEnabledIds.includes(dependencyId),
    );
  }

  return (
    <AppScreenLayout>
      <div className="app-screen-layout__content feature-control-screen">
        <PageHeader
          title="Feature Control"
          subtitle="Turn modules on or off for each agency. Dependencies stay enforced."
          onBack={onBack}
          backLabel="Back to dashboard"
        />

        <div className="feature-control-screen__toolbar">
          <SelectField
            label="Agency"
            name="featureAgency"
            value={selectedAgencyId}
            onChange={(event) => handleAgencyChange(event.target.value)}
            placeholder="Select agency"
            options={agencies.map((agency) => ({
              value: agency.agencyId,
              label: agency.agencyName,
            }))}
            required
          />
          <div className="feature-control-screen__save">
            <Button
              type="button"
              onClick={() => onSave(selectedAgencyId, draftEnabledIds)}
              disabled={!selectedAgencyId}
            >
              Save Feature Access
            </Button>
          </div>
        </div>

        {selectedAgency ? (
          <div className="feature-control-screen__list">
            {features.map((feature) => {
              const dependencyBlocked = isDependencyBlocked(feature);
              const checked = draftEnabledIds.includes(feature.id);

              return (
                <ToggleSwitch
                  key={feature.id}
                  label={feature.name}
                  description={
                    dependencyBlocked
                      ? `${feature.description} Requires: ${feature.dependencies.join(", ")}`
                      : feature.description
                  }
                  checked={checked}
                  disabled={dependencyBlocked && !checked}
                  onChange={(nextChecked) =>
                    handleToggle(feature.id, nextChecked)
                  }
                />
              );
            })}
          </div>
        ) : (
          <p className="feature-control-screen__empty">
            Select an agency to manage feature access.
          </p>
        )}
      </div>
    </AppScreenLayout>
  );
}
