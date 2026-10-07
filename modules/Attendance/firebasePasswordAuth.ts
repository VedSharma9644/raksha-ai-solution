/**
 * Verify email + password against Firebase Auth (Identity Toolkit).
 * Passwords created by HR/Admin live only in Firebase Auth — never in Firestore.
 */

export type FirebasePasswordAuthResult =
  | { ok: true; localId: string; email: string }
  | { ok: false; code?: string; message: string };

export async function verifyFirebaseEmailPassword(
  email: string,
  password: string,
  apiKey = process.env.FIREBASE_API_KEY
): Promise<FirebasePasswordAuthResult> {
  if (!apiKey) {
    return { ok: false, message: "FIREBASE_API_KEY is not configured." };
  }

  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: email.trim(),
        password,
        returnSecureToken: true,
      }),
    }
  );

  const data = (await response.json()) as {
    localId?: string;
    email?: string;
    error?: { message?: string; errors?: Array<{ message?: string }> };
  };

  if (!response.ok || !data.localId) {
    const code = data.error?.message ?? "INVALID_LOGIN";
    return {
      ok: false,
      code,
      message:
        code === "EMAIL_NOT_FOUND" ||
        code === "INVALID_PASSWORD" ||
        code === "INVALID_LOGIN_CREDENTIALS"
          ? "Invalid mobile / Guard ID or password."
          : data.error?.message ?? "Authentication failed.",
    };
  }

  return {
    ok: true,
    localId: data.localId,
    email: data.email ?? email.trim(),
  };
}
