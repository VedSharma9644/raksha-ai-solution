import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuthContext } from "../features/authentication";
import {
  ProspectDetailScreen,
  useSaveProspect,
  useProspectNotes,
} from "../features/prospectClients";
import type { ProspectFormValues } from "../features/prospectClients";
import type { ProspectClient } from "@raskha/client-management";
import { auth } from "../lib/firebase";
import { APP_ROUTES } from "../app/routePaths";

// ── Inline single-prospect fetch ──────────────────────────────────────────────

function resolveAdminApiBase(): string {
  const fromEnv = import.meta.env.VITE_ADMIN_API_URL?.replace(/\/$/, "");
  if (import.meta.env.DEV && import.meta.env.VITE_ADMIN_API_FORCE_REMOTE !== "true") {
    return "http://localhost:3001";
  }
  return fromEnv || "http://localhost:3001";
}
const API_BASE = resolveAdminApiBase();

function useProspectDetail(prospectId: string) {
  const { agency } = useAuthContext();
  const [prospect, setProspect] = useState<ProspectClient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!prospectId || !agency) { setIsLoading(false); return; }
    setIsLoading(true);
    setError("");
    auth.currentUser
      ?.getIdToken()
      .then((token) =>
        fetch(`${API_BASE}/api/prospects/${prospectId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
      )
      .then(async (res) => {
        if (!res.ok) {
          const body = (await res.json().catch(() => ({}))) as { error?: string };
          throw new Error(body.error ?? `Failed to load prospect (${res.status})`);
        }
        return res.json() as Promise<ProspectClient>;
      })
      .then(setProspect)
      .catch((err: unknown) => {
        const e = err as { message?: string };
        setError(e.message ?? "Failed to load prospect.");
      })
      .finally(() => setIsLoading(false));
  }, [prospectId, agency, tick]);

  const reload = useCallback(() => setTick((t) => t + 1), []);
  return { prospect, isLoading, error, reload };
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function ProspectDetailPage() {
  const { id = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { agency } = useAuthContext();

  const { prospect, isLoading, error, reload } = useProspectDetail(id);
  const { updateProspect, updateStatus, deleteProspect, isSaving, saveError } =
    useSaveProspect();
  const { notes, isLoading: isLoadingNotes, error: notesError, isSaving: isSavingNote,
    saveError: noteError, addNote, deleteNote } = useProspectNotes(id);

  async function handleUpdateProspect(values: Partial<ProspectFormValues>) {
    const ok = await updateProspect(id, values as ProspectFormValues);
    if (ok) reload();
  }

  async function handleUpdateStatus(status: string) {
    const ok = await updateStatus(id, status);
    if (ok) reload();
  }

  async function handleDeleteProspect() {
    const ok = await deleteProspect(id);
    if (ok) navigate(APP_ROUTES.prospects);
  }

  async function handleAddNote(content: string) {
    await addNote(content, agency?.ownerName ?? "Admin");
  }

  if (isLoading) {
    return (
      <div className="page-loading-state">
        <p>Loading prospect…</p>
      </div>
    );
  }

  if (error || !prospect) {
    return (
      <div className="page-error-state">
        <p className="page-error-message">{error || "Prospect not found."}</p>
        <button onClick={() => navigate(APP_ROUTES.prospects)}>← Back to Prospects</button>
      </div>
    );
  }

  return (
    <ProspectDetailScreen
      prospect={prospect}
      notes={notes}
      isLoadingNotes={isLoadingNotes}
      notesError={notesError}
      isSavingProspect={isSaving}
      saveProspectError={saveError}
      isSavingNote={isSavingNote}
      saveNoteError={noteError}
      currentUserName={agency?.ownerName ?? "Admin"}
      onBack={() => navigate(APP_ROUTES.prospects)}
      onUpdateProspect={handleUpdateProspect}
      onUpdateStatus={handleUpdateStatus}
      onAddNote={handleAddNote}
      onDeleteNote={deleteNote}
      onDeleteProspect={handleDeleteProspect}
    />
  );
}
