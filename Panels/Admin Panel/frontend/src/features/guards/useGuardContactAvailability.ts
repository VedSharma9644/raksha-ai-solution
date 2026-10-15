import { useEffect, useRef, useState } from "react";
import {
  checkGuardEmailAvailability,
  checkGuardPhoneAvailability,
} from "@raskha/guard-management";
import { db } from "../../lib/firebase";

export type ContactFieldStatus = {
  checking: boolean;
  available: boolean | null;
  message: string;
};

const IDLE: ContactFieldStatus = {
  checking: false,
  available: null,
  message: "",
};

/**
 * Debounced realtime phone/email availability against Firestore `guards`.
 */
export function useGuardContactAvailability(params: {
  phone: string;
  email: string;
  /** When editing, ignore the current guard's own contact. */
  excludeGuardId?: string;
  enabled?: boolean;
  debounceMs?: number;
}) {
  const {
    phone,
    email,
    excludeGuardId,
    enabled = true,
    debounceMs = 450,
  } = params;

  const [phoneStatus, setPhoneStatus] = useState<ContactFieldStatus>(IDLE);
  const [emailStatus, setEmailStatus] = useState<ContactFieldStatus>(IDLE);
  const phoneReq = useRef(0);
  const emailReq = useRef(0);

  useEffect(() => {
    if (!enabled) {
      setPhoneStatus(IDLE);
      return;
    }
    const trimmed = phone.trim();
    if (!trimmed || !/^[0-9+\-\s]{8,15}$/.test(trimmed)) {
      setPhoneStatus(IDLE);
      return;
    }

    setPhoneStatus({ checking: true, available: null, message: "Checking…" });
    const reqId = ++phoneReq.current;
    const timer = window.setTimeout(() => {
      void checkGuardPhoneAvailability(db, trimmed, excludeGuardId)
        .then((result) => {
          if (reqId !== phoneReq.current) return;
          setPhoneStatus({
            checking: false,
            available: result.available,
            message: result.message ?? "",
          });
        })
        .catch(() => {
          if (reqId !== phoneReq.current) return;
          setPhoneStatus({
            checking: false,
            available: null,
            message: "Could not verify mobile number.",
          });
        });
    }, debounceMs);

    return () => window.clearTimeout(timer);
  }, [debounceMs, enabled, excludeGuardId, phone]);

  useEffect(() => {
    if (!enabled) {
      setEmailStatus(IDLE);
      return;
    }
    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setEmailStatus(IDLE);
      return;
    }

    setEmailStatus({ checking: true, available: null, message: "Checking…" });
    const reqId = ++emailReq.current;
    const timer = window.setTimeout(() => {
      void checkGuardEmailAvailability(db, trimmed, excludeGuardId)
        .then((result) => {
          if (reqId !== emailReq.current) return;
          setEmailStatus({
            checking: false,
            available: result.available,
            message: result.message ?? "",
          });
        })
        .catch(() => {
          if (reqId !== emailReq.current) return;
          setEmailStatus({
            checking: false,
            available: null,
            message: "Could not verify email.",
          });
        });
    }, debounceMs);

    return () => window.clearTimeout(timer);
  }, [debounceMs, email, enabled, excludeGuardId]);

  return { phoneStatus, emailStatus };
}
