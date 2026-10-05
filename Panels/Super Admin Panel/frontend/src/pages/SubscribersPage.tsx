import { useNavigate } from "react-router-dom";
import { APP_ROUTES } from "../app/routePaths";
import { SAMPLE_SUBSCRIBERS, SubscribersScreen } from "../features/subscribers";

export function SubscribersPage() {
  const navigate = useNavigate();

  return (
    <SubscribersScreen
      subscribers={SAMPLE_SUBSCRIBERS}
      onBack={() => navigate(APP_ROUTES.dashboard)}
    />
  );
}
