import { useEffect, useMemo, useState } from "react";
import { Button } from "../../../components/Button";
import { SearchableSelect } from "../../../components/SearchableSelect";
import { TextField } from "../../../components/TextField";
import {
  fetchGuardAttendanceHistory,
  type GuardAttendanceHistory,
  type GuardAttendanceHistoryLog,
} from "../attendanceApi";
import type { CorrectionGuardOption } from "../AttendanceCorrectionModal";
import "./GuardMonthReview.css";

export interface GuardMonthReviewProps {
  guards: CorrectionGuardOption[];
  onCorrectDay: (params: { guardId: string; dutyDate: string }) => void;
  /** Bump to reload after a correction is saved. */
  refreshKey?: number;
  /** Prefill from payroll (or other) deep-links. */
  initialGuardId?: string;
  initialYear?: number;
  initialMonth?: number;
}

function dutyDateFromParts(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function isProblemLog(log: GuardAttendanceHistoryLog): boolean {
  return log.kind === "missed" || log.kind === "half";
}

function isReviewLog(log: GuardAttendanceHistoryLog): boolean {
  return isProblemLog(log) || log.kind === "relief";
}

function reviewBadgeLabel(kind: string): string {
  if (kind === "half") return "Half";
  if (kind === "relief") return "Relief";
  return "Missed";
}

export function GuardMonthReview({
  guards,
  onCorrectDay,
  refreshKey = 0,
  initialGuardId = "",
  initialYear,
  initialMonth,
}: GuardMonthReviewProps) {
  const now = new Date();
  const [guardId, setGuardId] = useState(initialGuardId);
  const [year, setYear] = useState(
    String(initialYear ?? now.getFullYear())
  );
  const [month, setMonth] = useState(
    String(initialMonth ?? now.getMonth() + 1)
  );
  const [history, setHistory] = useState<GuardAttendanceHistory | null>(null);
  const [guardName, setGuardName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialGuardId) setGuardId(initialGuardId);
    if (initialYear != null) setYear(String(initialYear));
    if (initialMonth != null) setMonth(String(initialMonth));
  }, [initialGuardId, initialYear, initialMonth]);

  const guardOptions = useMemo(
    () => [
      { value: "", label: "Select guard…" },
      ...guards.map((g) => ({ value: g.id, label: g.label })),
    ],
    [guards]
  );

  async function load(selectedGuardId: string, y: number, m: number) {
    if (!selectedGuardId) {
      setHistory(null);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchGuardAttendanceHistory({
        guardId: selectedGuardId,
        year: y,
        month: m,
      });
      setHistory(data.history);
      setGuardName(data.guardName);
    } catch (err: unknown) {
      const e = err as { message?: string };
      setHistory(null);
      setError(e.message ?? "Failed to load month attendance.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (!guardId) return;
    const y = Number(year);
    const m = Number(month);
    if (!Number.isInteger(y) || !Number.isInteger(m) || m < 1 || m > 12) return;
    void load(guardId, y, m);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional reload on refreshKey
  }, [guardId, year, month, refreshKey]);

  function handleCheck() {
    const y = Number(year);
    const m = Number(month);
    if (!guardId) {
      setError("Select a guard.");
      return;
    }
    if (!Number.isInteger(y) || !Number.isInteger(m) || m < 1 || m > 12) {
      setError("Enter a valid year and month (1–12).");
      return;
    }
    void load(guardId, y, m);
  }

  const problemLogs = useMemo(() => {
    if (!history) return [];
    return history.logs
      .filter(isReviewLog)
      .sort((a, b) => (a.dutyDate ?? "").localeCompare(b.dutyDate ?? ""));
  }, [history]);

  const calendarCells = useMemo(() => {
    if (!history) return [];
    return history.calendarDays;
  }, [history]);

  return (
    <section className="att-month-review" aria-labelledby="att-month-review-title">
      <div className="att-month-review__head">
        <h2 id="att-month-review-title" className="att-month-review__title">
          Fix missed / half days
        </h2>
        <p className="att-month-review__hint">
          When a punch failed but the guard still worked, pick the guard and
          month, then correct missed or half-day statuses. Payroll and history
          use the corrected day — no fake punch is created.
        </p>
      </div>

      <div className="att-month-review__filters">
        <SearchableSelect
          label="Guard"
          name="monthReviewGuard"
          value={guardId}
          options={guardOptions}
          onChange={setGuardId}
          disabled={isLoading}
          searchPlaceholder="Search guard name or code…"
        />
        <TextField
          label="Year"
          name="monthReviewYear"
          type="number"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          disabled={isLoading}
        />
        <TextField
          label="Month"
          name="monthReviewMonth"
          type="number"
          min={1}
          max={12}
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          disabled={isLoading}
        />
        <div className="att-month-review__filter-action">
          <Button
            type="button"
            variant="secondary"
            size="medium"
            onClick={handleCheck}
            disabled={isLoading || !guardId}
          >
            {isLoading ? "Loading…" : "Load month"}
          </Button>
        </div>
      </div>

      {error ? (
        <p className="att-month-review__error" role="alert">
          {error}
        </p>
      ) : null}

      {history ? (
        <>
          <div className="att-month-review__stats">
            <span>
              <strong>{history.stats.presentDays}</strong> present
            </span>
            <span>
              <strong>{history.stats.halfDays}</strong> half
            </span>
            <span>
              <strong>{history.stats.missedDays}</strong> missed
            </span>
            <span>
              <strong>{history.stats.leaveDays}</strong> leave
            </span>
            <span>
              <strong>{history.stats.weeklyOffDays}</strong> offs
            </span>
          </div>

          <div className="att-month-review__cal" aria-label={`${history.monthLabel} calendar`}>
            {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
              <span key={`${d}-${i}`} className="att-month-review__cal-head">
                {d}
              </span>
            ))}
            {Array.from({ length: history.leadingEmpty ?? 0 }).map((_, i) => (
              <span key={`empty-${i}`} className="att-month-review__cal-empty" />
            ))}
            {calendarCells.map((cell) => {
              const dutyDate = dutyDateFromParts(
                history.year,
                history.month,
                cell.day
              );
              const actionable =
                cell.status === "missed" ||
                cell.status === "half" ||
                cell.status === "relief";
              return (
                <button
                  key={cell.day}
                  type="button"
                  className={`att-month-review__cal-day att-month-review__cal-day--${cell.status}${
                    actionable ? " att-month-review__cal-day--actionable" : ""
                  }`}
                  title={
                    actionable
                      ? `${dutyDate}: ${cell.status} — click to correct`
                      : `${dutyDate}: ${cell.status}`
                  }
                  disabled={!actionable || !guardId}
                  onClick={() =>
                    onCorrectDay({ guardId, dutyDate })
                  }
                >
                  {cell.day}
                </button>
              );
            })}
          </div>

          <div className="att-month-review__problems">
            <h3 className="att-month-review__problems-title">
              {guardName || "Guard"} · {history.monthLabel}
              {problemLogs.length === 0
                ? " — no missed, half, or relief days"
                : ` — ${problemLogs.length} day${problemLogs.length === 1 ? "" : "s"} to review`}
            </h3>

            {problemLogs.length === 0 ? (
              <p className="att-month-review__hint">
                Nothing to fix for this month. You can still use Correct
                attendance to record a missed relief duty or other day.
              </p>
            ) : (
              <ul className="att-month-review__list">
                {problemLogs.map((log) => {
                  const dutyDate =
                    log.dutyDate ||
                    dutyDateFromParts(
                      history.year,
                      history.month,
                      log.dayOfMonth
                    );
                  const corrected = log.footerTags?.includes("Admin Corrected");
                  return (
                    <li key={log.id} className="att-month-review__item">
                      <div className="att-month-review__item-main">
                        <span
                          className={`att-month-review__badge att-month-review__badge--${log.kind}`}
                        >
                          {reviewBadgeLabel(log.kind)}
                        </span>
                        <div>
                          <p className="att-month-review__item-date">
                            {log.dateLabel}
                            {corrected ? (
                              <span className="att-month-review__corrected">
                                {" "}
                                · Admin corrected
                              </span>
                            ) : null}
                          </p>
                          <p className="att-month-review__item-meta">
                            {log.statusLabel} · {log.postLabel}
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="secondary"
                        size="medium"
                        onClick={() => onCorrectDay({ guardId, dutyDate })}
                      >
                        Correct
                      </Button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </>
      ) : !isLoading && guardId ? null : !guardId ? (
        <p className="att-month-review__hint">
          Select a guard and load a month to see missed and half-day shifts.
        </p>
      ) : null}
    </section>
  );
}
