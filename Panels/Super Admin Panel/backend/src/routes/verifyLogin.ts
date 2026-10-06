import type { Request, Response } from "express";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

const AGENCIES_COLLECTION = "agencies";
const MODULE_ACCESS_COLLECTION = "agencyModuleAccess";
const DEFAULT_ENABLED_MODULES = ["employee_management", "site_management"];

/**
 * Agency panel calls this after Firebase email/password succeeds.
 * Auth: Authorization Bearer <agency Firebase ID token>
 * On Active: stamps lastRakshaVerifiedAt, caches enabledModules on the agency doc.
 * On Paused/Inactive/missing: hard fail (no grace — grace is client-side for downtime only).
 */
export async function verifyAgencyLogin(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const authHeader = req.header("authorization") ?? "";
    const match = authHeader.match(/^Bearer\s+(.+)$/i);
    if (!match) {
      res.status(401).json({
        ok: false,
        reason: "unauthorized",
        error: "Missing Authorization Bearer token.",
      });
      return;
    }

    const decoded = await getAuth().verifyIdToken(match[1]);
    const agencyId = decoded.uid;
    const db = getFirestore();
    const snap = await db.collection(AGENCIES_COLLECTION).doc(agencyId).get();

    if (!snap.exists) {
      res.status(404).json({
        ok: false,
        reason: "not_found",
        error: "Agency not found.",
      });
      return;
    }

    const agency = snap.data() as { status?: string; name?: string };
    if (agency.status !== "active") {
      res.status(403).json({
        ok: false,
        reason: "paused",
        status: agency.status ?? "inactive",
        error: "Agency account is paused or inactive.",
      });
      return;
    }

    const moduleSnap = await db
      .collection(MODULE_ACCESS_COLLECTION)
      .doc(agencyId)
      .get();

    let enabledModules = [...DEFAULT_ENABLED_MODULES];
    if (moduleSnap.exists) {
      const data = moduleSnap.data() as { enabledFeatureIds?: unknown };
      if (Array.isArray(data.enabledFeatureIds)) {
        enabledModules = data.enabledFeatureIds.filter(
          (id): id is string => typeof id === "string" && id.length > 0
        );
      }
    }

    const verifiedAt = new Date().toISOString();
    await snap.ref.update({
      lastRakshaVerifiedAt: FieldValue.serverTimestamp(),
      enabledModules,
      updatedAt: FieldValue.serverTimestamp(),
    });

    res.json({
      ok: true,
      reason: "active",
      status: "active",
      agencyId,
      agencyName: agency.name ?? "",
      verifiedAt,
      enabledModules,
    });
  } catch (error: unknown) {
    const err = error as { message?: string; code?: string };
    if (
      err.code === "auth/id-token-expired" ||
      err.code === "auth/argument-error" ||
      err.code === "auth/invalid-id-token"
    ) {
      res.status(401).json({
        ok: false,
        reason: "unauthorized",
        error: err.message ?? "Invalid auth token.",
      });
      return;
    }
    res.status(500).json({
      ok: false,
      reason: "error",
      error: err.message ?? "Verification failed.",
    });
  }
}
