import { useNavigate } from "react-router-dom";
import { APP_ROUTES } from "../app/routePaths";
import { useAuthContext } from "../features/authentication";
import {
  GeneralSettingsScreen,
  usePayrollSettings,
} from "../features/payroll";

export function GeneralSettingsPage() {
  const navigate = useNavigate();
  const { hrStaff } = useAuthContext();
  const { settings, isLoading, error } = usePayrollSettings(hrStaff?.agencyId);

  function goBack() {
    navigate(APP_ROUTES.dashboard);
  }

  if (isLoading || !settings) {
    return null;
  }

  return (
    <GeneralSettingsScreen
      settings={settings}
      isSubmitting={false}
      readOnly
      error={error}
      onBack={goBack}
    />
  );
}
