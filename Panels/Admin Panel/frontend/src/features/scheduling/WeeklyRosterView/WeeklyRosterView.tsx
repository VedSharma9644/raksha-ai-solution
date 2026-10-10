import { Fragment, useMemo, useState } from "react";
import type { GuardShiftAssignment, DayOfWeek } from "@raskha/scheduling";
import type { SiteShift } from "@raskha/site-management";
import type { Guard } from "@raskha/guard-management";
import "./WeeklyRosterView.css";

// ── Helpers ─────────────────────────────────────────────────────────────────

const JS_DOW_TO_DAY: DayOfWeek[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
const DAY_SHORT: Record<DayOfWeek, string> = {
  mon: "Mon", tue: "Tue", wed: "Wed", thu: "Thu", fri: "Fri", sat: "Sat", sun: "Sun",
};

/** Returns an array of 7 Date objects for Mon–Sun of the week offset from today. */
function getWeekDates(weekOffset: number): Date[] {
  const now = new Date();
  const jsDay = now.getDay(); // 0=Sun
  // Distance to Monday (Mon=1…Sun=7 in ISO, but JS uses 0=Sun)
  const daysToMon = jsDay === 0 ? -6 : 1 - jsDay;
  const monday = new Date(now);
  monday.setDate(now.getDate() + daysToMon + weekOffset * 7);
  monday.setHours(0, 0, 0, 0);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

/** Format date as "YYYY-MM-DD" (local, no timezone shift). */
function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Short month label like "Oct 12". */
const MONTH_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];
function shortDate(d: Date): string {
  return `${MONTH_SHORT[d.getMonth()]} ${d.getDate()}`;
}

/** Deterministic avatar colour from a string. */
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

/** True if the assignment is active on the given date (YYYY-MM-DD key). */
function isAssignmentActiveOn(a: GuardShiftAssignment, dateKey: string): boolean {
  if (!a.recurringDays.includes(JS_DOW_TO_DAY[new Date(`${dateKey}T12:00:00`).getDay()]!)) {
    return false;
  }
  const from = a.effectiveFrom ?? "";
  const to = a.effectiveTo ?? "";
  if (from && dateKey < from) return false;
  if (to && dateKey > to) return false;
  return true;
}

type GuardGenderKey = "male" | "female" | "other";
const GENDER_ICON: Record<GuardGenderKey, string> = { male: "♂", female: "♀", other: "⚧" };
const GENDER_KEYS: GuardGenderKey[] = ["male", "female", "other"];

/** Resolve the gender of a guard for a given assignment (stored or looked up). */
function resolveGender(
  a: GuardShiftAssignment,
  guardsMap: Map<string, Guard>,
): GuardGenderKey | null {
  const raw = (a.guardGender !== undefined && a.guardGender !== null)
    ? a.guardGender
    : guardsMap.get(a.guardId)?.gender ?? null;
  const g = typeof raw === "string" ? raw.toLowerCase() : null;
  if (g === "male" || g === "female" || g === "other") return g as GuardGenderKey;
  return null;
}

// ── Component ────────────────────────────────────────────────────────────────

export interface WeeklyRosterViewProps {
  shifts: SiteShift[];
  assignments: GuardShiftAssignment[];
  guards: Guard[];
  canEdit: boolean;
  onEditAssignment: (assignment: GuardShiftAssignment) => void;
  /** shiftId + optional pre-filled date (YYYY-MM-DD) for the modal */
  onAddAssignment: (shiftId: string, prefillDate?: string) => void;
}

export function WeeklyRosterView({
  shifts,
  assignments,
  guards,
  canEdit,
  onEditAssignment,
  onAddAssignment,
}: WeeklyRosterViewProps) {
  const [weekOffset, setWeekOffset] = useState(0);
  const weekDates = getWeekDates(weekOffset);
  const todayKey = toDateKey(new Date());

  // Build a fast id→guard lookup for gender resolution
  const guardsMap = useMemo(
    () => new Map(guards.map((g) => [g.id, g])),
    [guards],
  );

  if (shifts.length === 0) {
    return (
      <div className="weekly-roster__empty">
        <p>No shifts configured for this site.</p>
        <p className="weekly-roster__empty-sub">Edit the site to add Day / Night shift slots.</p>
      </div>
    );
  }

  // Week label: "Oct 6 – Oct 12, 2026"
  const first = weekDates[0]!;
  const last  = weekDates[6]!;
  const weekLabel =
    first.getMonth() === last.getMonth()
      ? `${shortDate(first)} – ${last.getDate()}, ${last.getFullYear()}`
      : `${shortDate(first)} – ${shortDate(last)}, ${last.getFullYear()}`;

  return (
    <div className="weekly-roster">
      {/* Week navigation */}
      <div className="weekly-roster__nav">
        <button
          type="button"
          className="weekly-roster__nav-btn"
          onClick={() => setWeekOffset((o) => o - 1)}
          aria-label="Previous week"
        >
          ‹
        </button>
        <span className="weekly-roster__week-label">{weekLabel}</span>
        <button
          type="button"
          className="weekly-roster__nav-btn"
          onClick={() => setWeekOffset((o) => o + 1)}
          aria-label="Next week"
        >
          ›
        </button>
        {weekOffset !== 0 && (
          <button
            type="button"
            className="weekly-roster__today-btn"
            onClick={() => setWeekOffset(0)}
          >
            Today
          </button>
        )}
      </div>

      {/* Grid */}
      <div
        className="weekly-roster__grid"
        style={{ gridTemplateColumns: `160px repeat(7, 1fr)` }}
      >
        {/* Header row */}
        <div className="weekly-roster__header-cell weekly-roster__shift-col">Shift</div>
        {weekDates.map((date) => {
          const key = toDateKey(date);
          const isToday = key === todayKey;
          const isPast  = key < todayKey;
          return (
            <div
              key={key}
              className={
                `weekly-roster__header-cell` +
                (isToday ? " weekly-roster__header-cell--today" : "") +
                (isPast  ? " weekly-roster__header-cell--past"  : "")
              }
            >
              <div className="weekly-roster__header-day">{DAY_SHORT[JS_DOW_TO_DAY[date.getDay()]!]}</div>
              <div className="weekly-roster__header-date">{shortDate(date)}</div>
              {isToday && <div className="weekly-roster__today-dot" />}
            </div>
          );
        })}

        {/* One row per shift */}
        {shifts.map((shift) => (
          <Fragment key={shift.id}>
            {/* Shift label cell */}
            <div className="weekly-roster__shift-label-cell">
              <span
                className={`weekly-roster__shift-type-dot weekly-roster__shift-type-dot--${shift.shiftType}`}
              />
              <div>
                <div className="weekly-roster__shift-name">{shift.label}</div>
                <div className="weekly-roster__shift-time">
                  {shift.startTime} – {shift.endTime}
                </div>
                <div className="weekly-roster__shift-required">
                  {shift.requiredGuards} guard{shift.requiredGuards !== 1 ? "s" : ""} / day
                </div>
              </div>
            </div>

            {/* Day cells */}
            {weekDates.map((date) => {
              const dateKey   = toDateKey(date);
              const isPast    = dateKey < todayKey;
              const isToday   = dateKey === todayKey;
              const dayOfWeek = JS_DOW_TO_DAY[date.getDay()]!;

              const cellAssignments = assignments.filter(
                (a) => a.shiftId === shift.id && isAssignmentActiveOn(a, dateKey),
              );
              const isFull = cellAssignments.length >= shift.requiredGuards;
              const canAssignToday = canEdit && (isToday || !isPast) && !isFull;

              return (
                <div
                  key={dateKey}
                  className={
                    `weekly-roster__day-cell` +
                    (isFull ? " weekly-roster__day-cell--full" : "") +
                    (isPast  ? " weekly-roster__day-cell--past" : "") +
                    (isToday ? " weekly-roster__day-cell--today" : "")
                  }
                >
                  {/* Fill indicator */}
                  <div className="weekly-roster__fill-bar">
                    <div
                      className="weekly-roster__fill-bar-inner"
                      style={{
                        width: `${Math.min(100, (cellAssignments.length / shift.requiredGuards) * 100)}%`,
                        background: isFull ? "#10b981" : isPast ? "#9ca3af" : "#f59e0b",
                      }}
                    />
                  </div>
                  <div className="weekly-roster__fill-count">
                    {cellAssignments.length}/{shift.requiredGuards}
                  </div>

                  {/* Gender breakdown row (only when shift has genderRequirements) */}
                  {shift.genderRequirements && (() => {
                    const req = shift.genderRequirements!;
                    const counts: Record<GuardGenderKey, number> = { male: 0, female: 0, other: 0 };
                    for (const a of cellAssignments) {
                      const g = resolveGender(a, guardsMap);
                      if (g) counts[g]++;
                    }
                    const visibleKeys = GENDER_KEYS.filter((gk) => req[gk] > 0);
                    if (visibleKeys.length === 0) return null;
                    return (
                      <div className="weekly-roster__gender-row">
                        {visibleKeys.map((gk) => {
                          const met = counts[gk] >= req[gk];
                          const zero = counts[gk] === 0;
                          return (
                            <span
                              key={gk}
                              className={
                                `weekly-roster__gender-badge` +
                                (met  ? " weekly-roster__gender-badge--met"  : "") +
                                (zero ? " weekly-roster__gender-badge--zero" : "")
                              }
                              title={`${gk}: ${counts[gk]}/${req[gk]}`}
                            >
                              {GENDER_ICON[gk]}{counts[gk]}/{req[gk]}
                            </span>
                          );
                        })}
                      </div>
                    );
                  })()}

                  {/* Guard avatars */}
                  <div className="weekly-roster__avatars">
                    {cellAssignments.map((a) => (
                      <button
                        key={a.id}
                        type="button"
                        className={
                          `weekly-roster__avatar-btn` +
                          (isPast ? " weekly-roster__avatar-btn--past" : "")
                        }
                        style={{ background: colorFromString(a.guardId) }}
                        title={
                          isPast
                            ? a.guardName
                            : a.shiftLocked
                              ? `${a.guardName} — on duty today (shift protected)`
                              : `${a.guardName} — click to edit`
                        }
                        disabled={!canEdit || isPast}
                        onClick={() => !isPast && canEdit && onEditAssignment(a)}
                      >
                        {initials(a.guardName)}
                        {!isPast && a.shiftLocked ? "*" : ""}
                      </button>
                    ))}
                  </div>

                  {/* Per-cell assign button (future/today only) */}
                  {canAssignToday && (
                    <button
                      type="button"
                      className="weekly-roster__cell-add-btn"
                      onClick={() => onAddAssignment(shift.id, dateKey)}
                      title={`Assign guard for ${DAY_SHORT[dayOfWeek]} ${shortDate(date)}`}
                    >
                      + Assign
                    </button>
                  )}

                  {isPast && (
                    <div className="weekly-roster__past-label">past</div>
                  )}
                </div>
              );
            })}
          </Fragment>
        ))}
      </div>
    </div>
  );
}
