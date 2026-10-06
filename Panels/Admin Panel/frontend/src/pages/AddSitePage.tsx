import { useNavigate } from "react-router-dom";
import { APP_ROUTES } from "../app/routePaths";
import { AddSiteScreen } from "../features/sites";
import { useAddSite } from "../features/sites";

export function AddSitePage() {
  const navigate = useNavigate();
  const { saveSite, isSubmitting } = useAddSite();

  function goBack() {
    navigate(APP_ROUTES.dashboard);
  }

  return (
    <AddSiteScreen
      isSubmitting={isSubmitting}
      onBack={goBack}
      onCancel={goBack}
      onSubmit={saveSite}
    />
  );
}
