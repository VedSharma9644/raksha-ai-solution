import { beforeEach, describe, expect, it, vi } from "vitest";

const update = vi.fn();
const requestGet = vi.fn();
const guardGet = vi.fn();

vi.mock("firebase-admin/firestore", () => ({
  Timestamp: { now: () => ({ seconds: 1, nanoseconds: 0 }) },
  getFirestore: () => ({
    collection: (name: string) => ({
      doc: (id: string) => {
        if (name === "reliefRequests") {
          return { get: requestGet, update };
        }
        if (name === "guards") {
          return { get: () => guardGet(id) };
        }
        return { get: vi.fn(), update: vi.fn() };
      },
      where: () => ({
        get: vi.fn().mockResolvedValue({ docs: [] }),
      }),
    }),
  }),
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
    }),
  };
}

describe("decideReliefRequest security rules", () => {
  beforeEach(() => {
    update.mockReset();
    requestGet.mockReset();
    guardGet.mockReset();
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
});
