import { Router, Request, Response } from "express";
import { getAuth } from "firebase-admin/auth";

export function createHrStaffRoutes(): Router {
  const router = Router();

  // PUT /api/hr-staff/:id/password — update an HR user's Firebase Auth password
  router.put("/:id/password", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { password } = req.body as { password?: string };

      if (!password || password.length < 8) {
        res
          .status(400)
          .json({ error: "Password must be at least 8 characters." });
        return;
      }

      await getAuth().updateUser(id, { password });
      res.json({ success: true });
    } catch (error: unknown) {
      const err = error as { message?: string; code?: string };
      if (err.code === "auth/user-not-found") {
        res.status(404).json({ error: "HR user not found in Firebase Auth." });
        return;
      }
      res
        .status(500)
        .json({ error: err.message ?? "Failed to update password." });
    }
  });

  return router;
}
