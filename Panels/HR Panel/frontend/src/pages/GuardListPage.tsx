import { useNavigate } from "react-router-dom";
import { APP_ROUTES } from "../app/routePaths";
import { GuardListScreen, SAMPLE_GUARDS } from "../features/guards";

export function GuardListPage() {
  const navigate = useNavigate();

  return (
    <GuardListScreen
      guards={SAMPLE_GUARDS}
      onBack={() => navigate(APP_ROUTES.dashboard)}
      onSelectGuard={(guardId) => console.info("Guard selected", guardId)}
    />
  );
}
