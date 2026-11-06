import { useEffect, useId, useRef, useState } from "react";
import { useBranchContext } from "../../features/branches";
import "./BranchSelector.css";

export function BranchSelector() {
  const { branches, activeBranchId, setActiveBranchId, isLoading } =
    useBranchContext();
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  const activeBranch = branches.find((branch) => branch.id === activeBranchId) ?? null;

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

  if (isLoading || branches.length === 0) return null;

  if (branches.length === 1) {
    return (
      <div className="branch-selector">
        <span className="branch-selector__icon" aria-hidden="true">
          🏢
        </span>
        <span className="branch-selector__value">{branches[0].name}</span>
      </div>
    );
  }

  const selectedLabel = activeBranch?.name ?? "Select branch…";

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
        onClick={() => setIsOpen((open) => !open)}
      >
        <span className="branch-selector__icon" aria-hidden="true">
          🏢
        </span>
        <span className="branch-selector__value">{selectedLabel}</span>
        <span className="branch-selector__caret" aria-hidden="true" />
      </button>
      {isOpen ? (
        <ul
          id={listId}
          className="branch-selector__menu"
          role="listbox"
          aria-label="Select branch"
        >
          {branches.map((branch) => (
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
