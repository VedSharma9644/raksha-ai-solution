import { auth } from "../../lib/firebase";
import type { AttendanceRecord, AttendanceStats } from "./attendanceTypes";

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
  date: string
): Promise<AgencyAttendanceDayResponse> {
  const query = new URLSearchParams({ date });
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
