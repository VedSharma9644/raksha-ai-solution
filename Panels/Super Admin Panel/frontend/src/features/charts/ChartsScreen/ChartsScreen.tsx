import { AppScreenLayout } from "../../../components/AppScreenLayout";
import { BarChart } from "../../../components/BarChart";
import { MetricCard } from "../../../components/MetricCard";
import { PageHeader } from "../../../components/PageHeader";
import type { ChartPoint, PlatformMetrics } from "../chartTypes";
import "./ChartsScreen.css";

export interface ChartsScreenProps {
  metrics: PlatformMetrics;
  agencyGrowth: ChartPoint[];
  featureUsage: ChartPoint[];
  subscriptionMix: ChartPoint[];
  onBack: () => void;
}

export function ChartsScreen({
  metrics,
  agencyGrowth,
  featureUsage,
  subscriptionMix,
  onBack,
}: ChartsScreenProps) {
  return (
    <AppScreenLayout>
      <div className="app-screen-layout__content charts-screen">
        <PageHeader
          title="Charts & Insights"
          subtitle="Platform growth, feature adoption, and subscription health at a glance."
          onBack={onBack}
          backLabel="Back to dashboard"
        />

        <section className="charts-screen__metrics" aria-label="Summary metrics">
          <MetricCard label="Agencies" value={metrics.totalAgencies} />
          <MetricCard
            label="Active subscribers"
            value={metrics.activeSubscribers}
          />
          <MetricCard label="Trials" value={metrics.trialAgencies} />
          <MetricCard
            label="Feature toggles on"
            value={metrics.enabledFeatureToggles}
          />
        </section>

        <section className="charts-screen__grid" aria-label="Platform charts">
          <BarChart title="Agency growth" points={agencyGrowth} />
          <BarChart title="Feature adoption by agency count" points={featureUsage} />
          <BarChart title="Subscription mix" points={subscriptionMix} />
        </section>
      </div>
    </AppScreenLayout>
  );
}
