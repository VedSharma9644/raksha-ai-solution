import { Router, type Response } from "express";
import {
  getFirestore,
  FieldValue,
  Timestamp,
} from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import type { SuperAdminRequest } from "../middleware/requireSuperAdmin.js";
import { generateOtp, hashOtp, otpsMatch } from "../services/otp.js";
import { deliverOtp } from "../services/notify.js";

/** Super Admin owns agency lifecycle ops; collection name mirrors Firestore. */
const AGENCIES_COLLECTION = "agencies";
const OTP_COLLECTION = "agencyDeleteOtps";
const OTP_TTL_MS = 10 * 60 * 1000;
const OTP_MAX_ATTEMPTS = 5;

type AgencyPlan = "basic" | "standard" | "premium";
type AgencyStatus = "active" | "inactive";

interface AgencyDoc {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  plan: AgencyPlan;
  logo: string;
  ownerName: string;
  status: AgencyStatus;
}

const PLAN_FROM_FORM: Record<string, AgencyPlan> = {
  "plan-starter": "basic",
  "plan-growth": "standard",
  "plan-enterprise": "premium",
  basic: "basic",
  standard: "standard",
  premium: "premium",
};

const PLAN_LABEL: Record<AgencyPlan, string> = {
  basic: "Starter",
  standard: "Growth",
  premium: "Enterprise",
};

function mapPlan(input?: string): AgencyPlan {
  if (!input) return "basic";
  return PLAN_FROM_FORM[input] ?? "basic";
}

function toListItem(agency: AgencyDoc) {
  return {
    id: agency.id,
    agencyName: agency.name,
    contactPerson: agency.ownerName,
    email: agency.email,
    city: agency.address,
    planName: PLAN_LABEL[agency.plan] ?? agency.plan,
    plan: agency.plan,
    status: agency.status === "active" ? "active" : "suspended",
    enabledFeatureCount: 0,
    phone: agency.phone,
    logo: agency.logo,
  };
}

function notifyEmail(): string {
  return (
    process.env.SUPER_ADMIN_NOTIFY_EMAIL?.trim() ||
    process.env.SUPER_ADMIN_EMAILS?.split(",")[0]?.trim() ||
    ""
  );
}

