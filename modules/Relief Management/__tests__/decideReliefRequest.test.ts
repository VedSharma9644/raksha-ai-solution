import { beforeEach, describe, expect, it, vi } from "vitest";

const update = vi.fn();
const requestGet = vi.fn();
const guardGet = vi.fn();
const assignmentAdd = vi.fn();

vi.mock("firebase-admin/firestore", () => ({
  Timestamp: { now: () => ({ seconds: 1, nanoseconds: 0 }) },
  FieldValue: { serverTimestamp: () => "SERVER_TS" },
  getFirestore: () => ({
    collection: (name: string) => ({
      doc: (id: string) => {
        if (name === "reliefRequests") {
          return { get: requestGet, update };
        }
        if (name === "guards") {
          return { get: () => guardGet(id) };
        }
        if (name === "attendanceRecords") {
          return { update: vi.fn().mockResolvedValue(undefined) };
        }
        return { get: vi.fn(), update: vi.fn() };
      },
      add: (data: unknown) => {
        if (name === "shiftAssignments") {
          return assignmentAdd(data);
        }
        return Promise.resolve({ id: "doc-1" });
      },
      // Supports .where().get() and .where().where().get() (roster + attendance + leave)
      where: () => ({
        where: () => ({
          where: () => ({
            get: vi.fn().mockResolvedValue({ docs: [] }),
          }),
          get: vi.fn().mockResolvedValue({ docs: [] }),
        }),
        get: vi.fn().mockResolvedValue({ docs: [] }),
      }),
    }),
  }),
}));

vi.mock("@raskha/attendance", () => ({
  getTodayOpenPunchIn: vi.fn().mockResolvedValue(null),
  weekdayFromDutyDate: () => "wed",
  ATTENDANCE_COLLECTION: "attendanceRecords",
}));

const { decideReliefRequest } = await import("../agencyRelief");

function pendingSnap(agencyId: string, guardId = "guard-requester") {
  return {
    exists: true,
    data: () => ({
      agencyId,
      guardId,
      guardName: "Requester",
      status: "pending",
      method: "remaining",
      dutyDate: "2026-10-08",
      siteId: "site-a",
      siteName: "Site A",
      postName: "Gate",
      shiftFrom: "08:00",
      shiftTo: "20:00",
    }),
  };
}

describe("decideReliefRequest security rules", () => {
  beforeEach(() => {
    update.mockReset();
    requestGet.mockReset();
    guardGet.mockReset();
    assignmentAdd.mockReset();
    assignmentAdd.mockResolvedValue({ id: "assign-1" });
  });

  it("IDOR: wrong agency cannot approve another agency’s request → 403", async () => {
    requestGet.mockResolvedValue(pendingSnap("agency-owner"));

    await expect(
      decideReliefRequest({
        agencyId: "agency-attacker",
        requestId: "req-1",
        decision: "approved",
        assignedGuardId: "guard-2",
        decidedByName: "Attacker Admin",
      })
    ).rejects.toMatchObject({
      statusCode: 403,
      message: expect.stringMatching(/cannot decide/i),
    });
    expect(update).not.toHaveBeenCalled();
  });

  it("IDOR: wrong agency cannot reject another agency’s request → 403", async () => {
    requestGet.mockResolvedValue(pendingSnap("agency-owner"));

    await expect(
      decideReliefRequest({
        agencyId: "agency-attacker",
        requestId: "req-1",
        decision: "rejected",
        remark: "Nope",
        decidedByName: "Attacker Admin",
      })
    ).rejects.toMatchObject({
      statusCode: 403,
    });
    expect(update).not.toHaveBeenCalled();
  });

  it("approve without assignedGuardId → 400", async () => {
    requestGet.mockResolvedValue(pendingSnap("agency-1"));

    await expect(
      decideReliefRequest({
        agencyId: "agency-1",
        requestId: "req-1",
        decision: "approved",
        decidedByName: "Admin",
      })
    ).rejects.toMatchObject({
      statusCode: 400,
      message: expect.stringMatching(/replacement guard/i),
    });
    expect(update).not.toHaveBeenCalled();
  });

  it("reject without remark → 400", async () => {
    requestGet.mockResolvedValue(pendingSnap("agency-1"));

    await expect(
      decideReliefRequest({
        agencyId: "agency-1",
        requestId: "req-1",
        decision: "rejected",
        remark: "   ",
        decidedByName: "Admin",
      })
    ).rejects.toMatchObject({
      statusCode: 400,
      message: expect.stringMatching(/rejection remark/i),
    });
    expect(update).not.toHaveBeenCalled();
  });

  it("approve with assignee from another agency → 403", async () => {
    requestGet.mockResolvedValue(pendingSnap("agency-1"));
    guardGet.mockResolvedValue({
      exists: true,
      data: () => ({
        agencyId: "other-agency",
        fullName: "Other Guard",
        employeeCode: "RKS-9999",
      }),
    });

    await expect(
      decideReliefRequest({
        agencyId: "agency-1",
        requestId: "req-1",
        decision: "approved",
        assignedGuardId: "guard-other",
        decidedByName: "Admin",
      })
    ).rejects.toMatchObject({
      statusCode: 403,
      message: expect.stringMatching(/belong to your agency/i),
    });
  });

  it("reject with remark for owning agency → updates", async () => {
    requestGet.mockResolvedValue(pendingSnap("agency-1"));
    update.mockResolvedValue(undefined);

    const result = await decideReliefRequest({
      agencyId: "agency-1",
      requestId: "req-1",
      decision: "rejected",
      remark: "Coverage unavailable",
      decidedByName: "Admin",
    });

    expect(result.status).toBe("rejected");
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "rejected",
        rejectionRemark: "Coverage unavailable",
      })
    );
  });

  it("approve writes shiftAssignments for assignee", async () => {
    requestGet.mockResolvedValue(pendingSnap("agency-1"));
    guardGet.mockResolvedValue({
      exists: true,
      data: () => ({
        agencyId: "agency-1",
        fullName: "Cover Guard",
        employeeCode: "RKS-1001",
      }),
    });
    update.mockResolvedValue(undefined);

    const result = await decideReliefRequest({
      agencyId: "agency-1",
      requestId: "req-1",
      decision: "approved",
      assignedGuardId: "guard-cover",
      decidedByName: "Admin",
    });

    expect(result.status).toBe("approved");
    expect(result.assignmentId).toBe("assign-1");
    expect(assignmentAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        guardId: "guard-cover",
        siteId: "site-a",
        effectiveFrom: "2026-10-08",
        effectiveTo: "2026-10-08",
        reliefRequestId: "req-1",
      })
    );
  });
});
