import { useNavigate } from "react-router-dom";
import { useBranchContext } from "../../features/branches";
import { APP_ROUTES } from "../../app/routePaths";
import "./WorkingBranchBar.css";

/** Sticky chip: which branch HR is operating in. */
export function WorkingBranchBar() {
  const navigate = useNavigate();
  const { branches, activeBranchId, setActiveBranchId } = useBranchContext();

  if (!activeBranchId) return null;

  const branch = branches.find((b) => b.id === activeBranchId);
  if (!branch) return null;

  const canSwitch = branches.length > 1;

  return (
    <div className="working-branch-bar" role="status">
      <span className="working-branch-bar__label">
        Working in: <strong>{branch.name}</strong>
        {branch.city ? ` · ${branch.city}` : ""}
      </span>
      {canSwitch ? (
        <button
          type="button"
          className="working-branch-bar__clear"
          onClick={() => {
            setActiveBranchId(null);
            navigate(APP_ROUTES.selectBranch);
          }}
        >
          Switch branch
        </button>
      ) : null}
    </div>
  );
}
