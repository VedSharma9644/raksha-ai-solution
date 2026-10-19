import { useBranchContext } from "../../features/branches";
import "./WorkingBranchBar.css";

/**
 * Sticky chip showing which branch scope the admin is viewing.
 * Hidden when "All Branches" is selected.
 */
export function WorkingBranchBar() {
  const { branches, activeBranchId, setActiveBranchId } = useBranchContext();

  if (!activeBranchId) return null;

  const branch = branches.find((b) => b.id === activeBranchId);
  if (!branch) return null;

  return (
    <div className="working-branch-bar" role="status">
      <span className="working-branch-bar__label">
        Viewing: <strong>{branch.name}</strong>
        {branch.city ? ` · ${branch.city}` : ""}
      </span>
      <button
        type="button"
        className="working-branch-bar__clear"
        onClick={() => setActiveBranchId(null)}
      >
        Show all branches
      </button>
    </div>
  );
}
