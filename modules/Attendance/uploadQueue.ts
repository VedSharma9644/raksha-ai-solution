/**
 * Limits concurrent selfie Storage uploads so an 8am spike
 * (e.g. 150 guards) is processed in waves (~20 at a time).
 */

const DEFAULT_MAX_CONCURRENT = 20;
const DEFAULT_MAX_WAIT_MS = 45_000;

type Waiter = {
  resolve: () => void;
  reject: (error: Error) => void;
  timer: ReturnType<typeof setTimeout>;
};

let maxConcurrent = Number(process.env.SELFIE_UPLOAD_CONCURRENCY || DEFAULT_MAX_CONCURRENT);
if (!Number.isFinite(maxConcurrent) || maxConcurrent < 1) {
  maxConcurrent = DEFAULT_MAX_CONCURRENT;
}

let inFlight = 0;
const queue: Waiter[] = [];

function waitLimit(): number {
  const raw = Number(process.env.SELFIE_UPLOAD_MAX_WAIT_MS || DEFAULT_MAX_WAIT_MS);
  return Number.isFinite(raw) && raw > 0 ? raw : DEFAULT_MAX_WAIT_MS;
}

function pump(): void {
  while (inFlight < maxConcurrent && queue.length > 0) {
    const next = queue.shift();
    if (!next) {
      return;
    }
    clearTimeout(next.timer);
    inFlight += 1;
    next.resolve();
  }
}

async function acquire(): Promise<void> {
  if (inFlight < maxConcurrent) {
    inFlight += 1;
    return;
  }

  await new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => {
      const idx = queue.findIndex((w) => w.resolve === resolve);
      if (idx >= 0) {
        queue.splice(idx, 1);
      }
      reject(
        Object.assign(
          new Error(
            "Attendance upload is busy. Please wait a moment and try again."
          ),
          { statusCode: 503 }
        )
      );
    }, waitLimit());

    queue.push({ resolve, reject, timer });
  });
}

function release(): void {
  inFlight = Math.max(0, inFlight - 1);
  pump();
}

/** Run `fn` with at most N concurrent selfie uploads (default 20). */
export async function withSelfieUploadSlot<T>(fn: () => Promise<T>): Promise<T> {
  await acquire();
  try {
    return await fn();
  } finally {
    release();
  }
}

/** Test helpers */
export function getSelfieUploadQueueStats(): {
  inFlight: number;
  waiting: number;
  maxConcurrent: number;
} {
  return { inFlight, waiting: queue.length, maxConcurrent };
}

export function resetSelfieUploadQueueForTests(): void {
  for (const w of queue) {
    clearTimeout(w.timer);
    w.reject(new Error("queue reset"));
  }
  queue.length = 0;
  inFlight = 0;
}
