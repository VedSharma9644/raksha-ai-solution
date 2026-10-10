import { useNavigate } from "react-router-dom";
import { APP_ROUTES } from "../app/routePaths";
import { AddSiteScreen, useAddSite } from "../features/sites";
import type { SiteFormValues } from "../features/sites";
import { EMPTY_SITE_FORM } from "../features/sites/siteFormTypes";
import type { SiteShiftRowValues } from "../features/sites/siteFormTypes";
import { useAuthContext } from "../features/authentication";
import {
  useFormBuilderStatus,
  useFormSchema,
  FormBuilderForm,
} from "../features/formBuilder";
import { AppScreenLayout } from "../components/AppScreenLayout";
import { PageHeader } from "../components/PageHeader";

export function AddSitePage() {
  const navigate = useNavigate();
  const { agency } = useAuthContext();
  const { saveSite, isSubmitting, error } = useAddSite();
  const { isEnabled, isLoading: isStatusLoading } = useFormBuilderStatus(
    agency?.id
  );
  const { fields, isLoading: isSchemaLoading } = useFormSchema(
    isEnabled ? agency?.id : undefined,
    "site"
  );

  function goBack() {
    navigate(APP_ROUTES.dashboard);
  }

  if (isStatusLoading) {
    return null;
  }

  if (!isEnabled) {
    return (
      <>
        {error ? (
          <p role="alert" style={{ color: "red", padding: "1rem" }}>
            {error}
          </p>
        ) : null}
        <AddSiteScreen
          isSubmitting={isSubmitting}
          onBack={goBack}
          onCancel={goBack}
          onSubmit={saveSite}
        />
      </>
    );
  }

  if (isSchemaLoading) {
    return null;
  }

  return (
    <AppScreenLayout>
      <div className="app-screen-layout__content">
        <PageHeader
          title="Add Site"
          subtitle="Fill in the custom form for this agency."
          onBack={goBack}
          backLabel="Back to dashboard"
        />
        {error ? (
          <p role="alert" style={{ color: "red", padding: "1rem" }}>
            {error}
          </p>
        ) : null}
        <FormBuilderForm
          formType="site"
          fields={fields}
          isSubmitting={isSubmitting}
          onCancel={goBack}
          onSubmit={async (data) => {
            // Merge with defaults so no field is ever undefined → Firestore rejects undefined
            const values: SiteFormValues = {
              ...EMPTY_SITE_FORM,
              siteName:            (data["siteName"]            as string) ?? "",
              siteType:            (data["siteType"]            as SiteFormValues["siteType"]) ?? "",
              clientName:          (data["clientName"]          as string) ?? "",
              address:             (data["address"]             as string) ?? "",
              city:                (data["city"]                as string) ?? "",
              managerName:         (data["managerName"]         as string) ?? "",
              managerContact:      (data["managerContact"]      as string) ?? "",
              hrName:              (data["hrName"]              as string) ?? "",
              hrContact:           (data["hrContact"]           as string) ?? "",
              siteSupervisor:      (data["siteSupervisor"]      as string) ?? "",
              contactPerson:       (data["contactPerson"]       as string) ?? "",
              contactPhone:        (data["contactPhone"]        as string) ?? "",
              latitude:            (data["latitude"]            as string) ?? "",
              longitude:           (data["longitude"]           as string) ?? "",
              notes:               (data["notes"]               as string) ?? "",
              // Shift config — provided by FormBuilderForm's internal shift state
              has24hSurveillance:  (data["has24hSurveillance"] === true || data["has24hSurveillance"] === "true"),
              intervalCheckinMinutes: (data["intervalCheckinMinutes"] as string) ?? "",
              shifts:              (data["shifts"] as unknown as SiteShiftRowValues[]) ?? [],
            };
            await saveSite(values);
          }}
        />
      </div>
    </AppScreenLayout>
  );
}
