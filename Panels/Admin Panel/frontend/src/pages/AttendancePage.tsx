import { useNavigate } from "react-router-dom";
import { APP_ROUTES } from "../app/routePaths";
import {
  AttendanceListScreen,
  useAgencyAttendance,
} from "../features/attendance";

export function AttendancePage() {
  const navigate = useNavigate();
  const {
    date,
    setDate,
    records,
    stats,
    sites,
    isLoading,
    error,
  } = useAgencyAttendance();

  return (
    <AttendanceListScreen
      records={records}
      stats={stats}
      sites={sites}
      dateFilter={date}
      onDateFilterChange={setDate}
      isLoading={isLoading}
      error={error}
      onBack={() => navigate(APP_ROUTES.dashboard)}
    />
  );
}
