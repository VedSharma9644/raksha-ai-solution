import { useNavigate } from "react-router-dom";
import { APP_ROUTES, editSitePath } from "../app/routePaths";
import { SiteListScreen } from "../features/sites";
import { useSiteList } from "../features/sites";

export function SiteListPage() {
  const navigate = useNavigate();
  const { sites, isLoading, error } = useSiteList();

  if (isLoading) return <p style={{ padding: "2rem" }}>Loading sites…</p>;
  if (error) return <p style={{ padding: "2rem", color: "red" }}>{error}</p>;

  return (
    <SiteListScreen
      sites={sites}
      onBack={() => navigate(APP_ROUTES.dashboard)}
      onAddSite={() => navigate(APP_ROUTES.addSite)}
      onSelectSite={(id) => navigate(editSitePath(id))}
    />
  );
}
