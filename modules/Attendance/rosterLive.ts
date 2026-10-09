import { getFirestore } from "firebase-admin/firestore";

/**
 * Live site shift definition — source of truth for Guard duty times.
 * Assignments only decide *which* shift/days; times/labels come from the site.
 */
export type LiveSiteShift = {
  id: string;
  label: string;
  startTime: string;
  endTime: string;
  shiftType?: string;
  requiredGuards?: number;
};

export type RosterAssignmentLike = {
  id?: string;
  siteId: string;
  shiftId?: string;
  shiftLabel: string;
  shiftStartTime: string;
  shiftEndTime: string;
  [key: string]: unknown;
};

type SiteShiftCache = Map<string, { siteName: string; shifts: Map<string, LiveSiteShift> }>;

function parseSiteShifts(data: Record<string, unknown> | undefined): {
  siteName: string;
  shifts: Map<string, LiveSiteShift>;
} {
  const siteName =
    (typeof data?.siteName === "string" && data.siteName) ||
    (typeof data?.name === "string" && data.name) ||
    "Assigned Site";
  const shifts = new Map<string, LiveSiteShift>();
  const config = data?.shiftConfig as
    | { shifts?: Array<Record<string, unknown>> }
    | null
    | undefined;
  for (const raw of config?.shifts ?? []) {
    const id = String(raw.id ?? "");
    if (!id) {
      continue;
    }
    shifts.set(id, {
      id,
      label: String(raw.label ?? "Duty"),
      startTime: String(raw.startTime ?? "08:00"),
      endTime: String(raw.endTime ?? "20:00"),
      shiftType: typeof raw.shiftType === "string" ? raw.shiftType : undefined,
      requiredGuards:
        typeof raw.requiredGuards === "number" ? raw.requiredGuards : undefined,
    });
  }
  return { siteName, shifts };
}

async function loadSiteCache(siteIds: string[]): Promise<SiteShiftCache> {
  const cache: SiteShiftCache = new Map();
  const unique = [...new Set(siteIds.filter(Boolean))];
  await Promise.all(
    unique.map(async (siteId) => {
      try {
        const snap = await getFirestore().collection("sites").doc(siteId).get();
        if (!snap.exists) {
          return;
        }
        cache.set(siteId, parseSiteShifts(snap.data() as Record<string, unknown>));
      } catch {
        // ignore per-site failures
      }
    })
  );
  return cache;
}

/**
 * Overlay live site.shiftConfig times/labels onto roster assignments.
 * If a shift was removed from the site, keeps the assignment snapshot as fallback.
 */
export async function hydrateAssignmentsFromLiveSites<T extends RosterAssignmentLike>(
  assignments: T[]
): Promise<T[]> {
  if (assignments.length === 0) {
    return assignments;
  }
  const cache = await loadSiteCache(assignments.map((a) => a.siteId));

  return assignments.map((assignment) => {
    const site = cache.get(assignment.siteId);
    if (!site) {
      return assignment;
    }
    const shiftId = String(assignment.shiftId ?? "");
    const live = shiftId ? site.shifts.get(shiftId) : undefined;
    if (!live) {
      return assignment;
    }
    return {
      ...assignment,
      shiftLabel: live.label || assignment.shiftLabel,
      shiftStartTime: live.startTime || assignment.shiftStartTime,
      shiftEndTime: live.endTime || assignment.shiftEndTime,
      siteName: site.siteName,
    };
  });
}

export async function getLiveShiftForSite(
  siteId: string,
  shiftId: string
): Promise<(LiveSiteShift & { siteName: string }) | null> {
  if (!siteId || !shiftId) {
    return null;
  }
  const cache = await loadSiteCache([siteId]);
  const site = cache.get(siteId);
  const live = site?.shifts.get(shiftId);
  if (!site || !live) {
    return null;
  }
  return { ...live, siteName: site.siteName };
}
