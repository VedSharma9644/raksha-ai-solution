import { describe, expect, it } from "vitest";

import {
  evaluatePunchInPunctuality,
  formatIstPunchTime,
  toDutyDateKey,
} from "../attendanceService";

describe("toDutyDateKey", () => {
  it("returns YYYY-MM-DD in IST", () => {
    // 2026-10-08T18:30:00.000Z == 2026-10-09 00:00 IST
    const key = toDutyDateKey(new Date("2026-10-08T18:30:00.000Z"));
    expect(key).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(key).toBe("2026-10-09");
  });
});

describe("formatIstPunchTime", () => {
  it("formats Cloud Run UTC instants as India clock time", () => {
    // 14:00 IST == 08:30 UTC
    expect(formatIstPunchTime(new Date("2026-10-08T08:30:00.000Z"))).toMatch(
      /2:00\s*pm/i
    );
  });
});

describe("evaluatePunchInPunctuality", () => {
  it("marks on-time when punching at shift start (IST)", () => {
    const result = evaluatePunchInPunctuality({
      punchedAt: new Date("2026-10-08T02:30:00.000Z"), // 08:00 IST
      shiftFrom: "08:00",
    });
    expect(result.punchInStatus).toBe("On Time");
    expect(result.minutesLate).toBe(0);
  });

  it("marks late when punching after shift start (IST)", () => {
    const result = evaluatePunchInPunctuality({
      punchedAt: new Date("2026-10-08T02:42:00.000Z"), // 08:12 IST
      shiftFrom: "08:00",
    });
    expect(result.punchInStatus).toBe("Late");
    expect(result.minutesLate).toBe(12);
  });
});
