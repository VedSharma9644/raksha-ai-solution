import { describe, expect, it } from "vitest";

import {
  addDaysToDutyDate,
  daysInCalendarMonth,
  formatIstMonthLabel,
  istWallClockToDate,
  jsWeekdayFromDutyDate,
  monthBoundsIst,
  shiftWindowIst,
  toDutyDateKey,
} from "../dutyDate";

describe("shiftWindowIst", () => {
  it("builds absolute instants from IST wall clock (not host TZ)", () => {
    const { start, end } = shiftWindowIst("2026-10-08", "08:00", "20:00");
    // 08:00 IST = 02:30 UTC; 20:00 IST = 14:30 UTC
    expect(start.toISOString()).toBe("2026-10-08T02:30:00.000Z");
    expect(end.toISOString()).toBe("2026-10-08T14:30:00.000Z");
  });

  it("spills overnight shifts into the next day", () => {
    const { start, end } = shiftWindowIst("2026-10-08", "20:00", "08:00");
    expect(start.toISOString()).toBe("2026-10-08T14:30:00.000Z");
    expect(end.toISOString()).toBe("2026-10-09T02:30:00.000Z");
  });
});

describe("monthBoundsIst", () => {
  it("uses IST midnight for month start/end", () => {
    const { start, end } = monthBoundsIst(2026, 10);
    // 1 Oct 2026 00:00 IST = 30 Sep 18:30 UTC
    expect(start.toISOString()).toBe("2026-09-30T18:30:00.000Z");
    // 1 Nov 2026 00:00 IST = 31 Oct 18:30 UTC
    expect(end.toISOString()).toBe("2026-10-31T18:30:00.000Z");
  });
});

describe("civil calendar helpers", () => {
  it("daysInCalendarMonth is host-TZ independent", () => {
    expect(daysInCalendarMonth(2026, 2)).toBe(28);
    expect(daysInCalendarMonth(2024, 2)).toBe(29);
    expect(daysInCalendarMonth(2026, 10)).toBe(31);
  });

  it("addDaysToDutyDate crosses months via civil calendar", () => {
    expect(addDaysToDutyDate("2026-10-31", 1)).toBe("2026-11-01");
    expect(addDaysToDutyDate("2026-01-01", -1)).toBe("2025-12-31");
  });

  it("jsWeekdayFromDutyDate matches civil weekday (Wed 2026-10-07)", () => {
    // 2026-10-07 is a Wednesday
    expect(jsWeekdayFromDutyDate("2026-10-07")).toBe(3);
  });

  it("formatIstMonthLabel is stable on any host TZ", () => {
    expect(formatIstMonthLabel(2026, 10)).toMatch(/October/i);
    expect(formatIstMonthLabel(2026, 10)).toMatch(/2026/);
  });
});

describe("istWallClockToDate + toDutyDateKey", () => {
  it("round-trips noon IST to the same duty date", () => {
    const noon = istWallClockToDate("2026-10-15", 12, 0);
    expect(toDutyDateKey(noon)).toBe("2026-10-15");
    expect(noon.toISOString()).toBe("2026-10-15T06:30:00.000Z");
  });
});
