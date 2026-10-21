import { useEffect } from "react";
import { useAuthContext } from "../features/authentication";
import { AgencyDashboardScreen } from "../features/dashboard";

export function AgencyDashboardPage() {
  const { refreshAgency } = useAuthContext();

  useEffect(() => {
    void refreshAgency();
    const onFocus = () => {
      void refreshAgency();
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [refreshAgency]);

  return <AgencyDashboardScreen />;
}
