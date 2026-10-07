import { randomUUID } from "node:crypto";

import type { AuthenticatedGuardContext } from "@raskha/attendance";

type SessionRecord = {
  token: string;
  guard: AuthenticatedGuardContext;
  createdAt: number;
  geofenceUnlockedAt: number | null;
};

const sessions = new Map<string, SessionRecord>();

const SESSION_TTL_MS = 12 * 60 * 60 * 1000;
const GEOFENCE_UNLOCK_TTL_MS = 15 * 60 * 1000;

function isExpired(createdAt: number): boolean {
  return Date.now() - createdAt > SESSION_TTL_MS;
}

export function createSession(guard: AuthenticatedGuardContext): string {
  const token = randomUUID();
  sessions.set(token, {
    token,
    guard,
    createdAt: Date.now(),
    geofenceUnlockedAt: null,
  });
  return token;
}

export function getSession(token: string): SessionRecord | null {
  const session = sessions.get(token);
  if (!session) {
    return null;
  }
  if (isExpired(session.createdAt)) {
    sessions.delete(token);
    return null;
  }
  return session;
}

export function markGeofenceUnlocked(token: string): void {
  const session = getSession(token);
  if (!session) {
    return;
  }
  session.geofenceUnlockedAt = Date.now();
}

export function isGeofenceUnlocked(token: string): boolean {
  const session = getSession(token);
  if (!session?.geofenceUnlockedAt) {
    return false;
  }
  return Date.now() - session.geofenceUnlockedAt <= GEOFENCE_UNLOCK_TTL_MS;
}

export function destroySession(token: string): void {
  sessions.delete(token);
}
