import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginAgency } from "@raskha/core";
import { APP_ROUTES } from "../../app/routePaths";
import { auth, db } from "../../lib/firebase";

function resolveErrorMessage(error: unknown): string {
  const err = error as { code?: string; message?: string };

  switch (err.code) {
    case "auth/invalid-credential":
    case "auth/user-not-found":
    case "auth/wrong-password":
      return "Invalid email or password.";
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  async function login(email: string, password: string) {
    setFormError("");
    setIsSubmitting(true);

    try {
      await loginAgency(auth, db, { email, password });
      navigate(APP_ROUTES.dashboard, { replace: true });
    } catch (error) {
      setFormError(resolveErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return { login, isSubmitting, formError };
}
