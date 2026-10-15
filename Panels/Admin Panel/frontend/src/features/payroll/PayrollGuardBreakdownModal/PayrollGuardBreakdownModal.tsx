import { useEffect, useState } from "react";
import { Button } from "../../../components/Button";
import {
  fetchGuardPayrollBreakdownApi,
  saveGuardReliefBonusesApi,
  type GuardPayrollBreakdown,
} from "../payrollApi";
import "./PayrollGuardBreakdownModal.css";

function formatMoney(n: number): string {
  return `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

export interface PayrollGuardBreakdownModalProps {
  guardId: string;
  year: number;
  month: number;
  onClose: () => void;
  onSaved: () => void;
}

export function PayrollGuardBreakdownModal({
  guardId,
  year,
  month,
  onClose,
  onSaved,
}: PayrollGuardBreakdownModalProps) {
  const [breakdown, setBreakdown] = useState<GuardPayrollBreakdown | null>(
    null
  );
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    fetchGuardPayrollBreakdownApi(guardId, year, month)
      .then((data) => {
        if (cancelled) return;
        setBreakdown(data);
        const next: Record<string, string> = {};
        for (const duty of data.reliefDuties) {
          next[duty.reliefRequestId] =
            duty.amount > 0 ? String(duty.amount) : "";
        }
        setDrafts(next);
      })
      .catch((e: Error) => {
        if (!cancelled) {
          setError(e.message ?? "Failed to load breakdown.");
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [guardId, year, month]);

  async function handleSave() {
    if (!breakdown) return;
    setIsSaving(true);
    setError(null);
    try {
      const entries = breakdown.reliefDuties.map((duty) => {
        const raw = drafts[duty.reliefRequestId] ?? "";
        const amount =
          raw.trim() === ""
            ? 0
            : Math.round(Number(String(raw).replace(/[^\d.]/g, "")) * 100) /
              100;
        return { reliefRequestId: duty.reliefRequestId, amount };
      });
      const updated = await saveGuardReliefBonusesApi({
        guardId,
        year,
        month,
        entries,
      });
      setBreakdown(updated);
      const next: Record<string, string> = {};
      for (const duty of updated.reliefDuties) {
        next[duty.reliefRequestId] =
          duty.amount > 0 ? String(duty.amount) : "";
      }
      setDrafts(next);
      onSaved();
    } catch (e: unknown) {
      setError(
        e instanceof Error ? e.message : "Failed to save relief bonuses."
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div
      className="payroll-breakdown-modal__backdrop"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="payroll-breakdown-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="payroll-breakdown-title"
      >
        <header className="payroll-breakdown-modal__header">
          <div>
            <h2
              id="payroll-breakdown-title"
              className="payroll-breakdown-modal__title"
            >
              {breakdown?.guardName ?? "Guard pay breakdown"}
            </h2>
            <p className="payroll-breakdown-modal__subtitle">
              {breakdown
                ? `${breakdown.period.label} · ${
                    breakdown.employeeCode || "No code"
                  }`
                : "Loading…"}
            </p>
          </div>
          <button
            type="button"
            className="payroll-breakdown-modal__close"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </header>

        <div className="payroll-breakdown-modal__body">
          {error ? (
            <p className="payroll-breakdown-modal__error" role="alert">
              {error}
            </p>
          ) : null}

          {isLoading ? (
            <p className="payroll-breakdown-modal__hint">Loading…</p>
          ) : breakdown ? (
            <>
              <section className="payroll-breakdown-modal__section">
                <h3 className="payroll-breakdown-modal__section-title">
                  Attendance pay
                </h3>
                <dl className="payroll-breakdown-modal__stats">
                  <div>
                    <dt>Present</dt>
                    <dd>{breakdown.breakdown.presentDays}</dd>
                  </div>
                  <div>
                    <dt>Half</dt>
                    <dd>{breakdown.breakdown.halfDays}</dd>
                  </div>
                  <div>
                    <dt>Missed</dt>
                    <dd>{breakdown.breakdown.missedDays}</dd>
                  </div>
                  <div>
                    <dt>Leave</dt>
                    <dd>{breakdown.breakdown.leaveDays}</dd>
                  </div>
                  <div>
                    <dt>Payable days</dt>
                    <dd>{breakdown.breakdown.payableDays}</dd>
                  </div>
                  <div>
                    <dt>Day rate</dt>
                    <dd>{formatMoney(breakdown.dayRate)}</dd>
                  </div>
                </dl>
                <p className="payroll-breakdown-modal__subtotal">
                  Attendance subtotal:{" "}
                  <strong>{formatMoney(breakdown.attendanceGross)}</strong>
                </p>
              </section>

              <section className="payroll-breakdown-modal__section">
                <h3 className="payroll-breakdown-modal__section-title">
                  Extra-duty relief bonuses
                </h3>
                <p className="payroll-breakdown-modal__hint">
                  Enter ₹ per relief day this guard covered for someone else.
                  Saved amounts are added to estimated pay.
                </p>
                {breakdown.reliefDuties.length === 0 ? (
                  <p className="payroll-breakdown-modal__hint">
                    No approved relief duties assigned to this guard in this
                    month.
                  </p>
                ) : (
                  <ul className="payroll-breakdown-modal__duties">
                    {breakdown.reliefDuties.map((duty) => (
                      <li key={duty.reliefRequestId}>
                        <div className="payroll-breakdown-modal__duty-main">
                          <span className="payroll-breakdown-modal__duty-date">
                            {duty.dutyDate}
                          </span>
                          <span className="payroll-breakdown-modal__duty-meta">
                            {duty.siteName} · {duty.postName} · {duty.shiftFrom}
                            –{duty.shiftTo}
                          </span>
                          <span className="payroll-breakdown-modal__duty-for">
                            For {duty.requesterName} ({duty.method})
                          </span>
                        </div>
                        <label className="payroll-breakdown-modal__amount">
                          <span className="visually-hidden">Bonus ₹</span>
                          <span className="payroll-breakdown-modal__rupee">
                            ₹
                          </span>
                          <input
                            type="text"
                            inputMode="decimal"
                            value={drafts[duty.reliefRequestId] ?? ""}
                            placeholder="0"
                            onChange={(e) =>
                              setDrafts((prev) => ({
                                ...prev,
                                [duty.reliefRequestId]: e.target.value,
                              }))
                            }
                          />
                        </label>
                      </li>
                    ))}
                  </ul>
                )}
                <p className="payroll-breakdown-modal__subtotal">
                  Relief bonuses:{" "}
                  <strong>{formatMoney(breakdown.reliefBonusTotal)}</strong>
                </p>
              </section>

              <section className="payroll-breakdown-modal__section">
                <h3 className="payroll-breakdown-modal__section-title">
                  EMI / advance deductions
                </h3>
                {(breakdown.advanceDeductions?.length ?? 0) === 0 ? (
                  <p className="payroll-breakdown-modal__hint">
                    No EMI or advance recoveries scheduled for this month.
                  </p>
                ) : (
                  <ul className="payroll-breakdown-modal__duties">
                    {(breakdown.advanceDeductions ?? []).map((row) => (
                      <li key={row.installmentId}>
                        <div>
                          <strong>
                            {row.label ??
                              (row.recoveryMode === "emi"
                                ? `EMI ${row.installmentIndex ?? "?"}/${row.emiMonths ?? "?"} · ${row.purpose}`
                                : row.purpose)}
                          </strong>
                          {row.recoveryMode === "emi" ? (
                            <span className="payroll-breakdown-modal__meta">
                              EMI installment deducted from this payroll
                            </span>
                          ) : row.recoveryMode === "next_payroll" ? (
                            <span className="payroll-breakdown-modal__meta">
                              Full advance recovered on this payroll
                            </span>
                          ) : null}
                        </div>
                        <strong className="payroll-breakdown-modal__deduct">
                          −{formatMoney(row.amount)}
                        </strong>
                      </li>
                    ))}
                  </ul>
                )}
                <p className="payroll-breakdown-modal__subtotal">
                  Total deducted:{" "}
                  <strong className="payroll-breakdown-modal__deduct">
                    −{formatMoney(breakdown.advanceDeductionTotal ?? 0)}
                  </strong>
                </p>
              </section>

              <p className="payroll-breakdown-modal__total">
                Estimated gross:{" "}
                <strong>{formatMoney(breakdown.estimatedGross)}</strong>
              </p>
              <p className="payroll-breakdown-modal__total">
                Estimated net (after EMI / advances):{" "}
                <strong>
                  {formatMoney(
                    breakdown.estimatedNet ?? breakdown.estimatedGross
                  )}
                </strong>
              </p>
            </>
          ) : null}
        </div>

        <footer className="payroll-breakdown-modal__footer">
          <Button type="button" variant="secondary" onClick={onClose}>
            Close
          </Button>
          <Button
            type="button"
            onClick={() => void handleSave()}
            disabled={
              isSaving ||
              isLoading ||
              !breakdown ||
              breakdown.reliefDuties.length === 0
            }
          >
            {isSaving ? "Saving…" : "Save bonuses"}
          </Button>
        </footer>
      </div>
    </div>
  );
}
