import { useState, useEffect, useCallback } from "react";
import { adminFetch } from "@raskha/shared";

export interface ProspectGuardNote {
  id: string;
  authorName: string;
  content: string;
  createdAt: unknown;
}

export function useProspectGuardNotes(guardId: string) {
  const [notes, setNotes] = useState<ProspectGuardNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotes = useCallback(async () => {
    if (!guardId) return;
    setLoading(true);
    setError(null);
    try {
      setNotes(
        await adminFetch<ProspectGuardNote[]>(
          `/api/prospect-guards/${guardId}/notes`,
          { requireAuth: false }
        )
      );
    } catch (err: unknown) {
      setError((err as { message?: string }).message ?? "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [guardId]);

  useEffect(() => {
    void fetchNotes();
  }, [fetchNotes]);

  const addNote = useCallback(
    async (content: string, authorName: string): Promise<boolean> => {
      setSaving(true);
      try {
        await adminFetch(`/api/prospect-guards/${guardId}/notes`, {
          method: "POST",
          body: JSON.stringify({ content, authorName }),
          requireAuth: false,
        });
        await fetchNotes();
        return true;
      } catch {
        return false;
      } finally {
        setSaving(false);
      }
    },
    [guardId, fetchNotes]
  );

  const deleteNote = useCallback(
    async (noteId: string): Promise<boolean> => {
      try {
        await adminFetch(`/api/prospect-guards/${guardId}/notes/${noteId}`, {
          method: "DELETE",
          requireAuth: false,
        });
        await fetchNotes();
        return true;
      } catch {
        return false;
      }
    },
    [guardId, fetchNotes]
  );

  return { notes, loading, saving, error, addNote, deleteNote, refresh: fetchNotes };
}
