import { beforeEach, describe, expect, it, vi } from "vitest";

const set = vi.fn();
const get = vi.fn();
const del = vi.fn();
const mergeSet = vi.fn();

vi.mock("firebase-admin/firestore", () => ({
  Timestamp: {
    now: () => ({ seconds: 1, nanoseconds: 0 }),
    fromMillis: (ms: number) => ({ millis: ms }),
  },
  getFirestore: () => ({
    collection: () => ({
      doc: (token: string) => ({
        set: (data: unknown, opts?: { merge?: boolean }) => {
          if (opts?.merge) {
            return mergeSet(token, data);
          }
          return set(token, data);
        },
        get: () => get(token),
        delete: () => del(token),
      }),
    }),
  }),
}));

const {
  clearSessionMemoryCache,
  createSession,
  getSession,
  markGeofenceUnlocked,
  isGeofenceUnlocked,
  destroySession,
} = await import("../sessionStore");

const demoGuard = {
  guardId: "g1",
  employeeCode: "RKS-0001",
  fullName: "Test Guard",
  agencyId: "a1",
  assignedSiteId: "s1",
  siteName: "Gate",
  postName: "Main",
  shiftFrom: "08:00",
  shiftTo: "20:00",
};

describe("Firestore-backed guard sessions", () => {
  beforeEach(() => {
    clearSessionMemoryCache();
    set.mockReset().mockResolvedValue(undefined);
    mergeSet.mockReset().mockResolvedValue(undefined);
    get.mockReset();
    del.mockReset().mockResolvedValue(undefined);
  });

  it("createSession writes guardSessions doc and returns token", async () => {
    const token = await createSession(demoGuard);
    expect(token).toBeTruthy();
    expect(set).toHaveBeenCalledWith(
      token,
      expect.objectContaining({
        token,
        guard: demoGuard,
        geofenceUnlockedAt: null,
      })
    );
  });

  it("getSession serves L1 cache after create (no second Firestore get)", async () => {
    const token = await createSession(demoGuard);
    get.mockClear();
    const session = await getSession(token);
    expect(session?.guard.guardId).toBe("g1");
    expect(get).not.toHaveBeenCalled();
  });

  it("getSession loads from Firestore when cache cold (multi-instance)", async () => {
    const token = await createSession(demoGuard);
    clearSessionMemoryCache();
    get.mockResolvedValue({
      exists: true,
      data: () => ({
        token,
        guard: demoGuard,
        createdAt: Date.now(),
        geofenceUnlockedAt: null,
      }),
      ref: { delete: del },
    });

    const session = await getSession(token);
    expect(session?.guard.employeeCode).toBe("RKS-0001");
    expect(get).toHaveBeenCalledWith(token);
  });

  it("expired session returns null and deletes doc", async () => {
    clearSessionMemoryCache();
    const token = "expired-token";
    get.mockResolvedValue({
      exists: true,
      data: () => ({
        token,
        guard: demoGuard,
        createdAt: Date.now() - 13 * 60 * 60 * 1000,
        geofenceUnlockedAt: null,
      }),
      ref: { delete: del },
    });

    const session = await getSession(token);
    expect(session).toBeNull();
  });

  it("markGeofenceUnlocked persists unlock timestamp", async () => {
    const token = await createSession(demoGuard);
    await markGeofenceUnlocked(token);
    expect(await isGeofenceUnlocked(token)).toBe(true);
    expect(mergeSet).toHaveBeenCalledWith(
      token,
      expect.objectContaining({
        geofenceUnlockedAt: expect.any(Number),
      })
    );
  });

  it("destroySession removes Firestore doc and cache", async () => {
    const token = await createSession(demoGuard);
    await destroySession(token);
    expect(del).toHaveBeenCalledWith(token);
    clearSessionMemoryCache();
    get.mockResolvedValue({ exists: false });
    expect(await getSession(token)).toBeNull();
  });
});
