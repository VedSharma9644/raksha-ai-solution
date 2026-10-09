import { describe, expect, it } from "vitest";

/**
 * Pure helpers mirrored from todayDuty selection rules for regression coverage.
 * (Firestore-backed resolveTodayDuty is covered via route smoke / integration.)
 */
function pickRelevant(params: {
  nowMs: number;
  windows: Array<{ startMs: number; endMs: number; id: string }>;
  hasOpenPunch?: boolean;
}): string | null {
  const sorted = [...params.windows].sort((a, b) => a.startMs - b.startMs);
  if (sorted.length === 0) {
    return null;
  }
  const notEnded = sorted.filter((w) => w.endMs > params.nowMs);
  if (params.hasOpenPunch) {
    const containing = sorted.find(
      (w) => w.startMs <= params.nowMs && w.endMs > params.nowMs
    );
    return (containing ?? notEnded[0] ?? sorted[sorted.length - 1]).id;
  }
  if (notEnded.length === 0) {
    return sorted[sorted.length - 1].id;
  }
  const inProgress = notEnded.filter((w) => w.startMs <= params.nowMs);
  const upcoming = notEnded.filter((w) => w.startMs > params.nowMs);
  return (inProgress[0] ?? upcoming[0] ?? notEnded[0]).id;
}

describe("today duty selection", () => {
  it("prefers later shift after earlier window ends (same-day reassignment)", () => {
    const chosen = pickRelevant({
      nowMs: 17 * 60 * 60 * 1000,
      windows: [
        { id: "morning", startMs: 8 * 3600_000, endMs: 16 * 3600_000 },
        { id: "evening", startMs: 18 * 3600_000, endMs: 22 * 3600_000 },
      ],
    });
    expect(chosen).toBe("evening");
  });

  it("keeps morning while its window is still open (late check-in)", () => {
    const chosen = pickRelevant({
      nowMs: 10 * 60 * 60 * 1000,
      windows: [
        { id: "morning", startMs: 8 * 3600_000, endMs: 16 * 3600_000 },
        { id: "evening", startMs: 18 * 3600_000, endMs: 22 * 3600_000 },
      ],
    });
    expect(chosen).toBe("morning");
  });

  it("uses in-progress window when punch is open", () => {
    const chosen = pickRelevant({
      nowMs: 19 * 60 * 60 * 1000,
      hasOpenPunch: true,
      windows: [
        { id: "morning", startMs: 8 * 3600_000, endMs: 16 * 3600_000 },
        { id: "evening", startMs: 18 * 3600_000, endMs: 22 * 3600_000 },
      ],
    });
    expect(chosen).toBe("evening");
  });
});
