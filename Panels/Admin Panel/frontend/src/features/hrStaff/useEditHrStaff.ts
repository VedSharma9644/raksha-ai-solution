import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getHrStaffById,
  updateHrStaff,
  sendHrPasswordResetEmail,
} from "@raskha/hr-management";
import type { HrStaff } from "@raskha/hr-management";
import { panelActionCodeSettings } from "@raskha/core";
import { db, clientFirebaseConfig } from "../../lib/firebase";
import type { HrStaffFormValues } from "./HrStaffForm";

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
      await updateHrStaff(db, hrStaffId, {
        fullName: values.fullName,
        employeeCode: values.employeeCode,
        phone: values.phone,
        notes: values.notes,
      });

      if (values.password && hrStaff) {
        await sendHrPasswordResetEmail(
          clientFirebaseConfig,
          hrStaff.email,
          panelActionCodeSettings("hr").url
        );
        setPasswordResetSent(true);
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
