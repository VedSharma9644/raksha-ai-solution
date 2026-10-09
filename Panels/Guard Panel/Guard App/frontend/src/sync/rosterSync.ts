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

/** Foreground poll interval while the Guard app is open (ms). */
export const ROSTER_FOREGROUND_POLL_MS = 15_000;
