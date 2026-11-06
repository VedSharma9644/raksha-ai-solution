/**
 * Shared roster refresh bus so Home / Schedule / Profile / Attendance
 * all refetch together when HR changes shifts or a push arrives.
 */

type RosterSyncListener = () => void;

const listeners = new Set<RosterSyncListener>();
let revision = 0;
let lastReason = 'boot';

export function getRosterSyncRevision(): number {
  return revision;
}

export function getLastRosterSyncReason(): string {
  return lastReason;
}

export function subscribeRosterSync(listener: RosterSyncListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Bump revision and notify every subscribed screen/hook. */
export function requestRosterSync(reason = 'manual'): void {
  revision += 1;
  lastReason = reason;
  listeners.forEach((listener) => {
    try {
      listener();
    } catch {
      // Keep other listeners running
    }
  });
}

/**
 * Silent /today + schedule poll while the Guard app is foregrounded (ms).
 * 60–90s is enough: interval windows are minutes long with ~15 min grace.
 * Timers must pause when AppState is not `active` (see useForegroundInterval).
 */
export const ROSTER_FOREGROUND_POLL_MS = 60_000;

/**
 * Inbox poll while foregrounded (ms). 60–120s keeps the bell reasonably
 * fresh without hammering Cloud Run; push + resume still refresh immediately.
 */
export const NOTIFICATIONS_FOREGROUND_POLL_MS = 90_000;
