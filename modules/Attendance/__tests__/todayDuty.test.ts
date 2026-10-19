import { describe, expect, it } from "vitest";

import { shiftWindowIst } from "../dutyDate";
import { pickTodayDutyWindow } from "../todayDuty";

type FakeRow = {
  id: string;
  siteId: string;
  shiftLabel: string;
  shiftStartTime: string;
  shiftEndTime: string;
  recurringDays: never[];
  effectiveFrom: string;
};

function windowFor(
  dutyDate: string,
  shiftFrom: string,
  shiftTo: string,
  id: string
) {
  const { start, end } = shiftWindowIst(dutyDate, shiftFrom, shiftTo);
  const row: FakeRow = {
    id,
    siteId: "site-1",
    shiftLabel: id,
    shiftStartTime: shiftFrom,
    shiftEndTime: shiftTo,
    recurringDays: [],
    effectiveFrom: "1970-01-01",
  };
  return { row, start, end, dutyDate };
}

describe("today duty selection", () => {
  it("prefers later shift after earlier window ends (same-day reassignment)", () => {
    const dutyDate = "2026-10-15";
    const chosen = pickTodayDutyWindow({
      nowMs: shiftWindowIst(dutyDate, "17:00", "17:01").start.getTime(),
      windows: [
        windowFor(dutyDate, "08:00", "16:00", "morning"),
        windowFor(dutyDate, "18:00", "22:00", "evening"),
      ],
    });
    expect(chosen?.row.id).toBe("evening");
  });

  it("keeps morning while its window is still open (late check-in)", () => {
    const dutyDate = "2026-10-15";
    const chosen = pickTodayDutyWindow({
      nowMs: shiftWindowIst(dutyDate, "10:00", "10:01").start.getTime(),
      windows: [
        windowFor(dutyDate, "08:00", "16:00", "morning"),
        windowFor(dutyDate, "18:00", "22:00", "evening"),
      ],
    });
    expect(chosen?.row.id).toBe("morning");
  });

  it("uses in-progress window when punch is open", () => {
    const dutyDate = "2026-10-15";
    const chosen = pickTodayDutyWindow({
      nowMs: shiftWindowIst(dutyDate, "19:00", "19:01").start.getTime(),
      hasOpenPunch: true,
      windows: [
        windowFor(dutyDate, "08:00", "16:00", "morning"),
        windowFor(dutyDate, "18:00", "22:00", "evening"),
      ],
    });
    expect(chosen?.row.id).toBe("evening");
  });

  it("keeps yesterday overnight window after IST midnight", () => {
    const yesterday = "2026-10-14";
    const today = "2026-10-15";
    const overnight = windowFor(yesterday, "20:00", "08:00", "night");
    const morning = windowFor(today, "08:00", "20:00", "day");
    // 02:00 IST on Oct 15 = still inside overnight from Oct 14
    const nowMs = shiftWindowIst(today, "02:00", "02:01").start.getTime();
    const chosen = pickTodayDutyWindow({
      nowMs,
      hasOpenPunch: true,
      windows: [overnight, morning],
    });
    expect(chosen?.row.id).toBe("night");
    expect(chosen?.dutyDate).toBe(yesterday);
  });
});
