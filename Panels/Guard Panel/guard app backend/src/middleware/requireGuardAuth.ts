import type { NextFunction, Request, Response } from "express";

import type { AuthenticatedGuardContext } from "@raskha/attendance";

import { getSession } from "../sessionStore";

export type AuthedRequest = Request & {
  guardToken?: string;
  guard?: AuthenticatedGuardContext;
};

export async function requireGuardAuth(
  req: AuthedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      res.status(401).json({ error: "Missing or invalid Authorization header." });
      return;
    }

    const token = header.slice("Bearer ".length).trim();
    const session = await getSession(token);
    if (!session) {
      res
        .status(401)
        .json({ error: "Session expired or invalid. Please log in again." });
      return;
    }

    req.guardToken = token;
    req.guard = session.guard;
    next();
  } catch (error: unknown) {
    const err = error as { message?: string };
    res.status(401).json({
      error: err.message ?? "Session expired or invalid. Please log in again.",
    });
  }
}
