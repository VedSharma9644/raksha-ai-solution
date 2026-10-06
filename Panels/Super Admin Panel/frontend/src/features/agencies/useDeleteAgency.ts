import { useState } from "react";
import {
  confirmAgencyDeleteApi,
  requestAgencyDeleteOtpApi,
} from "./agencyApi";

export function useDeleteAgency() {
  const [isRequesting, setIsRequesting] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [pendingAgencyId, setPendingAgencyId] = useState<string | null>(null);
  const [notified, setNotified] = useState("");
  const [debugOtp, setDebugOtp] = useState("");
  const [error, setError] = useState("");

  async function requestDelete(agencyId: string) {
    setError("");
    setDebugOtp("");
    setIsRequesting(true);
    try {
      const result = await requestAgencyDeleteOtpApi(agencyId);
      setPendingAgencyId(agencyId);
      setNotified(result.notified);
      if (result.debugOtp) setDebugOtp(result.debugOtp);
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e.message ?? "Failed to send delete OTP.");
    } finally {
      setIsRequesting(false);
    }
  }

  async function confirmDelete(otp: string) {
    if (!pendingAgencyId) return;
    setError("");
    setIsConfirming(true);
    try {
      await confirmAgencyDeleteApi(pendingAgencyId, otp);
      setPendingAgencyId(null);
      setNotified("");
      setDebugOtp("");
      return true;
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e.message ?? "Failed to confirm delete.");
      return false;
    } finally {
      setIsConfirming(false);
    }
  }

  function cancelDelete() {
    setPendingAgencyId(null);
    setNotified("");
    setDebugOtp("");
    setError("");
  }

  return {
    requestDelete,
    confirmDelete,
    cancelDelete,
    isRequesting,
    isConfirming,
    pendingAgencyId,
    notified,
    debugOtp,
    error,
  };
}
