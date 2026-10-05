import type { ReactNode } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useAuthContext } from "../features/authentication";
import { AddGuardPage } from "../pages/AddGuardPage";
import { EditGuardPage } from "../pages/EditGuardPage";
import { AddHrPage } from "../pages/AddHrPage";
import { AddSitePage } from "../pages/AddSitePage";
import { AddSupervisorPage } from "../pages/AddSupervisorPage";
import { AgencyDashboardPage } from "../pages/AgencyDashboardPage";
import { EmployeeListPage } from "../pages/EmployeeListPage";
import { LoginPage } from "../pages/LoginPage";
import { APP_ROUTES } from "./routePaths";

// Redirects to login if not authenticated
function ProtectedRoute({ children }: { children: ReactNode }) {
  const { agency, isLoading } = useAuthContext();

  if (isLoading) {
    return null; // Or a loading spinner
  }

  if (!agency) {
    return <Navigate to={APP_ROUTES.login} replace />;
  }

  return <>{children}</>;
}

// Redirects to dashboard if already logged in
function GuestRoute({ children }: { children: ReactNode }) {
  const { agency, isLoading } = useAuthContext();

  if (isLoading) {
    return null;
  }

  if (agency) {
    return <Navigate to={APP_ROUTES.dashboard} replace />;
  }

  return <>{children}</>;
}

export function AppRouter() {
  return (
    <Routes>
      {/* Guest-only: redirect to dashboard if already logged in */}
      <Route
        path={APP_ROUTES.login}
        element={
          <GuestRoute>
            <LoginPage />
          </GuestRoute>
        }
      />

      {/* Protected: redirect to login if not authenticated */}
      <Route
        path={APP_ROUTES.dashboard}
        element={
          <ProtectedRoute>
            <AgencyDashboardPage />
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
        path={APP_ROUTES.editGuard}
        element={
          <ProtectedRoute>
            <EditGuardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={APP_ROUTES.addSite}
        element={
          <ProtectedRoute>
            <AddSitePage />
          </ProtectedRoute>
        }
      />
      <Route
        path={APP_ROUTES.employeeList}
        element={
          <ProtectedRoute>
            <EmployeeListPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={APP_ROUTES.addSupervisor}
        element={
          <ProtectedRoute>
            <AddSupervisorPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={APP_ROUTES.addHr}
        element={
          <ProtectedRoute>
            <AddHrPage />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to={APP_ROUTES.login} replace />} />
    </Routes>
  );
}
