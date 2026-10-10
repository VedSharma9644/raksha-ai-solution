import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BranchForm } from "../features/branchManagement";
import { useAddBranch } from "../features/branchManagement";
import { APP_ROUTES } from "../app/routePaths";

const EMPTY: { name: string; city: string; address: string; phone: string; managerName: string } = {
  name: "",
  city: "",
  address: "",
  phone: "",
  managerName: "",
};

export function AddBranchPage() {
  const navigate = useNavigate();
  const { saveBranch, isSubmitting, error } = useAddBranch();
  const [values, setValues] = useState(EMPTY);

  return (
    <BranchForm
      title="Add Branch"
      subtitle="Create a new branch for your agency."
      values={values}
      onChange={setValues}
      onSubmit={saveBranch}
      onBack={() => navigate(APP_ROUTES.branchList)}
      isSubmitting={isSubmitting}
      error={error}
      submitLabel="Create Branch"
    />
  );
}
