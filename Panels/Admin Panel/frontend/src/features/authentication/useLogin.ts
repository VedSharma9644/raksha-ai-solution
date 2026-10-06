import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { loginAgency } from "@raskha/core";
import { APP_ROUTES } from "../../app/routePaths";
import { auth, db } from "../../lib/firebase";
import { useAuthContext } from "./AuthContext";
import {
  isWithinRakshaGrace,
  verifyAgencyWithRaksha,
} from "./rakshaVerify";

const VERIFY_PASS_MESSAGE = "Verification from Raksha Passed";
const VERIFY_FAIL_MESSAGE = "Verification failed, please contact Raksha";
const PASS_DISPLAY_MS = 900;

function resolveErrorMessage(error: unknown): string {
  const err = error as { code?: string; message?: string };

  switch (err.code) {
    case "auth/invalid-credential":
    case "auth/user-not-found":
    case "auth/wrong-password":
      return "Invalid email or password.";
    case "auth/user-disabled":
      return "This agency account is paused. Contact Raksha to reactivate.";
    case "auth/too-many-requests":
      return "Too many attempts. Please try again later.";
    case "auth/network-request-failed":
      return "Network error. Check your connection and try again.";
  }

  if (err.message === "Account not found") {
    return "This account is not authorized to access the panel.";
  }

  if (err.message === "Account is inactive") {
    return "Your agency account has been deactivated. Contact support.";
  }

  return "Unable to sign in right now. Please try again.";
}

export function useLogin() {
  const navigate = useNavigate();
  const { setLoginPending } = useAuthContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  async function hardFailAndSignOut() {
    await signOut(auth);
    setStatusMessage("");
    setFormError(VERIFY_FAIL_MESSAGE);
  }

  async function login(email: string, password: string) {
    setFormError("");
    setStatusMessage("");
    setIsSubmitting(true);
    setLoginPending(true);

    try {
      const { credential, agency } = await loginAgency(auth, db, {
        email,
        password,
      });

      setStatusMessage("Verifying with Raksha…");
      const idToken = await credential.user.getIdToken();
      const outcome = await verifyAgencyWithRaksha(idToken);

      if (outcome.kind === "paused") {
        await hardFailAndSignOut();
        return;
      }

      if (outcome.kind === "unreachable") {
        if (!isWithinRakshaGrace(agency.lastRakshaVerifiedAt)) {
          await hardFailAndSignOut();
          return;
        }
        setLoginPending(false);
        navigate(APP_ROUTES.dashboard, { replace: true });
        return;
      }

      setStatusMessage(VERIFY_PASS_MESSAGE);
      await new Promise((resolve) => setTimeout(resolve, PASS_DISPLAY_MS));
      setLoginPending(false);
      navigate(APP_ROUTES.dashboard, { replace: true });
    } catch (error) {
      setStatusMessage("");
      setFormError(resolveErrorMessage(error));
      try {
        await signOut(auth);
      } catch {
        /* ignore */
      }
    } finally {
      setIsSubmitting(false);
      setLoginPending(false);
    }
  }

  return { login, isSubmitting, formError, statusMessage };
}
