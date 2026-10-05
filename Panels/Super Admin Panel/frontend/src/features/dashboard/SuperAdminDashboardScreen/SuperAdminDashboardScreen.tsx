import { ActionCard } from "../../../components/ActionCard";
import { BarChart } from "../../../components/BarChart";
import { MetricCard } from "../../../components/MetricCard";
import type { ChartPoint, PlatformMetrics } from "../../charts/chartTypes";
import type { SuperAdminDashboardActionId } from "../dashboardActions";
import { SUPER_ADMIN_DASHBOARD_ACTIONS } from "../dashboardActions";
import "./SuperAdminDashboardScreen.css";

export interface SuperAdminDashboardScreenProps {
  metrics: PlatformMetrics;
  agencyGrowth: ChartPoint[];
  onActionClick: (actionId: SuperAdminDashboardActionId) => void;
}

export function SuperAdminDashboardScreen({
  metrics,
  agencyGrowth,
  onActionClick,
}: SuperAdminDashboardScreenProps) {
  return (
    <main className="super-admin-dashboard">
      <header className="super-admin-dashboard__header">
        <div>
          <p className="super-admin-dashboard__brand-name">Raskha</p>
          <p className="super-admin-dashboard__brand-panel">Super Admin</p>
        </div>
      </header>

      <section
        className="super-admin-dashboard__intro"
        aria-labelledby="super-admin-heading"
      >
        <h1 id="super-admin-heading" className="super-admin-dashboard__headline">
          Platform command center
        </h1>
        <p className="super-admin-dashboard__support">
          Control agencies, unlock modules, and watch subscription health across
          every company on Raskha.
        </p>
      </section>

      <section
        className="super-admin-dashboard__metrics"
        aria-label="Platform metrics"
      >
        <MetricCard label="Agencies" value={metrics.totalAgencies} />
        <MetricCard label="Active subscribers" value={metrics.activeSubscribers} />
        <MetricCard label="Trials" value={metrics.trialAgencies} />
        <MetricCard
          label="Feature toggles on"
          value={metrics.enabledFeatureToggles}
        />
      </section>

      <section className="super-admin-dashboard__chart">
        <BarChart title="Agency growth" points={agencyGrowth} />
      </section>

      <section
        className="super-admin-dashboard__actions"
        aria-label="Super admin quick actions"
      >
        {SUPER_ADMIN_DASHBOARD_ACTIONS.map((action) => (
          <ActionCard
            key={action.id}
            title={action.title}
            description={action.description}
            icon={action.iconLabel}
            onClick={() => onActionClick(action.id)}
          />
        ))}
      </section>
    </main>
  );
}
