import { useCallback, useEffect, useState } from "react";
import type { ProspectNote } from "@raskha/client-management";
import { auth } from "../../lib/firebase";

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

async function authHeaders(): Promise<Headers> {
  const headers = new Headers({ "Content-Type": "application/json" });
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    headers.set("Authorization", `Bearer ${token}`);
  }
  return headers;
}

async function apiRequest<T>(method: string, path: string, body?: unknown): Promise<T> {
  const headers = await authHeaders();
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const data = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (!res.ok) {
    throw new Error((data as { error?: string }).error ?? `Request failed (${res.status})`);
  }
  return data;
}

export function useProspectNotes(prospectId: string) {
  const [notes, setNotes] = useState<ProspectNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!prospectId) { setIsLoading(false); return; }
    setIsLoading(true);
    setError("");
    authHeaders()
      .then((headers) => fetch(`${API_BASE}/api/prospects/${prospectId}/notes`, { headers }))
      .then(async (res) => {
        if (!res.ok) {
          const body = (await res.json().catch(() => ({}))) as { error?: string };
          throw new Error(body.error ?? `Failed to load notes (${res.status})`);
        }
        return res.json() as Promise<ProspectNote[]>;
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
      await apiRequest("POST", `/api/prospects/${prospectId}/notes`, { content, authorName });
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
      await apiRequest("DELETE", `/api/prospects/${prospectId}/notes/${noteId}`);
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
