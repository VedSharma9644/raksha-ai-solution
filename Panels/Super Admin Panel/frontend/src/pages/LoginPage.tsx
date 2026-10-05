import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { APP_ROUTES } from "../app/routePaths";
import type { LoginCredentials } from "../features/authentication";
import { LoginScreen } from "../features/authentication";

export function LoginPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  async function handleLogin(credentials: LoginCredentials) {
    setFormError("");
    setIsSubmitting(true);

    try {
      console.info("Super admin login submitted", { email: credentials.email });
      navigate(APP_ROUTES.dashboard);
    } catch {
      setFormError("Unable to sign in right now. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <LoginScreen
      onSubmit={handleLogin}
      onForgotPassword={() =>
        console.info("Super admin forgot password requested")
      }
      isSubmitting={isSubmitting}
      formError={formError}
    />
  );
}
