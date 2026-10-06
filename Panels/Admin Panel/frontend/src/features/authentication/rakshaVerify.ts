import type { Timestamp } from "firebase/firestore";

/** Days of offline grace after a successful Raksha verification. Prefer env for testing. */
export const AGENCY_VERIFY_GRACE_DAYS = Number(
  import.meta.env.VITE_AGENCY_VERIFY_GRACE_DAYS ?? 30
);

const VERIFY_TIMEOUT_MS = 8_000;

function superAdminApiBase(): string {
  return (
    import.meta.env.VITE_SUPER_ADMIN_API_URL?.replace(/\/$/, "") ||
    "http://localhost:3003"
  );
}

export type RakshaVerifyOutcome =
  | { kind: "passed" }
  | { kind: "paused" }
  | { kind: "unreachable" };

interface VerifyApiBody {
  ok?: boolean;
  reason?: string;
}

/**
 * Calls Super Admin after Firebase sign-in.
 * - passed: agency Active
 * - paused: Super Admin says inactive/paused (hard fail, no grace)
 * - unreachable: timeout / network / 5xx (caller may apply grace)
 */
export async function verifyAgencyWithRaksha(
  idToken: string
): Promise<RakshaVerifyOutcome> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), VERIFY_TIMEOUT_MS);

  try {
    const res = await fetch(`${superAdminApiBase()}/api/agencies/verify-login`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${idToken}`,
        "Content-Type": "application/json",
      },
      signal: controller.signal,
    });

    if (res.status === 403 || res.status === 404) {
      return { kind: "paused" };
    }

    if (!res.ok) {
      return { kind: "unreachable" };
    }

    const body = (await res.json()) as VerifyApiBody;
    if (body.ok === true) {
      return { kind: "passed" };
    }

    if (body.reason === "paused" || body.reason === "not_found") {
      return { kind: "paused" };
    }

    return { kind: "unreachable" };
  } catch {
    return { kind: "unreachable" };
  } finally {
    clearTimeout(timer);
  }
}

export function isWithinRakshaGrace(
  lastRakshaVerifiedAt: Timestamp | undefined,
  graceDays: number = AGENCY_VERIFY_GRACE_DAYS
): boolean {
  if (!lastRakshaVerifiedAt || graceDays <= 0) {
    return false;
  }

  const verifiedMs = lastRakshaVerifiedAt.toMillis();
  const windowMs = graceDays * 24 * 60 * 60 * 1000;
  return Date.now() - verifiedMs <= windowMs;
}
