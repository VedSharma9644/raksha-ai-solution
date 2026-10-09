import { beforeEach, describe, expect, it, vi } from "vitest";
import express from "express";
import request from "supertest";

const authenticateGuard = vi.fn();
const requestGuardLoginOtp = vi.fn();
const verifyGuardLoginOtp = vi.fn();

const sessionDocs = new Map<string, Record<string, unknown>>();

vi.mock("firebase-admin/firestore", () => ({
  Timestamp: {
    now: () => ({ seconds: 1, nanoseconds: 0 }),
    fromMillis: (ms: number) => ({ millis: ms }),
  },
  getFirestore: () => ({
    collection: () => ({
      doc: (token: string) => ({
        set: async (data: Record<string, unknown>, opts?: { merge?: boolean }) => {
          const prev = sessionDocs.get(token) ?? {};
          sessionDocs.set(token, opts?.merge ? { ...prev, ...data } : data);
        },
        get: async () => {
          const data = sessionDocs.get(token);
          return {
            exists: Boolean(data),
            data: () => data,
            ref: {
              delete: async () => {
                sessionDocs.delete(token);
              },
            },
          };
        },
        delete: async () => {
          sessionDocs.delete(token);
        },
      }),
    }),
  }),
}));

vi.mock("@raskha/attendance", () => ({
  authenticateGuard: (...args: unknown[]) => authenticateGuard(...args),
  requestGuardLoginOtp: (...args: unknown[]) => requestGuardLoginOtp(...args),
  verifyGuardLoginOtp: (...args: unknown[]) => verifyGuardLoginOtp(...args),
}));

vi.mock("@raskha/leave", () => ({
  getLeaveBalanceForGuard: vi.fn().mockResolvedValue({}),
  listLeaveRequestsForGuard: vi.fn().mockResolvedValue({ requests: [] }),
  submitLeaveRequest: vi.fn(),
  withdrawLeaveRequest: vi.fn(),
}));

vi.mock("@raskha/relief", () => ({
  isReliefMethod: vi.fn(),
  isReliefReason: vi.fn(),
  listReliefRequestsForGuard: vi.fn().mockResolvedValue({ requests: [] }),
  submitReliefRequest: vi.fn(),
  withdrawReliefRequest: vi.fn(),
}));

vi.mock("@raskha/notifications", () => ({
  listGuardNotifications: vi.fn().mockResolvedValue({ notifications: [] }),
  markGuardNotificationsRead: vi.fn(),
  registerGuardPushToken: vi.fn(),
  unregisterGuardPushToken: vi.fn(),
}));

const { createAuthRoutes } = await import("../authRoutes");
const { createLeaveRoutes } = await import("../leaveRoutes");
const { createReliefRoutes } = await import("../reliefRoutes");
const { createNotificationRoutes } = await import("../notificationRoutes");

const demoGuard = {
  guardId: "g1",
  employeeCode: "RKS-0001",
  fullName: "Test Guard",
  agencyId: "a1",
  assignedSiteId: "s1",
  siteName: "Gate A",
  postName: "Main",
  shiftFrom: "08:00",
  shiftTo: "20:00",
  profilePictureUrl: "",
};

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use("/api/auth", createAuthRoutes());
  app.use("/api/leave", createLeaveRoutes());
  app.use("/api/relief", createReliefRoutes());
  app.use("/api/notifications", createNotificationRoutes());
  return app;
}

describe("Guard App API auth", () => {
  const app = buildApp();

  beforeEach(async () => {
    authenticateGuard.mockReset();
    requestGuardLoginOtp.mockReset();
    verifyGuardLoginOtp.mockReset();
    sessionDocs.clear();
    const { clearSessionMemoryCache } = await import("../../sessionStore");
    clearSessionMemoryCache();
  });

  describe("POST /api/auth/login", () => {
    it("400 when identifier and password are missing", async () => {
      const res = await request(app).post("/api/auth/login").send({});
      expect(res.status).toBe(400);
      expect(String(res.body.error)).toMatch(/required/i);
    });

    it("401 on invalid credentials", async () => {
      authenticateGuard.mockResolvedValue(null);
      const res = await request(app)
        .post("/api/auth/login")
        .send({ identifier: "RKS-0001", password: "wrong" });
      expect(res.status).toBe(401);
      expect(String(res.body.error)).toMatch(/Invalid/i);
    });

    it("200 returns session token and guard on success", async () => {
      authenticateGuard.mockResolvedValue(demoGuard);
      const res = await request(app)
        .post("/api/auth/login")
        .send({ identifier: "RKS-0001", password: "demo1234" });

      expect(res.status).toBe(200);
      expect(res.body.token).toBeTruthy();
      expect(res.body.guard.employeeCode).toBe("RKS-0001");
      expect(res.body.guard.fullName).toBe("Test Guard");
    });
  });

  describe("POST /api/auth/otp", () => {
    it("otp/request 400 without phone", async () => {
      const res = await request(app).post("/api/auth/otp/request").send({});
      expect(res.status).toBe(400);
    });

    it("otp/request 200 with masked phone", async () => {
      requestGuardLoginOtp.mockResolvedValue({
        maskedPhone: "******3210",
        expiresInSeconds: 300,
        debugOtp: "123456",
      });
      const res = await request(app)
        .post("/api/auth/otp/request")
        .send({ phone: "9876543210" });
      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.maskedPhone).toBe("******3210");
    });

    it("otp/verify 400 without phone/otp", async () => {
      const res = await request(app).post("/api/auth/otp/verify").send({});
      expect(res.status).toBe(400);
    });

    it("otp/verify 200 returns session on success", async () => {
      verifyGuardLoginOtp.mockResolvedValue({ guard: demoGuard });
      const res = await request(app)
        .post("/api/auth/otp/verify")
        .send({ phone: "9876543210", otp: "123456" });
      expect(res.status).toBe(200);
      expect(res.body.token).toBeTruthy();
      expect(res.body.guard.id).toBe("g1");
    });
  });

  describe("protected routes without session → 401", () => {
    it.each([
      "/api/leave/requests",
      "/api/leave/balances",
      "/api/relief/requests",
      "/api/notifications",
    ])("%s", async (path) => {
      const res = await request(app).get(path);
      expect(res.status).toBe(401);
      expect(String(res.body.error)).toMatch(/Authorization|Session/i);
    });

    it("invalid Bearer session → 401", async () => {
      const res = await request(app)
        .get("/api/leave/requests")
        .set("Authorization", "Bearer not-a-real-session");
      expect(res.status).toBe(401);
    });
  });

  it("login then access leave with session token → 200", async () => {
    authenticateGuard.mockResolvedValue(demoGuard);
    const login = await request(app)
      .post("/api/auth/login")
      .send({ identifier: "RKS-0001", password: "demo1234" });

    const res = await request(app)
      .get("/api/leave/requests")
      .set("Authorization", `Bearer ${login.body.token}`);

    expect(res.status).toBe(200);
  });

  it("session works after L1 cache clear (simulates other Cloud Run instance)", async () => {
    authenticateGuard.mockResolvedValue(demoGuard);
    const login = await request(app)
      .post("/api/auth/login")
      .send({ identifier: "RKS-0001", password: "demo1234" });

    const { clearSessionMemoryCache } = await import("../../sessionStore");
    clearSessionMemoryCache();

    const res = await request(app)
      .get("/api/leave/requests")
      .set("Authorization", `Bearer ${login.body.token}`);

    expect(res.status).toBe(200);
  });
});
