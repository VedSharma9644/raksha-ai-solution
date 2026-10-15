import { auth } from "../../lib/firebase";
import type {
  AttendanceCorrectionStatus,
  AttendanceDayOverride,
  AttendanceRecord,
  AttendanceStats,
} from "./attendanceTypes";

function resolveAdminApiBase(): string {
  const fromEnv = import.meta.env.VITE_ADMIN_API_URL?.replace(/\/$/, "");
  if (import.meta.env.DEV) {
    const forceRemote = import.meta.env.VITE_ADMIN_API_FORCE_REMOTE === "true";
    if (!forceRemote) {
      return "http://localhost:3001";
    }
  }
  return fromEnv || "http://localhost:3001";
}

const API_BASE = resolveAdminApiBase();

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

async function authHeaders(): Promise<Headers> {
  const headers = new Headers({ "Content-Type": "application/json" });
  const user = auth.currentUser;
  if (!user) {
    throw new Error("You must be signed in to view attendance.");
  }
  const token = await user.getIdToken();
  headers.set("Authorization", `Bearer ${token}`);
  return headers;
}

export async function fetchAgencyAttendanceDay(
  date: string,
  branchId?: string | null
): Promise<AgencyAttendanceDayResponse> {
  const query = new URLSearchParams({ date });
  if (branchId) query.set("branchId", branchId);
  const response = await fetch(`${API_BASE}/api/attendance?${query.toString()}`, {
    headers: await authHeaders(),
  });
  const data = (await response.json().catch(() => ({}))) as AgencyAttendanceDayResponse & {
    error?: string;
  };
  if (!response.ok) {
    throw new Error(data.error ?? `Request failed (${response.status})`);
  }
  return data;
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
  const response = await fetch(
    `${API_BASE}/api/attendance/history?${query.toString()}`,
    { headers: await authHeaders() }
  );
  const data = (await response.json().catch(() => ({}))) as GuardAttendanceHistoryResponse & {
    error?: string;
  };
  if (!response.ok) {
    throw new Error(data.error ?? `Request failed (${response.status})`);
  }
  return data;
}

export async function fetchAttendanceCorrection(params: {
  guardId: string;
  dutyDate: string;
}): Promise<AttendanceDayOverride | null> {
  const query = new URLSearchParams({
    guardId: params.guardId,
    dutyDate: params.dutyDate,
  });
  const response = await fetch(
    `${API_BASE}/api/attendance/corrections?${query.toString()}`,
    { headers: await authHeaders() }
  );
  const data = (await response.json().catch(() => ({}))) as {
    override?: AttendanceDayOverride | null;
    error?: string;
  };
  if (!response.ok) {
    throw new Error(data.error ?? `Request failed (${response.status})`);
  }
  return data.override ?? null;
}

export async function saveAttendanceCorrection(params: {
  guardId: string;
  dutyDate: string;
  status: AttendanceCorrectionStatus;
  note: string;
}): Promise<AttendanceDayOverride> {
  const response = await fetch(`${API_BASE}/api/attendance/corrections`, {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify(params),
  });
  const data = (await response.json().catch(() => ({}))) as {
    override?: AttendanceDayOverride;
    error?: string;
  };
  if (!response.ok) {
    throw new Error(data.error ?? `Request failed (${response.status})`);
  }
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
  const response = await fetch(
    `${API_BASE}/api/attendance/corrections?${query.toString()}`,
    { method: "DELETE", headers: await authHeaders() }
  );
  const data = (await response.json().catch(() => ({}))) as { error?: string };
  if (!response.ok) {
    throw new Error(data.error ?? `Request failed (${response.status})`);
  }
}
