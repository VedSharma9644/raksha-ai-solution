import { useNavigate, useParams } from "react-router-dom";
import { APP_ROUTES } from "../app/routePaths";
import { useDeleteGuard, useEditGuard } from "../features/guards";
import { EditStaffMemberScreen } from "../features/staff";

export function EditGuardPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const guardId = id ?? "";

  const { initialValues, isLoading, isSubmitting, loadError, saveError, saveGuard } =
    useEditGuard(guardId);
  const { removeGuard, isDeleting, error: deleteError } = useDeleteGuard(guardId);

  if (isLoading) {
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
        onBack={() => navigate(APP_ROUTES.employeeList)}
        onCancel={() => navigate(APP_ROUTES.employeeList)}
        onSubmit={saveGuard}
        onDelete={removeGuard}
      />
    </>
  );
}
