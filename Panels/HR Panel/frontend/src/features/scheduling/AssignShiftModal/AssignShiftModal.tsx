import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import type { GuardShiftAssignment, DayOfWeek } from "@raskha/scheduling";
import { ALL_DAYS, DAY_LABELS } from "@raskha/scheduling";
import type { SiteShift } from "@raskha/site-management";
import type { Guard } from "@raskha/guard-management";
import "./AssignShiftModal.css";

export interface AssignShiftModalProps {
  /** Guards already assigned to this site */
  guards: Guard[];
  /** All existing shift assignments for this site */
  assignments: GuardShiftAssignment[];
  /** Shift slots from site.shiftConfig.shifts */
  shifts: SiteShift[];
  /** If editing an existing assignment */
  existingAssignment?: GuardShiftAssignment | null;
  isSaving: boolean;
  saveError: string;
  onSave: (data: {
    guardId: string;
    guardName: string;
    shiftId: string;
    shiftLabel: string;
    shiftStartTime: string;
    shiftEndTime: string;
    recurringDays: DayOfWeek[];
    effectiveFrom: string;
    effectiveTo?: string | null;
  }) => Promise<void>;
  onDelete?: (assignmentId: string) => Promise<void>;
  onClose: () => void;
}

const today = () => new Date().toISOString().split("T")[0]!;

