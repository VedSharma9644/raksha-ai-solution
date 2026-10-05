import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { deleteHrStaff } from "@raskha/hr-management";
import { db } from "../../lib/firebase";

export function useDeleteHrStaff(hrStaffId: string) {
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  async function removeHrStaff() {
    const confirmed = window.confirm(
      "Are you sure you want to delete this HR user? This cannot be undone."
    );

    if (!confirmed) return;

    setError("");
    setIsDeleting(true);

    try {
      await deleteHrStaff(db, hrStaffId);
      navigate("/hr", { replace: true });
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e.message ?? "Failed to delete HR user. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  }

  return { removeHrStaff, isDeleting, error };
}
