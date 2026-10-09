import { beforeEach, describe, expect, it, vi } from "vitest";

const update = vi.fn();
const requestGet = vi.fn();

vi.mock("firebase-admin/firestore", () => ({
  Timestamp: { now: () => ({ seconds: 1, nanoseconds: 0 }) },
  getFirestore: () => ({
    collection: () => ({
      doc: () => ({ get: requestGet, update }),
      where: () => ({
        get: vi.fn().mockResolvedValue({ docs: [] }),
      }),
    }),
  }),
}));

const { decideLeaveRequest } = await import("../agencyLeave");

function pendingSnap(agencyId: string) {
  return {
    exists: true,
    data: () => ({
      agencyId,
      guardId: "guard-1",
      guardName: "Guard One",
      status: "pending",
      leaveType: "CL",
      startDate: "2026-10-10",
      endDate: "2026-10-11",
    }),
  };
}

describe("decideLeaveRequest security rules", () => {
  beforeEach(() => {
    update.mockReset();
    requestGet.mockReset();
  });

  it("IDOR: wrong agency cannot approve another agency’s leave → 403", async () => {
    requestGet.mockResolvedValue(pendingSnap("agency-owner"));

    await expect(
      decideLeaveRequest({
        agencyId: "agency-attacker",
        requestId: "leave-1",
        decision: "approved",
        decidedByName: "Attacker",
      })
    ).rejects.toMatchObject({
      statusCode: 403,
      message: expect.stringMatching(/cannot decide/i),
    });
    expect(update).not.toHaveBeenCalled();
  });

  it("IDOR: wrong agency cannot reject another agency’s leave → 403", async () => {
    requestGet.mockResolvedValue(pendingSnap("agency-owner"));

    await expect(
      decideLeaveRequest({
        agencyId: "agency-attacker",
        requestId: "leave-1",
        decision: "rejected",
        remark: "Denied",
        decidedByName: "Attacker",
      })
    ).rejects.toMatchObject({ statusCode: 403 });
    expect(update).not.toHaveBeenCalled();
  });

  it("reject without remark → 400", async () => {
    requestGet.mockResolvedValue(pendingSnap("agency-1"));

    await expect(
      decideLeaveRequest({
        agencyId: "agency-1",
        requestId: "leave-1",
        decision: "rejected",
        decidedByName: "Admin",
      })
    ).rejects.toMatchObject({
      statusCode: 400,
      message: expect.stringMatching(/rejection remark/i),
    });
  });
});
