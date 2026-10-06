import { Router, type Response } from "express";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import {
  requireAgencyCaller,
  type AgencyAuthRequest,
} from "../middleware/requireAgencyCaller";

const FORM_SCHEMAS_COLLECTION = "formSchemas";
const FORM_TYPES = new Set(["guard", "hr", "site"]);

function schemaDocId(agencyId: string, formType: string): string {
  return `${agencyId}_${formType}`;
}

function isFormType(value: string): value is "guard" | "hr" | "site" {
  return FORM_TYPES.has(value);
}

function normalizeFields(raw: unknown): unknown[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((field) => field && typeof field === "object");
}

/**
 * Agency Form Builder schemas — Admin SDK bypasses client Firestore rules.
 * GET: agency admin or HR of that agency
 * PUT: agency admin only
 */
export function createFormSchemaRoutes(): Router {
  const router = Router();
  const db = getFirestore();

  router.use(requireAgencyCaller);

  router.get("/:formType", async (req: AgencyAuthRequest, res: Response) => {
    try {
      const formType = String(req.params.formType ?? "");
      const agencyId = req.agencyId;
      if (!agencyId || !isFormType(formType)) {
        res.status(400).json({ error: "Invalid form type." });
        return;
      }

      const snap = await db
        .collection(FORM_SCHEMAS_COLLECTION)
        .doc(schemaDocId(agencyId, formType))
        .get();

      if (!snap.exists) {
        res.json({ schema: null });
        return;
      }

      res.json({
        schema: {
          id: snap.id,
          ...snap.data(),
        },
      });
    } catch (error: unknown) {
      const err = error as { message?: string };
      res.status(500).json({
        error: err.message ?? "Failed to load form schema.",
      });
    }
  });

  router.put("/:formType", async (req: AgencyAuthRequest, res: Response) => {
    try {
      if (req.callerRole !== "agency") {
        res.status(403).json({
          error: "Only agency admins can edit form layouts.",
        });
        return;
      }

      const formType = String(req.params.formType ?? "");
      const agencyId = req.agencyId;
      if (!agencyId || !isFormType(formType)) {
        res.status(400).json({ error: "Invalid form type." });
        return;
      }

      const fields = normalizeFields(
        (req.body as { fields?: unknown })?.fields
      );
      const id = schemaDocId(agencyId, formType);
      const ref = db.collection(FORM_SCHEMAS_COLLECTION).doc(id);
      const existing = await ref.get();

      const data = {
        id,
        agencyId,
        formType,
        fields,
        updatedAt: FieldValue.serverTimestamp(),
        createdAt: existing.exists
          ? existing.data()?.createdAt ?? FieldValue.serverTimestamp()
          : FieldValue.serverTimestamp(),
      };

      await ref.set(data, { merge: true });

      res.json({
        schema: {
          id,
          agencyId,
          formType,
          fields,
        },
      });
    } catch (error: unknown) {
      const err = error as { message?: string };
      res.status(500).json({
        error: err.message ?? "Failed to save form schema.",
      });
    }
  });

  return router;
}
