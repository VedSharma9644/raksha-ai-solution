import { Navigate, Route, Routes } from "react-router-dom";
import { AddAgencyPage } from "../pages/AddAgencyPage";
import { AgencyListPage } from "../pages/AgencyListPage";
import { ChartsPage } from "../pages/ChartsPage";
import { FeatureControlPage } from "../pages/FeatureControlPage";
import { LoginPage } from "../pages/LoginPage";
import { SubscribersPage } from "../pages/SubscribersPage";
import { SuperAdminDashboardPage } from "../pages/SuperAdminDashboardPage";
import { APP_ROUTES } from "./routePaths";

export function AppRouter() {
  return (
    <Routes>
      <Route path={APP_ROUTES.login} element={<LoginPage />} />
      <Route
        path={APP_ROUTES.dashboard}
        element={<SuperAdminDashboardPage />}
      />
      <Route path={APP_ROUTES.addAgency} element={<AddAgencyPage />} />
      <Route path={APP_ROUTES.agencyList} element={<AgencyListPage />} />
      <Route
        path={APP_ROUTES.featureControl}
        element={<FeatureControlPage />}
      />
      <Route path={APP_ROUTES.subscribers} element={<SubscribersPage />} />
      <Route path={APP_ROUTES.charts} element={<ChartsPage />} />
      <Route path="*" element={<Navigate to={APP_ROUTES.login} replace />} />
    </Routes>
  );
}
