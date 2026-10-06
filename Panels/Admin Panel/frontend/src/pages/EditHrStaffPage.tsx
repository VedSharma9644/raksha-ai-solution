import { useNavigate, useParams } from "react-router-dom";
import {
  EditHrStaffScreen,
  useDeleteHrStaff,
  useEditHrStaff,
} from "../features/hrStaff";
import type { HrStaffFormValues } from "../features/hrStaff";
import { useAuthContext } from "../features/authentication";
import {
  useFormBuilderStatus,
  useFormSchema,
  FormBuilderForm,
} from "../features/formBuilder";
import { AppScreenLayout } from "../components/AppScreenLayout";
import { PageHeader } from "../components/PageHeader";

function toFormData(
  values: HrStaffFormValues
): Record<string, string | File | null> {
  const data: Record<string, string | File | null> = {};
  for (const [key, value] of Object.entries(values)) {
    if (typeof value === "string" || value instanceof File || value === null) {
      data[key] = value;
    } else {
      data[key] = value == null ? "" : String(value);
    }
  }
  return data;
}

export function EditHrStaffPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const hrStaffId = id ?? "";
  const { agency } = useAuthContext();

  const {
    initialValues,
    isLoading,
    isSubmitting,
    loadError,
    saveError,
    saveHrStaff,
  } = useEditHrStaff(hrStaffId);

  const { removeHrStaff, isDeleting, error: deleteError } =
    useDeleteHrStaff(hrStaffId);
  const { isEnabled, isLoading: isStatusLoading } = useFormBuilderStatus(
    agency?.id
  );
  const { fields, isLoading: isSchemaLoading } = useFormSchema(
    isEnabled ? agency?.id : undefined,
    "hr"
  );

  function goBack() {
    navigate("/hr");
  }

  if (isStatusLoading || isLoading) {
    return <p style={{ padding: "2rem" }}>Loading HR user…</p>;
  }

  if (loadError || !initialValues) {
    return (
      <p role="alert" style={{ color: "red", padding: "2rem" }}>
        {loadError || "HR user not found."}
      </p>
    );
  }

  const formError = saveError || deleteError;

  if (!isEnabled) {
    return (
      <>
        {formError ? (
          <p role="alert" style={{ color: "red", padding: "1rem" }}>
            {formError}
          </p>
        ) : null}
        <EditHrStaffScreen
          initialValues={initialValues}
          isSubmitting={isSubmitting}
          isDeleting={isDeleting}
          onBack={goBack}
          onCancel={goBack}
          onSubmit={(values: HrStaffFormValues) => saveHrStaff(values)}
          onDelete={removeHrStaff}
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
          title="Edit HR Staff"
          subtitle="Update HR staff details."
          onBack={goBack}
          backLabel="Back to HR"
        />
        {formError ? (
          <p role="alert" style={{ color: "red", padding: "1rem" }}>
            {formError}
          </p>
        ) : null}
        <FormBuilderForm
          formType="hr"
          fields={fields}
          isSubmitting={isSubmitting}
          isDeleting={isDeleting}
          initialValues={toFormData(initialValues)}
          submitLabel="Update HR staff"
          onCancel={goBack}
          onDelete={removeHrStaff}
          onSubmit={async (data) => {
            const values = {
              ...initialValues,
              ...(data as unknown as HrStaffFormValues),
            };
            await saveHrStaff(values);
          }}
        />
      </div>
    </AppScreenLayout>
  );
}
