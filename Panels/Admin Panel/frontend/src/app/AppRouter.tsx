import type { ReactNode } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AdminAppShell } from "../components/AdminAppShell";
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
import { GeneralSettingsPage } from "../pages/GeneralSettingsPage";
import { PayrollPage } from "../pages/PayrollPage";
import { PayrollRunDetailPage } from "../pages/PayrollRunDetailPage";
import { EarningsPage } from "../pages/EarningsPage";
import { EarningsSiteDetailPage } from "../pages/EarningsSiteDetailPage";
import { InvoicesPage } from "../pages/InvoicesPage";
import { InvoiceDetailPage } from "../pages/InvoiceDetailPage";
import { InvoiceSettingsPage } from "../pages/InvoiceSettingsPage";
import { MoneyOutPage } from "../pages/MoneyOutPage";
import { PaymentManagementPage } from "../pages/PaymentManagementPage";
import { ManageSchedulePage } from "../pages/ManageSchedulePage";
import { InventoryListPage } from "../pages/InventoryListPage";
import { AddInventoryItemPage } from "../pages/AddInventoryItemPage";
import { EditInventoryItemPage } from "../pages/EditInventoryItemPage";
import { InventoryBranchStockPage } from "../pages/InventoryBranchStockPage";
import { AttendancePage } from "../pages/AttendancePage";
import { LeaveManagementPage } from "../pages/LeaveManagementPage";
import { ReliefManagementPage } from "../pages/ReliefManagementPage";
import { SchedulingPage } from "../pages/SchedulingPage";
import { ProspectLeadsPage } from "../pages/ProspectLeadsPage";
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

