import { guardApiConfig } from './guard-api-config';

export type GuardSessionUser = {
  id: string;
  employeeCode: string;
  fullName: string;
  agencyId: string;
  assignedSiteId: string;
  siteName: string;
  postName: string;
  shiftFrom: string;
  shiftTo: string;
  /** Guard profile picture URL from Admin/HR; empty when unset. */
  profilePictureUrl?: string;
};

export type PunchInResult = {
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
  shiftStatus: string;
  mode?: 'punch_in' | 'punch_out';
  punchOutTime?: string;
  durationLabel?: string;
};

export type TodayShiftStatus = {
  shiftActive: boolean;
  openPunchInId: string | null;
  punchedAt: string | null;
  punchInStatus?: string | null;
  minutesLate?: number | null;
  siteName?: string;
  postName?: string;
  assignedSiteId?: string;
  shiftFrom?: string;
  shiftTo?: string;
  shiftLabel?: string;
  dutySource?: 'roster' | 'profile';
  earlierShiftCount?: number;
  hasLaterReplacement?: boolean;
  assignmentId?: string | null;
};

export type GeofenceCheckResult = {
  unlocked: boolean;
  cameraUnlocked: boolean;
  status: string;
  accuracyMeters: number;
  distanceMeters: number | null;
  message: string;
};

export type AttendanceHistoryDayStatus =
  | 'full'
  | 'half'
  | 'missed'
  | 'upcoming'
  | 'today'
  | 'off'
  | 'leave'
  | 'present'
  | 'empty';

export type AttendanceHistoryLogDto = {
  id: string;
  kind:
    | 'onDuty'
    | 'full'
    | 'half'
    | 'missed'
    | 'upcoming'
    | 'weeklyOff'
    | 'leave'
    | 'present';
  statusLabel: string;
  dateLabel: string;
  postLabel: string;
  postIcon: 'shield' | 'door-front' | 'weekend' | 'domain';
  detailPrimaryLabel?: string;
  detailPrimaryValue?: string;
  detailSecondaryLabel?: string;
  detailSecondaryValue?: string;
  detailTertiaryLabel?: string;
  detailTertiaryValue?: string;
  footerTags: string[];
  punchedAtIso: string;
  dayOfMonth: number;
  dutyDate?: string;
  selfieUrl?: string;
};

export type AttendanceHistoryResponse = {
  year: number;
  month: number;
  monthLabel: string;
  cycleLabel: string;
  cycleNote: string;
  punctualityTitle: string;
  punctualitySubtitle: string;
  stats: {
    presentDays: number;
    totalHours: number;
    leaveDays: number;
    weeklyOffDays: number;
    missedDays?: number;
    halfDays?: number;
  };
  calendarDays: Array<{ day: number; status: AttendanceHistoryDayStatus }>;
  leadingEmpty: number;
  logs: AttendanceHistoryLogDto[];
  filterCounts: {
    all: number;
    present: number;
    weeklyOff: number;
    missed?: number;
    half?: number;
  };
};

export type GuardScheduleDutyStatus =
  | 'coming'
  | 'on_duty'
  | 'late_login'
  | 'delayed'
  | 'completed'
  | 'missed'
  | 'scheduled'
  | 'rest';

export type GuardScheduleShiftDto = {
  id: string;
  dutyDate: string;
  dayLabel: string;
  siteName: string;
  postName: string;
  shiftFrom: string;
  shiftTo: string;
  timeLabel: string;
  kind: 'confirmed' | 'night' | 'rest';
  statusLabel: string;
  dutyStatus?: GuardScheduleDutyStatus;
  isToday: boolean;
  isTomorrow: boolean;
  nightAllowanceLabel?: string;
};

export type GuardScheduleResponse = {
  shifts: GuardScheduleShiftDto[];
  restDays: GuardScheduleShiftDto[];
  from: string;
  days: number;
};

async function parseJson<T>(response: Response): Promise<T> {
  const data = (await response.json()) as T & { error?: string };
  if (!response.ok) {
    throw new Error(data.error ?? `Request failed (${response.status})`);
  }
  return data;
}

export async function loginGuard(
  identifier: string,
  password: string,
): Promise<{ token: string; guard: GuardSessionUser }> {
  const response = await fetch(`${guardApiConfig.baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier, password }),
  });
  return parseJson(response);
}

export async function requestLoginOtp(
  phone: string,
): Promise<{ ok: boolean; maskedPhone: string; expiresInSeconds: number; debugOtp?: string }> {
  const response = await fetch(`${guardApiConfig.baseUrl}/api/auth/otp/request`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone }),
  });
  return parseJson(response);
}

export async function verifyLoginOtp(
  phone: string,
  otp: string,
): Promise<{ token: string; guard: GuardSessionUser }> {
  const response = await fetch(`${guardApiConfig.baseUrl}/api/auth/otp/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, otp }),
  });
  return parseJson(response);
}

