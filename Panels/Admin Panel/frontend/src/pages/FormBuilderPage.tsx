import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { FormType } from "@raskha/form-builder";
import { APP_ROUTES } from "../app/routePaths";
import { useAuthContext } from "../features/authentication";
import {
  useFormBuilderStatus,
  useFormSchema,
  FormBuilderStudio,
  ModuleDisabledPanel,
} from "../features/formBuilder";
import { AppScreenLayout } from "../components/AppScreenLayout";
import { PageHeader } from "../components/PageHeader";
import "./FormBuilderPage.css";

const FORM_OPTIONS: {
  id: FormType;
  title: string;
  description: string;
}[] = [
  {
    id: "guard",
    title: "Guard form",
    description: "Fields shown when adding or editing a guard.",
  },
  {
    id: "hr",
    title: "HR staff form",
    description: "Fields shown when adding or editing HR users.",
  },
  {
    id: "site",
    title: "Site form",
    description: "Fields shown when adding or editing a client site.",
  },
];

function FormBuilderEditor({
  formType,
  onBack,
}: {
  formType: FormType;
  onBack: () => void;
}) {
  const { agency } = useAuthContext();
  const { fields, isLoading, isSaving, error, saveFields } = useFormSchema(
    agency?.id,
    formType
  );

  if (isLoading) {
    return <p className="form-builder-page__loading">Loading form…</p>;
  }

  return (
    <>
      {error ? (
        <p role="alert" className="form-builder-page__error">
          {error}
        </p>
      ) : null}
      <FormBuilderStudio
        formType={formType}
        fields={fields}
        isSaving={isSaving}
        onSave={saveFields}
        onBack={onBack}
      />
    </>
  );
}

export function FormBuilderPage() {
  const navigate = useNavigate();
  const { isEnabled, isLoading: isStatusLoading } = useFormBuilderStatus();
  const [selectedType, setSelectedType] = useState<FormType | null>(null);

  function goDashboard() {
    navigate(APP_ROUTES.dashboard);
  }

  if (isStatusLoading) {
    return null;
  }

  if (!isEnabled) {
    return (
      <ModuleDisabledPanel
        title="Form Builder"
        onBack={goDashboard}
        backLabel="Back to dashboard"
      />
    );
  }

  return (
    <AppScreenLayout>
      <div className="app-screen-layout__content form-builder-page">
        <PageHeader
          title="Form Builder"
          subtitle={
            selectedType
              ? "Edit fields on the left. Preview stays on the right."
              : "Choose which form you want to customize."
          }
          onBack={goDashboard}
          backLabel="Back to dashboard"
        />

        {!selectedType ? (
          <div className="form-builder-page__picker">
            {FORM_OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                className="form-builder-page__card"
                onClick={() => setSelectedType(option.id)}
              >
                <span className="form-builder-page__card-title">
                  {option.title}
                </span>
                <span className="form-builder-page__card-desc">
                  {option.description}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <FormBuilderEditor
            formType={selectedType}
            onBack={() => setSelectedType(null)}
          />
        )}
      </div>
    </AppScreenLayout>
  );
}
