import { useNavigate } from "react-router-dom";
import { APP_ROUTES } from "../app/routePaths";
import {
  ChartsScreen,
  SAMPLE_AGENCY_GROWTH,
  SAMPLE_FEATURE_USAGE,
  SAMPLE_PLATFORM_METRICS,
  SAMPLE_SUBSCRIPTION_MIX,
} from "../features/charts";

export function ChartsPage() {
  const navigate = useNavigate();

  return (
    <ChartsScreen
      metrics={SAMPLE_PLATFORM_METRICS}
      agencyGrowth={SAMPLE_AGENCY_GROWTH}
      featureUsage={SAMPLE_FEATURE_USAGE}
      subscriptionMix={SAMPLE_SUBSCRIPTION_MIX}
      onBack={() => navigate(APP_ROUTES.dashboard)}
    />
  );
}
