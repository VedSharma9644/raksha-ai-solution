import { Router, type Response } from "express";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getTodayOpenPunchIn } from "@raskha/attendance";
import { GUARDS_COLLECTION } from "@raskha/guard-management";
import { notifyRosterUpdate } from "@raskha/notifications";
import {
  buildAgencyRosterCoverage,
  type GuardShiftAssignment,
} from "@raskha/scheduling";
import { requireAgencyCaller, type AgencyAuthRequest } from "../middleware/requireAgencyCaller";

const SHIFT_ASSIGNMENTS_COLLECTION = "shiftAssignments";

type DayOfWeek = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

const JS_TO_DOW: DayOfWeek[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

const TODAY_SHIFT_LOCKED_DELETE =
  "This guard has already punched in for today's shift. You cannot remove the assignment while they are on duty — set an end date after today instead, or wait until they punch out.";

const TODAY_SHIFT_LOCKED_CHANGE =
  "This guard has already punched in for today's shift. You can still edit future dates, but today's shift (slot / days covering today) cannot be changed until they punch out.";

function todayDutyDateKey(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function weekdayFromDutyDate(dutyDate: string): DayOfWeek {
  const [y, m, d] = dutyDate.split("-").map(Number);
  const utc = new Date(Date.UTC(y, m - 1, d, 6, 30));
  return JS_TO_DOW[utc.getUTCDay()] ?? "mon";
}

function assignmentCoversDutyDate(params: {
  effectiveFrom?: string | null;
  effectiveTo?: string | null;
  recurringDays?: unknown;
  dutyDate: string;
}): boolean {
  const from = String(params.effectiveFrom ?? "").trim();
  const to = params.effectiveTo ? String(params.effectiveTo).trim() : "";
  if (!from || params.dutyDate < from) {
    return false;
  }
  if (to && params.dutyDate > to) {
    return false;
  }
  const days = Array.isArray(params.recurringDays)
    ? params.recurringDays.filter((d): d is string => typeof d === "string")
    : [];
  return days.includes(weekdayFromDutyDate(params.dutyDate));
}

async function siteDisplayName(
  adminDb: ReturnType<typeof getFirestore>,
  siteId: string
): Promise<string> {
  try {
    const snap = await adminDb.collection("sites").doc(siteId).get();
    const name = (snap.data() as { siteName?: string } | undefined)?.siteName;
    return typeof name === "string" && name.trim() ? name.trim() : "Assigned Site";
  } catch {
    return "Assigned Site";
  }
}

/**
 * True only when the guard is punched in AND this assignment covers today.
 * Future-only assignments stay fully editable.
 */
async function isTodayShiftInProgress(params: {
  guardId: string;
  effectiveFrom?: string | null;
  effectiveTo?: string | null;
  recurringDays?: unknown;
}): Promise<boolean> {
  if (!params.guardId.trim()) {
    return false;
  }
  const open = await getTodayOpenPunchIn(params.guardId).catch(() => null);
  if (!open) {
    return false;
  }
  return assignmentCoversDutyDate({
    effectiveFrom: params.effectiveFrom,
    effectiveTo: params.effectiveTo,
    recurringDays: params.recurringDays,
    dutyDate: todayDutyDateKey(),
  });
}

/** Block PATCH only when the change would alter today's in-progress duty. */
function todayDutyChangeBlocked(params: {
  current: {
    shiftId?: string;
    effectiveFrom?: string | null;
    effectiveTo?: string | null;
    recurringDays?: unknown;
  };
  next: {
    shiftId: string;
    effectiveFrom: string;
    effectiveTo: string | null;
    recurringDays: unknown;
  };
}): string | null {
  const dutyDate = todayDutyDateKey();
  const stillCoversToday = assignmentCoversDutyDate({
    effectiveFrom: params.next.effectiveFrom,
    effectiveTo: params.next.effectiveTo,
    recurringDays: params.next.recurringDays,
    dutyDate,
  });

  if (!stillCoversToday) {
    return TODAY_SHIFT_LOCKED_CHANGE;
  }

  if (params.next.shiftId !== String(params.current.shiftId ?? "")) {
    return TODAY_SHIFT_LOCKED_CHANGE;
  }

  return null;
}

/** Keep guards.* profile times/site aligned with the live roster assignment. */
async function syncGuardProfileFromAssignment(params: {
  guardId: string;
  siteId: string;
  shiftStartTime: string;
  shiftEndTime: string;
  shiftLabel: string;
}): Promise<void> {
  const { guardId, siteId, shiftStartTime, shiftEndTime, shiftLabel } = params;
  if (!guardId.trim()) {
    return;
  }
  await getFirestore()
    .collection(GUARDS_COLLECTION)
    .doc(guardId)
    .set(
      {
        assignedSiteId: siteId,
        shiftFrom: shiftStartTime,
        shiftTo: shiftEndTime,
        post: shiftLabel,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    )
    .catch(() => undefined);
}

export function createSchedulingRoutes(): Router {
  const router = Router();

  router.use(requireAgencyCaller);

  // ── GET /api/scheduling/coverage?days=7 — next-N-day understaffed sites ─────
  router.get("/coverage", async (req: AgencyAuthRequest, res: Response) => {
    try {
      const agencyId = req.agencyId;
      if (!agencyId) {
        res.status(401).json({ error: "Unauthorized." });
        return;
      }

      const daysRaw = Number(req.query.days ?? 7);
      const days = Number.isFinite(daysRaw) ? Math.max(1, Math.min(daysRaw, 31)) : 7;
      const adminDb = getFirestore();

      const [sitesSnap, assignmentsSnap] = await Promise.all([
        adminDb.collection("sites").where("agencyId", "==", agencyId).get(),
        adminDb
          .collection(SHIFT_ASSIGNMENTS_COLLECTION)
          .where("agencyId", "==", agencyId)
          .get(),
      ]);

      const sites = sitesSnap.docs.map((d) => {
        const data = d.data() as Record<string, unknown>;
        return {
          id: d.id,
          siteName: String(data.siteName ?? "Site"),
          status: typeof data.status === "string" ? data.status : "active",
          shiftConfig: data.shiftConfig as
            | { shifts?: Array<{ id: string; label?: string; requiredGuards?: number }> }
            | null
            | undefined,
        };
      });

      const assignmentsBySiteId: Record<string, GuardShiftAssignment[]> = {};
      for (const d of assignmentsSnap.docs) {
        const data = d.data() as Record<string, unknown>;
        const siteId = String(data.siteId ?? "");
        if (!siteId) {
          continue;
        }
        const row = {
          id: d.id,
          ...data,
        } as unknown as GuardShiftAssignment;
        if (!assignmentsBySiteId[siteId]) {
          assignmentsBySiteId[siteId] = [];
        }
        assignmentsBySiteId[siteId]!.push(row);
      }

      const report = buildAgencyRosterCoverage({
        sites,
        assignmentsBySiteId,
        days,
      });
      res.json(report);
    } catch (err: unknown) {
      const e = err as { message?: string };
      res.status(500).json({
        error: e.message ?? "Failed to compute roster coverage.",
      });
    }
  });

  // ── GET /api/scheduling?siteId=xxx — list shift assignments for a site ──────
  router.get("/", async (req: AgencyAuthRequest, res: Response) => {
    try {
      const agencyId = req.agencyId;
      if (!agencyId) {
        res.status(401).json({ error: "Unauthorized." });
        return;
      }

      const { siteId } = req.query;
      if (!siteId || typeof siteId !== "string") {
        res.status(400).json({ error: "siteId query param is required." });
        return;
      }

      const adminDb = getFirestore();
      const snap = await adminDb
        .collection(SHIFT_ASSIGNMENTS_COLLECTION)
        .where("siteId", "==", siteId)
        .where("agencyId", "==", agencyId)
        .get();

      const siteDoc = await adminDb.collection("sites").doc(siteId).get();
      const siteData = siteDoc.data() as
        | {
            shiftConfig?: {
              shifts?: Array<{
                id: string;
                label?: string;
                startTime?: string;
                endTime?: string;
              }>;
            };
          }
        | undefined;
      const liveById = new Map(
        (siteData?.shiftConfig?.shifts ?? []).map((s) => [s.id, s])
      );

      // Batch-fetch guard genders so old assignments (without guardGender stored)
      // still get the correct value in the API response.
      const uniqueGuardIds = [...new Set(snap.docs.map((d) => String(d.data().guardId ?? "")))].filter(Boolean);
      const guardGenderCache = new Map<string, string | null>();
      if (uniqueGuardIds.length > 0) {
        await Promise.all(
          uniqueGuardIds.map(async (gid) => {
            try {
              const gDoc = await adminDb.collection(GUARDS_COLLECTION).doc(gid).get();
              const gender = (gDoc.data() as { gender?: string } | undefined)?.gender ?? null;
              const normalised = typeof gender === "string" ? gender.toLowerCase() : null;
              guardGenderCache.set(gid, normalised);
            } catch {
              guardGenderCache.set(gid, null);
            }
          })
        );
      }

      const assignments = await Promise.all(
        snap.docs.map(async (d) => {
          const data = d.data() as Record<string, unknown>;
          const live = liveById.get(String(data.shiftId ?? ""));
          const guardId = String(data.guardId ?? "");
          const todayLocked = await isTodayShiftInProgress({
            guardId,
            effectiveFrom: data.effectiveFrom as string | null | undefined,
            effectiveTo: data.effectiveTo as string | null | undefined,
            recurringDays: data.recurringDays,
          });

          // Inject guardGender: prefer stored value, fall back to live guard profile
          const storedGender = data.guardGender;
          const resolvedGender =
            (storedGender !== undefined && storedGender !== null && storedGender !== "")
              ? String(storedGender).toLowerCase()
              : (guardGenderCache.get(guardId) ?? null);

          const base = live
            ? {
                id: d.id,
                ...data,
                guardGender: resolvedGender,
                shiftLabel: live.label || data.shiftLabel,
                shiftStartTime: live.startTime || data.shiftStartTime,
                shiftEndTime: live.endTime || data.shiftEndTime,
              }
            : { id: d.id, ...data, guardGender: resolvedGender };
          return {
            ...base,
            shiftLocked: todayLocked,
            shiftLockedReason: todayLocked ? TODAY_SHIFT_LOCKED_CHANGE : undefined,
          };
        })
      );
      res.json(assignments);
    } catch (err: unknown) {
      const e = err as { message?: string };
      res.status(500).json({ error: e.message ?? "Failed to fetch shift assignments." });
    }
  });

  // ── POST /api/scheduling — create a new shift assignment ────────────────────
  router.post("/", async (req: AgencyAuthRequest, res: Response) => {
    try {
      const agencyId = req.agencyId;
      if (!agencyId) {
        res.status(401).json({ error: "Unauthorized." });
        return;
      }

      const {
        siteId,
        guardId,
        guardName,
        shiftId,
        shiftLabel,
        shiftStartTime,
        shiftEndTime,
        recurringDays,
        effectiveFrom,
        effectiveTo,
      } = req.body as Record<string, unknown>;

      if (!siteId || !guardId || !shiftId || !recurringDays || !effectiveFrom) {
        res.status(400).json({ error: "Missing required fields." });
        return;
      }

      const adminDb = getFirestore();

      const siteDoc = await adminDb.collection("sites").doc(String(siteId)).get();
      if (!siteDoc.exists) {
        res.status(404).json({ error: "Site not found." });
        return;
      }
      const siteData = siteDoc.data() as Record<string, unknown>;
      if (siteData.agencyId !== agencyId) {
        res.status(403).json({ error: "Forbidden." });
        return;
      }
      const shiftConfig = siteData.shiftConfig as {
        shifts?: Array<{
          id: string;
          label?: string;
          startTime?: string;
          endTime?: string;
          requiredGuards: number;
          genderRequirements?: { male: number; female: number; other: number } | null;
        }>;
      } | null | undefined;
      const shiftDef = shiftConfig?.shifts?.find((s) => s.id === String(shiftId));
      if (!shiftDef) {
        res.status(400).json({ error: "Shift not found on this site." });
        return;
      }
      // Per-day fullness check: for each requested recurring day, count how many
      // existing active assignments already cover that day. Block only if a
      // specific day is already at capacity — not by total document count.
      const existingSnap = await adminDb
        .collection(SHIFT_ASSIGNMENTS_COLLECTION)
        .where("siteId", "==", String(siteId))
        .where("shiftId", "==", String(shiftId))
        .get();

      const newEffectiveFrom = String(effectiveFrom ?? "");
      const newEffectiveTo = effectiveTo ? String(effectiveTo) : null;
      const requestedDays = Array.isArray(recurringDays)
        ? (recurringDays as string[])
        : [];

      const DAY_LABELS_MAP: Record<string, string> = {
        mon: "Monday", tue: "Tuesday", wed: "Wednesday", thu: "Thursday",
        fri: "Friday", sat: "Saturday", sun: "Sunday",
      };

      // Fetch the guard's gender for gender-quota checks
      const guardDoc = await adminDb.collection(GUARDS_COLLECTION).doc(String(guardId)).get();
      const guardGender = (guardDoc.data() as { gender?: string } | undefined)?.gender ?? null;
      const genderLabel: Record<string, string> = { male: "Male", female: "Female", other: "Other" };

      // ── Duplicate guard check ─────────────────────────────────────────────
      // Block if this exact guard is already assigned to this shift on any
      // overlapping day within the requested date range.
      for (const d of existingSnap.docs) {
        const a = d.data() as {
          guardId?: string;
          recurringDays?: string[];
          effectiveTo?: string | null;
          effectiveFrom?: string;
        };
        if (String(a.guardId ?? "") !== String(guardId)) continue;
        const aDays = Array.isArray(a.recurringDays) ? a.recurringDays : [];
        const overlapsDay = requestedDays.some((day) => aDays.includes(day));
        if (!overlapsDay) continue;
        // Date-range overlap check
        if (a.effectiveTo && newEffectiveFrom && a.effectiveTo < newEffectiveFrom) continue;
        if (newEffectiveTo && a.effectiveFrom && a.effectiveFrom > newEffectiveTo) continue;
        res.status(409).json({
          error: "This guard is already assigned to this shift on one or more of the selected days. Each guard can only appear once per shift.",
        });
        return;
      }

      for (const day of requestedDays) {
        let totalCount = 0;
        let genderCount = 0;
        for (const d of existingSnap.docs) {
          const a = d.data() as {
            recurringDays?: string[];
            effectiveTo?: string | null;
            effectiveFrom?: string;
            guardGender?: string | null;
          };
          const aDays = Array.isArray(a.recurringDays) ? a.recurringDays : [];
          if (!aDays.includes(day)) continue;
          // Skip assignments that end before the new one starts
          if (a.effectiveTo && newEffectiveFrom && a.effectiveTo < newEffectiveFrom) continue;
          // Skip assignments that start after the new one ends
          if (newEffectiveTo && a.effectiveFrom && a.effectiveFrom > newEffectiveTo) continue;
          totalCount++;
          if (guardGender && a.guardGender === guardGender) genderCount++;
        }

        const dayLabel = DAY_LABELS_MAP[day] ?? day;

        // Total capacity check
        if (totalCount >= shiftDef.requiredGuards) {
          res.status(409).json({
            error: `Shift already has ${totalCount}/${shiftDef.requiredGuards} guards on ${dayLabel}. Choose different days or remove an existing guard first.`,
          });
          return;
        }

        // Per-gender capacity check
        const genderReq = shiftDef.genderRequirements;
        if (genderReq && guardGender && guardGender in genderReq) {
          const quota = genderReq[guardGender as keyof typeof genderReq] ?? 0;
          if (quota === 0) {
            res.status(409).json({
              error: `This shift has no slots for ${genderLabel[guardGender] ?? guardGender} guards.`,
            });
            return;
          }
          if (genderCount >= quota) {
            res.status(409).json({
              error: `The ${genderLabel[guardGender] ?? guardGender} guard slot for ${dayLabel} is already full (${genderCount}/${quota}).`,
            });
            return;
          }
        }
      }

      const data = {
        agencyId,
        siteId,
        guardId,
        guardName: guardName ?? "",
        guardGender: guardGender ?? null,
        shiftId,
        shiftLabel: shiftDef.label || String(shiftLabel ?? "Duty"),
        shiftStartTime: shiftDef.startTime || String(shiftStartTime ?? "08:00"),
        shiftEndTime: shiftDef.endTime || String(shiftEndTime ?? "20:00"),
        recurringDays,
        effectiveFrom,
        effectiveTo: effectiveTo ?? null,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      };

      const ref = await adminDb.collection(SHIFT_ASSIGNMENTS_COLLECTION).add(data);
      await syncGuardProfileFromAssignment({
        guardId: String(guardId),
        siteId: String(siteId),
        shiftStartTime: String(data.shiftStartTime),
        shiftEndTime: String(data.shiftEndTime),
        shiftLabel: String(data.shiftLabel),
      });

      const siteName = String(
        (siteData.siteName as string | undefined) ?? "Assigned Site"
      );
      void notifyRosterUpdate({
        guardId: String(guardId),
        agencyId,
        action: "assigned",
        siteName,
        shiftLabel: String(data.shiftLabel),
        shiftStartTime: String(data.shiftStartTime),
        shiftEndTime: String(data.shiftEndTime),
      }).catch(() => undefined);

      res.status(201).json({ id: ref.id, ...data });
    } catch (err: unknown) {
      const e = err as { message?: string };
      res.status(500).json({ error: e.message ?? "Failed to create shift assignment." });
    }
  });

  // ── PATCH /api/scheduling/:id — update a shift assignment ───────────────────
  router.patch("/:id", async (req: AgencyAuthRequest, res: Response) => {
    try {
      const agencyId = req.agencyId;
      if (!agencyId) {
        res.status(401).json({ error: "Unauthorized." });
        return;
      }

      const assignmentId = req.params["id"] as string;
      const adminDb = getFirestore();

      const doc = await adminDb.collection(SHIFT_ASSIGNMENTS_COLLECTION).doc(assignmentId).get();
      if (!doc.exists || (doc.data() as { agencyId?: string })?.agencyId !== agencyId) {
        res.status(403).json({ error: "Not authorised to edit this assignment." });
        return;
      }

      const current = doc.data() as {
        siteId?: string;
        shiftId?: string;
        guardId?: string;
        shiftLabel?: string;
        shiftStartTime?: string;
        shiftEndTime?: string;
        effectiveFrom?: string | null;
        effectiveTo?: string | null;
        recurringDays?: unknown;
      };

      const body = req.body as Record<string, unknown>;
      const nextShiftId = String(body.shiftId ?? current.shiftId ?? "");
      const nextSiteId = String(current.siteId ?? "");
      const nextEffectiveFrom = String(
        body.effectiveFrom ?? current.effectiveFrom ?? ""
      );
      const nextEffectiveTo =
        body.effectiveTo === null || body.effectiveTo === ""
          ? null
          : body.effectiveTo !== undefined
            ? String(body.effectiveTo)
            : current.effectiveTo
              ? String(current.effectiveTo)
              : null;
      const nextRecurringDays =
        body.recurringDays !== undefined ? body.recurringDays : current.recurringDays;

      const todayLocked = await isTodayShiftInProgress({
        guardId: String(current.guardId ?? ""),
        effectiveFrom: current.effectiveFrom,
        effectiveTo: current.effectiveTo,
        recurringDays: current.recurringDays,
      });
      if (todayLocked) {
        const lockError = todayDutyChangeBlocked({
          current,
          next: {
            shiftId: nextShiftId,
            effectiveFrom: nextEffectiveFrom,
            effectiveTo: nextEffectiveTo,
            recurringDays: nextRecurringDays,
          },
        });
        if (lockError) {
          res.status(409).json({ error: lockError });
          return;
        }
      }

      let liveLabel: string | undefined;
      let liveStart: string | undefined;
      let liveEnd: string | undefined;
      if (nextSiteId && nextShiftId) {
        const siteDoc = await adminDb.collection("sites").doc(nextSiteId).get();
        const siteData = siteDoc.data() as
          | {
              shiftConfig?: {
                shifts?: Array<{
                  id: string;
                  label?: string;
                  startTime?: string;
                  endTime?: string;
                }>;
              };
            }
          | undefined;
        const live = siteData?.shiftConfig?.shifts?.find(
          (s) => s.id === nextShiftId
        );
        if (live) {
          liveLabel = live.label;
          liveStart = live.startTime;
          liveEnd = live.endTime;
        }
      }

      const updates = {
        ...body,
        ...(liveLabel ? { shiftLabel: liveLabel } : {}),
        ...(liveStart ? { shiftStartTime: liveStart } : {}),
        ...(liveEnd ? { shiftEndTime: liveEnd } : {}),
        updatedAt: FieldValue.serverTimestamp(),
      };
      await adminDb.collection(SHIFT_ASSIGNMENTS_COLLECTION).doc(assignmentId).update(updates);

      const guardId = String(current.guardId ?? "");
      const nextLabel = String(
        liveLabel ?? body.shiftLabel ?? current.shiftLabel ?? "Duty"
      );
      const nextStart = String(
        liveStart ?? body.shiftStartTime ?? current.shiftStartTime ?? ""
      );
      const nextEnd = String(
        liveEnd ?? body.shiftEndTime ?? current.shiftEndTime ?? ""
      );

      if (guardId && nextSiteId && nextStart && nextEnd) {
        await syncGuardProfileFromAssignment({
          guardId,
          siteId: nextSiteId,
          shiftStartTime: nextStart,
          shiftEndTime: nextEnd,
          shiftLabel: nextLabel,
        });
      }

      if (guardId) {
        const siteName = await siteDisplayName(adminDb, nextSiteId);
        void notifyRosterUpdate({
          guardId,
          agencyId,
          action: "updated",
          siteName,
          shiftLabel: nextLabel,
          shiftStartTime: nextStart,
          shiftEndTime: nextEnd,
        }).catch(() => undefined);
      }

      res.json({ success: true });
    } catch (err: unknown) {
      const e = err as { message?: string };
      res.status(500).json({ error: e.message ?? "Failed to update shift assignment." });
    }
  });

  // ── DELETE /api/scheduling/:id — delete a shift assignment ──────────────────
  router.delete("/:id", async (req: AgencyAuthRequest, res: Response) => {
    try {
      const agencyId = req.agencyId;
      if (!agencyId) {
        res.status(401).json({ error: "Unauthorized." });
        return;
      }

      const assignmentId = req.params["id"] as string;
      const adminDb = getFirestore();

      const doc = await adminDb.collection(SHIFT_ASSIGNMENTS_COLLECTION).doc(assignmentId).get();
      if (!doc.exists || (doc.data() as { agencyId?: string })?.agencyId !== agencyId) {
        res.status(403).json({ error: "Not authorised to delete this assignment." });
        return;
      }

      const prior = doc.data() as {
        guardId?: string;
        siteId?: string;
        shiftLabel?: string;
        shiftStartTime?: string;
        shiftEndTime?: string;
        effectiveFrom?: string | null;
        effectiveTo?: string | null;
        recurringDays?: unknown;
      };

      const todayLocked = await isTodayShiftInProgress({
        guardId: String(prior.guardId ?? ""),
        effectiveFrom: prior.effectiveFrom,
        effectiveTo: prior.effectiveTo,
        recurringDays: prior.recurringDays,
      });
      if (todayLocked) {
        res.status(409).json({ error: TODAY_SHIFT_LOCKED_DELETE });
        return;
      }

      await adminDb.collection(SHIFT_ASSIGNMENTS_COLLECTION).doc(assignmentId).delete();

      if (prior.guardId) {
        const siteName = await siteDisplayName(
          adminDb,
          String(prior.siteId ?? "")
        );
        void notifyRosterUpdate({
          guardId: String(prior.guardId),
          agencyId,
          action: "removed",
          siteName,
          shiftLabel: String(prior.shiftLabel ?? "Duty"),
          shiftStartTime: String(prior.shiftStartTime ?? ""),
          shiftEndTime: String(prior.shiftEndTime ?? ""),
        }).catch(() => undefined);
      }

      res.json({ success: true });
    } catch (err: unknown) {
      const e = err as { message?: string };
      res.status(500).json({ error: e.message ?? "Failed to delete shift assignment." });
    }
  });

  return router;
}
