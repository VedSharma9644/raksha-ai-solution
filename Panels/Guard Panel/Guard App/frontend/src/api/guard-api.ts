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
};

export type GeofenceCheckResult = {
  unlocked: boolean;
  cameraUnlocked: boolean;
  status: string;
  accuracyMeters: number;
  distanceMeters: number | null;
  message: string;
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

export async function punchInAttendance(
  token: string,
  params: {
    lat: number;
    lng: number;
    accuracyMeters?: number;
    selfieBase64: string;
  },
): Promise<PunchInResult> {
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

/** Tiny 1x1 JPEG used as demo selfie payload until live camera capture is wired. */
export const DEMO_SELFIE_BASE64 =
  '/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAn/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIQAxAAAAGcP//EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAQUCf//EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQMBAT8Bf//EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQIBAT8Bf//EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEABj8Cf//EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAT8hf//Z';
