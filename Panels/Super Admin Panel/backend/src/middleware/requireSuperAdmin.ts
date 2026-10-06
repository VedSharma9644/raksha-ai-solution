import type { Request, Response, NextFunction } from "express";
import { getAuth } from "firebase-admin/auth";

export interface SuperAdminRequest extends Request {
  superAdmin?: {
    uid?: string;
    email?: string;
    via: "api-key" | "firebase";
  };
}

/**
 * Accepts either:
 * - x-api-key matching SUPER_ADMIN_API_KEY
 * - Authorization: Bearer <Firebase ID token> whose email is in SUPER_ADMIN_EMAILS
 */
export async function requireSuperAdmin(
  req: SuperAdminRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const apiKey = req.header("x-api-key");
    const expectedKey = process.env.SUPER_ADMIN_API_KEY?.trim();

    if (expectedKey && apiKey && apiKey === expectedKey) {
      req.superAdmin = { via: "api-key" };
      next();
      return;
    }

    const authHeader = req.header("authorization") ?? "";
    const match = authHeader.match(/^Bearer\s+(.+)$/i);
    if (!match) {
      res.status(401).json({
        error:
          "Unauthorized. Provide x-api-key or Authorization Bearer token.",
      });
      return;
    }

    const decoded = await getAuth().verifyIdToken(match[1]);
    const email = (decoded.email ?? "").toLowerCase();
    const allowList = (process.env.SUPER_ADMIN_EMAILS ?? "")
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);

    if (allowList.length > 0 && !allowList.includes(email)) {
      res.status(403).json({ error: "Not a Super Admin account." });
      return;
    }

    req.superAdmin = {
      uid: decoded.uid,
      email: decoded.email,
      via: "firebase",
    };
    next();
  } catch (error: unknown) {
    const err = error as { message?: string };
    res.status(401).json({ error: err.message ?? "Invalid auth token." });
  }
}
