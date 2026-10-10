import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import type { GuardShiftAssignment, DayOfWeek } from "@raskha/scheduling";
import { ALL_DAYS, DAY_LABELS } from "@raskha/scheduling";
import type { SiteShift } from "@raskha/site-management";
import type { Guard } from "@raskha/guard-management";
import "./AssignShiftModal.css";

// ── Gender helpers ────────────────────────────────────────────────────────────

type GuardGenderKey = "male" | "female" | "other";

const GENDER_ICON: Record<GuardGenderKey, string> = {
  male:   "♂",
  female: "♀",
  other:  "⚧",
};
const GENDER_LABEL: Record<GuardGenderKey, string> = {
  male:   "Male",
  female: "Female",
  other:  "Other",
};
const GENDER_KEYS: GuardGenderKey[] = ["male", "female", "other"];

/**
 * Counts how many guards of each gender are already assigned for a shift,
 * filtered to assignments that overlap at least one of `filterDays`.
 * Pass ALL_DAYS to count every assignment regardless of which days are ticked.
 * Returns null when the shift has no genderRequirements set.
 */
function computeGenderUsed(
  shift: SiteShift,
  filterDays: DayOfWeek[],
  assignments: GuardShiftAssignment[],
  guards: Guard[],
  editingAssignmentId?: string | null,
): { male: number; female: number; other: number } | null {
  if (!shift.genderRequirements) return null;
  const used: Record<GuardGenderKey, number> = { male: 0, female: 0, other: 0 };

  for (const a of assignments) {
    if (a.id === editingAssignmentId) continue;
    if (a.shiftId !== shift.id) continue;
    if (!filterDays.some((d) => a.recurringDays.includes(d))) continue;
    // Prefer stored guardGender; fall back to guard profile lookup
    const rawGender =
      (a.guardGender !== undefined && a.guardGender !== null)
        ? a.guardGender
        : guards.find((g) => g.id === a.guardId)?.gender ?? null;
    const gender = typeof rawGender === "string" ? rawGender.toLowerCase() : null;
    if (gender === "male" || gender === "female" || gender === "other") {
      used[gender as GuardGenderKey]++;
    }
  }
  return used;
}

/**
 * Returns remaining capacity per gender for the given shift + selected days.
 * Used to decide which guards can still be added (dropdown filter).
 */
function computeGenderCapacity(
  shift: SiteShift,
  selectedDays: DayOfWeek[],
  assignments: GuardShiftAssignment[],
  guards: Guard[],
  editingAssignmentId?: string | null,
): { male: number; female: number; other: number } | null {
  if (!shift.genderRequirements) return null;
  const req = shift.genderRequirements;
  const used = computeGenderUsed(shift, selectedDays, assignments, guards, editingAssignmentId);
  if (!used) return null;

  return {
    male:   Math.max(0, req.male   - used.male),
    female: Math.max(0, req.female - used.female),
    other:  Math.max(0, req.other  - used.other),
  };
}

// ── Props ─────────────────────────────────────────────────────────────────────