export function AssignShiftModal({
  guards,
  assignments,
  shifts,
  existingAssignment,
  isSaving,
  saveError,
  onSave,
  onDelete,
  onClose,
}: AssignShiftModalProps) {
  // Initialize to the first non-full shift (or preselected shift, or shifts[0])
  const firstAvailableShiftId = (() => {
    if (existingAssignment) return existingAssignment.shiftId;
    // Prefer the first shift that is NOT already at capacity
    const nonFull = shifts.find(
      (s) => assignments.filter((a) => a.shiftId === s.id).length < s.requiredGuards
    );
    return nonFull?.id ?? shifts[0]?.id ?? "";
  })();

  const [guardId, setGuardId] = useState(existingAssignment?.guardId ?? "");
  const [shiftId, setShiftId] = useState(firstAvailableShiftId);
  const [recurringDays, setRecurringDays] = useState<DayOfWeek[]>(
    existingAssignment?.recurringDays ?? ALL_DAYS
  );
  const [effectiveFrom, setEffectiveFrom] = useState(
    existingAssignment?.effectiveFrom ?? today()
  );
  const [effectiveTo, setEffectiveTo] = useState(
    existingAssignment?.effectiveTo ?? ""
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Update shiftId if shifts load after mount and nothing is selected yet
  useEffect(() => {
    if (!shiftId && shifts.length > 0) {
      setShiftId(shifts[0]!.id);
    }
  }, [shifts, shiftId]);

  function toggleDay(day: DayOfWeek) {
    setRecurringDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  }

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!guardId) errs.guardId = "Select a guard.";
    if (!shiftId) errs.shiftId = "Select a shift.";
    if (recurringDays.length === 0) errs.recurringDays = "Select at least one day.";
    if (!effectiveFrom) errs.effectiveFrom = "Set effective from date.";

    // Enforce requiredGuards cap (skip when editing an existing assignment)
    if (!existingAssignment && shiftId) {
      const selectedShift = shifts.find((s) => s.id === shiftId);
      const assignedCount = assignments.filter((a) => a.shiftId === shiftId).length;
      if (selectedShift && assignedCount >= selectedShift.requiredGuards) {
        errs.guardId = `This shift is full — ${assignedCount}/${selectedShift.requiredGuards} guards already assigned.`;
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    const selectedShift = shifts.find((s) => s.id === shiftId);
    if (!selectedShift) return;

    const selectedGuard = guards.find((g) => g.id === guardId);
    if (!selectedGuard) return;

    await onSave({
      guardId,
      guardName: selectedGuard.fullName,
      shiftId,
      shiftLabel: selectedShift.label,
      shiftStartTime: selectedShift.startTime,
      shiftEndTime: selectedShift.endTime,
      recurringDays,
      effectiveFrom,
      effectiveTo: effectiveTo || null,
    });
  }

  // Guards not yet assigned to the currently selected shift (when creating)
  const availableGuards = existingAssignment
    ? guards  // editing — keep the existing guard selectable
    : guards.filter(
        (g) => !assignments.some((a) => a.guardId === g.id && a.shiftId === shiftId)
      );

  // Whether the currently selected shift is already at capacity
  const selectedShiftDef = shifts.find((s) => s.id === shiftId);
  const assignedToShift = assignments.filter((a) => a.shiftId === shiftId).length;
  const shiftIsFull =
    !existingAssignment &&
    !!selectedShiftDef &&
    assignedToShift >= selectedShiftDef.requiredGuards;

  return (
    <div className="assign-shift-modal__backdrop" onClick={onClose}>
      <div
        className="assign-shift-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Assign Guard to Shift"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="assign-shift-modal__header">
          <h2 className="assign-shift-modal__title">
            {existingAssignment ? "Edit Shift Assignment" : "Assign Guard to Shift"}
          </h2>
          <button
            type="button"
            className="assign-shift-modal__close"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <form className="assign-shift-modal__body" onSubmit={handleSubmit} noValidate>
          {/* Guard selector */}
          <div className="assign-shift-modal__field">
            <label className="assign-shift-modal__label">Guard</label>
            <select
              className={`assign-shift-modal__select${errors.guardId ? " assign-shift-modal__select--error" : ""}`}
              value={guardId}
              onChange={(e) => setGuardId(e.target.value)}
              disabled={isSaving || !!existingAssignment || shiftIsFull}
            >
              <option value="">Select a guard…</option>
              {availableGuards.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.fullName} ({g.employeeCode})
                </option>
              ))}
            </select>
            {shiftIsFull && (
              <p className="assign-shift-modal__shift-full">
                This shift is full ({assignedToShift}/{selectedShiftDef!.requiredGuards} guards assigned).
                {shifts.length > 1 ? " Select a different shift below." : " Remove an existing guard first."}
              </p>
            )}
            {!shiftIsFull && availableGuards.length === 0 && !existingAssignment && (
              <span className="assign-shift-modal__error">
                All site guards are already assigned to this shift.
              </span>
            )}
            {errors.guardId && !shiftIsFull && (
              <span className="assign-shift-modal__error">{errors.guardId}</span>
            )}
          </div>

          {/* Shift selector */}
          <div className="assign-shift-modal__field">
            <label className="assign-shift-modal__label">Shift</label>
            {shifts.length === 0 ? (
              <p className="assign-shift-modal__no-shifts">
                No shifts configured for this site. Edit the site to add shifts first.
              </p>
            ) : (
              <div className="assign-shift-modal__shift-options">
                {shifts.map((s) => {
                  const countForShift = assignments.filter((a) => a.shiftId === s.id).length;
                  const isFull = countForShift >= s.requiredGuards;
                  return (
                    <label key={s.id} className={`assign-shift-modal__shift-card${shiftId === s.id ? " assign-shift-modal__shift-card--selected" : ""}${isFull ? " assign-shift-modal__shift-card--full" : ""}`}>
                      <input
                        type="radio"
                        name="shiftId"
                        value={s.id}
                        checked={shiftId === s.id}
                        onChange={() => { setShiftId(s.id); setGuardId(""); }}
                        disabled={isSaving}
                        className="assign-shift-modal__radio"
                      />
                      <div className="assign-shift-modal__shift-info">
                        <span className={`assign-shift-modal__shift-badge assign-shift-modal__shift-badge--${s.shiftType}`}>
                          {s.shiftType === "day" ? "☀" : s.shiftType === "night" ? "🌙" : "⏰"}
                        </span>
                        <span className="assign-shift-modal__shift-label">{s.label}</span>
                        <span className="assign-shift-modal__shift-time">
                          {s.startTime} – {s.endTime}
                        </span>
                        <span className={`assign-shift-modal__shift-count${isFull ? " assign-shift-modal__shift-count--full" : ""}`}>
                          {countForShift}/{s.requiredGuards}
                        </span>
                      </div>
                    </label>
                  );
                })}
              </div>
            )}
            {errors.shiftId && <span className="assign-shift-modal__error">{errors.shiftId}</span>}
          </div>

          {/* Recurring days */}
          <div className="assign-shift-modal__field">
            <label className="assign-shift-modal__label">Recurring days</label>
            <div className="assign-shift-modal__days">
              {ALL_DAYS.map((day) => (
                <label
                  key={day}
                  className={`assign-shift-modal__day-chip${recurringDays.includes(day) ? " assign-shift-modal__day-chip--on" : ""}`}
                >
                  <input
                    type="checkbox"
                    className="assign-shift-modal__day-checkbox"
                    checked={recurringDays.includes(day)}
                    onChange={() => toggleDay(day)}
                    disabled={isSaving}
                  />
                  {DAY_LABELS[day]}
                </label>
              ))}
            </div>
            {errors.recurringDays && (
              <span className="assign-shift-modal__error">{errors.recurringDays}</span>
            )}
          </div>

          {/* Effective dates */}
          <div className="assign-shift-modal__date-row">
            <div className="assign-shift-modal__field">
              <label className="assign-shift-modal__label" htmlFor="effectiveFrom">
                Effective from
              </label>
              <input
                id="effectiveFrom"
                type="date"
                className={`assign-shift-modal__date${errors.effectiveFrom ? " assign-shift-modal__date--error" : ""}`}
                value={effectiveFrom}
                onChange={(e) => setEffectiveFrom(e.target.value)}
                disabled={isSaving}
              />
              {errors.effectiveFrom && (
                <span className="assign-shift-modal__error">{errors.effectiveFrom}</span>
              )}
            </div>
            <div className="assign-shift-modal__field">
              <label className="assign-shift-modal__label" htmlFor="effectiveTo">
                Effective to <span className="assign-shift-modal__optional">(optional)</span>
              </label>
              <input
                id="effectiveTo"
                type="date"
                className="assign-shift-modal__date"
                value={effectiveTo}
                onChange={(e) => setEffectiveTo(e.target.value)}
                disabled={isSaving}
                min={effectiveFrom}
              />
            </div>
          </div>

          {saveError && (
            <p className="assign-shift-modal__save-error" role="alert">{saveError}</p>
          )}

          <div className="assign-shift-modal__footer">
            {existingAssignment && onDelete && (
              <button
                type="button"
                className="assign-shift-modal__delete-btn"
                disabled={isSaving}
                onClick={() => void onDelete(existingAssignment.id)}
              >
                Remove
              </button>
            )}
            <div className="assign-shift-modal__footer-right">
              <button
                type="button"
                className="assign-shift-modal__cancel-btn"
                onClick={onClose}
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="assign-shift-modal__save-btn"
                disabled={isSaving || shifts.length === 0 || shiftIsFull}
              >
                {isSaving ? "Saving…" : existingAssignment ? "Update" : "Assign"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
