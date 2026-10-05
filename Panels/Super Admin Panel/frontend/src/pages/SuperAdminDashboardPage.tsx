import { useNavigate } from "react-router-dom";
import { APP_ROUTES } from "../app/routePaths";
import type { SuperAdminDashboardActionId } from "../features/dashboard";
import { SuperAdminDashboardScreen } from "../features/dashboard";
import {
  SAMPLE_AGENCY_GROWTH,
  SAMPLE_PLATFORM_METRICS,
} from "../features/charts";

const ACTION_ROUTES: Record<
  SuperAdminDashboardActionId,
  (typeof APP_ROUTES)[keyof typeof APP_ROUTES]
> = {
  "add-agency": APP_ROUTES.addAgency,
  "agency-list": APP_ROUTES.agencyList,
  "feature-control": APP_ROUTES.featureControl,
  subscribers: APP_ROUTES.subscribers,
  charts: APP_ROUTES.charts,
};

export function SuperAdminDashboardPage() {
  const navigate = useNavigate();

  return (
    <SuperAdminDashboardScreen
      metrics={SAMPLE_PLATFORM_METRICS}
      agencyGrowth={SAMPLE_AGENCY_GROWTH}
      onActionClick={(actionId) => navigate(ACTION_ROUTES[actionId])}
    />
  );
}
