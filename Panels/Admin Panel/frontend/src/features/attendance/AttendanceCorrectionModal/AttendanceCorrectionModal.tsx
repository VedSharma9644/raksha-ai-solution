import { useEffect, useMemo, useState } from "react";
import { Button } from "../../../components/Button";
import { SearchableSelect } from "../../../components/SearchableSelect";
import { SelectField } from "../../../components/SelectField";
import { TextAreaField } from "../../../components/TextAreaField";
import {
  clearAttendanceCorrection,
  fetchAttendanceCorrection,
  saveAttendanceCorrection,
} from "../attendanceApi";
import {
  ATTENDANCE_CORRECTION_STATUS_OPTIONS,
  type AttendanceCorrectionStatus,
} from "../attendanceTypes";
import "./AttendanceCorrectionModal.css";

export type CorrectionGuardOption = {
  id: string;
  label: string;
};

export interface AttendanceCorrectionModalProps {
  guards: CorrectionGuardOption[];
  initialGuardId?: string;
  initialDutyDate: string;
  onClose: () => void;
  onSaved: () => void;
}

export function AttendanceCorrectionModal({
  guards,
  initialGuardId = "",
  initialDutyDate,
  onClose,
  onSaved,
}: AttendanceCorrectionModalProps) {
  const [guardId, setGuardId] = useState(initialGuardId);
  const [dutyDate, setDutyDate] = useState(initialDutyDate);
  const [status, setStatus] = useState<AttendanceCorrectionStatus>("full");
  const [note, setNote] = useState("");
  const [hasExisting, setHasExisting] = useState(false);
  const [loadingExisting, setLoadingExisting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const guardOptions = useMemo(
    () => [
      { value: "", label: "Select guard…" },
      ...guards.map((g) => ({ value: g.id, label: g.label })),
    ],
    [guards]
  );

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  useEffect(() => {
    if (!guardId || !dutyDate) {
      setHasExisting(false);
      return;
    }

    let cancelled = false;
    setLoadingExisting(true);
    setError(null);

    fetchAttendanceCorrection({ guardId, dutyDate })
      .then((override) => {
        if (cancelled) return;
        if (override) {
          setStatus(override.status);
          setNote(override.note ?? "");
          setHasExisting(true);
        } else {
          setHasExisting(false);
        }
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const e = err as { message?: string };
        setError(e.message ?? "Failed to load existing correction.");
      })
      .finally(() => {
        if (!cancelled) setLoadingExisting(false);
      });

    return () => {
      cancelled = true;
    };
  }, [guardId, dutyDate]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!guardId) {
      setError("Select a guard.");
      return;
    }
    if (!dutyDate) {
      setError("Select a duty date.");
      return;
    }
    if (!note.trim()) {
      setError("Add a short note explaining the technical failure.");
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      await saveAttendanceCorrection({ guardId, dutyDate, status, note });
      onSaved();
      onClose();
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e.message ?? "Failed to save correction.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleClear() {
    if (!guardId || !dutyDate) return;
    setIsClearing(true);
    setError(null);
    try {
      await clearAttendanceCorrection({ guardId, dutyDate });
      onSaved();
      onClose();
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e.message ?? "Failed to clear correction.");
    } finally {
      setIsClearing(false);
    }
  }

  const busy = isSaving || isClearing || loadingExisting;

  return (
    <div
      className="att-correction-modal__backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Correct attendance"
    >
      <div
        className="att-correction-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="att-correction-modal__header">
          <div>
            <h2 className="att-correction-modal__title">Correct attendance</h2>
            <p className="att-correction-modal__subtitle">
              Use when a punch failed for technical reasons. This sets the day
              status for payroll and history — it does not create a fake punch.
            </p>
          </div>
          <button
            type="button"
            className="att-correction-modal__close"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <form className="att-correction-modal__body" onSubmit={handleSave}>
          <SearchableSelect
            label="Guard"
            name="correctionGuard"
            value={guardId}
            options={guardOptions}
            onChange={setGuardId}
            required
            disabled={busy || Boolean(initialGuardId)}
            searchPlaceholder="Search guard name or code…"
          />

          <div className="att-correction-modal__field">
            <label
              className="att-correction-modal__date-label"
              htmlFor="correctionDutyDate"
            >
              Duty date
            </label>
            <input
              id="correctionDutyDate"
              type="date"
              className="att-correction-modal__date-input"
              value={dutyDate}
              onChange={(e) => setDutyDate(e.target.value)}
              required
              disabled={busy}
            />
          </div>

          <SelectField
            label="Corrected status"
            name="correctionStatus"
            value={status}
            options={ATTENDANCE_CORRECTION_STATUS_OPTIONS}
            onChange={(e) =>
              setStatus(e.target.value as AttendanceCorrectionStatus)
            }
            required
            disabled={busy}
          />

          <TextAreaField
            label="Reason / note"
            name="correctionNote"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={
              status === "relief"
                ? "e.g. Covered for Ramesh at Site A — missed same-day relief entry"
                : "e.g. App crashed at punch-in; verified on site CCTV"
            }
            rows={3}
            required
            disabled={busy}
          />

          {hasExisting ? (
            <p className="att-correction-modal__existing">
              A correction already exists for this day — saving will update it.
            </p>
          ) : null}

          {error ? (
            <p className="att-correction-modal__error" role="alert">
              {error}
            </p>
          ) : null}

          <div className="att-correction-modal__actions">
            {hasExisting ? (
              <Button
                type="button"
                variant="ghost"
                size="medium"
                disabled={busy}
                onClick={() => void handleClear()}
              >
                {isClearing ? "Clearing…" : "Clear correction"}
              </Button>
            ) : (
              <span />
            )}
            <div className="att-correction-modal__actions-right">
              <Button
                type="button"
                variant="secondary"
                size="medium"
                disabled={busy}
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button type="submit" size="medium" disabled={busy}>
                {isSaving ? "Saving…" : "Save correction"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
