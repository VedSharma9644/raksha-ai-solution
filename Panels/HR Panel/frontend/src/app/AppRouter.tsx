import type { ReactNode } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useAuthContext } from "../features/authentication";
import { AddGuardPage } from "../pages/AddGuardPage";
import { GuardListPage } from "../pages/GuardListPage";
import { ViewGuardPage } from "../pages/ViewGuardPage";
import { HrDashboardPage } from "../pages/HrDashboardPage";
import { InventoryPage } from "../pages/InventoryPage";
import { LeaveManagementPage } from "../pages/LeaveManagementPage";
import { LoginPage } from "../pages/LoginPage";
import { APP_ROUTES } from "./routePaths";

// Redirects to login if no authenticated HR staff session
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

// Redirects to dashboard if already logged in
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

export function AppRouter() {
  return (
    <Routes>
      {/* Guest-only */}
      <Route
        path={APP_ROUTES.login}
        element={
          <GuestRoute>
            <LoginPage />
          </GuestRoute>
        }
      />

      {/* Protected */}
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
          <ProtectedRoute>
            <AddGuardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={APP_ROUTES.guardList}
        element={
          <ProtectedRoute>
            <GuardListPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={APP_ROUTES.viewGuard}
        element={
          <ProtectedRoute>
            <ViewGuardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={APP_ROUTES.manageInventory}
        element={
          <ProtectedRoute>
            <InventoryPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={APP_ROUTES.manageLeave}
        element={
          <ProtectedRoute>
            <LeaveManagementPage />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to={APP_ROUTES.login} replace />} />
    </Routes>
  );
}
