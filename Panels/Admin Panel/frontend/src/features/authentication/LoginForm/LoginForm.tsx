import { useState } from "react";
import type { FormEvent } from "react";
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
  onForgotPassword: () => void;
  isSubmitting?: boolean;
  formError?: string;
  statusMessage?: string;
}

export function LoginForm({
  onSubmit,
  onForgotPassword,
  isSubmitting = false,
  formError,
  statusMessage,
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

  return (
    <form className="login-form" onSubmit={handleSubmit} noValidate>
      <div className="login-form__fields">
        <TextField
          label="Work email"
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder="you@agency.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          errorMessage={emailError}
          required
          disabled={isSubmitting}
        />

        <PasswordField
          label="Password"
          name="password"
          placeholder="Enter your password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          errorMessage={passwordError}
          required
          disabled={isSubmitting}
        />
      </div>

      <div className="login-form__forgot">
        <Button
          type="button"
          variant="link"
          onClick={onForgotPassword}
          disabled={isSubmitting}
        >
          Forgot password?
        </Button>
      </div>

      {formError ? (
        <p className="login-form__error" role="alert">
          {formError}
        </p>
      ) : null}

      {statusMessage && !formError ? (
        <p className="login-form__status" role="status" aria-live="polite">
          {statusMessage}
        </p>
      ) : null}

      <Button type="submit" fullWidth disabled={isSubmitting}>
        {isSubmitting ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
