import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { EarningsReportPeriod, EarningsSummary } from "@raskha/earnings";
import { APP_ROUTES, earningsSitePath } from "../../../app/routePaths";
import { AppScreenLayout } from "../../../components/AppScreenLayout";
import { PageHeader } from "../../../components/PageHeader";
import { useBranchContext } from "../../branches";
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
  const { activeBranchId } = useBranchContext();
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

  /** Ensure general (no-site) expenses always reduce Money out / Net in the UI. */
  const agencyTotals = useMemo(() => {
    if (!summary) return null;
    const generalFromRows = (summary.unattributedExpenses ?? []).reduce(
      (s, e) => s + (Number(e.amount) || 0),
      0
    );
    const general =
      generalFromRows > 0
        ? generalFromRows
        : Number(summary.moneyOutUnattributedExpenses) || 0;
    const siteMoneyOut = summary.sites.reduce(
      (s, r) => s + (Number(r.moneyOut) || 0),
      0
    );
    const moneyIn = Number(summary.moneyIn) || 0;
    const moneyOut = Math.round((siteMoneyOut + general) * 100) / 100;
    const net = Math.round((moneyIn - moneyOut) * 100) / 100;
    const result =
      net > 0.005 ? "profit" : net < -0.005 ? "loss" : "break_even";
    return {
      moneyIn,
      moneyOut,
      general: Math.round(general * 100) / 100,
      net,
      result,
    };
  }, [summary]);

  async function load(y: number, m: number) {
    setIsLoading(true);
    setError("");
    try {
      const data = await fetchEarningsSummaryApi({
        fromYear: y,
        fromMonth: m,
        toYear: y,
        toMonth: m,
        branchId: activeBranchId,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reload on branch/period
  }, [year, month, activeBranchId]);

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
      await downloadEarningsCsvApi({
        period,
        year: y,
        month: m,
        branchId: activeBranchId,
      });
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
                  {formatMoney(agencyTotals?.moneyIn ?? summary.moneyIn)}
                </strong>
                <span className="earnings-list__kpi-meta">Client billing</span>
              </article>
              <article className="earnings-list__kpi earnings-list__kpi--out">
                <span className="earnings-list__kpi-label">Money out</span>
                <strong className="earnings-list__kpi-value">
                  {formatMoney(agencyTotals?.moneyOut ?? summary.moneyOut)}
                </strong>
                <span className="earnings-list__kpi-meta">
                  Sites + general expenses
                  {(agencyTotals?.general ?? 0) > 0
                    ? ` (incl. ${formatMoney(agencyTotals!.general)} general)`
                    : ""}
                </span>
              </article>
              <article className="earnings-list__kpi earnings-list__kpi--general">
                <span className="earnings-list__kpi-label">General expenses</span>
                <strong className="earnings-list__kpi-value">
                  {formatMoney(agencyTotals?.general ?? 0)}
                </strong>
                <span className="earnings-list__kpi-meta">
                  Deducted from agency net
                </span>
              </article>
              <article
                className={`earnings-list__kpi earnings-list__kpi--net earnings-list__kpi--${agencyTotals?.result ?? summary.result}`}
              >
                <span className="earnings-list__kpi-label">Net</span>
                <strong className="earnings-list__kpi-value">
                  {formatMoney(agencyTotals?.net ?? summary.net)}
                </strong>
                <span
                  className={`earnings-list__badge earnings-list__badge--${agencyTotals?.result ?? summary.result}`}
                >
                  {resultLabel(agencyTotals?.result ?? summary.result)}
                </span>
              </article>
            </section>

            <section
              className="earnings-list__sites"
              aria-labelledby="earnings-general-title"
            >
              <div className="earnings-list__sites-head">
                <h2
                  id="earnings-general-title"
                  className="earnings-list__panel-title"
                >
                  General / unallocated expenses
                </h2>
                <p className="earnings-list__panel-hint">
                  Logged in Money Out without a site (for example staff parties
                  or misc spend). Deducted from agency profit only — not assigned
                  to any site.
                </p>
              </div>

              <div className="earnings-list__table-wrap">
                <table className="earnings-list__table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Category</th>
                      <th>Note</th>
                      <th>Guard</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(summary.unattributedExpenses ?? []).length === 0 ? (
                      <tr>
                        <td colSpan={5} className="earnings-list__empty">
                          No general expenses in this period. Add them in Money
                          Out and leave Site empty.
                        </td>
                      </tr>
                    ) : (
                      (summary.unattributedExpenses ?? []).map((e) => (
                        <tr key={e.expenseId}>
                          <td>{e.date}</td>
                          <td>{e.category}</td>
                          <td>{e.note || "—"}</td>
                          <td>{e.guardName || "—"}</td>
                          <td className="earnings-list__num">
                            {formatMoney(e.amount)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                  {(summary.unattributedExpenses ?? []).length > 0 ? (
                    <tfoot>
                      <tr className="earnings-list__tfoot">
                        <td colSpan={4}>Total general expenses</td>
                        <td className="earnings-list__num">
                          {formatMoney(agencyTotals?.general ?? 0)}
                        </td>
                      </tr>
                    </tfoot>
                  ) : null}
                </table>
              </div>
            </section>

            <section className="earnings-list__sites" aria-labelledby="earnings-sites-title">
              <div className="earnings-list__sites-head">
                <h2 id="earnings-sites-title" className="earnings-list__panel-title">
                  By site
                </h2>
                <p className="earnings-list__panel-hint">
                  Site-linked costs only. General expenses above are extra on top
                  of these rows. Click a site for the guard and relief breakdown.
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
