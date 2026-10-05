import { useNavigate } from "react-router-dom";
import { APP_ROUTES, editGuardPath } from "../app/routePaths";
import { EmployeeListScreen } from "../features/employees";
import type { EmployeeListItem } from "../features/employees";
import { useGuardList } from "../features/guards";

function mapGuardToListItem(guard: {
  id: string;
  fullName: string;
  employeeCode: string;
  phone: string;
  assignedSiteId: string;
  status: "active" | "inactive" | "on_leave";
}): EmployeeListItem {
  return {
    id: guard.id,
    fullName: guard.fullName,
    employeeCode: guard.employeeCode,
    role: "guard",
    phone: guard.phone,
    assignedSite: guard.assignedSiteId,
    status: guard.status,
  };
}

export function EmployeeListPage() {
  const navigate = useNavigate();
  const { guards, isLoading, error } = useGuardList();

  const employees = guards.map(mapGuardToListItem);

  if (isLoading) {
    return <p style={{ padding: "2rem" }}>Loading guards…</p>;
  }

  if (error) {
    return (
      <p role="alert" style={{ color: "red", padding: "2rem" }}>
        {error}
      </p>
    );
  }

  return (
    <EmployeeListScreen
      employees={employees}
      onBack={() => navigate(APP_ROUTES.dashboard)}
      onSelectEmployee={(employeeId) => {
        navigate(editGuardPath(employeeId));
      }}
    />
  );
}
