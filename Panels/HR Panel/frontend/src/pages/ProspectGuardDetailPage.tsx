import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuthContext } from "../features/authentication";
import {
  ProspectGuardDetailScreen,
  useSaveProspectGuard,
  useProspectGuardNotes,
} from "../features/prospectGuards";
import type { ProspectGuardFormValues } from "../features/prospectGuards";
import type { ProspectGuard } from "@raskha/guard-management";
import { auth } from "../lib/firebase";
import { APP_ROUTES } from "../app/routePaths";

// ── Inline single-guard fetch ─────────────────────────────────────────────────

function resolveAdminApiBase(): string {
  const fromEnv = import.meta.env.VITE_ADMIN_API_URL?.replace(/\/$/, "");
  if (import.meta.env.DEV && import.meta.env.VITE_ADMIN_API_FORCE_REMOTE !== "true") {
    return "http://localhost:3001";
  }
  return fromEnv || "http://localhost:3001";
}
const API_BASE = resolveAdminApiBase();

function useProspectGuardDetail(guardId: string) {
  const { hrStaff } = useAuthContext();
  const [guard, setGuard] = useState<ProspectGuard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!guardId || !hrStaff) { setIsLoading(false); return; }
    setIsLoading(true);
    setError("");
    auth.currentUser
      ?.getIdToken()
      .then((token) =>
        fetch(`${API_BASE}/api/prospect-guards/${guardId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
      )
      .then(async (res) => {
        if (!res.ok) {
          const body = (await res.json().catch(() => ({}))) as { error?: string };
          throw new Error(body.error ?? `Failed to load guard (${res.status})`);
        }
        return res.json() as Promise<ProspectGuard>;
      })
      .then(setGuard)
      .catch((err: unknown) => {
        const e = err as { message?: string };
        setError(e.message ?? "Failed to load guard.");
      })
      .finally(() => setIsLoading(false));
  }, [guardId, hrStaff, tick]);

  const reload = useCallback(() => setTick((t) => t + 1), []);
  return { guard, isLoading, error, reload };
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function ProspectGuardDetailPage() {
  const { id = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { hrStaff } = useAuthContext();

  const { guard, isLoading, error, reload } = useProspectGuardDetail(id);
  const { saving: isSaving, saveError, saveGuard, deleteGuard } = useSaveProspectGuard();
  const {
    notes,
    loading: isLoadingNotes,
    error: notesError,
    saving: isSavingNote,
    addNote,
    deleteNote,
  } = useProspectGuardNotes(id);

  async function handleUpdateGuard(values: Partial<ProspectGuardFormValues>) {
    const id2 = await saveGuard(values as ProspectGuardFormValues, id);
    if (id2) reload();
  }

  async function handleUpdateStatus(status: string) {
    await saveGuard({ status } as ProspectGuardFormValues, id);
    reload();
  }

  async function handleDeleteGuard() {
    const ok = await deleteGuard(id);
    if (ok) navigate(APP_ROUTES.prospectGuards);
  }

  async function handleAddNote(content: string) {
    await addNote(content, hrStaff?.fullName ?? "HR Staff");
  }

  if (isLoading) {
    return (
      <div className="page-loading-state">
        <p>Loading prospect guard…</p>
      </div>
    );
  }

  if (error || !guard) {
    return (
      <div className="page-error-state">
        <p className="page-error-message">{error || "Prospect guard not found."}</p>
        <button onClick={() => navigate(APP_ROUTES.prospectGuards)}>← Back to Prospect Guards</button>
      </div>
    );
  }

  return (
    <ProspectGuardDetailScreen
      guard={guard}
      notes={notes}
      isLoadingNotes={isLoadingNotes}
      notesError={notesError}
      isSavingGuard={isSaving}
      saveGuardError={saveError}
      isSavingNote={isSavingNote}
      currentUserName={hrStaff?.fullName ?? "HR Staff"}
      onBack={() => navigate(APP_ROUTES.prospectGuards)}
      onUpdateGuard={handleUpdateGuard}
      onUpdateStatus={handleUpdateStatus}
      onAddNote={handleAddNote}
      onDeleteNote={deleteNote}
      onDeleteGuard={handleDeleteGuard}
    />
  );
}
