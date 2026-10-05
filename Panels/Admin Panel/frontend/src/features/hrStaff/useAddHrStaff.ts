import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createHrStaffAccount } from "@raskha/hr-management";
import { useAuthContext } from "../authentication";
import { db } from "../../lib/firebase";
import type { HrStaffFormValues } from "./HrStaffForm";

// Firebase config passed to the secondary app for HR user creation
const firebaseConfig = {
  apiKey: import.meta.env.FIREBASE_API_KEY,
  authDomain: import.meta.env.FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.FIREBASE_APP_ID,
};

export function useAddHrStaff() {
  const navigate = useNavigate();
  const { agency } = useAuthContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function saveHrStaff(values: HrStaffFormValues) {
    if (!agency) {
      setError("Not authenticated.");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      await createHrStaffAccount(db, firebaseConfig, {
        agencyId: agency.id,
        fullName: values.fullName,
        employeeCode: values.employeeCode,
        phone: values.phone,
        email: values.email,
        password: values.password,
        notes: values.notes,
      });
      navigate("/hr", { replace: true });
    } catch (err: unknown) {
      const e = err as { code?: string; message?: string };
      if (e.code === "auth/email-already-in-use") {
        setError("An account with this email already exists.");
      } else {
        setError(e.message ?? "Failed to create HR user. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return { saveHrStaff, isSubmitting, error };
}
