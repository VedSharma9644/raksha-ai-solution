import { useNavigate } from "react-router-dom";
import { APP_ROUTES, assignGuardsPath } from "../app/routePaths";
import { SiteListScreen } from "../features/sites/SiteListScreen";
import { useSiteList } from "../features/sites/useSiteList";
import { useGuardList } from "../features/guards/useGuardList";

export function SiteListPage() {
  const navigate = useNavigate();
  const { sites, isLoading, error } = useSiteList();
  const { guards } = useGuardList();

  if (isLoading) return <p style={{ padding: "2rem" }}>Loading sites…</p>;
  if (error) return <p style={{ padding: "2rem", color: "red" }}>{error}</p>;

  return (
    <SiteListScreen
      sites={sites}
      guards={guards}
      onBack={() => navigate(APP_ROUTES.dashboard)}
      onAssignGuards={(id) => navigate(assignGuardsPath(id))}
    />
  );
}
