import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { APP_ROUTES, assignGuardsPath, editSitePath, schedulingPath } from "../app/routePaths";
import { SiteListScreen } from "../features/sites";
import { useSiteList } from "../features/sites";
import { useGuardList } from "../features/guards/useGuardList";
import { useAgencyRosterCoverage } from "../features/scheduling/useAgencyRosterCoverage";

export function SiteListPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const fromManageSchedule =
    (location.state as { from?: string } | null)?.from === "manage-schedule";
  const { sites, isLoading: sitesLoading, error: sitesError } = useSiteList();
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

  if (sitesLoading) return <p style={{ padding: "2rem" }}>Loading sites…</p>;
  if (sitesError) return <p style={{ padding: "2rem", color: "red" }}>{sitesError}</p>;

  return (
    <SiteListScreen
      sites={sites}
      guards={guards}
      understaffedSiteIds={understaffedSiteIds}
      coverageSummary={coverageSummary}
      onBack={() =>
        navigate(
          fromManageSchedule
            ? APP_ROUTES.manageSchedule
            : APP_ROUTES.dashboard
        )
      }
      backLabel={
        fromManageSchedule
          ? "Back to manage schedule"
          : "Back to dashboard"
      }
      onAddSite={() => navigate(APP_ROUTES.addSite)}
      onSelectSite={(id) => navigate(editSitePath(id))}
      onAssignGuards={(id) => navigate(assignGuardsPath(id))}
      onSchedule={(id) => navigate(schedulingPath(id))}
    />
  );
}
