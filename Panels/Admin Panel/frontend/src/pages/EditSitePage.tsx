import { useNavigate, useParams } from "react-router-dom";
import { APP_ROUTES } from "../app/routePaths";
import { EditSiteScreen } from "../features/sites";
import { useEditSite } from "../features/sites";
import { useDeleteSite } from "../features/sites";

export function EditSitePage() {
  const navigate = useNavigate();
  const { id = "" } = useParams<{ id: string }>();

  const { initialValues, isLoading, isSubmitting, loadError, saveError, saveSite } =
    useEditSite(id);
  const { removeSite, isDeleting } = useDeleteSite(id);

  if (isLoading) return <p style={{ padding: "2rem" }}>Loading site…</p>;
  if (loadError) return <p style={{ padding: "2rem", color: "red" }}>{loadError}</p>;
  if (!initialValues) return null;

  return (
    <>
      {saveError && (
        <p style={{ padding: "0 2rem", color: "red" }}>{saveError}</p>
      )}
      <EditSiteScreen
        initialValues={initialValues}
        isSubmitting={isSubmitting}
        isDeleting={isDeleting}
        onBack={() => navigate(APP_ROUTES.siteList)}
        onCancel={() => navigate(APP_ROUTES.siteList)}
        onSubmit={saveSite}
        onDelete={removeSite}
      />
    </>
  );
}
