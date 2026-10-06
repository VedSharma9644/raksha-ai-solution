import type { FormEvent } from "react";
import { useState } from "react";
import { Button } from "../../../components/Button";
import { PasswordField } from "../../../components/PasswordField";
import { TextField } from "../../../components/TextField";
import "./LoginForm.css";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginFormProps {
  onSubmit: (credentials: LoginCredentials) => void | Promise<void>;
  /** Called with the email currently in the field when user clicks "Forgot password?" */
  onForgotPassword: (email: string) => void | Promise<void>;
  isSubmitting?: boolean;
  isSendingReset?: boolean;
  formError?: string;
  /** Shown below the forgot password button after a reset email is sent */
  resetMessage?: string;
}

export function LoginForm({
  onSubmit,
  onForgotPassword,
  isSubmitting = false,
  isSendingReset = false,
  formError,
  resetMessage,
}: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  function validate(): boolean {
    let isValid = true;
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setEmailError("Enter your work email.");
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setEmailError("Enter a valid email address.");
      isValid = false;
    } else {
      setEmailError("");
    }

    if (!password) {
      setPasswordError("Enter your password.");
      isValid = false;
    } else if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters.");
      isValid = false;
    } else {
      setPasswordError("");
    }

    return isValid;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validate()) {
      return;
    }

    await onSubmit({
      email: email.trim(),
      password,
    });
  }

  async function handleForgotPassword() {
    await onForgotPassword(email.trim());
  }

  return (
    <form className="login-form" onSubmit={handleSubmit} noValidate>
      <div className="login-form__fields">
        <TextField
          label="Work email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@agency.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          errorMessage={emailError}
          required
          disabled={isSubmitting || isSendingReset}
        />
        <PasswordField
          label="Password"
          name="password"
          placeholder="Enter your password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          errorMessage={passwordError}
          required
          disabled={isSubmitting || isSendingReset}
        />
      </div>

      <div className="login-form__forgot">
        <Button
          type="button"
          variant="link"
          onClick={handleForgotPassword}
          disabled={isSubmitting || isSendingReset}
        >
          {isSendingReset ? "Sending…" : "Forgot password?"}
        </Button>
      </div>

      {resetMessage ? (
        <p className="login-form__reset-message" role="status">
          {resetMessage}
        </p>
      ) : null}

      {formError ? (
        <p className="login-form__error" role="alert">
          {formError}
        </p>
      ) : null}

      <Button type="submit" fullWidth disabled={isSubmitting || isSendingReset}>
        {isSubmitting ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
