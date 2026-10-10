import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { APP_ROUTES, assignGuardsPath, schedulingPath } from "../app/routePaths";
import { SiteListScreen } from "../features/sites/SiteListScreen";
import { useSiteList } from "../features/sites/useSiteList";
import { useGuardList } from "../features/guards/useGuardList";
import { useAgencyRosterCoverage } from "../features/scheduling/useAgencyRosterCoverage";

export function SiteListPage() {
  const navigate = useNavigate();
  const { sites, isLoading, error } = useSiteList();
  const { guards } = useGuardList();
  const { report } = useAgencyRosterCoverage(7);

  const understaffedSiteIds = useMemo(
    () => (report?.sitesAtRisk ?? []).map((s) => s.siteId),
    [report]
  );
  const coverageSummary = useMemo(() => {
    const atRisk = report?.sitesAtRisk ?? [];
    if (atRisk.length === 0) {
      return undefined;
    }
    const totalGaps = atRisk.reduce((sum, s) => sum + s.gapCount, 0);
    return `${atRisk.length} site${atRisk.length === 1 ? "" : "s"} ${
      atRisk.length === 1 ? "has" : "have"
    } understaffed shifts in the next 7 days (${totalGaps} shift-day gap${
      totalGaps === 1 ? "" : "s"
    }).`;
  }, [report]);

  if (isLoading) return <p style={{ padding: "2rem" }}>Loading sites…</p>;
  if (error) return <p style={{ padding: "2rem", color: "red" }}>{error}</p>;

  return (
    <SiteListScreen
      sites={sites}
      guards={guards}
      understaffedSiteIds={understaffedSiteIds}
      coverageSummary={coverageSummary}
      onBack={() => navigate(APP_ROUTES.dashboard)}
      onAssignGuards={(id) => navigate(assignGuardsPath(id))}
      onSchedule={(id) => navigate(schedulingPath(id))}
    />
  );
}
