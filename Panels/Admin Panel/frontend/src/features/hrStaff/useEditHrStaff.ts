import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getHrStaffById,
  updateHrStaff,
} from "@raskha/hr-management";
import type { HrStaff } from "@raskha/hr-management";
import { updateHrStaffPassword } from "@raskha/core";
import { db } from "../../lib/firebase";
import type { HrStaffFormValues } from "./HrStaffForm";

// Admin backend base URL — update for production
const ADMIN_BACKEND_URL = "http://localhost:3001";

export function useEditHrStaff(hrStaffId: string) {
  const navigate = useNavigate();
  const [hrStaff, setHrStaff] = useState<HrStaff | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [saveError, setSaveError] = useState("");

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
    setIsSubmitting(true);

    try {
      // Update Firestore profile fields
      await updateHrStaff(db, hrStaffId, {
        fullName: values.fullName,
        employeeCode: values.employeeCode,
        phone: values.phone,
        notes: values.notes,
        assignedBranchIds: values.assignedBranchIds ?? [],
      });

      // If a new password was entered, update it directly in Firebase Auth
      if (values.password) {
        await updateHrStaffPassword(hrStaffId, values.password, ADMIN_BACKEND_URL);
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
        assignedBranchIds: hrStaff.assignedBranchIds ?? [],
      }
    : undefined;

  return {
    hrStaff,
    initialValues,
    isLoading,
    isSubmitting,
    loadError,
    saveError,
    saveHrStaff,
  };
}
