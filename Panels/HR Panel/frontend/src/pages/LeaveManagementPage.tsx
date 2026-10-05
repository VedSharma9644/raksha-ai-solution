import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { APP_ROUTES } from "../app/routePaths";
import type { LeaveRequest, LeaveRequestStatus } from "../features/leave";
import {
  LeaveManagementScreen,
  SAMPLE_LEAVE_REQUESTS,
} from "../features/leave";

export function LeaveManagementPage() {
  const navigate = useNavigate();
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(
    SAMPLE_LEAVE_REQUESTS,
  );

  function handleUpdateStatus(leaveId: string, status: LeaveRequestStatus) {
    setLeaveRequests((current) =>
      current.map((request) =>
        request.id === leaveId ? { ...request, status } : request,
      ),
    );
    console.info("Leave status updated", { leaveId, status });
  }

  return (
    <LeaveManagementScreen
      leaveRequests={leaveRequests}
      onBack={() => navigate(APP_ROUTES.dashboard)}
      onUpdateStatus={handleUpdateStatus}
    />
  );
}
