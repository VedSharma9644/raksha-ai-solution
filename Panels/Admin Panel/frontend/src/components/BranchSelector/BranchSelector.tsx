import { useBranchContext } from "../../features/branches";
import "./BranchSelector.css";

export function BranchSelector() {
  const { branches, activeBranchId, setActiveBranchId, isLoading } =
    useBranchContext();

  const activeBranches = branches.filter((b) => b.status !== "inactive");

  // Don't render if there are no active branches
  if (!isLoading && activeBranches.length === 0) return null;

  return (
    <div className="branch-selector">
      <span className="branch-selector__icon" aria-hidden="true">🏢</span>
      <select
        className="branch-selector__select"
        value={activeBranchId ?? ""}
        onChange={(e) =>
          setActiveBranchId(e.target.value === "" ? null : e.target.value)
        }
        aria-label="Select branch"
        disabled={isLoading}
      >
        <option value="">All Branches</option>
        {activeBranches.map((b) => (
          <option key={b.id} value={b.id}>
            {b.name}
          </option>
        ))}
      </select>
    </div>
  );
}
