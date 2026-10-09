import { randomUUID } from "node:crypto";

import { getFirestore, Timestamp } from "firebase-admin/firestore";

import type { AuthenticatedGuardContext } from "@raskha/attendance";

export const GUARD_SESSIONS_COLLECTION = "guardSessions";

export type SessionRecord = {
  token: string;
  guard: AuthenticatedGuardContext;
  createdAt: number;
  geofenceUnlockedAt: number | null;
};

const SESSION_TTL_MS = 12 * 60 * 60 * 1000;
const GEOFENCE_UNLOCK_TTL_MS = 15 * 60 * 1000;
/** Short L1 cache so hot requests on the same instance avoid a Firestore round-trip. */
const MEMORY_CACHE_TTL_MS = 30_000;

type CacheEntry = {
  session: SessionRecord;
  cachedAt: number;
};

const memoryCache = new Map<string, CacheEntry>();

function isExpired(createdAt: number): boolean {
  return Date.now() - createdAt > SESSION_TTL_MS;
}

function fromDoc(
  token: string,
  data: Record<string, unknown>
): SessionRecord | null {
  const createdAtRaw = data.createdAt;
  let createdAt = 0;
  if (typeof createdAtRaw === "number") {
    createdAt = createdAtRaw;
  } else if (
    createdAtRaw &&
    typeof (createdAtRaw as { toMillis?: () => number }).toMillis === "function"
  ) {
    createdAt = (createdAtRaw as { toMillis: () => number }).toMillis();
  }

  if (!createdAt || isExpired(createdAt)) {
    return null;
  }

  const guard = data.guard as AuthenticatedGuardContext | undefined;
  if (!guard || typeof guard !== "object" || !guard.guardId) {
    return null;
  }

  let geofenceUnlockedAt: number | null = null;
  const geoRaw = data.geofenceUnlockedAt;
  if (typeof geoRaw === "number") {
    geofenceUnlockedAt = geoRaw;
  } else if (
    geoRaw &&
    typeof (geoRaw as { toMillis?: () => number }).toMillis === "function"
  ) {
    geofenceUnlockedAt = (geoRaw as { toMillis: () => number }).toMillis();
  }

  return {
    token,
    guard,
    createdAt,
    geofenceUnlockedAt,
  };
}

function putCache(session: SessionRecord): void {
  memoryCache.set(session.token, { session, cachedAt: Date.now() });
}

function getCached(token: string): SessionRecord | null {
  const entry = memoryCache.get(token);
  if (!entry) {
    return null;
  }
  if (Date.now() - entry.cachedAt > MEMORY_CACHE_TTL_MS) {
    memoryCache.delete(token);
    return null;
  }
  if (isExpired(entry.session.createdAt)) {
    memoryCache.delete(token);
    return null;
  }
  return entry.session;
}

export async function createSession(
  guard: AuthenticatedGuardContext
): Promise<string> {
  const token = randomUUID();
  const createdAt = Date.now();
  const session: SessionRecord = {
    token,
    guard,
    createdAt,
    geofenceUnlockedAt: null,
  };

  await getFirestore()
    .collection(GUARD_SESSIONS_COLLECTION)
    .doc(token)
    .set({
      token,
      guard,
      createdAt,
      geofenceUnlockedAt: null,
      expiresAt: Timestamp.fromMillis(createdAt + SESSION_TTL_MS),
      updatedAt: Timestamp.now(),
    });

  putCache(session);
  return token;
}

export async function getSession(token: string): Promise<SessionRecord | null> {
  const trimmed = token.trim();
  if (!trimmed) {
    return null;
  }

  const cached = getCached(trimmed);
  if (cached) {
    return cached;
  }

  const snap = await getFirestore()
    .collection(GUARD_SESSIONS_COLLECTION)
    .doc(trimmed)
    .get();

  if (!snap.exists) {
    return null;
  }

  const session = fromDoc(trimmed, (snap.data() ?? {}) as Record<string, unknown>);
  if (!session) {
    // Expired — best-effort cleanup
    void snap.ref.delete().catch(() => undefined);
    memoryCache.delete(trimmed);
    return null;
  }

  putCache(session);
  return session;
}

export async function markGeofenceUnlocked(token: string): Promise<void> {
  const session = await getSession(token);
  if (!session) {
    return;
  }

  const unlockedAt = Date.now();
  session.geofenceUnlockedAt = unlockedAt;
  putCache(session);

  await getFirestore()
    .collection(GUARD_SESSIONS_COLLECTION)
    .doc(token)
    .set(
      {
        geofenceUnlockedAt: unlockedAt,
        updatedAt: Timestamp.now(),
      },
      { merge: true }
    );
}

export async function isGeofenceUnlocked(token: string): Promise<boolean> {
  const session = await getSession(token);
  if (!session?.geofenceUnlockedAt) {
    return false;
  }
  return Date.now() - session.geofenceUnlockedAt <= GEOFENCE_UNLOCK_TTL_MS;
}

export async function destroySession(token: string): Promise<void> {
  memoryCache.delete(token);
  await getFirestore()
    .collection(GUARD_SESSIONS_COLLECTION)
    .doc(token)
    .delete()
    .catch(() => undefined);
}

/** Test helper — clear L1 cache between unit tests. */
export function clearSessionMemoryCache(): void {
  memoryCache.clear();
}
