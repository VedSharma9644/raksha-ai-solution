import { LoginForm } from "../LoginForm";
import type { LoginCredentials } from "../LoginForm";
import "./LoginScreen.css";

export interface LoginScreenProps {
  onSubmit: (credentials: LoginCredentials) => void | Promise<void>;
  onForgotPassword: (email: string) => void | Promise<void>;
  isSubmitting?: boolean;
  isSendingReset?: boolean;
  formError?: string;
  resetMessage?: string;
}

export function LoginScreen({
  onSubmit,
  onForgotPassword,
  isSubmitting,
  isSendingReset,
  formError,
  resetMessage,
}: LoginScreenProps) {
  return (
    <main className="login-screen">
      <div className="login-screen__atmosphere" aria-hidden="true" />

      <section className="login-screen__panel" aria-labelledby="login-heading">
        <header className="login-screen__brand">
          <p className="login-screen__brand-name">Raskha</p>
          <p className="login-screen__brand-panel">HR Panel</p>
        </header>

        <div className="login-screen__intro">
          <h1 id="login-heading" className="login-screen__headline">
            Sign in to HR
          </h1>
          <p className="login-screen__support">
            Manage guards, leave requests, and inventory — without site or
            financial access.
          </p>
        </div>

        <LoginForm
          onSubmit={onSubmit}
          onForgotPassword={onForgotPassword}
          isSubmitting={isSubmitting}
          isSendingReset={isSendingReset}
          formError={formError}
          resetMessage={resetMessage}
        />
      </section>
    </main>
  );
}
