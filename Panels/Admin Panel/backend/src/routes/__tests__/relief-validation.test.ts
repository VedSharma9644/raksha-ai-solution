import { beforeEach, describe, expect, it, vi } from "vitest";
import express from "express";
import request from "supertest";

const verifyIdToken = vi.fn();
const agencyGet = vi.fn();
const hrGet = vi.fn();
const decideReliefRequest = vi.fn();
const decideLeaveRequest = vi.fn();

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
  decideLeaveRequest: (...args: unknown[]) => decideLeaveRequest(...args),
  LEAVE_TYPE_LABELS: { CL: "Casual" },
  listAgencyLeaveRequestsDto: vi.fn().mockResolvedValue({
    requests: [],
    counts: { all: 0, pending: 0, approved: 0, rejected: 0 },
  }),
}));

vi.mock("@raskha/relief", () => ({
  decideReliefRequest: (...args: unknown[]) => decideReliefRequest(...args),
  listAgencyReliefRequestsDto: vi.fn().mockResolvedValue({
    requests: [],
    counts: { all: 0, pending: 0, approved: 0, rejected: 0 },
  }),
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

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use("/api/leave", createLeaveRoutes());
  app.use("/api/relief", createReliefRoutes());
  return app;
}

async function asAgency(app: ReturnType<typeof buildApp>) {
  verifyIdToken.mockResolvedValue({ uid: "agency-1" });
  agencyGet.mockResolvedValue({
    exists: true,
    data: () => ({ status: "active", name: "Agency One", ownerName: "Owner" }),
  });
  return app;
}

describe("Admin API relief/leave decision validation", () => {
  let app: ReturnType<typeof buildApp>;

  beforeEach(async () => {
    app = await asAgency(buildApp());
    decideReliefRequest.mockReset();
    decideLeaveRequest.mockReset();
  });

  it("POST /api/relief/.../approve without assignedGuardId → 400", async () => {
    decideReliefRequest.mockRejectedValue(
      Object.assign(new Error("Select a replacement guard before approving."), {
        statusCode: 400,
      })
    );

    const res = await request(app)
      .post("/api/relief/requests/req-1/approve")
      .set("Authorization", "Bearer agency-token")
      .send({});

    expect(res.status).toBe(400);
    expect(decideReliefRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        agencyId: "agency-1",
        decision: "approved",
        assignedGuardId: "",
      })
    );
  });

  it("POST /api/relief/.../reject without remark → 400", async () => {
    decideReliefRequest.mockRejectedValue(
      Object.assign(new Error("A rejection remark is required."), {
        statusCode: 400,
      })
    );

    const res = await request(app)
      .post("/api/relief/requests/req-1/reject")
      .set("Authorization", "Bearer agency-token")
      .send({});

    expect(res.status).toBe(400);
    expect(decideReliefRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        agencyId: "agency-1",
        decision: "rejected",
        remark: undefined,
      })
    );
  });

  it("IDOR: approve leave for another agency surfaces 403", async () => {
    decideLeaveRequest.mockRejectedValue(
      Object.assign(new Error("You cannot decide this leave request."), {
        statusCode: 403,
      })
    );

    const res = await request(app)
      .post("/api/leave/requests/foreign-leave/approve")
      .set("Authorization", "Bearer agency-token")
      .send({});

    expect(res.status).toBe(403);
  });

  it("IDOR: approve relief for another agency surfaces 403", async () => {
    decideReliefRequest.mockRejectedValue(
      Object.assign(new Error("You cannot decide this relief request."), {
        statusCode: 403,
      })
    );

    const res = await request(app)
      .post("/api/relief/requests/foreign-relief/approve")
      .set("Authorization", "Bearer agency-token")
      .send({ assignedGuardId: "guard-2" });

    expect(res.status).toBe(403);
  });
});
