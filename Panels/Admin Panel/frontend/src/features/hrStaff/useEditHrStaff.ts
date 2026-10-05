import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getHrStaffById,
  updateHrStaff,
  sendHrPasswordResetEmail,
} from "@raskha/hr-management";
import type { HrStaff } from "@raskha/hr-management";
import { db } from "../../lib/firebase";
import type { HrStaffFormValues } from "./HrStaffForm";

const firebaseConfig = {
  apiKey: import.meta.env.FIREBASE_API_KEY,
  authDomain: import.meta.env.FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.FIREBASE_APP_ID,
};

export function useEditHrStaff(hrStaffId: string) {
  const navigate = useNavigate();
  const [hrStaff, setHrStaff] = useState<HrStaff | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [passwordResetSent, setPasswordResetSent] = useState(false);

  useEffect(() => {
    if (!hrStaffId) return;

    setIsLoading(true);
    setLoadError("");

    getHrStaffById(db, hrStaffId)
      .then((data) => {
        if (!data) {
          setLoadError("HR user not found.");
        } else {
          setHrStaff(data);
        }
      })
      .catch((err: unknown) => {
        const e = err as { message?: string };
        setLoadError(e.message ?? "Failed to load HR user.");
      })
      .finally(() => setIsLoading(false));
  }, [hrStaffId]);

  async function saveHrStaff(values: HrStaffFormValues) {
    setSaveError("");
    setPasswordResetSent(false);
    setIsSubmitting(true);

    try {
      // Update Firestore fields
      await updateHrStaff(db, hrStaffId, {
        fullName: values.fullName,
        employeeCode: values.employeeCode,
        phone: values.phone,
        notes: values.notes,
      });

      // If a new password was entered, send a password reset email
      if (values.password && hrStaff) {
        await sendHrPasswordResetEmail(firebaseConfig, hrStaff.email);
        setPasswordResetSent(true);
        // Stay on page to show the reset email confirmation
        setIsSubmitting(false);
        return;
      }

      navigate("/hr", { replace: true });
    } catch (err: unknown) {
      const e = err as { message?: string };
      setSaveError(e.message ?? "Failed to update HR user. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const initialValues: HrStaffFormValues | undefined = hrStaff
    ? {
        fullName: hrStaff.fullName,
        employeeCode: hrStaff.employeeCode,
        phone: hrStaff.phone,
        email: hrStaff.email,
        password: "",
        notes: hrStaff.notes,
      }
    : undefined;

  return {
    hrStaff,
    initialValues,
    isLoading,
    isSubmitting,
    loadError,
    saveError,
    passwordResetSent,
    saveHrStaff,
  };
}
