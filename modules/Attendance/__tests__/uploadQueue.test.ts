import { afterEach, describe, expect, it } from "vitest";

import {
  getSelfieUploadQueueStats,
  resetSelfieUploadQueueForTests,
  withSelfieUploadSlot,
} from "../uploadQueue";

afterEach(() => {
  resetSelfieUploadQueueForTests();
});

describe("withSelfieUploadSlot", () => {
  it("runs work under the concurrency cap", async () => {
    let peak = 0;
    let active = 0;

    await Promise.all(
      Array.from({ length: 40 }, async () => {
        await withSelfieUploadSlot(async () => {
          active += 1;
          peak = Math.max(peak, active);
          await new Promise((r) => setTimeout(r, 15));
          active -= 1;
        });
      })
    );

    const { maxConcurrent } = getSelfieUploadQueueStats();
    expect(peak).toBeLessThanOrEqual(maxConcurrent);
    expect(peak).toBeGreaterThan(0);
  });

  it("queues when all slots are busy", async () => {
    const { maxConcurrent } = getSelfieUploadQueueStats();
    const releases: Array<() => void> = [];

    const holders = Array.from({ length: maxConcurrent }, () =>
      withSelfieUploadSlot(
        () =>
          new Promise<void>((resolve) => {
            releases.push(resolve);
          })
      )
    );

    await new Promise((r) => setTimeout(r, 20));
    expect(getSelfieUploadQueueStats().inFlight).toBe(maxConcurrent);

    const waiting = withSelfieUploadSlot(async () => "done");
    await new Promise((r) => setTimeout(r, 20));
    expect(getSelfieUploadQueueStats().waiting).toBe(1);

    for (const release of releases) {
      release();
    }
    await Promise.all(holders);
    await expect(waiting).resolves.toBe("done");
  });
});
