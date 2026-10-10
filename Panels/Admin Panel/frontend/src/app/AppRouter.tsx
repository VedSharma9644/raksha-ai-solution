import type { ReactNode } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { ModuleProtectedRoute } from "../components/ModuleProtectedRoute";
import { useAuthContext } from "../features/authentication";
import { AddGuardPage } from "../pages/AddGuardPage";
import { EditGuardPage } from "../pages/EditGuardPage";
import { AddSitePage } from "../pages/AddSitePage";
import { SiteListPage } from "../pages/SiteListPage";
import { EditSitePage } from "../pages/EditSitePage";
import { AssignGuardsPage } from "../pages/AssignGuardsPage";
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
import { InventoryBranchStockPage } from "../pages/InventoryBranchStockPage";
import { AttendancePage } from "../pages/AttendancePage";
import { LeaveManagementPage } from "../pages/LeaveManagementPage";
import { ReliefManagementPage } from "../pages/ReliefManagementPage";
import { SchedulingPage } from "../pages/SchedulingPage";
import { ProspectsPage } from "../pages/ProspectsPage";
import { ProspectDetailPage } from "../pages/ProspectDetailPage";
import { ProspectGuardsPage } from "../pages/ProspectGuardsPage";
import { ProspectGuardDetailPage } from "../pages/ProspectGuardDetailPage";
import { ViewGuardPage } from "../pages/ViewGuardPage";
import { BranchListPage } from "../pages/BranchListPage";
import { AddBranchPage } from "../pages/AddBranchPage";
import { EditBranchPage } from "../pages/EditBranchPage";
import { APP_ROUTES } from "./routePaths";

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { agency, isLoading } = useAuthContext();

  if (isLoading) {
    return null;
  }

  if (!agency) {
    return <Navigate to={APP_ROUTES.login} replace />;
  }

  return <>{children}</>;
}

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
            <AgencyDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={APP_ROUTES.formBuilder}
        element={
          <ModuleRoute>
            <FormBuilderPage />
          </ModuleRoute>
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
        path={APP_ROUTES.viewGuard}
        element={
          <ModuleRoute>
            <ViewGuardPage />
          </ModuleRoute>
        }
      />
      <Route
        path={APP_ROUTES.editGuard}
        element={
          <ModuleRoute>
            <EditGuardPage />
          </ModuleRoute>
        }
      />
      <Route
        path={APP_ROUTES.addSite}
        element={
          <ModuleRoute>
            <AddSitePage />
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
        path={APP_ROUTES.editSite}
        element={
          <ModuleRoute>
            <EditSitePage />
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
        path={APP_ROUTES.employeeList}
        element={
          <ModuleRoute>
            <EmployeeListPage />
          </ModuleRoute>
        }
      />
      <Route
        path={APP_ROUTES.addHrStaff}
        element={
          <ModuleRoute>
            <AddHrStaffPage />
          </ModuleRoute>
        }
      />
      <Route
        path={APP_ROUTES.editHrStaff}
        element={
          <ModuleRoute>
            <EditHrStaffPage />
          </ModuleRoute>
        }
      />
      <Route
        path={APP_ROUTES.hrList}
        element={
          <ModuleRoute>
            <HrStaffListPage />
          </ModuleRoute>
        }
      />
      <Route
        path={APP_ROUTES.inventoryList}
        element={
          <ModuleRoute>
            <InventoryListPage />
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
        path={APP_ROUTES.inventoryBranchStock}
        element={
          <ModuleRoute>
            <InventoryBranchStockPage />
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
        path={APP_ROUTES.scheduling}
        element={
          <ModuleRoute>
            <SchedulingPage />
          </ModuleRoute>
        }
      />
      <Route
        path={APP_ROUTES.prospects}
        element={
          <ModuleRoute>
            <ProspectsPage />
          </ModuleRoute>
        }
      />
      <Route
        path={APP_ROUTES.prospectDetail}
        element={
          <ModuleRoute>
            <ProspectDetailPage />
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

      {/* Branch Management — Admin only, no module gate */}
      <Route
        path={APP_ROUTES.branchList}
        element={
          <ProtectedRoute>
            <BranchListPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={APP_ROUTES.addBranch}
        element={
          <ProtectedRoute>
            <AddBranchPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={APP_ROUTES.editBranch}
        element={
          <ProtectedRoute>
            <EditBranchPage />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to={APP_ROUTES.login} replace />} />
    </Routes>
  );
}
