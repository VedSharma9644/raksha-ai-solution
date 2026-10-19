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
  markIntervalCheckin,
  listIntervalCheckinsForShift,
  listAttendanceHistory,
  listGuardUpcomingSchedule,
  resolveTodayDuty,
  evaluatePunchInPunctuality,
  evaluatePunchOutEligibility,
  findApprovedReliefAssigneeForDuty,
  assertPunchInWithinLateWindow,
  getPunchInWindowStatus,
  PUNCH_IN_EARLY_MINUTES,
  PUNCH_IN_LATE_GRACE_MINUTES,
  createSelfieUploadUrl,
  toDutyDateKey,
  type MarkPunchInParams,
  type MarkPunchOutParams,
  type PunchOutEligibility,
  type MarkIntervalCheckinParams,
  type IntervalCheckinResult,
  type IntervalCheckinRecordSummary,
  type OpenPunchInRecord,
  type AttendanceHistoryResponse,
  type AttendanceHistoryLogDto,
  type AttendanceHistoryLogKind,
  type AttendanceHistoryDayStatus,
  type GuardScheduleResponse,
  type GuardScheduleShiftDto,
  type TodayDutyResolution,
} from "./attendanceService";

export {
  IST_TIME_ZONE,
  IST_OFFSET,
  addDaysToDutyDate,
  daysInCalendarMonth,
  dutyDateFromParts,
  eachDutyDateInMonth,
  formatIstDutyDayLabel,
  formatIstMonthLabel,
  formatIstPunchDate,
  formatIstPunchTime,
  istWallClockToDate,
  jsWeekdayFromDutyDate,
  monthBoundsIst,
  parseHhMm,
  shiftWindowIst,
  startOfIstDay,
  weekdayFromDutyDate,
  type DayOfWeek,
} from "./dutyDate";

export {
  INTERVAL_CHECKIN_GRACE_MINUTES,
  computeIntervalCheckinStatus,
  evaluateIntervalCheckinPunctuality,
  type IntervalCheckinStatusDto,
  type IntervalCheckinWindowStatus,
  type IntervalCheckinPunctuality,
} from "./intervalCheckin";

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

export {
  ATTENDANCE_DAY_OVERRIDES_COLLECTION,
  ATTENDANCE_CORRECTION_STATUSES,
  attendanceOverrideDocId,
  attendanceReliefBonusDutyId,
  attendanceOverrideDocIdFromReliefBonusId,
  isAttendanceReliefBonusDutyId,
  getAttendanceDayOverride,
  listAttendanceOverridesForGuard,
  listAttendanceOverrideRecordsForGuard,
  loadAttendanceOverridesForMonth,
  saveAttendanceDayOverride,
  deleteAttendanceDayOverride,
  isAttendanceCorrectionStatus,
  type AttendanceCorrectionStatus,
  type AttendanceOverrideStatus,
  type AttendanceDayOverride,
} from "./attendanceDayOverride";
