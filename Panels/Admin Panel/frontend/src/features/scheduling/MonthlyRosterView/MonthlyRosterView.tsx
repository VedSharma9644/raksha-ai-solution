import { useState } from "react";
import type { GuardShiftAssignment, DayOfWeek } from "@raskha/scheduling";
import type { SiteShift } from "@raskha/site-management";
import "./MonthlyRosterView.css";

const DAY_OF_WEEK_MAP: DayOfWeek[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function shiftsForDate(
  date: Date,
  shifts: SiteShift[],
  assignments: GuardShiftAssignment[]
): { shift: SiteShift; guards: GuardShiftAssignment[] }[] {
  const dayOfWeek = DAY_OF_WEEK_MAP[date.getDay()]!;

  return shifts.map((shift) => {
    const guards = assignments.filter(
      (a) =>
        a.shiftId === shift.id &&
        a.recurringDays.includes(dayOfWeek) &&
        new Date(a.effectiveFrom) <= date &&
        (!a.effectiveTo || new Date(a.effectiveTo) >= date)
    );
    return { shift, guards };
  });
}

export interface MonthlyRosterViewProps {
  shifts: SiteShift[];
  assignments: GuardShiftAssignment[];
  canEdit: boolean;
  onAddAssignment: (shiftId?: string) => void;
}

export function MonthlyRosterView({
  shifts,
  assignments,
  canEdit,
  onAddAssignment,
}: MonthlyRosterViewProps) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth()); // 0-indexed
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
  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  // Pad to complete rows
  while (cells.length % 7 !== 0) cells.push(null);

  const selectedDate = selectedDay != null ? new Date(year, month, selectedDay) : null;
  const selectedShiftInfo = selectedDate
    ? shiftsForDate(selectedDate, shifts, assignments)
    : null;

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
                return <div key={`empty-${idx}`} className="monthly-roster__cell monthly-roster__cell--empty" />;
              }
              const date = new Date(year, month, day);
              const shiftInfo = shiftsForDate(date, shifts, assignments);
              const totalGuards = shiftInfo.reduce((n, s) => n + s.guards.length, 0);
              const isToday =
                date.getDate() === now.getDate() &&
                date.getMonth() === now.getMonth() &&
                date.getFullYear() === now.getFullYear();
              const isSelected = selectedDay === day;

              return (
                <button
                  key={day}
                  type="button"
                  className={`monthly-roster__cell${isToday ? " monthly-roster__cell--today" : ""}${isSelected ? " monthly-roster__cell--selected" : ""}`}
                  onClick={() => setSelectedDay(isSelected ? null : day)}
                >
                  <span className="monthly-roster__cell-num">{day}</span>
                  {shifts.length > 0 && (
                    <div className="monthly-roster__cell-pills">
                      {shiftInfo.map(({ shift, guards }) => (
                        <span
                          key={shift.id}
                          className={`monthly-roster__pill monthly-roster__pill--${shift.shiftType}`}
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
            </div>
            {selectedShiftInfo.length === 0 ? (
              <p className="monthly-roster__sidebar-empty">No shifts configured.</p>
            ) : (
              selectedShiftInfo.map(({ shift, guards }) => (
                <div key={shift.id} className="monthly-roster__sidebar-shift">
                  <div className="monthly-roster__sidebar-shift-header">
                    <span className={`monthly-roster__sidebar-dot monthly-roster__sidebar-dot--${shift.shiftType}`} />
                    <span className="monthly-roster__sidebar-shift-name">{shift.label}</span>
                    <span className="monthly-roster__sidebar-shift-time">
                      {shift.startTime} – {shift.endTime}
                    </span>
                  </div>
                  {guards.length === 0 ? (
                    <p className="monthly-roster__sidebar-no-guards">No guards assigned</p>
                  ) : (
                    <ul className="monthly-roster__sidebar-guards">
                      {guards.map((g) => (
                        <li key={g.id} className="monthly-roster__sidebar-guard">
                          {g.guardName}
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="monthly-roster__sidebar-fill">
                    {guards.length}/{shift.requiredGuards} guards
                    {guards.length < shift.requiredGuards && (
                      <span className="monthly-roster__sidebar-shortage">
                        {" "}({shift.requiredGuards - guards.length} short)
                      </span>
                    )}
                  </div>
                  {canEdit && (
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