function ModuleOnly({ children }: { children: ReactNode }) {
  return <ModuleProtectedRoute>{children}</ModuleProtectedRoute>;
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
        element={
          <ProtectedRoute>
            <AdminAppShell />
          </ProtectedRoute>
        }
      >
        <Route path={APP_ROUTES.dashboard} element={<AgencyDashboardPage />} />
        <Route
          path={APP_ROUTES.formBuilder}
          element={
            <ModuleOnly>
              <FormBuilderPage />
            </ModuleOnly>
          }
        />
        <Route
          path={APP_ROUTES.generalSettings}
          element={
            <ModuleOnly>
              <GeneralSettingsPage />
            </ModuleOnly>
          }
        />
        <Route
          path={APP_ROUTES.paymentManagement}
          element={
            <ModuleOnly>
              <PaymentManagementPage />
            </ModuleOnly>
          }
        />
        <Route
          path={APP_ROUTES.manageSchedule}
          element={
            <ModuleOnly>
              <ManageSchedulePage />
            </ModuleOnly>
          }
        />
        <Route
          path={APP_ROUTES.payroll}
          element={
            <ModuleOnly>
              <PayrollPage />
            </ModuleOnly>
          }
        />
        <Route
          path={APP_ROUTES.payrollRunDetail}
          element={
            <ModuleOnly>
              <PayrollRunDetailPage />
            </ModuleOnly>
          }
        />
        <Route
          path={APP_ROUTES.earnings}
          element={
            <ModuleOnly>
              <EarningsPage />
            </ModuleOnly>
          }
        />
        <Route
          path={APP_ROUTES.earningsSiteDetail}
          element={
            <ModuleOnly>
              <EarningsSiteDetailPage />
            </ModuleOnly>
          }
        />
        <Route
          path={APP_ROUTES.invoiceSettings}
          element={
            <ModuleOnly>
              <InvoiceSettingsPage />
            </ModuleOnly>
          }
        />
        <Route
          path={APP_ROUTES.invoices}
          element={
            <ModuleOnly>
              <InvoicesPage />
            </ModuleOnly>
          }
        />
        <Route
          path={APP_ROUTES.invoiceDetail}
          element={
            <ModuleOnly>
              <InvoiceDetailPage />
            </ModuleOnly>
          }
        />
        <Route
          path={APP_ROUTES.moneyOut}
          element={
            <ModuleOnly>
              <MoneyOutPage />
            </ModuleOnly>
          }
        />
        <Route
          path={APP_ROUTES.addGuard}
          element={
            <ModuleOnly>
              <AddGuardPage />
            </ModuleOnly>
          }
        />
        <Route
          path={APP_ROUTES.viewGuard}
          element={
            <ModuleOnly>
              <ViewGuardPage />
            </ModuleOnly>
          }
        />
        <Route
          path={APP_ROUTES.editGuard}
          element={
            <ModuleOnly>
              <EditGuardPage />
            </ModuleOnly>
          }
        />
        <Route
          path={APP_ROUTES.addSite}
          element={
            <ModuleOnly>
              <AddSitePage />
            </ModuleOnly>
          }
        />
        <Route
          path={APP_ROUTES.siteList}
          element={
            <ModuleOnly>
              <SiteListPage />
            </ModuleOnly>
          }
        />
        <Route
          path={APP_ROUTES.editSite}
          element={
            <ModuleOnly>
              <EditSitePage />
            </ModuleOnly>
          }
        />
        <Route
          path={APP_ROUTES.assignGuards}
          element={
            <ModuleOnly>
              <AssignGuardsPage />
            </ModuleOnly>
          }
        />
        <Route
          path={APP_ROUTES.employeeList}
          element={
            <ModuleOnly>
              <EmployeeListPage />
            </ModuleOnly>
          }
        />
        <Route
          path={APP_ROUTES.addHrStaff}
          element={
            <ModuleOnly>
              <AddHrStaffPage />
            </ModuleOnly>
          }
        />
        <Route
          path={APP_ROUTES.editHrStaff}
          element={
            <ModuleOnly>
              <EditHrStaffPage />
            </ModuleOnly>
          }
        />
        <Route
          path={APP_ROUTES.hrList}
          element={
            <ModuleOnly>
              <HrStaffListPage />
            </ModuleOnly>
          }
        />
        <Route
          path={APP_ROUTES.inventoryList}
          element={
            <ModuleOnly>
              <InventoryListPage />
            </ModuleOnly>
          }
        />
        <Route
          path={APP_ROUTES.addInventoryItem}
          element={
            <ModuleOnly>
              <AddInventoryItemPage />
            </ModuleOnly>
          }
        />
        <Route
          path={APP_ROUTES.editInventoryItem}
          element={
            <ModuleOnly>
              <EditInventoryItemPage />
            </ModuleOnly>
          }
        />
        <Route
          path={APP_ROUTES.inventoryBranchStock}
          element={
            <ModuleOnly>
              <InventoryBranchStockPage />
            </ModuleOnly>
          }
        />
        <Route
          path={APP_ROUTES.attendance}
          element={
            <ModuleOnly>
              <AttendancePage />
            </ModuleOnly>
          }
        />
        <Route
          path={APP_ROUTES.manageLeave}
          element={
            <ModuleOnly>
              <LeaveManagementPage />
            </ModuleOnly>
          }
        />
        <Route
          path={APP_ROUTES.manageRelief}
          element={
            <ModuleOnly>
              <ReliefManagementPage />
            </ModuleOnly>
          }
        />
        <Route
          path={APP_ROUTES.scheduling}
          element={
            <ModuleOnly>
              <SchedulingPage />
            </ModuleOnly>
          }
        />
        <Route
          path={APP_ROUTES.prospectLeads}
          element={
            <ModuleOnly>
              <ProspectLeadsPage />
            </ModuleOnly>
          }
        />
        <Route
          path={APP_ROUTES.prospects}
          element={
            <ModuleOnly>
              <ProspectsPage />
            </ModuleOnly>
          }
        />
        <Route
          path={APP_ROUTES.prospectDetail}
          element={
            <ModuleOnly>
              <ProspectDetailPage />
            </ModuleOnly>
          }
        />
        <Route
          path={APP_ROUTES.prospectGuards}
          element={
            <ModuleOnly>
              <ProspectGuardsPage />
            </ModuleOnly>
          }
        />
        <Route
          path={APP_ROUTES.prospectGuardDetail}
          element={
            <ModuleOnly>
              <ProspectGuardDetailPage />
            </ModuleOnly>
          }
        />
        <Route path={APP_ROUTES.branchList} element={<BranchListPage />} />
        <Route path={APP_ROUTES.addBranch} element={<AddBranchPage />} />
        <Route path={APP_ROUTES.editBranch} element={<EditBranchPage />} />
      </Route>

      <Route path="*" element={<Navigate to={APP_ROUTES.login} replace />} />
    </Routes>
  );
}
