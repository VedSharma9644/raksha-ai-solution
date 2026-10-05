import { Navigate, Route, Routes } from "react-router-dom";
import { AddGuardPage } from "../pages/AddGuardPage";
import { AddHrPage } from "../pages/AddHrPage";
import { AddSitePage } from "../pages/AddSitePage";
import { AddSupervisorPage } from "../pages/AddSupervisorPage";
import { AgencyDashboardPage } from "../pages/AgencyDashboardPage";
import { EmployeeListPage } from "../pages/EmployeeListPage";
import { LoginPage } from "../pages/LoginPage";
import { APP_ROUTES } from "./routePaths";

export function AppRouter() {
  return (
    <Routes>
      <Route path={APP_ROUTES.login} element={<LoginPage />} />
      <Route path={APP_ROUTES.dashboard} element={<AgencyDashboardPage />} />
      <Route path={APP_ROUTES.addGuard} element={<AddGuardPage />} />
      <Route path={APP_ROUTES.addSite} element={<AddSitePage />} />
      <Route path={APP_ROUTES.employeeList} element={<EmployeeListPage />} />
      <Route path={APP_ROUTES.addSupervisor} element={<AddSupervisorPage />} />
      <Route path={APP_ROUTES.addHr} element={<AddHrPage />} />
      <Route path="*" element={<Navigate to={APP_ROUTES.login} replace />} />
    </Routes>
  );
}