export async function checkGeofence(
  token: string,
  lat: number,
  lng: number,
  accuracyMeters = 5,
): Promise<GeofenceCheckResult> {
  const response = await fetch(`${guardApiConfig.baseUrl}/api/attendance/geofence-check`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ lat, lng, accuracyMeters }),
  });
  return parseJson(response);
}

export type SelfieUploadTicket = {
  uploadUrl: string;
  storagePath: string;
  selfieUrl: string;
  contentType: string;
  expiresAt: string;
};

export type PunchSelfieParams = {
  lat: number;
  lng: number;
  accuracyMeters?: number;
  /** Preferred after signed-URL upload */
  selfieStoragePath?: string;
  selfieUrl?: string;
  /** Legacy fallback when signed URL path fails */
  selfieBase64?: string;
};

async function createSelfieUploadTicket(
  token: string,
  purpose: 'punch_in_selfie' | 'punch_out_selfie',
): Promise<SelfieUploadTicket> {
  const response = await fetch(
    `${guardApiConfig.baseUrl}/api/attendance/selfie-upload-url`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ purpose }),
    },
  );
  return parseJson(response);
}

/** Decode already-compressed selfie base64 into PUT body bytes (avoids Response.blob()). */
function selfieBase64ToBytes(selfieBase64: string): Uint8Array {
  const cleaned = selfieBase64.replace(/^data:image\/\w+;base64,/, '');
  if (typeof globalThis.atob !== 'function') {
    throw new Error('Base64 decode unavailable on this device.');
  }
  const binary = globalThis.atob(cleaned);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Compress/camera JPEG → Storage via signed URL → punch with path.
 * Falls back to base64 JSON if signed upload is unavailable.
 */
export async function punchWithSelfieUpload(
  token: string,
  mode: 'punch_in' | 'punch_out',
  params: {
    lat: number;
    lng: number;
    accuracyMeters?: number;
    selfieUri: string;
    selfieBase64: string;
  },
): Promise<PunchInResult> {
  const purpose =
    mode === 'punch_out' ? 'punch_out_selfie' : 'punch_in_selfie';
  const endpoint =
    mode === 'punch_out'
      ? `${guardApiConfig.baseUrl}/api/attendance/punch-out`
      : `${guardApiConfig.baseUrl}/api/attendance/punch-in`;

  let storagePath: string | undefined;
  let selfieUrl: string | undefined;

  try {
    const ticket = await createSelfieUploadTicket(token, purpose);
    // Upload bytes from the compressed base64 we already have — no Response.blob().
    const jpegBytes = selfieBase64ToBytes(params.selfieBase64);
    const putRes = await fetch(ticket.uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': ticket.contentType || 'image/jpeg' },
      body: jpegBytes,
    });
    if (!putRes.ok) {
      throw new Error(`Selfie upload failed (${putRes.status})`);
    }
    storagePath = ticket.storagePath;
    selfieUrl = ticket.selfieUrl;
  } catch {
    // Keep punch working on older builds / signed-URL outages.
    storagePath = undefined;
    selfieUrl = undefined;
  }

  const body: PunchSelfieParams = {
    lat: params.lat,
    lng: params.lng,
    accuracyMeters: params.accuracyMeters,
  };
  if (storagePath) {
    body.selfieStoragePath = storagePath;
    if (selfieUrl) {
      body.selfieUrl = selfieUrl;
    }
  } else {
    body.selfieBase64 = params.selfieBase64;
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  return parseJson(response);
}

export async function punchInAttendance(
  token: string,
  params: PunchSelfieParams & { selfieBase64?: string; selfieUri?: string },
): Promise<PunchInResult> {
  if (params.selfieUri && params.selfieBase64) {
    return punchWithSelfieUpload(token, 'punch_in', {
      lat: params.lat,
      lng: params.lng,
      accuracyMeters: params.accuracyMeters,
      selfieUri: params.selfieUri,
      selfieBase64: params.selfieBase64,
    });
  }
  const response = await fetch(`${guardApiConfig.baseUrl}/api/attendance/punch-in`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(params),
  });
  return parseJson(response);
}

