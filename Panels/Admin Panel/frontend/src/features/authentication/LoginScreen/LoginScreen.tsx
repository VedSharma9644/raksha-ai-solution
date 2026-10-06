import type { LoginCredentials } from "../LoginForm";
import { LoginForm } from "../LoginForm";
import "./LoginScreen.css";

export interface LoginScreenProps {
  onSubmit: (credentials: LoginCredentials) => void | Promise<void>;
  onForgotPassword: () => void;
  isSubmitting?: boolean;
  formError?: string;
  statusMessage?: string;
}

export function LoginScreen({
  onSubmit,
  onForgotPassword,
  isSubmitting,
  formError,
  statusMessage,
}: LoginScreenProps) {
  return (
    <main className="login-screen">
      <div className="login-screen__atmosphere" aria-hidden="true" />

      <section className="login-screen__panel" aria-labelledby="login-heading">
        <header className="login-screen__brand">
          <p className="login-screen__brand-name">Raskha</p>
          <p className="login-screen__brand-panel">Agency Panel</p>
        </header>

        <div className="login-screen__intro">
          <h1 id="login-heading" className="login-screen__headline">
            Sign in to your agency
          </h1>
          <p className="login-screen__support">
            Manage sites, guards, and daily operations from one secure
            workspace.
          </p>
        </div>

        <LoginForm
          onSubmit={onSubmit}
          onForgotPassword={onForgotPassword}
          isSubmitting={isSubmitting}
          formError={formError}
          statusMessage={statusMessage}
        />
      </section>
    </main>
  );
}
