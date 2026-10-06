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
  /** Pre-select an agency when opened from the Agencies list. */
  initialAgencyId?: string;
  /** Hide agency picker when managing one agency. */
  lockAgency?: boolean;
  title?: string;
  subtitle?: string;
  backLabel?: string;
  /** Live Form Builder toggle (persisted separately). */
  formBuilderEnabled?: boolean;
  formBuilderLoading?: boolean;
  onToggleFormBuilder?: (enabled: boolean) => void;
}

export function FeatureControlScreen({
  agencies,
  features,
  onBack,
  onSave,
  initialAgencyId = "",
  lockAgency = false,
  title = "Modules",
  subtitle = "Turn modules on or off for this agency. Dependencies stay enforced.",
  backLabel = "Back to agencies",
  formBuilderEnabled = false,
  formBuilderLoading = false,
  onToggleFormBuilder,
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
    const agency = agencies.find((item) => item.agencyId === initialAgencyId);
    setDraftEnabledIds(agency?.enabledFeatureIds ?? []);
  }, [initialAgencyId, agencies]);

  const selectedAgency = useMemo(
    () => agencies.find((agency) => agency.agencyId === selectedAgencyId),
    [agencies, selectedAgencyId]
  );

  const catalogFeatures = useMemo(
    () => features.filter((feature) => feature.id !== "form_builder"),
    [features]
  );

  function handleAgencyChange(agencyId: string) {
    const agency = agencies.find((item) => item.agencyId === agencyId);
    setSelectedAgencyId(agencyId);
    setDraftEnabledIds(agency?.enabledFeatureIds ?? []);
  }

  function handleToggle(featureId: string, enabled: boolean) {
    setDraftEnabledIds((current) => {
      if (enabled) {
        return current.includes(featureId) ? current : [...current, featureId];
      }
      return current.filter((id) => id !== featureId);
    });
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
              disabled={!selectedAgencyId}
            >
              Save Module Access
            </Button>
          </div>
        </div>

        {selectedAgency ? (
          <div className="feature-control-screen__list">
            {onToggleFormBuilder ? (
              <ToggleSwitch
                label="Form Builder"
                description="Custom intake and onboarding forms for guards and sites."
                checked={formBuilderEnabled}
                disabled={formBuilderLoading}
                onChange={onToggleFormBuilder}
              />
            ) : null}

            {catalogFeatures.map((feature) => {
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
            Select an agency to manage modules.
          </p>
        )}
      </div>
    </AppScreenLayout>
  );
}
