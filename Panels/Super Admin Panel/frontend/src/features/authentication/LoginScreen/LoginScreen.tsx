import { LoginForm } from "../LoginForm";
import type { LoginCredentials } from "../LoginForm";
import "./LoginScreen.css";

export interface LoginScreenProps {
  onSubmit: (credentials: LoginCredentials) => void | Promise<void>;
  onForgotPassword: () => void;
  isSubmitting?: boolean;
  formError?: string;
}

export function LoginScreen({
  onSubmit,
  onForgotPassword,
  isSubmitting,
  formError,
}: LoginScreenProps) {
  return (
    <main className="login-screen">
      <div className="login-screen__atmosphere" aria-hidden="true" />
      <section className="login-screen__panel" aria-labelledby="login-heading">
        <header className="login-screen__brand">
          <p className="login-screen__brand-name">Raskha</p>
          <p className="login-screen__brand-panel">Super Admin</p>
        </header>
        <div className="login-screen__intro">
          <h1 id="login-heading" className="login-screen__headline">
            Platform control
          </h1>
          <p className="login-screen__support">
            Manage agencies, feature access, subscribers, and platform health
            from one owner panel.
          </p>
        </div>
        <LoginForm
          onSubmit={onSubmit}
          onForgotPassword={onForgotPassword}
          isSubmitting={isSubmitting}
          formError={formError}
        />
      </section>
    </main>
  );
}
