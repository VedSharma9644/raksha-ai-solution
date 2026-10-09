import { useState, useEffect, useCallback } from "react";
import { auth } from "../../lib/firebase";

export interface ProspectGuardNote {
  id: string;
  authorName: string;
  content: string;
  createdAt: unknown;
}

function resolveAdminApiBase(): string {
  const fromEnv = import.meta.env.VITE_ADMIN_API_URL?.replace(/\/$/, "");
  if (import.meta.env.DEV) {
    if (import.meta.env.VITE_ADMIN_API_FORCE_REMOTE !== "true") {
      return "http://localhost:3001";
    }
  }
  return fromEnv || "http://localhost:3001";
}

const API_BASE = resolveAdminApiBase();

export function useProspectGuardNotes(guardId: string) {
  const [notes, setNotes] = useState<ProspectGuardNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotes = useCallback(async () => {
    const user = auth.currentUser;
    if (!user || !guardId) return;
    setLoading(true);
    setError(null);
    try {
      const token = await user.getIdToken();
      const res = await fetch(`${API_BASE}/api/prospect-guards/${guardId}/notes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Failed to load notes (${res.status})`);
      setNotes(await res.json());
    } catch (err: unknown) {
      setError((err as { message?: string }).message ?? "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [guardId]);

  useEffect(() => { fetchNotes(); }, [fetchNotes]);

  const addNote = useCallback(
    async (content: string, authorName: string): Promise<boolean> => {
      const user = auth.currentUser;
      if (!user) return false;
      setSaving(true);
      try {
        const token = await user.getIdToken();
        const res = await fetch(`${API_BASE}/api/prospect-guards/${guardId}/notes`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ content, authorName }),
        });
        if (!res.ok) return false;
        await fetchNotes();
        return true;
      } finally {
        setSaving(false);
      }
    },
    [guardId, fetchNotes]
  );

  const deleteNote = useCallback(
    async (noteId: string): Promise<boolean> => {
      const user = auth.currentUser;
      if (!user) return false;
      try {
        const token = await user.getIdToken();
        const res = await fetch(`${API_BASE}/api/prospect-guards/${guardId}/notes/${noteId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) await fetchNotes();
        return res.ok;
      } catch {
        return false;
      }
    },
    [guardId, fetchNotes]
  );

  return { notes, loading, saving, error, addNote, deleteNote, refresh: fetchNotes };
}
