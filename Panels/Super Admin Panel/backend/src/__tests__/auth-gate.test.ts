import { beforeEach, describe, expect, it, vi } from "vitest";
import express from "express";
import request from "supertest";

const verifyIdToken = vi.fn();
const agencyGet = vi.fn();
const moduleGet = vi.fn();
const agencyUpdate = vi.fn();

vi.mock("firebase-admin/auth", () => ({
  getAuth: () => ({ verifyIdToken }),
}));

vi.mock("firebase-admin/firestore", () => ({
  getFirestore: () => ({
    collection: (name: string) => ({
      doc: () => ({
        get: name === "agencies" ? agencyGet : moduleGet,
        update: agencyUpdate,
        ref: { update: agencyUpdate },
      }),
    }),
  }),
  FieldValue: {
    serverTimestamp: () => "server-ts",
  },
}));

process.env.SUPER_ADMIN_API_KEY = "test-sa-key";
process.env.SUPER_ADMIN_EMAILS = "admin@raskha.test";

const { requireSuperAdmin } = await import("../middleware/requireSuperAdmin");
const { verifyAgencyLogin } = await import("../routes/verifyLogin");

function buildApp() {
  const app = express();
  app.use(express.json());
  app.post("/api/agencies/verify-login", verifyAgencyLogin);
  app.get("/api/modules", requireSuperAdmin, (_req, res) => {
    res.json({ ok: true });
  });
  app.get("/api/agencies", requireSuperAdmin, (_req, res) => {
    res.json({ agencies: [] });
  });
  return app;
}

describe("Super Admin auth", () => {
  const app = buildApp();

  beforeEach(() => {
    verifyIdToken.mockReset();
    agencyGet.mockReset();
    moduleGet.mockReset();
    agencyUpdate.mockReset();
  });

  describe("POST /api/agencies/verify-login (Admin panel post-login)", () => {
    it("401 without Bearer token", async () => {
      const res = await request(app).post("/api/agencies/verify-login").send({});
      expect(res.status).toBe(401);
      expect(res.body.reason).toBe("unauthorized");
    });

    it("404 when agency doc missing", async () => {
      verifyIdToken.mockResolvedValue({ uid: "missing-agency" });
      agencyGet.mockResolvedValue({ exists: false });

      const res = await request(app)
        .post("/api/agencies/verify-login")
        .set("Authorization", "Bearer agency-token");

      expect(res.status).toBe(404);
      expect(res.body.reason).toBe("not_found");
    });

    it("403 when agency is paused", async () => {
      verifyIdToken.mockResolvedValue({ uid: "agency-1" });
      agencyGet.mockResolvedValue({
        exists: true,
        data: () => ({ status: "paused", name: "Paused Co" }),
        ref: { update: agencyUpdate },
      });

      const res = await request(app)
        .post("/api/agencies/verify-login")
        .set("Authorization", "Bearer agency-token");

      expect(res.status).toBe(403);
      expect(res.body.reason).toBe("paused");
    });

    it("200 when agency is active", async () => {
      verifyIdToken.mockResolvedValue({ uid: "agency-1" });
      agencyUpdate.mockResolvedValue(undefined);
      agencyGet.mockResolvedValue({
        exists: true,
        data: () => ({ status: "active", name: "Active Co" }),
        ref: { update: agencyUpdate },
      });
      moduleGet.mockResolvedValue({ exists: false });

      const res = await request(app)
        .post("/api/agencies/verify-login")
        .set("Authorization", "Bearer agency-token");

      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.reason).toBe("active");
    });
  });

  describe("protected Super Admin routes", () => {
    it("GET /api/modules without auth → 401", async () => {
      const res = await request(app).get("/api/modules");
      expect(res.status).toBe(401);
    });

    it("GET /api/agencies without auth → 401", async () => {
      const res = await request(app).get("/api/agencies");
      expect(res.status).toBe(401);
    });

    it("GET /api/modules with x-api-key → 200", async () => {
      const res = await request(app)
        .get("/api/modules")
        .set("x-api-key", "test-sa-key");
      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
    });

    it("GET /api/modules with wrong x-api-key → 401", async () => {
      const res = await request(app)
        .get("/api/modules")
        .set("x-api-key", "wrong-key-not-a-real-secret");
      expect(res.status).toBe(401);
    });

    it("GET /api/agencies with wrong x-api-key → 401", async () => {
      const res = await request(app)
        .get("/api/agencies")
        .set("x-api-key", "also-wrong");
      expect(res.status).toBe(401);
    });

    it("GET /api/modules with allowlisted Bearer → 200", async () => {
      verifyIdToken.mockResolvedValue({
        uid: "sa-1",
        email: "admin@raskha.test",
      });
      const res = await request(app)
        .get("/api/modules")
        .set("Authorization", "Bearer sa-token");
      expect(res.status).toBe(200);
    });

    it("GET /api/modules with non-allowlisted email → 403", async () => {
      verifyIdToken.mockResolvedValue({
        uid: "other",
        email: "other@example.com",
      });
      const res = await request(app)
        .get("/api/modules")
        .set("Authorization", "Bearer other-token");
      expect(res.status).toBe(403);
    });
  });
});
