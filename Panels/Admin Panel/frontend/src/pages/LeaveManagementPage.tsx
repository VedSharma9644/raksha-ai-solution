import { useNavigate } from "react-router-dom";
import { APP_ROUTES } from "../app/routePaths";
import { LeaveManagementScreen, useAgencyLeave } from "../features/leave";

export function LeaveManagementPage() {
  const navigate = useNavigate();
  const {
    leaveRequests,
    isLoading,
    isUpdatingId,
    error,
    updateStatus,
  } = useAgencyLeave();

  return (
    <LeaveManagementScreen
      leaveRequests={leaveRequests}
      isLoading={isLoading}
      error={error}
      updatingId={isUpdatingId}
      onBack={() => navigate(APP_ROUTES.dashboard)}
      onUpdateStatus={(leaveId, status) => {
        void updateStatus(leaveId, status);
      }}
    />
  );
}
