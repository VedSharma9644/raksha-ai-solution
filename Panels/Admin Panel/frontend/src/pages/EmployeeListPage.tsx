import { useNavigate } from "react-router-dom";
import { APP_ROUTES } from "../app/routePaths";
import { EmployeeListScreen, SAMPLE_EMPLOYEES } from "../features/employees";

export function EmployeeListPage() {
  const navigate = useNavigate();

  return (
    <EmployeeListScreen
      employees={SAMPLE_EMPLOYEES}
      onBack={() => navigate(APP_ROUTES.dashboard)}
      onSelectEmployee={(employeeId) => {
        console.info("Employee selected", employeeId);
      }}
    />
  );
}
