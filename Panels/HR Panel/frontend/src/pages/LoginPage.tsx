import type { LoginCredentials } from "../features/authentication";
import {
  LoginScreen,
  useLogin,
  useForgotPassword,
} from "../features/authentication";

export function LoginPage() {
  const { login, isSubmitting, formError } = useLogin();
  const { sendResetEmail, isSendingReset, resetMessage, resetError } =
    useForgotPassword();

  async function handleLogin(credentials: LoginCredentials) {
    await login(credentials.email, credentials.password);
  }

  async function handleForgotPassword(email: string) {
    await sendResetEmail(email);
  }

  // Show reset error as formError if present (no active login error)
  const displayError = formError || resetError;

  return (
    <LoginScreen
      onSubmit={handleLogin}
      onForgotPassword={handleForgotPassword}
      isSubmitting={isSubmitting}
      isSendingReset={isSendingReset}
      formError={displayError}
      resetMessage={resetMessage}
    />
  );
}
