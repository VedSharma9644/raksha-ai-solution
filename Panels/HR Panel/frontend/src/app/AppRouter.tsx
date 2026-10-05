import { Navigate, Route, Routes } from "react-router-dom";
import { AddGuardPage } from "../pages/AddGuardPage";
import { GuardListPage } from "../pages/GuardListPage";
import { HrDashboardPage } from "../pages/HrDashboardPage";
import { InventoryPage } from "../pages/InventoryPage";
import { LeaveManagementPage } from "../pages/LeaveManagementPage";
import { LoginPage } from "../pages/LoginPage";
import { APP_ROUTES } from "./routePaths";

export function AppRouter() {
  return (
    <Routes>
      <Route path={APP_ROUTES.login} element={<LoginPage />} />
      <Route path={APP_ROUTES.dashboard} element={<HrDashboardPage />} />
      <Route path={APP_ROUTES.addGuard} element={<AddGuardPage />} />
      <Route path={APP_ROUTES.guardList} element={<GuardListPage />} />
      <Route path={APP_ROUTES.manageInventory} element={<InventoryPage />} />
      <Route path={APP_ROUTES.manageLeave} element={<LeaveManagementPage />} />
      <Route path="*" element={<Navigate to={APP_ROUTES.login} replace />} />
    </Routes>
  );
}
