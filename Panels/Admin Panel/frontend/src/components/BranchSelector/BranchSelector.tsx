import { useEffect, useId, useRef, useState } from "react";
import { useBranchContext } from "../../features/branches";
import "./BranchSelector.css";

export function BranchSelector() {
  const { branches, activeBranchId, setActiveBranchId, isLoading } =
    useBranchContext();
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  const activeBranches = branches.filter((branch) => branch.status !== "inactive");
  const selected =
    activeBranches.find((branch) => branch.id === activeBranchId) ?? null;
  const selectedLabel = selected?.name ?? "All Branches";

  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  if (!isLoading && activeBranches.length === 0) return null;

  return (
    <div
      className={`branch-selector${isOpen ? " branch-selector--open" : ""}`}
      ref={rootRef}
    >
      <button
        type="button"
        className="branch-selector__trigger"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listId}
        aria-label={`Select branch, currently ${selectedLabel}`}
        disabled={isLoading}
        onClick={() => setIsOpen((open) => !open)}
      >
        <span className="branch-selector__icon" aria-hidden="true">
          🏢
        </span>
        <span className="branch-selector__value">
          {isLoading ? "Loading…" : selectedLabel}
        </span>
        <span className="branch-selector__caret" aria-hidden="true" />
      </button>
      {isOpen ? (
        <ul
          id={listId}
          className="branch-selector__menu"
          role="listbox"
          aria-label="Select branch"
        >
          <li>
            <button
              type="button"
              role="option"
              aria-selected={activeBranchId == null}
              className="branch-selector__option"
              onClick={() => {
                setActiveBranchId(null);
                setIsOpen(false);
              }}
            >
              All Branches
            </button>
          </li>
          {activeBranches.map((branch) => (
            <li key={branch.id}>
              <button
                type="button"
                role="option"
                aria-selected={branch.id === activeBranchId}
                className="branch-selector__option"
                onClick={() => {
                  setActiveBranchId(branch.id);
                  setIsOpen(false);
                }}
              >
                {branch.name}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
