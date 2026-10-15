import { useNavigate } from "react-router-dom";
import { APP_ROUTES } from "../app/routePaths";
import { ProspectLeadsScreen } from "../features/prospectLeads";

export function ProspectLeadsPage() {
  const navigate = useNavigate();

  return (
    <ProspectLeadsScreen
      onBack={() => navigate(APP_ROUTES.dashboard)}
      onOpenClients={() => navigate(APP_ROUTES.prospects)}
      onOpenGuards={() => navigate(APP_ROUTES.prospectGuards)}
    />
  );
}
