import { useNavigate } from "react-router-dom";
import { APP_ROUTES, assignGuardsPath, editSitePath, schedulingPath } from "../app/routePaths";
import { SiteListScreen } from "../features/sites";
import { useSiteList } from "../features/sites";
import { useGuardList } from "../features/guards/useGuardList";

export function SiteListPage() {
  const navigate = useNavigate();
  const { sites, isLoading: sitesLoading, error: sitesError } = useSiteList();
  const { guards } = useGuardList();

  if (sitesLoading) return <p style={{ padding: "2rem" }}>Loading sites…</p>;
  if (sitesError) return <p style={{ padding: "2rem", color: "red" }}>{sitesError}</p>;

  return (
    <SiteListScreen
      sites={sites}
      guards={guards}
      onBack={() => navigate(APP_ROUTES.dashboard)}
      onAddSite={() => navigate(APP_ROUTES.addSite)}
      onSelectSite={(id) => navigate(editSitePath(id))}
      onAssignGuards={(id) => navigate(assignGuardsPath(id))}
      onSchedule={(id) => navigate(schedulingPath(id))}
    />
  );
}
