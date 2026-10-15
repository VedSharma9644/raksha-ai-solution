// Context / capabilities
export {
  WebOpsProvider,
  useWebOps,
} from "./context/WebOpsContext";
export type {
  WebOpsRole,
  WebOpsCapabilities,
  WebOpsContextValue,
  WebOpsProviderProps,
} from "./context/WebOpsContext";

export {
  configureAdminApi,
  resolveAdminApiBase,
  adminAuthHeaders,
  adminFetch,
  adminFetchBlob,
} from "./lib/adminApi";
export { filterByBranch, appendBranchParam } from "./lib/branchFilter";

// Manage schedule hub
export {
  ManageScheduleScreen,
} from "./features/manageSchedule";
export type {
  ManageScheduleOption,
  ManageScheduleOptionId,
  ManageScheduleScreenProps,
} from "./features/manageSchedule";

// Relief
export {
  ReliefManagementScreen,
  useAgencyRelief,
  fetchAgencyReliefRequests,
  decideAgencyReliefRequest,
} from "./features/relief";
export type {
  ReliefRequest,
  ReliefRequestStatus,
  ReliefAssigneeOption,
} from "./features/relief";

// Leave
export {
  LeaveManagementScreen,
  useAgencyLeave,
  fetchAgencyLeaveRequests,
  decideAgencyLeaveRequest,
} from "./features/leave";
export type { LeaveRequest, LeaveRequestStatus } from "./features/leave";

// Scheduling
export {
  SchedulingScreen,
  useScheduling,
  useSaveShiftAssignment,
  useAgencyRosterCoverage,
} from "./features/scheduling";
export type { SchedulingScreenProps } from "./features/scheduling";

// Attendance
export {
  AttendanceListScreen,
  AttendanceDetailModal,
  AttendanceCorrectionModal,
  GuardMonthReview,
  useAgencyAttendance,
  fetchAgencyAttendanceDay,
  fetchAttendanceCorrection,
  saveAttendanceCorrection,
  clearAttendanceCorrection,
  formatDuration,
  ATTENDANCE_CORRECTION_STATUS_OPTIONS,
} from "./features/attendance";
export type {
  AttendanceRecord,
  AttendanceStats,
  GeofenceStatus,
  AttendanceCorrectionStatus,
  AttendanceDayOverride,
} from "./features/attendance";

// Sites (list + assign; CRUD stays in Admin panel)
export {
  SiteListScreen,
  useSiteList,
  useAssignGuards,
  GuardAssignmentPicker,
  AssignGuardsScreen,
} from "./features/sites";
export type {
  SiteListScreenProps,
  UseAssignGuardsReturn,
  GuardAssignmentPickerProps,
  AssignGuardsScreenProps,
} from "./features/sites";

// Shared ops guard list (branch-filtered)
export { useGuardList } from "./features/guards/useGuardList";
