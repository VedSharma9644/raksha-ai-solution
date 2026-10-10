import { useState } from "react";
import type { GuardShiftAssignment, DayOfWeek } from "@raskha/scheduling";
import type { SiteShift } from "@raskha/site-management";
import type { Guard } from "@raskha/guard-management";
import "./MonthlyRosterView.css";

type GuardGenderKey = "male" | "female" | "other";
const GENDER_ICON: Record<GuardGenderKey, string> = { male: "♂", female: "♀", other: "⚧" };
const GENDER_KEYS: GuardGenderKey[] = ["male", "female", "other"];

const DAY_OF_WEEK_MAP: DayOfWeek[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** Returns today at midnight for consistent comparisons. */
function todayMidnight(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function isPastDate(date: Date): boolean {
  return date < todayMidnight();
}

function isToday(date: Date): boolean {
  const t = todayMidnight();
  return (
    date.getDate() === t.getDate() &&
    date.getMonth() === t.getMonth() &&
    date.getFullYear() === t.getFullYear()
  );
}

function shiftsForDate(
  date: Date,
  shifts: SiteShift[],
  assignments: GuardShiftAssignment[]
): { shift: SiteShift; guards: GuardShiftAssignment[] }[] {
  const dayOfWeek = DAY_OF_WEEK_MAP[date.getDay()]!;
  // Build YYYY-MM-DD key without timezone shift
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const dateKey = `${y}-${m}-${d}`;

  return shifts.map((shift) => {
    const guards = assignments.filter(
      (a) =>
        a.shiftId === shift.id &&
        a.recurringDays.includes(dayOfWeek) &&
        a.effectiveFrom <= dateKey &&
        (!a.effectiveTo || a.effectiveTo >= dateKey)
    );
    return { shift, guards };
  });
}

export interface MonthlyRosterViewProps {
  shifts: SiteShift[];
  assignments: GuardShiftAssignment[];
  guards: Guard[];
  canEdit: boolean;
  onAddAssignment: (shiftId?: string) => void;
  onEditAssignment: (assignment: GuardShiftAssignment) => void;
}

export function MonthlyRosterView({
  shifts,
  assignments,
  guards: propGuards,
  canEdit,
  onAddAssignment,
  onEditAssignment,
}: MonthlyRosterViewProps) {
  const now = new Date();
  const [year, setYear]         = useState(now.getFullYear());
  const [month, setMonth]       = useState(now.getMonth()); // 0-indexed
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  function prevMonth() {
    if (month === 0) { setYear((y) => y - 1); setMonth(11); }
    else setMonth((m) => m - 1);
    setSelectedDay(null);
  }

  function nextMonth() {
    if (month === 11) { setYear((y) => y + 1); setMonth(0); }
    else setMonth((m) => m + 1);
    setSelectedDay(null);
  }

  // Build calendar grid
  const firstDay    = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const selectedDate     = selectedDay != null ? new Date(year, month, selectedDay) : null;
  const selectedShiftInfo = selectedDate
    ? shiftsForDate(selectedDate, shifts, assignments)
    : null;
  const selectedIsPast   = selectedDate != null && isPastDate(selectedDate);

  return (
    <div className="monthly-roster">
      {/* Month navigation */}
      <div className="monthly-roster__nav">
        <button type="button" className="monthly-roster__nav-btn" onClick={prevMonth}>
          ‹
        </button>
        <span className="monthly-roster__month-label">
          {MONTH_NAMES[month]} {year}
        </span>
        <button type="button" className="monthly-roster__nav-btn" onClick={nextMonth}>
          ›
        </button>
      </div>

      <div className="monthly-roster__layout">
        {/* Calendar */}
        <div className="monthly-roster__calendar">
          {/* Day headers */}
          <div className="monthly-roster__week-header">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d} className="monthly-roster__week-day">{d}</div>
            ))}
          </div>

          {/* Day cells */}
          <div className="monthly-roster__grid">
            {cells.map((day, idx) => {
              if (!day) {
                return (
                  <div
                    key={`empty-${idx}`}
                    className="monthly-roster__cell monthly-roster__cell--empty"
                  />
                );
              }
              const date       = new Date(year, month, day);
              const shiftInfo  = shiftsForDate(date, shifts, assignments);
              const totalGuards = shiftInfo.reduce((n, s) => n + s.guards.length, 0);
              const isTodayCell = isToday(date);
              const isPastCell  = isPastDate(date);
              const isSelected  = selectedDay === day;

              return (
                <button
                  key={day}
                  type="button"
                  className={
                    `monthly-roster__cell` +
                    (isTodayCell ? " monthly-roster__cell--today"    : "") +
                    (isPastCell  ? " monthly-roster__cell--past"     : "") +
                    (isSelected  ? " monthly-roster__cell--selected" : "")
                  }
                  onClick={() => setSelectedDay(isSelected ? null : day)}
                >
                  <span className="monthly-roster__cell-num">{day}</span>
                  {shifts.length > 0 && (
                    <div className="monthly-roster__cell-pills">
                      {shiftInfo.map(({ shift, guards }) => (
                        <span
                          key={shift.id}
                          className={`monthly-roster__pill monthly-roster__pill--${shift.shiftType}${guards.length >= shift.requiredGuards ? " monthly-roster__pill--full" : ""}`}
                          title={`${shift.label}: ${guards.length}/${shift.requiredGuards}`}
                        >
                          {guards.length}/{shift.requiredGuards}
                        </span>
                      ))}
                    </div>
                  )}
                  {shifts.length === 0 && totalGuards === 0 && (
                    <div className="monthly-roster__cell-no-shift" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Sidebar */}
        {selectedDay && selectedShiftInfo && (
          <div className="monthly-roster__sidebar">
            <div className="monthly-roster__sidebar-date">
              {MONTH_NAMES[month]} {selectedDay}, {year}
              {selectedIsPast && (
                <span className="monthly-roster__sidebar-past-badge">Past</span>
              )}
            </div>

            {selectedShiftInfo.length === 0 ? (
              <p className="monthly-roster__sidebar-empty">No shifts configured.</p>
            ) : (
              selectedShiftInfo.map(({ shift, guards }) => (
                <div key={shift.id} className="monthly-roster__sidebar-shift">
                  <div className="monthly-roster__sidebar-shift-header">
                    <span
                      className={`monthly-roster__sidebar-dot monthly-roster__sidebar-dot--${shift.shiftType}`}
                    />
                    <span className="monthly-roster__sidebar-shift-name">{shift.label}</span>
                    <span className="monthly-roster__sidebar-shift-time">
                      {shift.startTime} – {shift.endTime}
                    </span>
                  </div>

                  {/* Guard coverage */}
                  <div className="monthly-roster__sidebar-fill">
                    {guards.length}/{shift.requiredGuards} guards
                    {guards.length === 0 && !selectedIsPast && (
                      <span className="monthly-roster__sidebar-shortage"> (none assigned)</span>
                    )}
                    {guards.length > 0 && guards.length < shift.requiredGuards && (
                      <span className="monthly-roster__sidebar-shortage">
                        {" "}({shift.requiredGuards - guards.length} short)
                      </span>
                    )}
                    {guards.length >= shift.requiredGuards && (
                      <span className="monthly-roster__sidebar-full"> ✓ Covered</span>
                    )}
                  </div>

                  {/* Gender breakdown (only when genderRequirements set) */}
                  {shift.genderRequirements && (() => {
                    const req = shift.genderRequirements!;
                    const guardsMap = new Map(propGuards.map((g) => [g.id, g]));
                    const counts: Record<GuardGenderKey, number> = { male: 0, female: 0, other: 0 };
                    for (const a of guards) {
                      const rawGender =
                        (a.guardGender !== undefined && a.guardGender !== null)
                          ? a.guardGender
                          : guardsMap.get(a.guardId)?.gender ?? null;
                      const gVal = typeof rawGender === "string" ? rawGender.toLowerCase() : null;
                      if (gVal === "male" || gVal === "female" || gVal === "other") {
                        counts[gVal as GuardGenderKey]++;
                      }
                    }
                    const visibleKeys = GENDER_KEYS.filter((gk) => req[gk] > 0);
                    if (visibleKeys.length === 0) return null;
                    return (
                      <div className="monthly-roster__gender-row">
                        {visibleKeys.map((gk) => {
                          const met  = counts[gk] >= req[gk];
                          const zero = counts[gk] === 0;
                          return (
                            <span
                              key={gk}
                              className={
                                `monthly-roster__gender-badge` +
                                (met  ? " monthly-roster__gender-badge--met"  : "") +
                                (zero ? " monthly-roster__gender-badge--zero" : "")
                              }
                              title={`${gk}: ${counts[gk]}/${req[gk]}`}
                            >
                              {GENDER_ICON[gk]} {counts[gk]}/{req[gk]}
                            </span>
                          );
                        })}
                      </div>
                    );
                  })()}

                  {guards.length === 0 ? (
                    <p className="monthly-roster__sidebar-no-guards">No guards assigned</p>
                  ) : (
                    <ul className="monthly-roster__sidebar-guards">
                      {guards.map((g) => (
                        <li key={g.id} className="monthly-roster__sidebar-guard">
                          {selectedIsPast || !canEdit ? (
                            // Past date or read-only: plain text
                            <span className="monthly-roster__sidebar-guard-name">
                              {g.guardName}
                            </span>
                          ) : (
                            // Future/today + canEdit: clickable to open edit modal
                            <button
                              type="button"
                              className="monthly-roster__sidebar-guard-btn"
                              onClick={() => onEditAssignment(g)}
                              title={`Edit ${g.guardName}'s assignment`}
                            >
                              <span className="monthly-roster__sidebar-guard-name">
                                {g.guardName}
                              </span>
                              <span className="monthly-roster__sidebar-guard-edit-icon">
                                ✎
                              </span>
                            </button>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Assign button — only for today/future dates */}
                  {canEdit && !selectedIsPast && (
                    <button
                      type="button"
                      className="monthly-roster__sidebar-assign-btn"
                      onClick={() => onAddAssignment(shift.id)}
                    >
                      + Assign Guard
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
