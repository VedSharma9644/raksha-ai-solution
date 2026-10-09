import { beforeEach, describe, expect, it, vi } from "vitest";

const findGuardByIdentifier = vi.fn();
const verifyFirebaseEmailPassword = vi.fn();
const getSiteGeofenceById = vi.fn();

vi.mock("firebase-admin/firestore", () => ({
  getFirestore: () => ({
    collection: () => ({
      where: () => ({
        limit: () => ({
          get: async () => ({ empty: true, docs: [] }),
        }),
      }),
      doc: () => ({
        get: async () => ({ exists: false }),
      }),
    }),
  }),
}));

vi.mock("firebase-admin/auth", () => ({
  getAuth: () => ({
    getUser: async () => ({ email: null }),
  }),
}));

vi.mock("../firebasePasswordAuth", () => ({
  verifyFirebaseEmailPassword: (...args: unknown[]) =>
    verifyFirebaseEmailPassword(...args),
}));

vi.mock("../siteLookup", () => ({
  getSiteGeofenceById: (...args: unknown[]) => getSiteGeofenceById(...args),
}));

vi.mock("@raskha/guard-management", () => ({
  GUARDS_COLLECTION: "guards",
}));

// We test authenticateGuard behavior by importing after mocks; findGuard is internal,
// so exercise through public API with env demo credentials.

describe("authenticateGuard preference", () => {
  beforeEach(() => {
    findGuardByIdentifier.mockReset();
    verifyFirebaseEmailPassword.mockReset();
    getSiteGeofenceById.mockReset();
    getSiteGeofenceById.mockResolvedValue(null);
    process.env.GUARD_DEMO_ID = "RKS-8842";
    process.env.GUARD_DEMO_PASSWORD = "demo1234";
    process.env.GUARD_DEMO_PHONE = "9876543210";
  });

  it("returns demo only when no real guard matches demo credentials", async () => {
    const { authenticateGuard } = await import("../guardAuth");
    const result = await authenticateGuard({
      identifier: "RKS-8842",
      password: "demo1234",
      demoMode: true,
    });
    expect(result?.guardId).toBe("demo-guard-rks-8842");
    expect(result?.fullName).toBe("Rajesh Kumar");
  });

  it("does not return demo on wrong password", async () => {
    const { authenticateGuard } = await import("../guardAuth");
    const result = await authenticateGuard({
      identifier: "RKS-8842",
      password: "wrong-password",
      demoMode: true,
    });
    expect(result).toBeNull();
  });
});
