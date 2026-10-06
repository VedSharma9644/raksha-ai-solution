import { Router, type Response } from "express";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import type { SuperAdminRequest } from "../middleware/requireSuperAdmin.js";

const MODULE_ACCESS_COLLECTION = "agencyModuleAccess";
const AGENCIES_COLLECTION = "agencies";
const DEFAULT_ENABLED_MODULES = ["employee_management", "site_management"];

function paramId(value: string | string[]): string {
  return Array.isArray(value) ? value[0] ?? "" : value;
}

function normalizeIds(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [...DEFAULT_ENABLED_MODULES];
  return [
    ...new Set(
      raw.filter((id): id is string => typeof id === "string" && id.length > 0)
    ),
  ];
}

/**
 * Super Admin module toggles — Admin SDK only (client Firestore has no SA rules).
 */
export function createModuleRoutes(): Router {
  const router = Router();
  const db = getFirestore();

  router.get("/", async (_req: SuperAdminRequest, res: Response) => {
    try {
      const snap = await db.collection(MODULE_ACCESS_COLLECTION).get();
      const modules = snap.docs.map((item) => {
        const data = item.data() as { agencyId?: string; enabledFeatureIds?: unknown };
        return {
          agencyId: data.agencyId || item.id,
          enabledFeatureIds: normalizeIds(data.enabledFeatureIds),
        };
      });
      res.json({ modules });
    } catch (error: unknown) {
      const err = error as { message?: string };
      res.status(500).json({
        error: err.message ?? "Failed to list module access.",
      });
    }
  });

  router.get("/:agencyId", async (req: SuperAdminRequest, res: Response) => {
    try {
      const agencyId = paramId(req.params.agencyId);
      if (!agencyId) {
        res.status(400).json({ error: "agencyId is required." });
        return;
      }

      const snap = await db
        .collection(MODULE_ACCESS_COLLECTION)
        .doc(agencyId)
        .get();

      if (!snap.exists) {
        res.json({
          agencyId,
          enabledFeatureIds: [...DEFAULT_ENABLED_MODULES],
        });
        return;
      }

      const data = snap.data() as { enabledFeatureIds?: unknown };
      res.json({
        agencyId,
        enabledFeatureIds: normalizeIds(data.enabledFeatureIds),
      });
    } catch (error: unknown) {
      const err = error as { message?: string };
      res.status(500).json({
        error: err.message ?? "Failed to load module access.",
      });
    }
  });

  router.put("/:agencyId", async (req: SuperAdminRequest, res: Response) => {
    try {
      const agencyId = paramId(req.params.agencyId);
      if (!agencyId) {
        res.status(400).json({ error: "agencyId is required." });
        return;
      }

      const enabledFeatureIds = normalizeIds(
        (req.body as { enabledFeatureIds?: unknown })?.enabledFeatureIds
      );

      await db.collection(MODULE_ACCESS_COLLECTION).doc(agencyId).set(
        {
          agencyId,
          enabledFeatureIds,
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

      // Keep agency cache in sync for Admin/HR panels (read after login / refresh).
      await db.collection(AGENCIES_COLLECTION).doc(agencyId).set(
        {
          enabledModules: enabledFeatureIds,
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

      res.json({ agencyId, enabledFeatureIds });
    } catch (error: unknown) {
      const err = error as { message?: string };
      res.status(500).json({
        error: err.message ?? "Failed to save module access.",
      });
    }
  });

  return router;
}
