import { useNavigate } from "react-router-dom";
import { useBranchContext } from "../features/branches";
import { APP_ROUTES } from "../app/routePaths";
import "./BranchSelectionPage.css";

export function BranchSelectionPage() {
  const navigate = useNavigate();
  const { branches, setActiveBranchId } = useBranchContext();

  function selectBranch(branchId: string) {
    setActiveBranchId(branchId);
    navigate(APP_ROUTES.dashboard, { replace: true });
  }

  return (
    <div className="branch-selection-page">
      <div className="branch-selection-page__card">
        <div className="branch-selection-page__header">
          <p className="branch-selection-page__brand">Raskha</p>
          <h1 className="branch-selection-page__title">Select Your Branch</h1>
          <p className="branch-selection-page__subtitle">
            You have access to multiple branches. Choose which one to work in.
          </p>
        </div>

        <div className="branch-selection-page__grid">
          {branches.map((branch) => (
            <button
              key={branch.id}
              type="button"
              className="branch-selection-page__branch-btn"
              onClick={() => selectBranch(branch.id)}
            >
              <span className="branch-selection-page__branch-icon">🏢</span>
              <span className="branch-selection-page__branch-name">{branch.name}</span>
              {branch.city && (
                <span className="branch-selection-page__branch-city">{branch.city}</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
