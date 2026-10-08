import { Fragment } from "react";
import type { GuardShiftAssignment, DayOfWeek } from "@raskha/scheduling";
import { ALL_DAYS, DAY_LABELS } from "@raskha/scheduling";
import type { SiteShift } from "@raskha/site-management";
import "./WeeklyRosterView.css";

// Deterministic color from a string
function colorFromString(str: string): string {
  const colors = [
    "#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981",
    "#ef4444", "#06b6d4", "#84cc16", "#f97316", "#6366f1",
  ];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length]!;
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export interface WeeklyRosterViewProps {
  shifts: SiteShift[];
  assignments: GuardShiftAssignment[];
  canEdit: boolean;
  onEditAssignment: (assignment: GuardShiftAssignment) => void;
  onAddAssignment: (shiftId: string) => void;
}

export function WeeklyRosterView({
  shifts,
  assignments,
  canEdit,
  onEditAssignment,
  onAddAssignment,
}: WeeklyRosterViewProps) {
  if (shifts.length === 0) {
    return (
      <div className="weekly-roster__empty">
        <p>No shifts configured for this site.</p>
        <p className="weekly-roster__empty-sub">Edit the site to add Day / Night shift slots.</p>
      </div>
    );
  }

  // Index: shiftId → day → assignments
  const index: Record<string, Record<DayOfWeek, GuardShiftAssignment[]>> = {};
  for (const shift of shifts) {
    index[shift.id] = {} as Record<DayOfWeek, GuardShiftAssignment[]>;
    for (const day of ALL_DAYS) {
      index[shift.id]![day] = [];
    }
  }

  for (const a of assignments) {
    for (const day of a.recurringDays) {
      if (index[a.shiftId]?.[day]) {
        index[a.shiftId]![day]!.push(a);
      }
    }
  }

  return (
    <div className="weekly-roster">
      <div className="weekly-roster__grid" style={{ gridTemplateColumns: `160px repeat(7, 1fr)` }}>
        {/* Header row */}
        <div className="weekly-roster__header-cell weekly-roster__shift-col">Shift</div>
        {ALL_DAYS.map((day) => (
          <div key={day} className="weekly-roster__header-cell">{DAY_LABELS[day]}</div>
        ))}

        {/* One row per shift */}
        {shifts.map((shift) => (
          <Fragment key={shift.id}>
            {/* Shift label cell */}
            <div key={`label-${shift.id}`} className="weekly-roster__shift-label-cell">
              <span
                className={`weekly-roster__shift-type-dot weekly-roster__shift-type-dot--${shift.shiftType}`}
              />
              <div>
                <div className="weekly-roster__shift-name">{shift.label}</div>
                <div className="weekly-roster__shift-time">
                  {shift.startTime} – {shift.endTime}
                </div>
                <div className="weekly-roster__shift-required">
                  {shift.requiredGuards} guard{shift.requiredGuards !== 1 ? "s" : ""} required
                </div>
                {canEdit && (
                  <button
                    type="button"
                    className="weekly-roster__add-btn"
                    onClick={() => onAddAssignment(shift.id)}
                    title="Assign guard to this shift"
                  >
                    + Assign
                  </button>
                )}
              </div>
            </div>

            {/* Day cells */}
            {ALL_DAYS.map((day) => {
              const cellAssignments = index[shift.id]?.[day] ?? [];
              const isFull = cellAssignments.length >= shift.requiredGuards;
              return (
                <div
                  key={`${shift.id}-${day}`}
                  className={`weekly-roster__day-cell${isFull ? " weekly-roster__day-cell--full" : ""}`}
                >
                  {/* Fill indicator */}
                  <div className="weekly-roster__fill-bar">
                    <div
                      className="weekly-roster__fill-bar-inner"
                      style={{
                        width: `${Math.min(100, (cellAssignments.length / shift.requiredGuards) * 100)}%`,
                        background: isFull ? "#10b981" : "#f59e0b",
                      }}
                    />
                  </div>
                  <div className="weekly-roster__fill-count">
                    {cellAssignments.length}/{shift.requiredGuards}
                  </div>

                  {/* Guard avatars */}
                  <div className="weekly-roster__avatars">
                    {cellAssignments.map((a) => (
                      <button
                        key={a.id}
                        type="button"
                        className="weekly-roster__avatar-btn"
                        style={{ background: colorFromString(a.guardId) }}
                        title={a.guardName}
                        disabled={!canEdit}
                        onClick={() => canEdit && onEditAssignment(a)}
                      >
                        {initials(a.guardName)}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </Fragment>
        ))}
      </div>
    </div>
  );
}
