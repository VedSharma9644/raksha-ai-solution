import { useNavigate } from "react-router-dom";
import { APP_ROUTES } from "../app/routePaths";
import { AgencyListScreen, SAMPLE_AGENCIES } from "../features/agencies";

export function AgencyListPage() {
  const navigate = useNavigate();

  return (
    <AgencyListScreen
      agencies={SAMPLE_AGENCIES}
      onBack={() => navigate(APP_ROUTES.dashboard)}
      onSelectAgency={(agencyId) => {
        console.info("Agency selected", agencyId);
        navigate(APP_ROUTES.featureControl);
      }}
    />
  );
}
