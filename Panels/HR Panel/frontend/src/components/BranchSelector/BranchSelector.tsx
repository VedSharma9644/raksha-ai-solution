import { useBranchContext } from "../../features/branches";
import "./BranchSelector.css";

export function BranchSelector() {
  const { branches, activeBranchId, setActiveBranchId, isLoading } =
    useBranchContext();

  // Don't render while loading or when no branches are assigned
  if (isLoading || branches.length === 0) return null;

  const activeBranch = branches.find((b) => b.id === activeBranchId);

  // Single branch — show a static label (no dropdown needed)
  if (branches.length === 1) {
    return (
      <div className="branch-selector">
        <span className="branch-selector__icon" aria-hidden="true">🏢</span>
        <span className="branch-selector__name">
          {branches[0].name}
        </span>
      </div>
    );
  }

  // Multiple branches — show a dropdown to switch between them
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
        {activeBranch ? null : (
          <option value="" disabled>Select branch…</option>
        )}
        {branches.map((b) => (
          <option key={b.id} value={b.id}>
            {b.name}
          </option>
        ))}
      </select>
    </div>
  );
}
