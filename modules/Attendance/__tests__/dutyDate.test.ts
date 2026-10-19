import { describe, expect, it } from "vitest";

import {
  assertPunchInWithinLateWindow,
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
      dutyDate: "2026-10-08",
    });
    expect(result.punchInStatus).toBe("On Time");
    expect(result.minutesLate).toBe(0);
  });

  it("marks on-time when punching within 15 minutes before start", () => {
    const result = evaluatePunchInPunctuality({
      punchedAt: new Date("2026-10-08T02:15:00.000Z"), // 07:45 IST
      shiftFrom: "08:00",
      dutyDate: "2026-10-08",
    });
    expect(result.punchInStatus).toBe("On Time");
    expect(result.minutesLate).toBe(0);
  });

  it("marks late when punching after shift start (IST)", () => {
    const result = evaluatePunchInPunctuality({
      punchedAt: new Date("2026-10-08T02:42:00.000Z"), // 08:12 IST
      shiftFrom: "08:00",
      dutyDate: "2026-10-08",
    });
    expect(result.punchInStatus).toBe("Late");
    expect(result.minutesLate).toBe(12);
  });

  it("allows punch-in from 15 minutes before shift start", () => {
    expect(() =>
      assertPunchInWithinLateWindow({
        punchedAt: new Date("2026-10-08T02:15:00.000Z"), // 07:45 IST
        shiftFrom: "08:00",
        dutyDate: "2026-10-08",
      })
    ).not.toThrow();
  });

  it("blocks punch-in more than 15 minutes before shift start", () => {
    expect(() =>
      assertPunchInWithinLateWindow({
        punchedAt: new Date("2026-10-08T02:14:00.000Z"), // 07:44 IST
        shiftFrom: "08:00",
        dutyDate: "2026-10-08",
      })
    ).toThrow(/not open yet/i);
  });

  it("allows punch-in within 15 minutes after shift start", () => {
    expect(() =>
      assertPunchInWithinLateWindow({
        punchedAt: new Date("2026-10-08T02:45:00.000Z"), // 08:15 IST
        shiftFrom: "08:00",
        dutyDate: "2026-10-08",
      })
    ).not.toThrow();
  });

  it("blocks punch-in more than 15 minutes after shift start", () => {
    expect(() =>
      assertPunchInWithinLateWindow({
        punchedAt: new Date("2026-10-08T02:46:00.000Z"), // 08:16 IST
        shiftFrom: "08:00",
        dutyDate: "2026-10-08",
      })
    ).toThrow(/Punch-in closed/i);
  });

  it("anchors overnight late window to roster duty date after midnight", () => {
    // Duty 2026-10-08 20:00–08:00; punch at 20:10 IST still on duty date
    const result = evaluatePunchInPunctuality({
      punchedAt: new Date("2026-10-08T14:40:00.000Z"), // 20:10 IST
      shiftFrom: "20:00",
      shiftTo: "08:00",
      dutyDate: "2026-10-08",
    });
    expect(result.punchInStatus).toBe("Late");
    expect(result.minutesLate).toBe(10);
  });

  it("blocks early punch more than 15 minutes before a 22:00 shift", () => {
    expect(() =>
      assertPunchInWithinLateWindow({
        punchedAt: new Date("2026-10-08T16:14:00.000Z"), // 21:44 IST — 16 min early
        shiftFrom: "22:00",
        shiftTo: "08:00",
        dutyDate: "2026-10-08",
      })
    ).toThrow(/not open yet/i);
  });

  it("allows punch at 21:45 for a 22:00 shift", () => {
    expect(() =>
      assertPunchInWithinLateWindow({
        punchedAt: new Date("2026-10-08T16:15:00.000Z"), // 21:45 IST
        shiftFrom: "22:00",
        shiftTo: "08:00",
        dutyDate: "2026-10-08",
      })
    ).not.toThrow();
  });
});
