export type GeofenceStatus = "passed" | "failed" | "demo_passed";

/** One interval check-in captured during a shift */
export interface IntervalCheckin {
  id: string;
  /** 1-based sequence: 1st check-in, 2nd, 3rd… */
  sequenceNumber: number;
  /** e.g. "10:02 AM" */
  checkinTime: string;
  selfieUrl: string;
  geofenceStatus: GeofenceStatus;
  lat: number;
  lng: number;
  accuracyMeters: number;
}

export interface AttendanceRecord {
  id: string;
  guardId: string;
  guardName: string;
  guardEmployeeCode: string;
  guardInitials: string;
  guardAvatarColor: string;
  agencyId: string;
  siteId: string;
  siteName: string;
  postName: string;
  /** "YYYY-MM-DD" */
  punchInDate: string;
  /** "08:02 AM" */
  punchInTime: string;
  punchInSelfieUrl: string;
  punchInGeofenceStatus: GeofenceStatus;
  punchInLat: number;
  punchInLng: number;
  punchInAccuracyMeters: number;
  /** null = still on shift */
  punchOutTime: string | null;
  punchOutSelfieUrl: string | null;
  punchOutGeofenceStatus: GeofenceStatus | null;
  /** null = still on shift */
  durationMinutes: number | null;
  /** Interval check-ins captured during this shift (empty if site has no interval requirement) */
  intervalCheckins: IntervalCheckin[];
}

export interface AttendanceStats {
  presentToday: number;
  absentToday: number;
  onShift: number;
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}
