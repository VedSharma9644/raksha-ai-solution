import { useState } from "react";
import { sendHrForgotPasswordEmail } from "@raskha/core";
import { auth } from "../../lib/firebase";

export function useForgotPassword() {
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [resetMessage, setResetMessage] = useState("");
  const [resetError, setResetError] = useState("");

  async function sendResetEmail(email: string) {
    setResetMessage("");
    setResetError("");

    if (!email) {
      setResetError("Enter your email address first, then click Forgot password.");
      return;
    }

    setIsSendingReset(true);

    try {
      await sendHrForgotPasswordEmail(auth, email);
      setResetMessage(
        `Password reset link sent to ${email}. Check your inbox.`
      );
    } catch (err: unknown) {
      const e = err as { code?: string; message?: string };
      if (e.code === "auth/user-not-found" || e.code === "auth/invalid-email") {
        setResetError("No account found with that email address.");
      } else {
        setResetError("Failed to send reset email. Please try again.");
      }
    } finally {
      setIsSendingReset(false);
    }
  }

  return { sendResetEmail, isSendingReset, resetMessage, resetError };
}
