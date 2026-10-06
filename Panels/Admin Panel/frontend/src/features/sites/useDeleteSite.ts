import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { deleteSite } from "@raskha/site-management";
import { db } from "../../lib/firebase";

export function useDeleteSite(siteId: string) {
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  async function removeSite() {
    const confirmed = window.confirm(
      "Are you sure you want to delete this site? This cannot be undone."
    );
    if (!confirmed) return;

    setError("");
    setIsDeleting(true);

    try {
      await deleteSite(db, siteId);
      navigate("/sites", { replace: true });
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e.message ?? "Failed to delete site. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  }

  return { removeSite, isDeleting, error };
}
