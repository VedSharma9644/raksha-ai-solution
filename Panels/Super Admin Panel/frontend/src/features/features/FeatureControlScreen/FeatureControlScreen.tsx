import { useEffect, useMemo, useState } from "react";
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
  onAgencyChange?: (agencyId: string) => void;
  initialAgencyId?: string;
  lockAgency?: boolean;
  title?: string;
  subtitle?: string;
  backLabel?: string;
  isSaving?: boolean;
}

function idsKey(ids: string[] | undefined): string {
  return [...(ids ?? [])].sort().join("|");
}

export function FeatureControlScreen({
  agencies,
  features,
  onBack,
  onSave,
  onAgencyChange,
  initialAgencyId = "",
  lockAgency = false,
  title = "Modules",
  subtitle = "Turn modules on or off for this agency. Dependencies stay enforced.",
  backLabel = "Back to agencies",
  isSaving = false,
}: FeatureControlScreenProps) {
  const [selectedAgencyId, setSelectedAgencyId] = useState(
    initialAgencyId || agencies[0]?.agencyId || ""
  );
  const [draftEnabledIds, setDraftEnabledIds] = useState<string[]>(
    agencies.find((a) => a.agencyId === (initialAgencyId || agencies[0]?.agencyId))
      ?.enabledFeatureIds ?? []
  );

  useEffect(() => {
    if (!initialAgencyId) return;
    setSelectedAgencyId(initialAgencyId);
  }, [initialAgencyId]);

  const selectedAgency = useMemo(
    () => agencies.find((agency) => agency.agencyId === selectedAgencyId),
    [agencies, selectedAgencyId]
  );

  const savedIdsKey = idsKey(selectedAgency?.enabledFeatureIds);
  useEffect(() => {
    if (!selectedAgency) return;
    setDraftEnabledIds(selectedAgency.enabledFeatureIds);
  }, [selectedAgencyId, savedIdsKey]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleAgencyChange(agencyId: string) {
    const agency = agencies.find((item) => item.agencyId === agencyId);
    setSelectedAgencyId(agencyId);
    setDraftEnabledIds(agency?.enabledFeatureIds ?? []);
    onAgencyChange?.(agencyId);
  }

  function handleToggle(featureId: string, enabled: boolean) {
    const next = enabled
      ? draftEnabledIds.includes(featureId)
        ? draftEnabledIds
        : [...draftEnabledIds, featureId]
      : draftEnabledIds.filter((id) => id !== featureId);

    setDraftEnabledIds(next);

    if (selectedAgencyId) {
      onSave(selectedAgencyId, next);
    }
  }

  function isDependencyBlocked(feature: PlatformFeature): boolean {
    return feature.dependencies.some(
      (dependencyId) => !draftEnabledIds.includes(dependencyId)
    );
  }

  return (
    <AppScreenLayout>
      <div className="app-screen-layout__content feature-control-screen">
        <PageHeader
          title={title}
          subtitle={
            selectedAgency
              ? `${subtitle} Managing ${selectedAgency.agencyName}.`
              : subtitle
          }
          onBack={onBack}
          backLabel={backLabel}
        />

        <div className="feature-control-screen__toolbar">
          {!lockAgency ? (
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
          ) : null}
          <div className="feature-control-screen__save">
            <Button
              type="button"
              onClick={() => onSave(selectedAgencyId, draftEnabledIds)}
              disabled={!selectedAgencyId || isSaving}
            >
              {isSaving ? "Saving…" : "Save Module Access"}
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
                  disabled={(dependencyBlocked && !checked) || isSaving}
                  onChange={(nextChecked) =>
                    handleToggle(feature.id, nextChecked)
                  }
                />
              );
            })}
          </div>
        ) : (
          <p className="feature-control-screen__empty">
            Select an agency to manage modules.
          </p>
        )}
      </div>
    </AppScreenLayout>
  );
}
