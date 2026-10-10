import { useNavigate } from "react-router-dom";
import { BranchListScreen } from "../features/branchManagement";
import { useBranchesList } from "../features/branchManagement";
import { APP_ROUTES, editBranchPath } from "../app/routePaths";

export function BranchListPage() {
  const navigate = useNavigate();
  const { branches, isLoading, error } = useBranchesList();

  return (
    <BranchListScreen
      branches={branches}
      isLoading={isLoading}
      error={error}
      onBack={() => navigate(APP_ROUTES.dashboard)}
      onAddBranch={() => navigate(APP_ROUTES.addBranch)}
      onEditBranch={(id) => navigate(editBranchPath(id))}
    />
  );
}
