import { LoginScreen } from "../features/authentication";
import { useLogin } from "../features/authentication";

export function LoginPage() {
  const { login, isSubmitting, formError } = useLogin();

  async function handleLogin(credentials: { email: string; password: string }) {
    await login(credentials.email, credentials.password);
  }

  function handleForgotPassword() {
    // TODO: implement forgot password flow
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
