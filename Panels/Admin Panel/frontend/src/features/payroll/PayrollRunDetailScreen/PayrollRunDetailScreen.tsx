import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { PayrollLine, PayrollRun } from "@raskha/payroll";
import {
  APP_ROUTES,
  attendanceFixPath,
  payrollRunPath,
} from "../../../app/routePaths";
import { AppScreenLayout } from "../../../components/AppScreenLayout";
import { Button } from "../../../components/Button";
import { PageHeader } from "../../../components/PageHeader";
import {
  downloadPayrollCsv,
  fetchPayrollRunApi,
  markPayrollLinePaidApi,
  markPayrollRunPaidApi,
  updatePayrollLineSalaryApi,
} from "../payrollApi";
import "./PayrollRunDetailScreen.css";

function formatMoney(n: number): string {
  return `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

export function PayrollRunDetailScreen() {
  const { runId = "" } = useParams();
  const navigate = useNavigate();
  const [run, setRun] = useState<PayrollRun | null>(null);
  const [lines, setLines] = useState<PayrollLine[]>([]);
  const [salaryDrafts, setSalaryDrafts] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [savingLineId, setSavingLineId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function load() {
    if (!runId) return;
    setIsLoading(true);
    setError("");
    try {
      const data = await fetchPayrollRunApi(runId);
      setRun(data.run);
      setLines(data.lines);
      const drafts: Record<string, string> = {};
      for (const line of data.lines) {
        drafts[line.id] = String(line.monthlySalary);
      }
      setSalaryDrafts(drafts);
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e.message ?? "Failed to load payroll run.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [runId]);

  async function handleMarkRunPaid() {
    if (!runId) return;
    setBusy(true);
    setError("");
    try {
      const data = await markPayrollRunPaidApi(runId);
      setRun(data.run);
      setLines(data.lines);
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e.message ?? "Failed to mark run paid.");
    } finally {
      setBusy(false);
    }
  }

  async function handleMarkLinePaid(lineId: string) {
    if (!runId) return;
    setBusy(true);
    setError("");
    try {
      const data = await markPayrollLinePaidApi(runId, lineId);
      setRun(data.run);
      setLines((prev) =>
        prev.map((l) => (l.id === data.line.id ? data.line : l))
      );
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e.message ?? "Failed to mark line paid.");
    } finally {
      setBusy(false);
    }
  }

  async function handleSaveSalary(line: PayrollLine) {
    if (!runId) return;
    const raw = salaryDrafts[line.id] ?? "";
    const amount = Number(String(raw).replace(/[^\d.]/g, ""));
    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Enter a valid positive monthly salary.");
      return;
    }
    if (amount === line.monthlySalary) return;

    setSavingLineId(line.id);
    setError("");
    try {
      const data = await updatePayrollLineSalaryApi(runId, line.id, amount);
      setRun(data.run);
      setLines((prev) =>
        prev.map((l) => (l.id === data.line.id ? data.line : l))
      );
      setSalaryDrafts((prev) => ({
        ...prev,
        [data.line.id]: String(data.line.monthlySalary),
      }));
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e.message ?? "Failed to update salary.");
    } finally {
      setSavingLineId(null);
    }
  }

  async function handleCsv() {
    if (!runId) return;
    setBusy(true);
    setError("");
    try {
      await downloadPayrollCsv(runId);
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e.message ?? "Failed to download CSV.");
    } finally {
      setBusy(false);
    }
  }

  if (isLoading) {
    return null;
  }

  if (!run) {
    return (
      <AppScreenLayout>
        <div className="app-screen-layout__content">
          <PageHeader
            title="Payroll run"
            subtitle={error || "Not found"}
            onBack={() => navigate(APP_ROUTES.payroll)}
            backLabel="Back to payroll"
          />
        </div>
      </AppScreenLayout>
    );
  }

  const settings = run.settingsSnapshot;
  const extrasNote = [
    settings.overtimePaid ? "Overtime configured (not applied in v1)" : null,
    settings.deductPfEsi ? "PF/ESI on (formulas later)" : null,
    settings.deductLateEarly ? "Late/early deduct on (rules later)" : null,
  ]
    .filter(Boolean)
    .join(" · ");

  const canEditSalary = run.status !== "paid";

  return (
    <AppScreenLayout>
      <div className="app-screen-layout__content payroll-detail">
        <PageHeader
          title={run.period.label}
          subtitle={`${run.period.startDate} → ${run.period.endDate} · ${run.guardCount} guards · ${formatMoney(run.totalGross)}`}
          onBack={() => navigate(APP_ROUTES.payroll)}
          backLabel="Back to payroll"
        />

        {error ? (
          <p role="alert" className="payroll-detail__error">
            {error}
          </p>
        ) : null}

        <div className="payroll-detail__actions no-print">
          <span
            className={`payroll-detail__badge payroll-detail__badge--${run.status}`}
          >
            {run.status === "paid" ? "Paid" : "Finalized"}
          </span>
          {run.status !== "paid" ? (
            <Button
              type="button"
              onClick={() => void handleMarkRunPaid()}
              disabled={busy || savingLineId != null}
            >
              Mark run paid
            </Button>
          ) : null}
          <Button
            type="button"
            variant="secondary"
            onClick={() => void handleCsv()}
            disabled={busy || savingLineId != null}
          >
            Download CSV
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => window.print()}
            disabled={busy || savingLineId != null}
          >
            Print
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() =>
              navigate(
                attendanceFixPath({
                  year: run.period.year,
                  month: run.period.month,
                  returnTo: payrollRunPath(run.id),
                })
              )
            }
            disabled={busy || savingLineId != null}
          >
            Fix attendance
          </Button>
        </div>

        {canEditSalary ? (
          <p className="payroll-detail__note no-print">
            Edit monthly salary on a line to recalculate day rate and gross pay.
            Use <strong>Fix attendance</strong> or a row&apos;s Fix link for
            missed / half days — Back returns to this run.
          </p>
        ) : (
          <p className="payroll-detail__note no-print">
            Use <strong>Fix attendance</strong> to correct missed or half days
            for this month, then return here.
          </p>
        )}

        {extrasNote ? (
          <p className="payroll-detail__note">{extrasNote}</p>
        ) : null}

        <div className="payroll-detail__table-wrap">
          <table className="payroll-detail__table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Guard</th>
                <th>Monthly salary</th>
                <th>Present</th>
                <th>Half</th>
                <th>Missed</th>
                <th>Leave</th>
                <th>Weekly offs</th>
                <th>Day rate</th>
                <th>Payable</th>
                <th>Relief bonus</th>
                <th>EMI / advance</th>
                <th>Gross</th>
                <th>Net</th>
                <th className="no-print">Attendance</th>
                <th className="no-print">Status</th>
              </tr>
            </thead>
            <tbody>
              {lines.map((line) => {
                const draft = salaryDrafts[line.id] ?? String(line.monthlySalary);
                const dirty =
                  Number(String(draft).replace(/[^\d.]/g, "")) !==
                  line.monthlySalary;
                const lineEditable =
                  canEditSalary && line.status !== "paid";
                const needsAttendanceFix =
                  line.breakdown.missedDays > 0 ||
                  line.breakdown.halfDays > 0;

                return (
                  <tr
                    key={line.id}
                    className={
                      needsAttendanceFix
                        ? "payroll-detail__row--needs-fix"
                        : undefined
                    }
                  >
                    <td>{line.employeeCode || "—"}</td>
                    <td>{line.guardName}</td>
                    <td>
                      {lineEditable ? (
                        <div className="payroll-detail__salary-edit no-print">
                          <input
                            type="number"
                            min={1}
                            step="0.01"
                            className="payroll-detail__salary-input"
                            value={draft}
                            disabled={savingLineId != null || busy}
                            aria-label={`Monthly salary for ${line.guardName}`}
                            onChange={(e) =>
                              setSalaryDrafts((prev) => ({
                                ...prev,
                                [line.id]: e.target.value,
                              }))
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                void handleSaveSalary(line);
                              }
                            }}
                          />
                          <button
                            type="button"
                            className="payroll-detail__salary-save"
                            disabled={
                              !dirty || savingLineId != null || busy
                            }
                            onClick={() => void handleSaveSalary(line)}
                          >
                            {savingLineId === line.id ? "…" : "Save"}
                          </button>
                        </div>
                      ) : (
                        formatMoney(line.monthlySalary)
                      )}
                      {lineEditable ? (
                        <span className="payroll-detail__salary-print-only">
                          {formatMoney(line.monthlySalary)}
                        </span>
                      ) : null}
                    </td>
                    <td>{line.breakdown.presentDays}</td>
                    <td>{line.breakdown.halfDays}</td>
                    <td>{line.breakdown.missedDays}</td>
                    <td>{line.breakdown.leaveDays}</td>
                    <td>{line.breakdown.weeklyOffDays}</td>
                    <td>{formatMoney(line.dayRate)}</td>
                    <td>{line.breakdown.payableDays}</td>
                    <td>
                      {(line.reliefBonusTotal ?? 0) > 0
                        ? formatMoney(line.reliefBonusTotal ?? 0)
                        : "—"}
                    </td>
                    <td>
                      {(line.advanceDeductionTotal ?? 0) > 0
                        ? `−${formatMoney(line.advanceDeductionTotal ?? 0)}`
                        : "—"}
                    </td>
                    <td>{formatMoney(line.grossPay)}</td>
                    <td>
                      <strong>
                        {formatMoney(line.netPay ?? line.grossPay)}
                      </strong>
                    </td>
                    <td className="no-print">
                      <button
                        type="button"
                        className={
                          needsAttendanceFix
                            ? "payroll-detail__fix-att payroll-detail__fix-att--alert"
                            : "payroll-detail__fix-att"
                        }
                        disabled={busy || savingLineId != null}
                        onClick={() =>
                          navigate(
                            attendanceFixPath({
                              guardId: line.guardId,
                              year: run.period.year,
                              month: run.period.month,
                              returnTo: payrollRunPath(run.id),
                            })
                          )
                        }
                      >
                        {needsAttendanceFix ? "Fix days" : "Review"}
                      </button>
                    </td>
                    <td className="no-print">
                      {line.status === "paid" ? (
                        <span className="payroll-detail__paid-label">Paid</span>
                      ) : (
                        <button
                          type="button"
                          className="payroll-detail__pay-btn"
                          disabled={busy || savingLineId != null}
                          onClick={() => void handleMarkLinePaid(line.id)}
                        >
                          Mark paid
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </AppScreenLayout>
  );
}
