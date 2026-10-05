import { useNavigate } from "react-router-dom";
import { APP_ROUTES } from "../app/routePaths";
import { AddStaffMemberScreen } from "../features/staff";
import type { StaffMemberFormValues } from "../features/staff";
import { useAddGuard } from "../features/guards";

export function AddGuardPage() {
  const navigate = useNavigate();
  const { saveGuard, isSubmitting, error } = useAddGuard();

  async function handleSubmit(values: StaffMemberFormValues) {
    await saveGuard(values);
  }

  function goBack() {
    navigate(APP_ROUTES.dashboard);
  }

  return (
    <>
      {error ? (
        <p role="alert" style={{ color: "red", padding: "1rem" }}>
          {error}
        </p>
      ) : null}
      <AddStaffMemberScreen
        role="guard"
        isSubmitting={isSubmitting}
        onBack={goBack}
        onCancel={goBack}
        onSubmit={handleSubmit}
      />
    </>
  );
}
