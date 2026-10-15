import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { PayrollRun } from "@raskha/payroll";
import {
  APP_ROUTES,
  attendanceFixPath,
  payrollRunPath,
} from "../../../app/routePaths";
import { AppScreenLayout } from "../../../components/AppScreenLayout";
import { Button } from "../../../components/Button";
import { PageHeader } from "../../../components/PageHeader";
import { TextField } from "../../../components/TextField";
import { PayrollGuardBreakdownModal } from "../PayrollGuardBreakdownModal";
import {
  fetchPayrollPreviewApi,
  generatePayrollRunApi,
  listPayrollRunsApi,
  updateGuardSalaryFromPayrollApi,
  type PayrollPreview,
} from "../payrollApi";
import "./PayrollListScreen.css";

function formatMoney(n: number): string {
  return `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

function monthName(year: number, month: number): string {
  return new Date(year, month - 1, 1).toLocaleString("en-IN", {
    month: "long",
    year: "numeric",
  });
}

export function PayrollListScreen() {
  const navigate = useNavigate();
  const now = new Date();
  const [runs, setRuns] = useState<PayrollRun[]>([]);
  const [year, setYear] = useState(String(now.getFullYear()));
  const [month, setMonth] = useState(String(now.getMonth() + 1));
  const [preview, setPreview] = useState<PayrollPreview | null>(null);
  const [salaryDrafts, setSalaryDrafts] = useState<Record<string, string>>({});
  const [isLoadingRuns, setIsLoadingRuns] = useState(true);
  const [isLoadingPreview, setIsLoadingPreview] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [savingGuardId, setSavingGuardId] = useState<string | null>(null);
  const [breakdownGuardId, setBreakdownGuardId] = useState<string | null>(
    null
  );
  const [error, setError] = useState("");

  async function loadRuns() {
    setIsLoadingRuns(true);
    try {
      setRuns(await listPayrollRunsApi());
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e.message ?? "Failed to load payroll runs.");
    } finally {
      setIsLoadingRuns(false);
    }
  }

  async function loadPreview(y: number, m: number) {
    setIsLoadingPreview(true);
    setError("");
    try {
      const data = await fetchPayrollPreviewApi(y, m);
      setPreview(data);
      const drafts: Record<string, string> = {};
      for (const line of data.lines) {
        drafts[line.guardId] = String(line.monthlySalary);
      }
      setSalaryDrafts(drafts);
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e.message ?? "Failed to load month payroll check.");
      setPreview(null);
    } finally {
      setIsLoadingPreview(false);
    }
  }

  async function handleSavePreviewSalary(guardId: string, current: number) {
    const raw = salaryDrafts[guardId] ?? "";
    const amount = Number(String(raw).replace(/[^\d.]/g, ""));
    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Enter a valid positive monthly salary.");
      return;
    }
    if (amount === current) return;

    const parsed = parsedYearMonth();
    if (!parsed) {
      setError("Enter a valid year and month (1–12).");
      return;
    }

    setSavingGuardId(guardId);
    setError("");
    try {
      await updateGuardSalaryFromPayrollApi(guardId, amount);
      await loadPreview(parsed.y, parsed.m);
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e.message ?? "Failed to update salary.");
    } finally {
      setSavingGuardId(null);
    }
  }

  useEffect(() => {
    void loadRuns();
    void loadPreview(now.getFullYear(), now.getMonth() + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- initial current month only
  }, []);

  function parsedYearMonth(): { y: number; m: number } | null {
    const y = Number(year);
    const m = Number(month);
    if (!Number.isInteger(y) || !Number.isInteger(m) || m < 1 || m > 12) {
      return null;
    }
    return { y, m };
  }

  async function handleCheckMonth() {
    const parsed = parsedYearMonth();
    if (!parsed) {
      setError("Enter a valid year and month (1–12).");
      return;
    }
    await loadPreview(parsed.y, parsed.m);
  }

  async function handleGenerate() {
    const parsed = parsedYearMonth();
    if (!parsed) {
      setError("Enter a valid year and month (1–12).");
      return;
    }
    setIsGenerating(true);
    setError("");
    try {
      const { run } = await generatePayrollRunApi(parsed.y, parsed.m);
      navigate(payrollRunPath(run.id));
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e.message ?? "Failed to generate payroll.");
      await loadRuns();
    } finally {
      setIsGenerating(false);
    }
  }

  const isCurrentMonth =
    preview != null &&
    preview.period.year === now.getFullYear() &&
    preview.period.month === now.getMonth() + 1;

  return (
    <AppScreenLayout>
      <div className="app-screen-layout__content">
        <PageHeader
          title="Payroll"
          subtitle="Check this month’s attendance-based pay, then save a run when ready."
          onBack={() => navigate(APP_ROUTES.paymentManagement)}
          backLabel="Back to payment management"
        />

        <div className="payroll-list__toolbar">
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              const y = Number(year) || now.getFullYear();
              const m = Number(month) || now.getMonth() + 1;
              navigate(
                attendanceFixPath({
                  year: y,
                  month: m,
                  returnTo: APP_ROUTES.payroll,
                })
              );
            }}
          >
            Fix attendance
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate(APP_ROUTES.generalSettings)}
          >
            General settings
          </Button>
        </div>

        <section className="payroll-list__generate" aria-labelledby="payroll-check-title">
          <h2 id="payroll-check-title" className="payroll-list__section-title">
            Check month payroll
          </h2>
          <p className="payroll-list__hint">
            Live view from attendance and general settings. Does not save until
            you click Save payroll run. Edit salary here, or use{" "}
            <strong>Fix attendance</strong> / a row&apos;s Fix link for missed
            or half days (returns here when you&apos;re done).
          </p>
          <div className="payroll-list__gen-row">
            <TextField
              label="Year"
              name="year"
              type="number"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              disabled={isGenerating || isLoadingPreview}
            />
            <TextField
              label="Month"
              name="month"
              type="number"
              min={1}
              max={12}
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              disabled={isGenerating || isLoadingPreview}
            />
            <div className="payroll-list__gen-actions">
              <Button
                type="button"
                variant="secondary"
                onClick={() => void handleCheckMonth()}
                disabled={isGenerating || isLoadingPreview}
              >
                {isLoadingPreview ? "Loading…" : "Check month"}
              </Button>
              <Button
                type="button"
                onClick={() => void handleGenerate()}
                disabled={isGenerating || isLoadingPreview}
              >
                {isGenerating ? "Saving…" : "Save payroll run"}
              </Button>
            </div>
          </div>
        </section>

        {error ? (
          <p role="alert" className="payroll-list__error">
            {error}
          </p>
        ) : null}

        <section
          className="payroll-list__preview"
          aria-labelledby="payroll-preview-title"
        >
          <div className="payroll-list__preview-head">
            <h2 id="payroll-preview-title" className="payroll-list__section-title">
              {preview
                ? `${preview.period.label}${isCurrentMonth ? " (current month)" : ""}`
                : monthName(Number(year) || now.getFullYear(), Number(month) || now.getMonth() + 1)}
            </h2>
            {preview ? (
              <p className="payroll-list__preview-totals">
                {preview.guardCount} guards · Monthly salaries{" "}
                {formatMoney(preview.totalMonthlySalary)} · Gross{" "}
                {formatMoney(preview.totalGross)}
                {(preview.totalAdvanceDeductions ?? 0) > 0
                  ? ` · EMI / advances −${formatMoney(preview.totalAdvanceDeductions ?? 0)}`
                  : ""}{" "}
                · Net{" "}
                <strong>
                  {formatMoney(preview.totalNet ?? preview.totalGross)}
                </strong>
                {preview.skippedWithoutSalary > 0
                  ? ` · ${preview.skippedWithoutSalary} without salary skipped`
                  : ""}
              </p>
            ) : null}
          </div>

          {isLoadingPreview ? (
            <p className="payroll-list__hint">Loading attendance-based payroll…</p>
          ) : !preview || preview.lines.length === 0 ? (
            <p className="payroll-list__hint">
              No guards with a salary or relief bonus found for this month.
            </p>
          ) : (
            <div className="payroll-list__table-wrap">
              <table className="payroll-list__table">
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
                    <th>Payable days</th>
                    <th>Relief bonus</th>
                    <th>EMI / advance</th>
                    <th>Gross</th>
                    <th>Net</th>
                    <th>Attendance</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.lines.map((line) => {
                    const draft =
                      salaryDrafts[line.guardId] ??
                      String(line.monthlySalary);
                    const dirty =
                      Number(String(draft).replace(/[^\d.]/g, "")) !==
                      line.monthlySalary;
                    const needsAttendanceFix =
                      line.breakdown.missedDays > 0 ||
                      line.breakdown.halfDays > 0;
                    const reliefBonus = line.reliefBonusTotal ?? 0;
                    const advanceCut = line.advanceDeductionTotal ?? 0;
                    const netPay = line.netPay ?? line.grossPay;
                    return (
                      <tr
                        key={line.id}
                        className={
                          needsAttendanceFix
                            ? "payroll-list__row--needs-fix"
                            : undefined
                        }
                      >
                        <td>{line.employeeCode || "—"}</td>
                        <td>
                          <button
                            type="button"
                            className="payroll-list__guard-link"
                            onClick={() => setBreakdownGuardId(line.guardId)}
                          >
                            {line.guardName}
                          </button>
                        </td>
                        <td>
                          <div className="payroll-list__salary-edit">
                            <input
                              type="number"
                              min={1}
                              step="0.01"
                              className="payroll-list__salary-input"
                              value={draft}
                              disabled={
                                savingGuardId != null ||
                                isGenerating ||
                                isLoadingPreview
                              }
                              aria-label={`Monthly salary for ${line.guardName}`}
                              onChange={(e) =>
                                setSalaryDrafts((prev) => ({
                                  ...prev,
                                  [line.guardId]: e.target.value,
                                }))
                              }
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  void handleSavePreviewSalary(
                                    line.guardId,
                                    line.monthlySalary
                                  );
                                }
                              }}
                            />
                            <button
                              type="button"
                              className="payroll-list__salary-save"
                              disabled={
                                !dirty ||
                                savingGuardId != null ||
                                isGenerating ||
                                isLoadingPreview
                              }
                              onClick={() =>
                                void handleSavePreviewSalary(
                                  line.guardId,
                                  line.monthlySalary
                                )
                              }
                            >
                              {savingGuardId === line.guardId ? "…" : "Save"}
                            </button>
                          </div>
                        </td>
                        <td>{line.breakdown.presentDays}</td>
                        <td>{line.breakdown.halfDays}</td>
                        <td>{line.breakdown.missedDays}</td>
                        <td>{line.breakdown.leaveDays}</td>
                        <td>{line.breakdown.weeklyOffDays}</td>
                        <td>{formatMoney(line.dayRate)}</td>
                        <td>{line.breakdown.payableDays}</td>
                        <td>
                          {reliefBonus > 0 ? formatMoney(reliefBonus) : "—"}
                        </td>
                        <td>
                          {advanceCut > 0 ? (
                            <span className="payroll-list__advance-cut">
                              −{formatMoney(advanceCut)}
                            </span>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td>{formatMoney(line.grossPay)}</td>
                        <td>
                          <strong>{formatMoney(netPay)}</strong>
                        </td>
                        <td>
                          <button
                            type="button"
                            className={
                              needsAttendanceFix
                                ? "payroll-list__fix-att payroll-list__fix-att--alert"
                                : "payroll-list__fix-att"
                            }
                            onClick={() =>
                              navigate(
                                attendanceFixPath({
                                  guardId: line.guardId,
                                  year: preview.period.year,
                                  month: preview.period.month,
                                  returnTo: APP_ROUTES.payroll,
                                })
                              )
                            }
                          >
                            {needsAttendanceFix ? "Fix days" : "Review"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          {preview ? (
            <p className="payroll-list__hint payroll-list__period-hint">
              Pay period: {preview.period.startDate} → {preview.period.endDate}.
              Estimated pay = day rate × payable days + relief − advance cuts. Click a
              guard name to enter ₹ per relief day.
            </p>
          ) : null}
        </section>

      {breakdownGuardId && preview ? (
        <PayrollGuardBreakdownModal
          guardId={breakdownGuardId}
          year={preview.period.year}
          month={preview.period.month}
          onClose={() => setBreakdownGuardId(null)}
          onSaved={() => {
            void loadPreview(preview.period.year, preview.period.month);
          }}
        />
      ) : null}

        <section aria-labelledby="payroll-runs-title">
          <h2 id="payroll-runs-title" className="payroll-list__section-title">
            Saved runs
          </h2>
          {isLoadingRuns ? (
            <p className="payroll-list__hint">Loading…</p>
          ) : runs.length === 0 ? (
            <p className="payroll-list__hint">
              No saved payroll runs yet. Check a month above, then Save payroll
              run.
            </p>
          ) : (
            <ul className="payroll-list__runs">
              {runs.map((run) => (
                <li key={run.id}>
                  <button
                    type="button"
                    className="payroll-list__run"
                    onClick={() => navigate(payrollRunPath(run.id))}
                  >
                    <span className="payroll-list__run-main">
                      <span className="payroll-list__run-title">
                        {run.period.label}
                      </span>
                      <span className="payroll-list__run-meta">
                        {run.guardCount} guards · {formatMoney(run.totalGross)}
                      </span>
                    </span>
                    <span
                      className={`payroll-list__badge payroll-list__badge--${run.status}`}
                    >
                      {run.status === "paid" ? "Paid" : "Finalized"}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </AppScreenLayout>
  );
}
