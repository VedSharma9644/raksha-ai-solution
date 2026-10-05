import { useNavigate } from "react-router-dom";
import { AddHrStaffScreen, useAddHrStaff } from "../features/hrStaff";
import type { HrStaffFormValues } from "../features/hrStaff";

export function AddHrStaffPage() {
  const navigate = useNavigate();
  const { saveHrStaff, isSubmitting, error } = useAddHrStaff();

  async function handleSubmit(values: HrStaffFormValues) {
    await saveHrStaff(values);
  }

  function goBack() {
    navigate("/dashboard");
  }

  return (
    <>
      {error ? (
        <p role="alert" style={{ color: "red", padding: "1rem" }}>
          {error}
        </p>
      ) : null}
      <AddHrStaffScreen
        isSubmitting={isSubmitting}
        onBack={goBack}
        onCancel={goBack}
        onSubmit={handleSubmit}
      />
    </>
  );
}
