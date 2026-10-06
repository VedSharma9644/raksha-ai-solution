import type { ReactNode } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useAuthContext } from "../features/authentication";
import { AddGuardPage } from "../pages/AddGuardPage";
import { EditGuardPage } from "../pages/EditGuardPage";
import { AddSitePage } from "../pages/AddSitePage";
import { SiteListPage } from "../pages/SiteListPage";
import { EditSitePage } from "../pages/EditSitePage";
import { AgencyDashboardPage } from "../pages/AgencyDashboardPage";
import { EmployeeListPage } from "../pages/EmployeeListPage";
import { LoginPage } from "../pages/LoginPage";
import { AddHrStaffPage } from "../pages/AddHrStaffPage";
import { EditHrStaffPage } from "../pages/EditHrStaffPage";
import { HrStaffListPage } from "../pages/HrStaffListPage";
import { FormBuilderPage } from "../pages/FormBuilderPage";
import { InventoryListPage } from "../pages/InventoryListPage";
import { AddInventoryItemPage } from "../pages/AddInventoryItemPage";
import { EditInventoryItemPage } from "../pages/EditInventoryItemPage";
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

// Redirects to dashboard if already logged in (not mid login+verify)
function GuestRoute({ children }: { children: ReactNode }) {
  const { agency, isLoading, isLoginPending } = useAuthContext();

  if (isLoading) {
    return null;
  }

  if (agency && !isLoginPending) {
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
        path={APP_ROUTES.formBuilder}
        element={
          <ProtectedRoute>
            <FormBuilderPage />
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
        path={APP_ROUTES.siteList}
        element={
          <ProtectedRoute>
            <SiteListPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={APP_ROUTES.editSite}
        element={
          <ProtectedRoute>
            <EditSitePage />
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
      {/* HR Staff routes */}
      <Route
        path={APP_ROUTES.addHrStaff}
        element={
          <ProtectedRoute>
            <AddHrStaffPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={APP_ROUTES.editHrStaff}
        element={
          <ProtectedRoute>
            <EditHrStaffPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={APP_ROUTES.hrList}
        element={
          <ProtectedRoute>
            <HrStaffListPage />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to={APP_ROUTES.login} replace />} />

      {/* Inventory routes */}
      <Route
        path={APP_ROUTES.inventoryList}
        element={
          <ProtectedRoute>
            <InventoryListPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={APP_ROUTES.addInventoryItem}
        element={
          <ProtectedRoute>
            <AddInventoryItemPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={APP_ROUTES.editInventoryItem}
        element={
          <ProtectedRoute>
            <EditInventoryItemPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
