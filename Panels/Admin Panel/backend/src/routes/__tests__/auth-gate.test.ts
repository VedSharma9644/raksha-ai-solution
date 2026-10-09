import { beforeEach, describe, expect, it, vi } from "vitest";
import express from "express";
import request from "supertest";

const verifyIdToken = vi.fn();
const agencyGet = vi.fn();
const hrGet = vi.fn();

vi.mock("firebase-admin/auth", () => ({
  getAuth: () => ({ verifyIdToken }),
}));

vi.mock("firebase-admin/firestore", () => ({
  getFirestore: () => ({
    collection: (name: string) => ({
      doc: () => ({
        get: name === "agencies" ? agencyGet : hrGet,
      }),
    }),
  }),
}));

vi.mock("@raskha/leave", () => ({
  decideLeaveRequest: vi.fn(),
  LEAVE_TYPE_LABELS: {},
  listAgencyLeaveRequestsDto: vi.fn().mockResolvedValue({
    requests: [],
    counts: { all: 0, pending: 0, approved: 0, rejected: 0 },
  }),
}));

vi.mock("@raskha/relief", () => ({
  decideReliefRequest: vi.fn(),
  listAgencyReliefRequestsDto: vi.fn().mockResolvedValue({ requests: [] }),
  RELIEF_METHOD_LABELS: {},
}));

vi.mock("@raskha/notifications", () => ({
  notifyLeaveDecision: vi.fn(),
  notifyReliefDecision: vi.fn(),
  notifyReliefAssignment: vi.fn(),
}));

vi.mock("../../services/agencyNotifications", () => ({
  listAgencyNotifications: vi.fn().mockResolvedValue({ notifications: [] }),
}));

const { createLeaveRoutes } = await import("../leaveRoutes");
const { createReliefRoutes } = await import("../reliefRoutes");
const { createSchedulingRoutes } = await import("../schedulingRoutes");
const { createNotificationRoutes } = await import("../notificationRoutes");

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use("/api/leave", createLeaveRoutes());
  app.use("/api/relief", createReliefRoutes());
  app.use("/api/scheduling", createSchedulingRoutes());
  app.use("/api/notifications", createNotificationRoutes());
  return app;
}

describe("Admin API auth gate", () => {
  let app: ReturnType<typeof buildApp>;

  beforeEach(() => {
    app = buildApp();
    verifyIdToken.mockReset();
    agencyGet.mockReset();
    hrGet.mockReset();
  });

  const protectedGets = [
    "/api/leave/requests",
    "/api/relief/requests",
    "/api/scheduling?siteId=site-1",
    "/api/notifications",
  ] as const;

  it.each(protectedGets)("%s without Bearer → 401", async (path) => {
    const res = await request(app).get(path);
    expect(res.status).toBe(401);
    expect(String(res.body.error)).toMatch(/Missing Authorization Bearer token/i);
  });

  it("invalid Bearer token → 401", async () => {
    verifyIdToken.mockRejectedValue({
      code: "auth/invalid-id-token",
      message: "Invalid auth token.",
    });

    const res = await request(app)
      .get("/api/leave/requests")
      .set("Authorization", "Bearer bad-token");

    expect(res.status).toBe(401);
  });

  it("valid agency token can pass leave gate (200)", async () => {
    verifyIdToken.mockResolvedValue({ uid: "agency-1" });
    agencyGet.mockResolvedValue({
      exists: true,
      data: () => ({ status: "active", name: "Agency One" }),
    });

    const res = await request(app)
      .get("/api/leave/requests")
      .set("Authorization", "Bearer valid-token");

    expect(res.status).toBe(200);
  });
});
