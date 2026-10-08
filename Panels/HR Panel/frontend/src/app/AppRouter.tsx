import type { ReactNode } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { ModuleProtectedRoute } from "../components/ModuleProtectedRoute";
import { useAuthContext } from "../features/authentication";
import { AddGuardPage } from "../pages/AddGuardPage";
import { GuardListPage } from "../pages/GuardListPage";
import { ViewGuardPage } from "../pages/ViewGuardPage";
import { HrDashboardPage } from "../pages/HrDashboardPage";
import { InventoryPage } from "../pages/InventoryPage";
import { LeaveManagementPage } from "../pages/LeaveManagementPage";
import { SiteListPage } from "../pages/SiteListPage";
import { AssignGuardsPage } from "../pages/AssignGuardsPage";
import { AttendancePage } from "../pages/AttendancePage";
import { LoginPage } from "../pages/LoginPage";
import { APP_ROUTES } from "./routePaths";

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { hrStaff, isLoading } = useAuthContext();

  if (isLoading) {
    return null;
  }

  if (!hrStaff) {
    return <Navigate to={APP_ROUTES.login} replace />;
  }

  return <>{children}</>;
}

function GuestRoute({ children }: { children: ReactNode }) {
  const { hrStaff, isLoading } = useAuthContext();

  if (isLoading) {
    return null;
  }

  if (hrStaff) {
    return <Navigate to={APP_ROUTES.dashboard} replace />;
  }

  return <>{children}</>;
}

function ModuleRoute({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute>
      <ModuleProtectedRoute>{children}</ModuleProtectedRoute>
    </ProtectedRoute>
  );
}

export function AppRouter() {
  return (
    <Routes>
      <Route
        path={APP_ROUTES.login}
        element={
          <GuestRoute>
            <LoginPage />
          </GuestRoute>
        }
      />

      <Route
        path={APP_ROUTES.dashboard}
        element={
          <ProtectedRoute>
            <HrDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={APP_ROUTES.addGuard}
        element={
          <ModuleRoute>
            <AddGuardPage />
          </ModuleRoute>
        }
      />
      <Route
        path={APP_ROUTES.guardList}
        element={
          <ModuleRoute>
            <GuardListPage />
          </ModuleRoute>
        }
      />
      <Route
        path={APP_ROUTES.viewGuard}
        element={
          <ModuleRoute>
            <ViewGuardPage />
          </ModuleRoute>
        }
      />
      <Route
        path={APP_ROUTES.manageInventory}
        element={
          <ModuleRoute>
            <InventoryPage />
          </ModuleRoute>
        }
      />
      <Route
        path={APP_ROUTES.manageLeave}
        element={
          <ModuleRoute>
            <LeaveManagementPage />
          </ModuleRoute>
        }
      />
      <Route
        path={APP_ROUTES.siteList}
        element={
          <ModuleRoute>
            <SiteListPage />
          </ModuleRoute>
        }
      />
      <Route
        path={APP_ROUTES.assignGuards}
        element={
          <ModuleRoute>
            <AssignGuardsPage />
          </ModuleRoute>
        }
      />
      <Route
        path={APP_ROUTES.attendance}
        element={
          <ModuleRoute>
            <AttendancePage />
          </ModuleRoute>
        }
      />

      <Route path="*" element={<Navigate to={APP_ROUTES.login} replace />} />
    </Routes>
  );
}
