import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { BranchForm } from "../features/branchManagement";
import { useEditBranch } from "../features/branchManagement";
import { APP_ROUTES } from "../app/routePaths";

export function EditBranchPage() {
  const navigate = useNavigate();
  const { id = "" } = useParams<{ id: string }>();
  const { branch, saveBranch, deleteBranch, isSubmitting, isDeleting, error } =
    useEditBranch(id);

  const [values, setValues] = useState({
    name: "",
    city: "",
    address: "",
    phone: "",
    managerName: "",
    status: "active" as "active" | "inactive",
  });

  // Pre-fill once the branch data is available
  useEffect(() => {
    if (!branch) return;
    setValues({
      name: branch.name,
      city: branch.city,
      address: branch.address ?? "",
      phone: branch.phone ?? "",
      managerName: branch.managerName ?? "",
      status: branch.status,
    });
  }, [branch]);

  return (
    <BranchForm
      title="Edit Branch"
      subtitle={branch ? `Editing: ${branch.name}` : "Loading…"}
      values={values}
      onChange={setValues}
      onSubmit={saveBranch}
      onBack={() => navigate(APP_ROUTES.branchList)}
      onDelete={deleteBranch}
      isSubmitting={isSubmitting}
      isDeleting={isDeleting}
      error={error}
      submitLabel="Save Changes"
    />
  );
}
