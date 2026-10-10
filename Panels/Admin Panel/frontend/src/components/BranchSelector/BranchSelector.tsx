import { useBranchContext } from "../../features/branches";
import "./BranchSelector.css";

export function BranchSelector() {
  const { branches, activeBranchId, setActiveBranchId, isLoading } =
    useBranchContext();

  // Don't render if there are no branches created yet
  if (!isLoading && branches.length === 0) return null;

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
        {branches.map((b) => (
          <option key={b.id} value={b.id}>
            {b.name}
          </option>
        ))}
      </select>
    </div>
  );
}
