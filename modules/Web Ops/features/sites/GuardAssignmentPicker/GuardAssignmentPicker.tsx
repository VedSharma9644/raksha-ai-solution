import { useMemo, useState } from "react";
import type { Guard } from "@raskha/guard-management";
import "./GuardAssignmentPicker.css";

export interface GuardAssignmentPickerProps {
  guards: Guard[];
  siteId: string;
  siteNameById: Record<string, string>;
  selectedIds: Set<string>;
  onToggle: (guardId: string) => void;
  disabled?: boolean;
}

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .slice(0, 2)
    .join("");
}

const STATUS_LABELS: Record<string, string> = {
  active: "Active",
  on_leave: "On Leave",
  inactive: "Inactive",
};

export function GuardAssignmentPicker({
  guards,
  siteId,
  siteNameById,
  selectedIds,
  onToggle,
  disabled = false,
}: GuardAssignmentPickerProps) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return guards;
    return guards.filter(
      (g) =>
        g.fullName.toLowerCase().includes(q) ||
        g.employeeCode.toLowerCase().includes(q) ||
        g.post.toLowerCase().includes(q)
    );
  }, [guards, search]);

  // Sort: on this site first, unassigned second, elsewhere last
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const aThis = a.assignedSiteId === siteId;
      const bThis = b.assignedSiteId === siteId;
      const aFree = !a.assignedSiteId;
      const bFree = !b.assignedSiteId;
      if (aThis !== bThis) return aThis ? -1 : 1;
      if (aFree !== bFree) return aFree ? -1 : 1;
      return a.fullName.localeCompare(b.fullName);
    });
  }, [filtered, siteId]);

  const assignedElsewhereCount = guards.filter(
    (g) => g.assignedSiteId && g.assignedSiteId !== siteId
  ).length;

  return (
    <div className="guard-assignment-picker">
      {/* Search */}
      <div className="guard-assignment-picker__search-wrap">
        <svg
          width="15" height="15" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          className="guard-assignment-picker__search-icon"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          className="guard-assignment-picker__search"
          placeholder="Search by name, code, or post…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          disabled={disabled}
        />
        {search && (
          <button
            type="button"
            className="guard-assignment-picker__clear"
            onClick={() => setSearch("")}
            aria-label="Clear search"
          >×</button>
        )}
      </div>

      {/* Summary bar */}
      <div className="guard-assignment-picker__summary">
        <span className="guard-assignment-picker__summary-count">
          <strong>{selectedIds.size}</strong> selected
        </span>
        <span className="guard-assignment-picker__summary-divider" />
        <span className="guard-assignment-picker__summary-total">
          {guards.length} total guards
        </span>
        {assignedElsewhereCount > 0 && (
          <>
            <span className="guard-assignment-picker__summary-divider" />
            <span className="guard-assignment-picker__summary-elsewhere">
              {assignedElsewhereCount} currently at another site
            </span>
          </>
        )}
      </div>

      {/* Guard list */}
      <div className="guard-assignment-picker__list" role="list">
        {sorted.length === 0 ? (
          <p className="guard-assignment-picker__empty">No guards match your search.</p>
        ) : (
          sorted.map((guard) => {
            const isElsewhere =
              !!guard.assignedSiteId && guard.assignedSiteId !== siteId;
            const isChecked = selectedIds.has(guard.id);
            const elsewhereName = isElsewhere
              ? (siteNameById[guard.assignedSiteId] ?? "Another site")
              : null;

            return (
              <label
                key={guard.id}
                className={[
                  "guard-assignment-picker__item",
                  isChecked ? "guard-assignment-picker__item--checked" : "",
                  isElsewhere && !isChecked ? "guard-assignment-picker__item--elsewhere" : "",
                  disabled ? "guard-assignment-picker__item--disabled" : "",
                ].join(" ")}
                title={
                  isElsewhere && !isChecked
                    ? `Currently at: ${elsewhereName}. Select to move them here.`
                    : undefined
                }
              >
                <input
                  type="checkbox"
                  className="guard-assignment-picker__checkbox"
                  checked={isChecked}
                  onChange={() => !disabled && onToggle(guard.id)}
                  disabled={disabled}
                />
                {/* Avatar */}
                {guard.profilePictureUrl ? (
                  <img
                    src={guard.profilePictureUrl}
                    alt={guard.fullName}
                    className="guard-assignment-picker__avatar guard-assignment-picker__avatar--img"
                  />
                ) : (
                  <span className="guard-assignment-picker__avatar guard-assignment-picker__avatar--initials">
                    {getInitials(guard.fullName)}
                  </span>
                )}
                {/* Info */}
                <div className="guard-assignment-picker__info">
                  <span className="guard-assignment-picker__name">{guard.fullName}</span>
                  <span className="guard-assignment-picker__meta">
                    {guard.employeeCode} &middot; {guard.post || "Guard"}
                  </span>
                </div>
                {/* Badge */}
                {isElsewhere && !isChecked ? (
                  <span
                    className="guard-assignment-picker__status guard-assignment-picker__status--elsewhere"
                    title={`Currently at: ${elsewhereName}`}
                  >
                    {elsewhereName}
                  </span>
                ) : (
                  <span className={`guard-assignment-picker__status guard-assignment-picker__status--${guard.status}`}>
                    {STATUS_LABELS[guard.status] ?? guard.status}
                  </span>
                )}
              </label>
            );
          })
        )}
      </div>

      {assignedElsewhereCount > 0 && (
        <p className="guard-assignment-picker__hint">
          Guards at another site can still be selected — they will be moved here when you save.
        </p>
      )}
    </div>
  );
}
