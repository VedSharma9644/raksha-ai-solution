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
      // Backend auth will plug in here later.
      console.info("Login submitted", { email: credentials.email });
      navigate(APP_ROUTES.dashboard);
    } catch {
      setFormError("Unable to sign in right now. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleForgotPassword() {
    console.info("Forgot password requested");
  }

  return (
    <LoginScreen
      onSubmit={handleLogin}
      onForgotPassword={handleForgotPassword}
      isSubmitting={isSubmitting}
      formError={formError}
    />
  );
}
