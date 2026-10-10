import type { ReactNode } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { ModuleProtectedRoute } from "../components/ModuleProtectedRoute";
import { useAuthContext } from "../features/authentication";
import { useBranchContext } from "../features/branches";
import { AddGuardPage } from "../pages/AddGuardPage";
import { GuardListPage } from "../pages/GuardListPage";
import { ViewGuardPage } from "../pages/ViewGuardPage";
import { HrDashboardPage } from "../pages/HrDashboardPage";
import { InventoryPage } from "../pages/InventoryPage";
import { AddInventoryItemPage } from "../pages/AddInventoryItemPage";
import { EditInventoryItemPage } from "../pages/EditInventoryItemPage";
import { BranchSelectionPage } from "../pages/BranchSelectionPage";
import { LeaveManagementPage } from "../pages/LeaveManagementPage";
import { ReliefManagementPage } from "../pages/ReliefManagementPage";
import { SiteListPage } from "../pages/SiteListPage";
import { AssignGuardsPage } from "../pages/AssignGuardsPage";
import { AttendancePage } from "../pages/AttendancePage";
import { SchedulingPage } from "../pages/SchedulingPage";
import { ProspectGuardsPage } from "../pages/ProspectGuardsPage";
import { ProspectGuardDetailPage } from "../pages/ProspectGuardDetailPage";
import { LoginPage } from "../pages/LoginPage";
import { APP_ROUTES } from "./routePaths";

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { hrStaff, isLoading } = useAuthContext();
  const { needsBranchSelection, isLoading: branchLoading } = useBranchContext();

  if (isLoading || branchLoading) {
    return null;
  }

  if (!hrStaff) {
    return <Navigate to={APP_ROUTES.login} replace />;
  }

  if (needsBranchSelection) {
    return <Navigate to={APP_ROUTES.selectBranch} replace />;
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

/** Logged-in only — used for the branch selection screen (bypasses branch check). */
function ProtectedBranchlessRoute({ children }: { children: ReactNode }) {
  const { hrStaff, isLoading } = useAuthContext();
  if (isLoading) return null;
  if (!hrStaff) return <Navigate to={APP_ROUTES.login} replace />;
  return <>{children}</>;
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
        path={APP_ROUTES.selectBranch}
        element={
          <ProtectedBranchlessRoute>
            <BranchSelectionPage />
          </ProtectedBranchlessRoute>
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
        path={APP_ROUTES.addInventoryItem}
        element={
          <ModuleRoute>
            <AddInventoryItemPage />
          </ModuleRoute>
        }
      />
      <Route
        path={APP_ROUTES.editInventoryItem}
        element={
          <ModuleRoute>
            <EditInventoryItemPage />
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
        path={APP_ROUTES.manageRelief}
        element={
          <ModuleRoute>
            <ReliefManagementPage />
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
      <Route
        path={APP_ROUTES.scheduling}
        element={
          <ModuleRoute>
            <SchedulingPage />
          </ModuleRoute>
        }
      />
      <Route
        path={APP_ROUTES.prospectGuards}
        element={
          <ModuleRoute>
            <ProspectGuardsPage />
          </ModuleRoute>
        }
      />
      <Route
        path={APP_ROUTES.prospectGuardDetail}
        element={
          <ModuleRoute>
            <ProspectGuardDetailPage />
          </ModuleRoute>
        }
      />

      <Route path="*" element={<Navigate to={APP_ROUTES.login} replace />} />
    </Routes>
  );
}