export async function punchOutAttendance(
  token: string,
  params: PunchSelfieParams & { selfieBase64?: string; selfieUri?: string },
): Promise<PunchInResult> {
  if (params.selfieUri && params.selfieBase64) {
    return punchWithSelfieUpload(token, 'punch_out', {
      lat: params.lat,
      lng: params.lng,
      accuracyMeters: params.accuracyMeters,
      selfieUri: params.selfieUri,
      selfieBase64: params.selfieBase64,
    });
  }
  const response = await fetch(`${guardApiConfig.baseUrl}/api/attendance/punch-out`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(params),
  });
  return parseJson(response);
}

export async function fetchTodayShift(token: string): Promise<TodayShiftStatus> {
  const response = await fetch(`${guardApiConfig.baseUrl}/api/attendance/today`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return parseJson(response);
}

export type GuardProfileGearItem = {
  id: string;
  itemName: string;
  category: string;
  unit: string;
  quantity: number;
};

export type GuardProfileResponse = {
  guardId: string;
  employeeCode: string;
  fullName: string;
  postName: string;
  profilePictureUrl: string;
  agencyId: string;
  agencyName: string;
  agencyPhone: string;
  site: {
    id: string;
    siteName: string;
    address: string;
    city: string;
    postName: string;
    hrName: string;
    hrContact: string;
    siteSupervisor: string;
    geofenceRadiusMeters: number | null;
  };
  shiftFrom: string;
  shiftTo: string;
  shiftLabel: string;
  dutySource: 'roster' | 'profile';
  esiNumber: string;
  pfNumber: string;
  hasPoliceVerification: boolean;
  hasCharacterCertificate: boolean;
  aadhaarLinked: boolean;
  gear: GuardProfileGearItem[];
};

export async function fetchGuardProfile(
  token: string,
): Promise<GuardProfileResponse> {
  const response = await fetch(`${guardApiConfig.baseUrl}/api/profile`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return parseJson(response);
}

export async function fetchAttendanceHistory(
  token: string,
  year: number,
  month: number,
): Promise<AttendanceHistoryResponse> {
  const query = new URLSearchParams({
    year: String(year),
    month: String(month),
  });
  const response = await fetch(
    `${guardApiConfig.baseUrl}/api/attendance/history?${query.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  return parseJson(response);
}

export async function fetchGuardSchedule(
  token: string,
  days = 14,
): Promise<GuardScheduleResponse> {
  const query = new URLSearchParams({ days: String(days) });
  const response = await fetch(
    `${guardApiConfig.baseUrl}/api/schedule/upcoming?${query.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  return parseJson(response);
}

export type LeaveTypeKey = 'CL' | 'SL' | 'EL';

export type LeaveBalanceTypeDto = {
  key: LeaveTypeKey;
  title: string;
  quota: number | null;
  remaining: number | null;
  usedApproved: number;
  usedPending: number;
  valueLabel: string;
  valueSuffix?: string;
  subtitle?: string;
  badge: string;
  badgeTone: 'paid' | 'slip' | 'urgent';
  highlighted?: boolean;
};

export type LeaveBalanceSummaryDto = {
  year: number;
  updatedLabel: string;
  daysLeft: number;
  daysTaken: number;
  daysPending: number;
  payrollNote: string;
  types: LeaveBalanceTypeDto[];
  coverSite: string;
  coverSupervisor: string;
};

export type LeaveRequestCardDto = {
  id: string;
  status: 'pending' | 'approved' | 'rejected';
  statusLabel: string;
  durationLabel: string;
  dateRange: string;
  leaveTypeLabel: string;
  reasonText: string;
  appliedMeta?: string;
  supervisorMeta?: string;
  approvalNote?: string;
  approvalDetail?: string;
  rejectionLabel?: string;
  compensationNote?: string;
  showPendingActions?: boolean;
};

export type LeaveRequestsResponse = {
  year: number;
  balance: LeaveBalanceSummaryDto;
  filterCounts: {
    all: number;
    pending: number;
    approved: number;
    rejected: number;
  };
  requests: LeaveRequestCardDto[];
};

export type SubmitLeaveResult = {
  id: string;
  status: 'pending';
  dayCount: number;
  message: string;
};

export async function fetchLeaveBalances(
  token: string,
  year?: number,
): Promise<LeaveBalanceSummaryDto> {
  const query = new URLSearchParams();
  if (year) {
    query.set('year', String(year));
  }
  const suffix = query.toString() ? `?${query.toString()}` : '';
  const response = await fetch(`${guardApiConfig.baseUrl}/api/leave/balances${suffix}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return parseJson(response);
}

export async function fetchLeaveRequests(
  token: string,
  status: 'all' | 'pending' | 'approved' | 'rejected' = 'all',
  year?: number,
): Promise<LeaveRequestsResponse> {
  const query = new URLSearchParams({ status });
  if (year) {
    query.set('year', String(year));
  }
  const response = await fetch(
    `${guardApiConfig.baseUrl}/api/leave/requests?${query.toString()}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  return parseJson(response);
}

export async function submitLeaveRequest(
  token: string,
  params: {
    leaveType: LeaveTypeKey;
    startDate: string;
    endDate: string;
    reason: string;
    note?: string;
  },
): Promise<SubmitLeaveResult> {
  const response = await fetch(`${guardApiConfig.baseUrl}/api/leave/requests`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(params),
  });
  return parseJson(response);
}

export async function withdrawLeaveRequest(
  token: string,
  requestId: string,
): Promise<{ ok: true; message: string }> {
  const response = await fetch(
    `${guardApiConfig.baseUrl}/api/leave/requests/${encodeURIComponent(requestId)}/withdraw`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  return parseJson(response);
}

export type ReliefMethodKey = 'remaining' | 'swap' | 'cover';
export type ReliefReasonKey =
  | 'urgentFamily'
  | 'medical'
  | 'transport'
  | 'personalEmergency';

export type ReliefRequestCardDto = {
  id: string;
  status: 'pending' | 'approved' | 'rejected';
  statusLabel: string;
  method: ReliefMethodKey;
  methodLabel: string;
  reasonLabel: string;
  note: string;
  siteName: string;
  postName: string;
  dutyDate: string;
  shiftFrom: string;
  shiftTo: string;
  timeRangeLabel: string;
  handoverFrom?: string;
  assignedGuardName?: string;
  assignedEmployeeCode?: string;
  appliedAt: string | null;
  decidedByName?: string;
  rejectionRemark?: string;
  approvalNote?: string;
  isAssignment?: boolean;
  requesterName?: string;
};

export type ReliefRequestsResponse = {
  filterCounts: {
    all: number;
    pending: number;
    approved: number;
    rejected: number;
  };
  requests: ReliefRequestCardDto[];
  assignments: ReliefRequestCardDto[];
};

export type SubmitReliefResult = {
  id: string;
  status: 'pending';
  message: string;
};

export async function fetchReliefRequests(
  token: string,
  status: 'all' | 'pending' | 'approved' | 'rejected' = 'all',
): Promise<ReliefRequestsResponse> {
  const query = new URLSearchParams({ status });
  const response = await fetch(
    `${guardApiConfig.baseUrl}/api/relief/requests?${query.toString()}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  return parseJson(response);
}

export async function submitReliefRequest(
  token: string,
  params: {
    method: ReliefMethodKey;
    reason: ReliefReasonKey;
    note?: string;
    dutyDate?: string;
    shiftFrom?: string;
    shiftTo?: string;
    siteId?: string;
    siteName?: string;
    postName?: string;
    handoverFrom?: string;
  },
): Promise<SubmitReliefResult> {
  const response = await fetch(`${guardApiConfig.baseUrl}/api/relief/requests`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(params),
  });
  return parseJson(response);
}

export async function withdrawReliefRequest(
  token: string,
  requestId: string,
): Promise<{ ok: true; message: string }> {
  const response = await fetch(
    `${guardApiConfig.baseUrl}/api/relief/requests/${encodeURIComponent(requestId)}/withdraw`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  return parseJson(response);
}

export type GuardNotificationDto = {
  id: string;
  type: string;
  title: string;
  body: string;
  data: Record<string, string>;
  read: boolean;
  createdAt: string;
};

export async function registerPushToken(
  token: string,
  params: {
    expoPushToken: string;
    deviceId: string;
    platform: 'ios' | 'android' | 'web' | 'unknown';
  },
): Promise<{ ok: true; id: string }> {
  const response = await fetch(`${guardApiConfig.baseUrl}/api/notifications/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(params),
  });
  return parseJson(response);
}

export async function unregisterPushToken(
  token: string,
  params: { deviceId?: string; expoPushToken?: string },
): Promise<{ ok: true }> {
  const response = await fetch(`${guardApiConfig.baseUrl}/api/notifications/unregister`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(params),
  });
  return parseJson(response);
}

export async function fetchGuardNotifications(
  token: string,
): Promise<{ notifications: GuardNotificationDto[]; unreadCount: number }> {
  const response = await fetch(`${guardApiConfig.baseUrl}/api/notifications`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return parseJson(response);
}

export async function markGuardNotificationsRead(
  token: string,
  params: { all?: boolean; notificationIds?: string[] },
): Promise<{ ok: true; updated: number }> {
  const response = await fetch(`${guardApiConfig.baseUrl}/api/notifications/read`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(params),
  });
  return parseJson(response);
}
