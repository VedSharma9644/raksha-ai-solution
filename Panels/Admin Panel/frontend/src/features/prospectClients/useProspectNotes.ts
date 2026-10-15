import { useCallback, useEffect, useState } from "react";
import type { ProspectNote } from "@raskha/client-management";
import { adminFetch } from "@raskha/shared";

export function useProspectNotes(prospectId: string) {
  const [notes, setNotes] = useState<ProspectNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!prospectId) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError("");
    adminFetch<ProspectNote[]>(`/api/prospects/${prospectId}/notes`, {
      requireAuth: false,
    })
      .then(setNotes)
      .catch((err: unknown) => {
        const e = err as { message?: string };
        setError(e.message ?? "Failed to load notes.");
      })
      .finally(() => setIsLoading(false));
  }, [prospectId, tick]);

  const reload = useCallback(() => setTick((t) => t + 1), []);

  async function addNote(content: string, authorName: string): Promise<boolean> {
    setIsSaving(true);
    setSaveError("");
    try {
      await adminFetch(`/api/prospects/${prospectId}/notes`, {
        method: "POST",
        body: JSON.stringify({ content, authorName }),
        requireAuth: false,
      });
      reload();
      return true;
    } catch (err: unknown) {
      const e = err as { message?: string };
      setSaveError(e.message ?? "Failed to add note.");
      return false;
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteNote(noteId: string): Promise<boolean> {
    setSaveError("");
    try {
      await adminFetch(`/api/prospects/${prospectId}/notes/${noteId}`, {
        method: "DELETE",
        requireAuth: false,
      });
      reload();
      return true;
    } catch (err: unknown) {
      const e = err as { message?: string };
      setSaveError(e.message ?? "Failed to delete note.");
      return false;
    }
  }

  return { notes, isLoading, error, isSaving, saveError, addNote, deleteNote, reload };
}
