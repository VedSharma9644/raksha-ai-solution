import { useNavigate, useParams } from "react-router-dom";
import {
  EditHrStaffScreen,
  useDeleteHrStaff,
  useEditHrStaff,
} from "../features/hrStaff";
import type { HrStaffFormValues } from "../features/hrStaff";

export function EditHrStaffPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const hrStaffId = id ?? "";

  const {
    initialValues,
    isLoading,
    isSubmitting,
    loadError,
    saveError,
    saveHrStaff,
  } = useEditHrStaff(hrStaffId);

  const { removeHrStaff, isDeleting, error: deleteError } = useDeleteHrStaff(hrStaffId);

  if (isLoading) {
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
        onBack={() => navigate("/hr")}
        onCancel={() => navigate("/hr")}
        onSubmit={(values: HrStaffFormValues) => saveHrStaff(values)}
        onDelete={removeHrStaff}
      />
    </>
  );
}
