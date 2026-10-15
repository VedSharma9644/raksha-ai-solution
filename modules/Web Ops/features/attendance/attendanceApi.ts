import { adminFetch } from "../../lib/adminApi";
import type {
  AttendanceCorrectionStatus,
  AttendanceDayOverride,
  AttendanceRecord,
  AttendanceStats,
} from "./attendanceTypes";

export type AgencyAttendanceDayResponse = {
  date: string;
  records: AttendanceRecord[];
  stats: AttendanceStats;
};

export type GuardAttendanceHistoryDayStatus =
  | "full"
  | "half"
  | "missed"
  | "upcoming"
  | "today"
  | "off"
  | "leave"
  | "relief"
  | "present"
  | "empty";

export type GuardAttendanceHistoryLog = {
  id: string;
  kind: string;
  statusLabel: string;
  dateLabel: string;
  postLabel: string;
  dutyDate?: string;
  footerTags: string[];
  dayOfMonth: number;
};

export type GuardAttendanceHistory = {
  year: number;
  month: number;
  monthLabel: string;
  stats: {
    presentDays: number;
    totalHours: number;
    leaveDays: number;
    weeklyOffDays: number;
    missedDays: number;
    halfDays: number;
  };
  calendarDays: Array<{ day: number; status: GuardAttendanceHistoryDayStatus }>;
  leadingEmpty: number;
  logs: GuardAttendanceHistoryLog[];
};

export type GuardAttendanceHistoryResponse = {
  guardId: string;
  guardName: string;
  employeeCode: string;
  history: GuardAttendanceHistory;
};

export async function fetchAgencyAttendanceDay(
  date: string,
  branchId?: string | null
): Promise<AgencyAttendanceDayResponse> {
  const query = new URLSearchParams({ date });
  if (branchId) query.set("branchId", branchId);
  return adminFetch<AgencyAttendanceDayResponse>(
    `/api/attendance?${query.toString()}`,
    { errorMessage: "You must be signed in to view attendance." }
  );
}

export async function fetchGuardAttendanceHistory(params: {
  guardId: string;
  year: number;
  month: number;
}): Promise<GuardAttendanceHistoryResponse> {
  const query = new URLSearchParams({
    guardId: params.guardId,
    year: String(params.year),
    month: String(params.month),
  });
  return adminFetch<GuardAttendanceHistoryResponse>(
    `/api/attendance/history?${query.toString()}`,
    { errorMessage: "You must be signed in to view attendance." }
  );
}

export async function fetchAttendanceCorrection(params: {
  guardId: string;
  dutyDate: string;
}): Promise<AttendanceDayOverride | null> {
  const query = new URLSearchParams({
    guardId: params.guardId,
    dutyDate: params.dutyDate,
  });
  const data = await adminFetch<{ override?: AttendanceDayOverride | null }>(
    `/api/attendance/corrections?${query.toString()}`,
    { errorMessage: "You must be signed in to view attendance." }
  );
  return data.override ?? null;
}

export async function saveAttendanceCorrection(params: {
  guardId: string;
  dutyDate: string;
  status: AttendanceCorrectionStatus;
  note: string;
}): Promise<AttendanceDayOverride> {
  const data = await adminFetch<{ override?: AttendanceDayOverride }>(
    "/api/attendance/corrections",
    {
      method: "POST",
      body: JSON.stringify(params),
      errorMessage: "You must be signed in to view attendance.",
    }
  );
  if (!data.override) {
    throw new Error("Correction saved but no data returned.");
  }
  return data.override;
}

export async function clearAttendanceCorrection(params: {
  guardId: string;
  dutyDate: string;
}): Promise<void> {
  const query = new URLSearchParams({
    guardId: params.guardId,
    dutyDate: params.dutyDate,
  });
  await adminFetch(`/api/attendance/corrections?${query.toString()}`, {
    method: "DELETE",
    errorMessage: "You must be signed in to view attendance.",
  });
}
