import { Timestamp } from "firebase/firestore";

export type AttendancePunchType = "punch_in" | "punch_out" | "interval_checkin";

export type GeofenceStatus = "passed" | "failed" | "demo_passed";

export type ShiftStatus = "started" | "ended" | "none";

export interface AttendanceRecord {
  id: string;
  guardId: string;
  agencyId: string;
  siteId: string;
  type: AttendancePunchType;
  /** For interval_checkin — links back to the opening punch_in document */
  shiftPunchInId?: string;
  punchedAt: Timestamp;
  lat: number;
  lng: number;
  accuracyMeters: number;
  selfieUrl: string;
  geofenceStatus: GeofenceStatus;
  shiftStatus: ShiftStatus;
  guardName: string;
  guardEmployeeCode: string;
  siteName: string;
  postName: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export const ATTENDANCE_COLLECTION = "attendanceRecords";

/** Demo credentials until Admin/HR persist passwords on `guards`. */
export const DEMO_GUARD_ID = "RKS-8842";
export const DEMO_GUARD_PASSWORD = "demo1234";

export interface AuthenticatedGuardContext {
  guardId: string;
  employeeCode: string;
  fullName: string;
  agencyId: string;
  assignedSiteId: string;
  siteName: string;
  postName: string;
  shiftFrom: string;
  shiftTo: string;
  phone: string;
}

export interface GeofenceCheckResult {
  unlocked: boolean;
  status: GeofenceStatus;
  accuracyMeters: number;
  distanceMeters: number | null;
  message: string;
}

export interface PunchInResult {
  recordId: string;
  guardName: string;
  guardId: string;
  punchInTime: string;
  punchInDate: string;
  punchInStatus: string;
  dutySiteName: string;
  dutyPostName: string;
  rosterTitle: string;
  rosterHours: string;
  geofenceDetail: string;
  geofenceResult: string;
  selfieUrl: string;
  shiftStatus: ShiftStatus;
}
