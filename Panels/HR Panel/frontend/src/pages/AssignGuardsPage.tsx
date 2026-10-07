import { useNavigate, useParams } from "react-router-dom";
import { APP_ROUTES } from "../app/routePaths";
import { AssignGuardsScreen } from "../features/sites/AssignGuardsScreen";
import { useAssignGuards } from "../features/sites/useAssignGuards";
import { useSiteList } from "../features/sites/useSiteList";

export function AssignGuardsPage() {
  const { id: siteId = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { sites } = useSiteList();
  const site = sites.find((s) => s.id === siteId);
  const siteName = site?.siteName ?? "Site";

  const {
    guards,
    siteNameById,
    isLoading,
    loadError,
    selectedIds,
    toggle,
    save,
    isSaving,
    saveError,
    isDirty,
  } = useAssignGuards(siteId);

  async function handleSave() {
    await save();
    if (!saveError) {
      navigate(APP_ROUTES.siteList);
    }
  }

  return (
    <AssignGuardsScreen
      siteName={siteName}
      siteId={siteId}
      siteNameById={siteNameById}
      guards={guards}
      isLoading={isLoading}
      loadError={loadError}
      selectedIds={selectedIds}
      onToggle={toggle}
      onSave={handleSave}
      onBack={() => navigate(APP_ROUTES.siteList)}
      isSaving={isSaving}
      saveError={saveError}
      isDirty={isDirty}
    />
  );
}
