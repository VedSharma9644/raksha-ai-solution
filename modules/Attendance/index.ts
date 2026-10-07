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
  type MarkPunchInParams,
} from "./attendanceService";
