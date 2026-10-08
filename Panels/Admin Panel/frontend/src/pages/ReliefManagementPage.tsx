import { useNavigate } from "react-router-dom";
import { APP_ROUTES } from "../app/routePaths";
import { useGuardList } from "../features/guards/useGuardList";
import {
  ReliefManagementScreen,
  useAgencyRelief,
} from "../features/relief";

export function ReliefManagementPage() {
  const navigate = useNavigate();
  const {
    reliefRequests,
    isLoading,
    isUpdatingId,
    error,
    updateStatus,
  } = useAgencyRelief();
  const { guards, isLoading: guardsLoading } = useGuardList();

  return (
    <ReliefManagementScreen
      reliefRequests={reliefRequests}
      assignees={guards.map((guard) => ({
        id: guard.id,
        fullName: guard.fullName,
        employeeCode: guard.employeeCode,
      }))}
      isLoading={isLoading || guardsLoading}
      error={error}
      updatingId={isUpdatingId}
      onBack={() => navigate(APP_ROUTES.dashboard)}
      onUpdateStatus={(reliefId, status, assignedGuardId) => {
        void updateStatus(reliefId, status, assignedGuardId);
      }}
    />
  );
}
