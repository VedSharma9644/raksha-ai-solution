export {
  ATTENDANCE_COLLECTION,
  DEMO_GUARD_ID,
  DEMO_GUARD_PASSWORD,
  type AttendancePunchType,
  type AttendanceRecord,
  type AuthenticatedGuardContext,
  type GeofenceCheckResult,
  type GeofenceStatus,
  type PunchInResult,
  type PunchOutResult,
  type ShiftStatus,
} from "./attendance";

export {
  checkGeofence,
  haversineMeters,
  DEFAULT_GEOFENCE_RADIUS_METERS,
  type CheckGeofenceParams,
  type SiteGeofenceInput,
} from "./geofence";

export {
  authenticateGuard,
  findGuardByIdentifier,
  getDemoGuardContext,
  getGuardContextById,
  type AuthenticateGuardParams,
} from "./guardAuth";

export {
  verifyFirebaseEmailPassword,
  type FirebasePasswordAuthResult,
} from "./firebasePasswordAuth";


export {
  requestGuardLoginOtp,
  verifyGuardLoginOtp,
  GUARD_LOGIN_OTP_COLLECTION,
  type RequestGuardOtpResult,
  type VerifyGuardOtpResult,
} from "./guardOtpService";

export {
  normalizePhone,
  isValidIndianMobile,
  phoneLookupVariants,
} from "./phone";

export {
  getSiteGeofenceById,
  type SiteGeofenceContext,
} from "./siteLookup";

export {
  getTodayOpenPunchIn,
  markPunchIn,
  markPunchOut,
  listAttendanceHistory,
  listGuardUpcomingSchedule,
  resolveTodayDuty,
  evaluatePunchInPunctuality,
  createSelfieUploadUrl,
  toDutyDateKey,
  type MarkPunchInParams,
  type MarkPunchOutParams,
  type OpenPunchInRecord,
  type AttendanceHistoryResponse,
  type AttendanceHistoryLogDto,
  type AttendanceHistoryLogKind,
  type AttendanceHistoryDayStatus,
  type GuardScheduleResponse,
  type GuardScheduleShiftDto,
  type TodayDutyResolution,
} from "./attendanceService";

export type { GuardScheduleDutyStatus } from "./guardSchedule";

export {
  getGuardProfile,
  toTelHref,
  type GuardProfileDto,
  type GuardProfileGearItem,
} from "./guardProfile";

export {
  withSelfieUploadSlot,
  getSelfieUploadQueueStats,
  resetSelfieUploadQueueForTests,
} from "./uploadQueue";

export {
  listAgencyAttendanceForDate,
  type AgencyAttendanceDayResponse,
  type AgencyAttendanceIntervalDto,
  type AgencyAttendanceRecordDto,
  type AgencyAttendanceStatsDto,
} from "./agencyAttendance";
