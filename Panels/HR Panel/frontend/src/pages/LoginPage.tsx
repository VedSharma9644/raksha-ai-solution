import type { LoginCredentials } from "../features/authentication";
import { LoginScreen, useLogin } from "../features/authentication";

export function LoginPage() {
  const { login, isSubmitting, formError } = useLogin();

  async function handleLogin(credentials: LoginCredentials) {
    await login(credentials.email, credentials.password);
  }

  return (
    <LoginScreen
      onSubmit={handleLogin}
      onForgotPassword={() => console.info("HR forgot password requested")}
      isSubmitting={isSubmitting}
      formError={formError}
    />
  );
}