export function createAgencyRoutes(): Router {
  const router = Router();
  const db = getFirestore();
  const auth = getAuth();

  router.get("/", async (_req, res: Response) => {
    try {
      const snapshot = await db
        .collection(AGENCIES_COLLECTION)
        .orderBy("createdAt", "desc")
        .get();

      const agencies = snapshot.docs.map((doc) =>
        toListItem(doc.data() as AgencyDoc)
      );
      res.json({ agencies });
    } catch (error: unknown) {
      const err = error as { message?: string };
      res.status(500).json({ error: err.message ?? "Failed to list agencies." });
    }
  });

  router.get("/:id", async (req, res: Response) => {
    try {
      const snap = await db
        .collection(AGENCIES_COLLECTION)
        .doc(req.params.id)
        .get();
      if (!snap.exists) {
        res.status(404).json({ error: "Agency not found." });
        return;
      }
      const agency = snap.data() as AgencyDoc;
      res.json({ agency: toListItem(agency), raw: agency });
    } catch (error: unknown) {
      const err = error as { message?: string };
      res.status(500).json({ error: err.message ?? "Failed to load agency." });
    }
  });

  router.post("/", async (req, res: Response) => {
    try {
      const body = req.body as {
        agencyName?: string;
        contactPerson?: string;
        email?: string;
        phone?: string;
        city?: string;
        address?: string;
        planId?: string;
        plan?: string;
        password?: string;
        logo?: string;
        notes?: string;
      };

      const name = body.agencyName?.trim();
      const ownerName = body.contactPerson?.trim();
      const email = body.email?.trim().toLowerCase();
      const phone = body.phone?.trim();
      const address = (body.address ?? body.city ?? "").trim();
      const password = body.password ?? "";
      const plan = mapPlan(body.planId ?? body.plan);
      const logo = body.logo?.trim() ?? "";
      const notes = body.notes?.trim() ?? "";

      if (!name || !ownerName || !email || !phone || !address) {
        res.status(400).json({ error: "Missing required agency fields." });
        return;
      }
      if (password.length < 8) {
        res
          .status(400)
          .json({ error: "Password must be at least 8 characters." });
        return;
      }

      const user = await auth.createUser({
        email,
        password,
        displayName: ownerName,
        emailVerified: false,
        disabled: false,
      });

      const agencyData = {
        id: user.uid,
        name,
        email,
        phone,
        address: notes ? `${address}\n${notes}` : address,
        plan,
        logo,
        ownerName,
        status: "active" as AgencyStatus,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      };

      await db.collection(AGENCIES_COLLECTION).doc(user.uid).set(agencyData);

      res.status(201).json({
        agency: toListItem({
          id: user.uid,
          name,
          email,
          phone,
          address: agencyData.address,
          plan,
          logo,
          ownerName,
          status: "active",
        }),
      });
    } catch (error: unknown) {
      const err = error as { message?: string; code?: string };
      if (err.code === "auth/email-already-exists") {
        res
          .status(409)
          .json({ error: "An account with this email already exists." });
        return;
      }
      res.status(500).json({ error: err.message ?? "Failed to create agency." });
    }
  });

  router.put("/:id", async (req, res: Response) => {
    try {
      const agencyId = req.params.id;
      const ref = db.collection(AGENCIES_COLLECTION).doc(agencyId);
      const snap = await ref.get();

      if (!snap.exists) {
        res.status(404).json({ error: "Agency not found." });
        return;
      }

      const body = req.body as {
        agencyName?: string;
        contactPerson?: string;
        email?: string;
        phone?: string;
        city?: string;
        address?: string;
        planId?: string;
        plan?: string;
        logo?: string;
        status?: AgencyStatus;
        password?: string;
      };

      const patch: Record<string, unknown> = {
        updatedAt: FieldValue.serverTimestamp(),
      };

      if (body.agencyName?.trim()) patch.name = body.agencyName.trim();
      if (body.contactPerson?.trim()) {
        patch.ownerName = body.contactPerson.trim();
      }
      if (body.phone?.trim()) patch.phone = body.phone.trim();
      if (body.logo !== undefined) patch.logo = body.logo.trim();
      if (body.status === "active" || body.status === "inactive") {
        patch.status = body.status;
      }
      if (body.planId || body.plan) {
        patch.plan = mapPlan(body.planId ?? body.plan);
      }
      if (body.address?.trim() || body.city?.trim()) {
        patch.address = (body.address ?? body.city)!.trim();
      }

      const authUpdate: {
        email?: string;
        password?: string;
        displayName?: string;
        disabled?: boolean;
      } = {};

      if (body.email?.trim()) {
        const nextEmail = body.email.trim().toLowerCase();
        patch.email = nextEmail;
        authUpdate.email = nextEmail;
      }
      if (body.contactPerson?.trim()) {
        authUpdate.displayName = body.contactPerson.trim();
      }
      if (body.password && body.password.length >= 8) {
        authUpdate.password = body.password;
      }
      if (body.status === "inactive") authUpdate.disabled = true;
      if (body.status === "active") authUpdate.disabled = false;

      if (Object.keys(authUpdate).length > 0) {
        await auth.updateUser(agencyId, authUpdate);
      }

      await ref.update(patch);
      const updated = (await ref.get()).data() as AgencyDoc;
      res.json({ agency: toListItem(updated) });
    } catch (error: unknown) {
      const err = error as { message?: string; code?: string };
      if (err.code === "auth/email-already-exists") {
        res.status(409).json({ error: "Email is already in use." });
        return;
      }
      res.status(500).json({ error: err.message ?? "Failed to update agency." });
    }
  });

  router.post(
    "/:id/delete-request",
    async (req: SuperAdminRequest, res: Response) => {
      try {
        const agencyId = req.params.id;
        const snap = await db
          .collection(AGENCIES_COLLECTION)
          .doc(agencyId)
          .get();
        if (!snap.exists) {
          res.status(404).json({ error: "Agency not found." });
          return;
        }

        const agency = snap.data() as AgencyDoc;
        const to = notifyEmail();
        if (!to) {
          res.status(500).json({
            error:
              "SUPER_ADMIN_NOTIFY_EMAIL (or SUPER_ADMIN_EMAILS) is not configured.",
          });
          return;
        }

        const otp = generateOtp(6);
        const expiresAt = Timestamp.fromMillis(Date.now() + OTP_TTL_MS);

        await db.collection(OTP_COLLECTION).doc(agencyId).set({
          agencyId,
          agencyName: agency.name,
          otpHash: hashOtp(otp),
          attempts: 0,
          expiresAt,
          createdAt: FieldValue.serverTimestamp(),
          requestedBy:
            req.superAdmin?.email ?? req.superAdmin?.via ?? "unknown",
        });

        const delivery = await deliverOtp({
          to,
          subject: `Raskha OTP: delete agency "${agency.name}"`,
          body: `Use OTP ${otp} to confirm deleting agency "${agency.name}" (${agency.email}). Expires in 10 minutes.`,
          otp,
        });

        const debug =
          process.env.SUPER_ADMIN_OTP_DEBUG === "true" ||
          process.env.NODE_ENV !== "production";

        res.json({
          ok: true,
          expiresInSeconds: OTP_TTL_MS / 1000,
          notified: to,
          delivery,
          ...(debug ? { debugOtp: otp } : {}),
        });
      } catch (error: unknown) {
        const err = error as { message?: string };
        res.status(500).json({
          error: err.message ?? "Failed to start delete confirmation.",
        });
      }
    }
  );

  router.post("/:id/delete-confirm", async (req, res: Response) => {
    try {
      const agencyId = req.params.id;
      const otp = String((req.body as { otp?: string }).otp ?? "").trim();

      if (!/^\d{6}$/.test(otp)) {
        res.status(400).json({ error: "Enter the 6-digit OTP." });
        return;
      }

      const otpRef = db.collection(OTP_COLLECTION).doc(agencyId);
      const otpSnap = await otpRef.get();

      if (!otpSnap.exists) {
        res
          .status(400)
          .json({ error: "No delete OTP requested for this agency." });
        return;
      }

      const challenge = otpSnap.data() as {
        otpHash: string;
        attempts: number;
        expiresAt: Timestamp;
        agencyName?: string;
      };

      if (challenge.attempts >= OTP_MAX_ATTEMPTS) {
        await otpRef.delete();
        res.status(429).json({ error: "Too many invalid OTP attempts." });
        return;
      }

      if (challenge.expiresAt.toMillis() < Date.now()) {
        await otpRef.delete();
        res.status(400).json({ error: "OTP expired. Request a new one." });
        return;
      }

      if (!otpsMatch(otp, challenge.otpHash)) {
        await otpRef.update({ attempts: FieldValue.increment(1) });
        res.status(400).json({ error: "Invalid OTP." });
        return;
      }

      const agencyRef = db.collection(AGENCIES_COLLECTION).doc(agencyId);
      const agencySnap = await agencyRef.get();
      if (!agencySnap.exists) {
        await otpRef.delete();
        res.status(404).json({ error: "Agency not found." });
        return;
      }

      await agencyRef.delete();
      try {
        await auth.deleteUser(agencyId);
      } catch (authErr: unknown) {
        const e = authErr as { code?: string };
        if (e.code !== "auth/user-not-found") {
          throw authErr;
        }
      }

      await otpRef.delete();

      res.json({
        ok: true,
        deletedAgencyId: agencyId,
        agencyName: challenge.agencyName,
      });
    } catch (error: unknown) {
      const err = error as { message?: string };
      res.status(500).json({ error: err.message ?? "Failed to delete agency." });
    }
  });

  return router;
}
