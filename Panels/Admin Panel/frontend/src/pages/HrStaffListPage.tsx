import { useNavigate } from "react-router-dom";
import { HrStaffListScreen, useHrStaffList } from "../features/hrStaff";

export function HrStaffListPage() {
  const navigate = useNavigate();
  const { hrStaff, isLoading, error } = useHrStaffList();

  if (isLoading) {
    return <p style={{ padding: "2rem" }}>Loading HR staff…</p>;
  }

  if (error) {
    return (
      <p role="alert" style={{ color: "red", padding: "2rem" }}>
        {error}
      </p>
    );
  }

  return (
    <HrStaffListScreen
      hrStaff={hrStaff}
      onBack={() => navigate("/dashboard")}
      onAddHr={() => navigate("/hr/add")}
      onSelectHr={(hrStaffId) => navigate(`/hr/${hrStaffId}/edit`)}
    />
  );
}
