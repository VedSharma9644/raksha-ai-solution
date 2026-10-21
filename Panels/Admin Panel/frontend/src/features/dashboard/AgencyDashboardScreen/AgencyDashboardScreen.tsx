import { useMemo, useState } from "react";
import {
  GroupedBarChart,
  SimpleBarChart,
  SimpleLineChart,
} from "../../../components/charts/SimpleCharts";
import {
  defaultDashboardRange,
  presetRange,
  useDashboardAnalytics,
  type DashboardDateRange,
} from "../useDashboardAnalytics";
import "./AgencyDashboardScreen.css";

function formatInr(value: number): string {
  return `₹${Math.round(value).toLocaleString("en-IN")}`;
}

function growthLabel(pct: number | null): { text: string; tone: "up" | "down" | "flat" } {
  if (pct == null) return { text: "No prior period", tone: "flat" };
  const rounded = Math.round(pct * 10) / 10;
  if (rounded > 0) return { text: `↑ ${rounded}% vs prior`, tone: "up" };
  if (rounded < 0) return { text: `↓ ${Math.abs(rounded)}% vs prior`, tone: "down" };
  return { text: "Flat vs prior", tone: "flat" };
}

export function AgencyDashboardScreen() {
  const [range, setRange] = useState<DashboardDateRange>(defaultDashboardRange);
  const [activePreset, setActivePreset] = useState<"7d" | "30d" | "month" | "custom">(
    "30d",
  );
  const analytics = useDashboardAnalytics(range);

  const incomeGrowth = useMemo(
    () => growthLabel(analytics.moneyInGrowthPct),
    [analytics.moneyInGrowthPct],
  );
  const netGrowth = useMemo(
    () => growthLabel(analytics.netGrowthPct),
    [analytics.netGrowthPct],
  );

  const presentSeries = analytics.attendanceDays.map((d) => ({
    label: d.label,
    value: d.present,
  }));

  function applyPreset(preset: "7d" | "30d" | "month") {
    setActivePreset(preset);
    setRange(presetRange(preset));
  }

  function onFromChange(value: string) {
    setActivePreset("custom");
    setRange((prev) => ({
      from: value,
      to: value > prev.to ? value : prev.to,
    }));
  }

  function onToChange(value: string) {
    setActivePreset("custom");
    setRange((prev) => ({
      from: value < prev.from ? value : prev.from,
      to: value,
    }));
  }

  return (
    <main className="agency-dashboard">
      <section className="agency-dashboard__intro" aria-labelledby="dashboard-heading">
        <div>
          <h1 id="dashboard-heading" className="agency-dashboard__headline">
            Agency overview
          </h1>
          <p className="agency-dashboard__support">
            Income, growth, and attendance for the selected branch and date range.
            Use the sidebar to open modules.
          </p>
        </div>

        <div className="agency-dashboard__range">
          <div className="agency-dashboard__field">
            <label htmlFor="dash-from">From</label>
            <input
              id="dash-from"
              type="date"
              value={range.from}
              max={range.to}
              onChange={(e) => onFromChange(e.target.value)}
            />
          </div>
          <div className="agency-dashboard__field">
            <label htmlFor="dash-to">To</label>
            <input
              id="dash-to"
              type="date"
              value={range.to}
              min={range.from}
              onChange={(e) => onToChange(e.target.value)}
            />
          </div>
          <div className="agency-dashboard__presets" role="group" aria-label="Range presets">
            {(
              [
                ["7d", "7 days"],
                ["30d", "30 days"],
                ["month", "This month"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                className={`agency-dashboard__preset${
                  activePreset === id ? " agency-dashboard__preset--active" : ""
                }`}
                onClick={() => applyPreset(id)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {analytics.loading ? (
        <p className="agency-dashboard__status">Loading analytics…</p>
      ) : null}
      {analytics.error ? (
        <p className="agency-dashboard__status agency-dashboard__status--error">
          {analytics.error}
        </p>
      ) : null}

      <section className="agency-dashboard__kpis" aria-label="Key metrics">
        <article className="agency-dashboard__kpi">
          <p className="agency-dashboard__kpi-label">Money in</p>
          <p className="agency-dashboard__kpi-value">{formatInr(analytics.moneyIn)}</p>
          <p
            className={`agency-dashboard__kpi-meta agency-dashboard__kpi-meta--${incomeGrowth.tone}`}
          >
            {incomeGrowth.text}
          </p>
        </article>
        <article className="agency-dashboard__kpi">
          <p className="agency-dashboard__kpi-label">Net</p>
          <p className="agency-dashboard__kpi-value">{formatInr(analytics.net)}</p>
          <p
            className={`agency-dashboard__kpi-meta agency-dashboard__kpi-meta--${netGrowth.tone}`}
          >
            {netGrowth.text}
          </p>
        </article>
        <article className="agency-dashboard__kpi">
          <p className="agency-dashboard__kpi-label">Money out</p>
          <p className="agency-dashboard__kpi-value">{formatInr(analytics.moneyOut)}</p>
          <p className="agency-dashboard__kpi-meta">In selected months</p>
        </article>
        <article className="agency-dashboard__kpi">
          <p className="agency-dashboard__kpi-label">Active guards</p>
          <p className="agency-dashboard__kpi-value">{analytics.activeGuards}</p>
          <p className="agency-dashboard__kpi-meta">{analytics.siteCount} sites</p>
        </article>
        <article className="agency-dashboard__kpi">
          <p className="agency-dashboard__kpi-label">Attendance snapshot</p>
          <p className="agency-dashboard__kpi-value">
            {analytics.attendanceToday
              ? `${analytics.attendanceToday.present} present`
              : "—"}
          </p>
          <p className="agency-dashboard__kpi-meta">
            {analytics.attendanceToday
              ? `${analytics.attendanceToday.absent} absent · ${analytics.attendanceToday.onShift} on shift`
              : "No day loaded"}
          </p>
        </article>
      </section>

      <section className="agency-dashboard__charts" aria-label="Charts">
        <SimpleBarChart
          title="Income by site"
          series={analytics.incomeBySite}
          valuePrefix="₹"
          emptyLabel="No earnings in this range (or earnings module unavailable)."
        />
        <SimpleLineChart
          title="Present guards over time"
          series={presentSeries}
          emptyLabel="No attendance samples in this range."
        />
        <GroupedBarChart
          title="Attendance: present vs absent"
          categories={analytics.attendanceDays.map((d) => d.label)}
          series={[
            {
              name: "Present",
              values: analytics.attendanceDays.map((d) => d.present),
              color: "var(--color-success)",
            },
            {
              name: "Absent",
              values: analytics.attendanceDays.map((d) => d.absent),
              color: "var(--color-error)",
            },
          ]}
          emptyLabel="No attendance samples in this range."
        />
      </section>
    </main>
  );
}