export interface AssignShiftModalProps {
  /** Guards available in the dropdown (site guards) */
  guards: Guard[];
  /** ALL agency guards — used only for gender lookup fallback on old assignments */
  allGuards?: Guard[];
  /** All shift assignments for this site — used to compute gender capacity */
  assignments: GuardShiftAssignment[];
  /** Shift slots from site.shiftConfig.shifts */
  shifts: SiteShift[];
  /** If editing an existing assignment */
  existingAssignment?: GuardShiftAssignment | null;
  /** Pre-fill date (YYYY-MM-DD) when opening from a specific day cell */
  prefilledDate?: string;
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

const JS_DOW_TO_DAY: DayOfWeek[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

function dayOfWeekFromDate(dateStr: string): DayOfWeek {
  const d = new Date(`${dateStr}T12:00:00Z`);
  return JS_DOW_TO_DAY[d.getUTCDay()]!;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function AssignShiftModal({
  guards,
  allGuards,
  assignments,
  shifts,
  existingAssignment,
  prefilledDate,
  isSaving,
  saveError,
  onSave,
  onDelete,
  onClose,
}: AssignShiftModalProps) {
  const [guardId, setGuardId] = useState(existingAssignment?.guardId ?? "");
  const [shiftId, setShiftId] = useState(existingAssignment?.shiftId ?? "");
  const [recurringDays, setRecurringDays] = useState<DayOfWeek[]>(
    existingAssignment?.recurringDays ??
      (prefilledDate ? [dayOfWeekFromDate(prefilledDate)] : ALL_DAYS)
  );
  const [effectiveFrom, setEffectiveFrom] = useState(
    existingAssignment?.effectiveFrom ?? prefilledDate ?? today()
  );
  const [effectiveTo, setEffectiveTo] = useState(
    existingAssignment?.effectiveTo ?? ""
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const todayLocked = Boolean(existingAssignment?.shiftLocked);
  const lockedReason =
    existingAssignment?.shiftLockedReason ||
    "This guard has already punched in today. You can still edit future dates, but today's shift cannot be changed or removed until they punch out.";

  // Keep shiftId in sync when the shift list loads
  useEffect(() => {
    if (!shiftId && shifts.length > 0) {
      setShiftId(shifts[0]!.id);
    }
  }, [shifts, shiftId]);

  const selectedShift = useMemo(
    () => shifts.find((s) => s.id === shiftId) ?? null,
    [shifts, shiftId],
  );

  // Merge allGuards + guards so gender lookup always has the widest possible pool
  const guardPool = useMemo(
    () => {
      if (!allGuards || allGuards.length === 0) return guards;
      // Deduplicate by id
      const map = new Map(allGuards.map((g) => [g.id, g]));
      guards.forEach((g) => { if (!map.has(g.id)) map.set(g.id, g); });
      return [...map.values()];
    },
    [guards, allGuards],
  );

  // Compute remaining gender capacity for the selected shift + days (used for dropdown filter)
  const genderCapacity = useMemo(() => {
    if (!selectedShift) return null;
    return computeGenderCapacity(
      selectedShift,
      recurringDays,
      assignments,
      guardPool,
      existingAssignment?.id ?? null,
    );
  }, [selectedShift, recurringDays, assignments, guardPool, existingAssignment]);

  // Compute filled counts across ALL days — used only for the "Filled:" display row
  const filledGenderUsed = useMemo(() => {
    if (!selectedShift) return null;
    return computeGenderUsed(
      selectedShift,
      ALL_DAYS,
      assignments,
      guardPool,
      existingAssignment?.id ?? null,
    );
  }, [selectedShift, assignments, guardPool, existingAssignment]);

  // Filter the guard list: hide guards whose gender slot is exhausted
  const availableGuards = useMemo(() => {
    if (!genderCapacity) return guards; // no gender requirements → show all
    return guards.filter((g) => {
      const gk = g.gender as GuardGenderKey | undefined;
      if (!gk) return true; // guard has no gender set → always show
      return genderCapacity[gk] > 0;
    });
  }, [guards, genderCapacity]);

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
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    const selectedShiftObj = shifts.find((s) => s.id === shiftId);
    if (!selectedShiftObj) return;

    const selectedGuard = guards.find((g) => g.id === guardId);
    if (!selectedGuard) return;

    await onSave({
      guardId,
      guardName: selectedGuard.fullName,
      shiftId,
      shiftLabel: selectedShiftObj.label,
      shiftStartTime: selectedShiftObj.startTime,
      shiftEndTime: selectedShiftObj.endTime,
      recurringDays,
      effectiveFrom,
      effectiveTo: effectiveTo || null,
    });
  }

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

          {/* Shift selector */}
          <div className="assign-shift-modal__field">
            <label className="assign-shift-modal__label">Shift</label>
            {shifts.length === 0 ? (
              <p className="assign-shift-modal__no-shifts">
                No shifts configured for this site. Edit the site to add shifts first.
              </p>
            ) : (
              <div className="assign-shift-modal__shift-options">
                {shifts.map((s) => (
                  <div key={s.id}>
                    <label
                      className={`assign-shift-modal__shift-card${shiftId === s.id ? " assign-shift-modal__shift-card--selected" : ""}`}
                    >
                      <input
                        type="radio"
                        name="shiftId"
                        value={s.id}
                        checked={shiftId === s.id}
                        onChange={() => setShiftId(s.id)}
                        disabled={isSaving || todayLocked}
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
                        <span className="assign-shift-modal__shift-total">
                          {s.requiredGuards} guards
                        </span>
                      </div>
                    </label>

                    {/* Gender requirement bar — shown only for selected shift with requirements */}
                    {shiftId === s.id && s.genderRequirements && (
                      <div className="assign-shift-modal__gender-bar">
                        {/* Requirement summary — how many of each gender are needed */}
                        <div className="assign-shift-modal__gender-bar-row">
                          <span className="assign-shift-modal__gender-bar-label">Required:</span>
                          <div className="assign-shift-modal__gender-slots">
                            {GENDER_KEYS.map((gk) => {
                              const req = s.genderRequirements![gk];
                              if (req === 0) return null;
                              return (
                                <span
                                  key={gk}
                                  className="assign-shift-modal__gender-req-pill"
                                >
                                  {GENDER_ICON[gk]} <strong>{req}</strong> {GENDER_LABEL[gk]}
                                </span>
                              );
                            })}
                          </div>
                        </div>

                        {/* Fill status — how many are already assigned (counts all days) */}
                        <div className="assign-shift-modal__gender-bar-row">
                          <span className="assign-shift-modal__gender-bar-label">Filled:</span>
                          <div className="assign-shift-modal__gender-slots">
                            {GENDER_KEYS.map((gk) => {
                              const req  = s.genderRequirements![gk];
                              const used = filledGenderUsed ? filledGenderUsed[gk] : 0;
                              const rem  = Math.max(0, req - used);
                              if (req === 0) return null;
                              const status =
                                used >= req ? "full" : used > 0 ? "partial" : "empty";
                              return (
                                <span
                                  key={gk}
                                  className={`assign-shift-modal__gender-slot assign-shift-modal__gender-slot--${status}`}
                                  title={`${GENDER_LABEL[gk]}: ${used} assigned of ${req} required, ${rem} remaining`}
                                >
                                  {GENDER_ICON[gk]} {used}/{req}
                                  {rem > 0 && (
                                    <span className="assign-shift-modal__gender-slot-rem">
                                      {" "}({rem} open)
                                    </span>
                                  )}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            {errors.shiftId && <span className="assign-shift-modal__error">{errors.shiftId}</span>}
          </div>

          {/* Guard selector */}
          <div className="assign-shift-modal__field">
            <label className="assign-shift-modal__label">Guard</label>
            {genderCapacity && availableGuards.length === 0 ? (
              <p className="assign-shift-modal__no-guards-msg">
                All gender slots for this shift are full on the selected days.
                Remove an existing guard or select different days.
              </p>
            ) : (
              <select
                className={`assign-shift-modal__select${errors.guardId ? " assign-shift-modal__select--error" : ""}`}
                value={guardId}
                onChange={(e) => setGuardId(e.target.value)}
                disabled={isSaving || !!existingAssignment}
              >
                <option value="">Select a guard…</option>
                {availableGuards.map((g) => {
                  const gk = g.gender as GuardGenderKey | undefined;
                  const genderTag = gk ? ` · ${GENDER_ICON[gk]}` : "";
                  return (
                    <option key={g.id} value={g.id}>
                      {g.fullName} ({g.employeeCode}){genderTag}
                    </option>
                  );
                })}
              </select>
            )}
            {errors.guardId && <span className="assign-shift-modal__error">{errors.guardId}</span>}
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
                min={today()}
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

          {todayLocked ? (
            <p className="assign-shift-modal__save-error" role="status">
              {lockedReason}
            </p>
          ) : null}

          {saveError && (
            <p className="assign-shift-modal__save-error" role="alert">{saveError}</p>
          )}

          <div className="assign-shift-modal__footer">
            {existingAssignment && onDelete && (
              <button
                type="button"
                className="assign-shift-modal__delete-btn"
                disabled={isSaving || todayLocked}
                title={
                  todayLocked
                    ? "Cannot remove while the guard is on duty today"
                    : undefined
                }
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
                disabled={isSaving || shifts.length === 0}
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
