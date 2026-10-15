import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { EarningsReportPeriod, EarningsSummary } from "@raskha/earnings";
import { APP_ROUTES, earningsSitePath } from "../../../app/routePaths";
import { AppScreenLayout } from "../../../components/AppScreenLayout";
import { PageHeader } from "../../../components/PageHeader";
import { EarningsPeriodSelect } from "../EarningsPeriodSelect";
import {
  downloadEarningsCsvApi,
  fetchEarningsSummaryApi,
} from "../earningsApi";
import "./EarningsListScreen.css";

function formatMoney(n: number): string {
  return `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

function resultLabel(result: string): string {
  if (result === "profit") return "Profit";
  if (result === "loss") return "Loss";
  return "Break-even";
}

const REPORT_OPTIONS: { value: EarningsReportPeriod; label: string }[] = [
  { value: "monthly", label: "Monthly" },
  { value: "bimonthly", label: "Bi-monthly" },
  { value: "halfyearly", label: "Half-yearly" },
  { value: "yearly", label: "Yearly" },
];

const MONTH_OPTIONS = [
  { value: "1", label: "January" },
  { value: "2", label: "February" },
  { value: "3", label: "March" },
  { value: "4", label: "April" },
  { value: "5", label: "May" },
  { value: "6", label: "June" },
  { value: "7", label: "July" },
  { value: "8", label: "August" },
  { value: "9", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

export function EarningsListScreen() {
  const navigate = useNavigate();
  const now = new Date();
  const [year, setYear] = useState(String(now.getFullYear()));
  const [month, setMonth] = useState(String(now.getMonth() + 1));
  const [summary, setSummary] = useState<EarningsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState("");

  const yearOptions = useMemo(() => {
    const current = now.getFullYear();
    const years: { value: string; label: string }[] = [];
    for (let y = current + 1; y >= current - 7; y -= 1) {
      years.push({ value: String(y), label: String(y) });
    }
    return years;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- stable year window from mount year
  }, []);

  const periodLabel = useMemo(() => {
    const m = MONTH_OPTIONS.find((o) => o.value === month)?.label ?? month;
    return `${m} ${year}`;
  }, [month, year]);

  async function load(y: number, m: number) {
    setIsLoading(true);
    setError("");
    try {
      const data = await fetchEarningsSummaryApi({
        fromYear: y,
        fromMonth: m,
        toYear: y,
        toMonth: m,
      });
      setSummary(data);
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e.message ?? "Failed to load earnings.");
      setSummary(null);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    const y = Number(year);
    const m = Number(month);
    if (!Number.isInteger(y) || !Number.isInteger(m) || m < 1 || m > 12) {
      return;
    }
    void load(y, m);
  }, [year, month]);

  async function handleExport(period: EarningsReportPeriod) {
    const y = Number(year);
    const m = Number(month);
    if (!Number.isInteger(y) || !Number.isInteger(m) || m < 1 || m > 12) {
      setError("Select a valid year and month.");
      return;
    }
    setIsExporting(true);
    setError("");
    try {
      await downloadEarningsCsvApi({ period, year: y, month: m });
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e.message ?? "Failed to download report.");
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <AppScreenLayout>
      <div className="app-screen-layout__content earnings-list">
        <PageHeader
          title="Earnings"
          subtitle="Client billing from sites versus guard pay, relief, and logged expenses."
          onBack={() => navigate(APP_ROUTES.paymentManagement)}
          backLabel="Back to payment management"
        />

        <section className="earnings-list__panel" aria-labelledby="earnings-period-title">
          <div className="earnings-list__panel-head">
            <div>
              <h2 id="earnings-period-title" className="earnings-list__panel-title">
                Period
              </h2>
              <p className="earnings-list__panel-hint">
                Choose a month to review site money in and out.
              </p>
            </div>
            <p className="earnings-list__period-chip" aria-live="polite">
              {periodLabel}
            </p>
          </div>

          <div className="earnings-list__period">
            <EarningsPeriodSelect
              label="Year"
              name="earningsYear"
              value={year}
              options={yearOptions}
              onChange={setYear}
              disabled={isLoading}
            />
            <EarningsPeriodSelect
              label="Month"
              name="earningsMonth"
              value={month}
              options={MONTH_OPTIONS}
              onChange={setMonth}
              disabled={isLoading}
            />
          </div>

          <div className="earnings-list__exports">
            <p className="earnings-list__exports-label">Download CSV report</p>
            <div className="earnings-list__export-btns" role="group" aria-label="Report period">
              {REPORT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  className="earnings-list__export-chip"
                  disabled={isExporting || isLoading}
                  onClick={() => void handleExport(opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {error ? (
          <p className="earnings-list__error" role="alert">
            {error}
          </p>
        ) : null}

        {isLoading ? (
          <p className="earnings-list__hint">Loading earnings…</p>
        ) : summary ? (
          <>
            <section
              className="earnings-list__kpis"
              aria-label={`Agency totals for ${periodLabel}`}
            >
              <article className="earnings-list__kpi earnings-list__kpi--in">
                <span className="earnings-list__kpi-label">Money in</span>
                <strong className="earnings-list__kpi-value">
                  {formatMoney(summary.moneyIn)}
                </strong>
                <span className="earnings-list__kpi-meta">Client billing</span>
              </article>
              <article className="earnings-list__kpi earnings-list__kpi--out">
                <span className="earnings-list__kpi-label">Money out</span>
                <strong className="earnings-list__kpi-value">
                  {formatMoney(summary.moneyOut)}
                </strong>
                <span className="earnings-list__kpi-meta">
                  Guard pay + relief + expenses
                </span>
              </article>
              <article
                className={`earnings-list__kpi earnings-list__kpi--net earnings-list__kpi--${summary.result}`}
              >
                <span className="earnings-list__kpi-label">Net</span>
                <strong className="earnings-list__kpi-value">
                  {formatMoney(summary.net)}
                </strong>
                <span
                  className={`earnings-list__badge earnings-list__badge--${summary.result}`}
                >
                  {resultLabel(summary.result)}
                </span>
              </article>
            </section>

            <section className="earnings-list__sites" aria-labelledby="earnings-sites-title">
              <div className="earnings-list__sites-head">
                <h2 id="earnings-sites-title" className="earnings-list__panel-title">
                  By site
                </h2>
                <p className="earnings-list__panel-hint">
                  Click a site name for the guard and relief breakdown.
                </p>
              </div>

              <div className="earnings-list__table-wrap">
                <table className="earnings-list__table">
                  <thead>
                    <tr>
                      <th>Site</th>
                      <th>Client</th>
                      <th>Assigned</th>
                      <th>Money in</th>
                      <th>Guard pay</th>
                      <th>Relief</th>
                      <th>Expenses</th>
                      <th>Net</th>
                      <th>Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.sites.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="earnings-list__empty">
                          No active sites found for this agency.
                        </td>
                      </tr>
                    ) : (
                      summary.sites.map((site) => (
                        <tr
                          key={site.siteId}
                          className={
                            site.result === "loss"
                              ? "earnings-list__row--loss"
                              : undefined
                          }
                        >
                          <td>
                            <button
                              type="button"
                              className="earnings-list__site-link"
                              onClick={() =>
                                navigate(
                                  earningsSitePath(site.siteId, {
                                    year: summary.from.year,
                                    month: summary.from.month,
                                  })
                                )
                              }
                            >
                              {site.siteName}
                            </button>
                          </td>
                          <td>{site.clientName || "—"}</td>
                          <td>
                            <span className="earnings-list__assigned">
                              <span>{site.assignedMale} M</span>
                              <span>{site.assignedFemale} F</span>
                              {site.assignedOther > 0 ? (
                                <span>{site.assignedOther} O</span>
                              ) : null}
                            </span>
                          </td>
                          <td className="earnings-list__num">
                            {formatMoney(site.moneyIn)}
                          </td>
                          <td className="earnings-list__num">
                            {formatMoney(site.moneyOutGuards)}
                          </td>
                          <td className="earnings-list__num">
                            {formatMoney(site.moneyOutRelief)}
                          </td>
                          <td className="earnings-list__num">
                            {formatMoney(site.moneyOutExpenses ?? 0)}
                          </td>
                          <td className="earnings-list__num earnings-list__num--net">
                            {formatMoney(site.net)}
                          </td>
                          <td>
                            <span
                              className={`earnings-list__badge earnings-list__badge--${site.result}`}
                            >
                              {resultLabel(site.result)}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        ) : null}
      </div>
    </AppScreenLayout>
  );
}
