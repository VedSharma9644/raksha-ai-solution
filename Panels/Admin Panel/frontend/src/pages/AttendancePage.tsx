import { useNavigate } from "react-router-dom";
import { APP_ROUTES } from "../app/routePaths";
import {
  AttendanceListScreen,
  SAMPLE_ATTENDANCE_RECORDS,
  SAMPLE_ATTENDANCE_STATS,
  SAMPLE_SITES,
} from "../features/attendance";

export function AttendancePage() {
  const navigate = useNavigate();

  return (
    <AttendanceListScreen
      records={SAMPLE_ATTENDANCE_RECORDS}
      stats={SAMPLE_ATTENDANCE_STATS}
      sites={SAMPLE_SITES}
      onBack={() => navigate(APP_ROUTES.dashboard)}
    />
  );
}
