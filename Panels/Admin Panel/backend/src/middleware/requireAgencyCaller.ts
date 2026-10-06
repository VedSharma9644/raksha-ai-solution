import type { Request, Response, NextFunction } from "express";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

const AGENCIES_COLLECTION = "agencies";
const HR_STAFF_COLLECTION = "hrStaff";

export interface AgencyAuthRequest extends Request {
  agencyId?: string;
  callerUid?: string;
  callerRole?: "agency" | "hr";
}

/**
 * Accepts Firebase ID token from Agency Admin (uid = agencyId)
 * or active HR staff (agencyId from hrStaff doc).
 */
export async function requireAgencyCaller(
  req: AgencyAuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.header("authorization") ?? "";
    const match = authHeader.match(/^Bearer\s+(.+)$/i);
    if (!match) {
      res.status(401).json({ error: "Missing Authorization Bearer token." });
      return;
    }

    const decoded = await getAuth().verifyIdToken(match[1]);
    const uid = decoded.uid;
    const db = getFirestore();

    const agencySnap = await db.collection(AGENCIES_COLLECTION).doc(uid).get();
    if (agencySnap.exists) {
      const status = (agencySnap.data() as { status?: string })?.status;
      if (status && status !== "active") {
        res.status(403).json({ error: "Agency account is not active." });
        return;
      }
      req.agencyId = uid;
      req.callerUid = uid;
      req.callerRole = "agency";
      next();
      return;
    }

    const hrSnap = await db.collection(HR_STAFF_COLLECTION).doc(uid).get();
    if (hrSnap.exists) {
      const hr = hrSnap.data() as {
        agencyId?: string;
        status?: string;
      };
      if (hr.status !== "active" || !hr.agencyId) {
        res.status(403).json({ error: "HR account is not active." });
        return;
      }
      req.agencyId = hr.agencyId;
      req.callerUid = uid;
      req.callerRole = "hr";
      next();
      return;
    }

    res.status(403).json({ error: "Not an agency or HR account." });
  } catch (error: unknown) {
    const err = error as { message?: string; code?: string };
    if (
      err.code === "auth/id-token-expired" ||
      err.code === "auth/argument-error" ||
      err.code === "auth/invalid-id-token"
    ) {
      res.status(401).json({ error: err.message ?? "Invalid auth token." });
      return;
    }
    res.status(401).json({ error: err.message ?? "Unauthorized." });
  }
}
