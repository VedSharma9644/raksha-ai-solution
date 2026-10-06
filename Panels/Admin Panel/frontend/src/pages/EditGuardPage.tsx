import { useNavigate, useParams } from "react-router-dom";
import { APP_ROUTES } from "../app/routePaths";
import { useDeleteGuard, useEditGuard, useGuardInventory, GuardInventoryPanel } from "../features/guards";
import { useInventoryList } from "../features/inventory";
import { EditStaffMemberScreen } from "../features/staff";
import type { StaffMemberFormValues } from "../features/staff";
import { useAuthContext } from "../features/authentication";
import {
  useFormBuilderStatus,
  useFormSchema,
  FormBuilderForm,
} from "../features/formBuilder";
import { AppScreenLayout } from "../components/AppScreenLayout";
import { PageHeader } from "../components/PageHeader";

function toFormData(
  values: StaffMemberFormValues
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

export function EditGuardPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const guardId = id ?? "";
  const { agency } = useAuthContext();

  const { initialValues, isLoading, isSubmitting, loadError, saveError, saveGuard } =
    useEditGuard(guardId);
  const { removeGuard, isDeleting, error: deleteError } = useDeleteGuard(guardId);
  const { isEnabled, isLoading: isStatusLoading } = useFormBuilderStatus(agency?.id);
  const { fields, isLoading: isSchemaLoading } = useFormSchema(
    isEnabled ? agency?.id : undefined,
    "guard",
  );
  const { assignments, isLoading: isAssignmentsLoading, isSaving, error: assignError,
    assign, updateQty, remove } = useGuardInventory(guardId);
  const { items: inventoryItems } = useInventoryList();

  function goBack() {
    navigate(APP_ROUTES.employeeList);
  }

  if (isStatusLoading || isLoading) {
    return <p style={{ padding: "2rem" }}>Loading guard…</p>;
  }

  if (loadError || !initialValues) {
    return (
      <p role="alert" style={{ color: "red", padding: "2rem" }}>
        {loadError || "Guard not found."}
      </p>
    );
  }

  const formError = saveError || deleteError;

  const inventoryPanel = (
    <GuardInventoryPanel
      assignments={assignments}
      inventoryItems={inventoryItems}
      isLoading={isAssignmentsLoading}
      isSaving={isSaving}
      error={assignError}
      onAssign={assign}
      onUpdateQty={updateQty}
      onRemove={remove}
    />
  );

  if (!isEnabled) {
    return (
      <>
        {formError ? (
          <p role="alert" style={{ color: "red", padding: "1rem" }}>
            {formError}
          </p>
        ) : null}
        <EditStaffMemberScreen
          role="guard"
          initialValues={initialValues}
          isSubmitting={isSubmitting}
          isDeleting={isDeleting}
          guardInventoryPanel={inventoryPanel}
          onBack={goBack}
          onCancel={goBack}
          onSubmit={saveGuard}
          onDelete={removeGuard}
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
          title="Edit Guard"
          subtitle="Update guard details."
          onBack={goBack}
          backLabel="Back to employees"
        />
        {formError ? (
          <p role="alert" style={{ color: "red", padding: "1rem" }}>
            {formError}
          </p>
        ) : null}
        <FormBuilderForm
          formType="guard"
          fields={fields}
          isSubmitting={isSubmitting}
          isDeleting={isDeleting}
          initialValues={toFormData(initialValues)}
          submitLabel="Update guard"
          onCancel={goBack}
          onDelete={removeGuard}
          onSubmit={async (data) => {
            const values = {
              ...initialValues,
              ...(data as unknown as StaffMemberFormValues),
            };
            values.characterCertificateFile =
              (data["characterCertificateFile"] as File | null) ?? null;
            values.policeVerificationFile =
              (data["policeVerificationFile"] as File | null) ?? null;
            await saveGuard(values);
          }}
        />
      </div>
    </AppScreenLayout>
  );
}
