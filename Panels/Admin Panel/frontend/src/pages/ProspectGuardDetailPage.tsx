import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { ProspectGuard } from "@raskha/guard-management";
import { adminFetch } from "@raskha/shared";
import { useAuthContext } from "../features/authentication";
import {
  ProspectGuardDetailScreen,
  useSaveProspectGuard,
  useProspectGuardNotes,
} from "../features/prospectGuards";
import type { ProspectGuardFormValues } from "../features/prospectGuards";
import { APP_ROUTES } from "../app/routePaths";

function useProspectGuardDetail(guardId: string) {
  const { agency } = useAuthContext();
  const [guard, setGuard] = useState<ProspectGuard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!guardId || !agency) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError("");
    adminFetch<ProspectGuard>(`/api/prospect-guards/${guardId}`, {
      requireAuth: false,
    })
      .then(setGuard)
      .catch((err: unknown) => {
        const e = err as { message?: string };
        setError(e.message ?? "Failed to load guard.");
      })
      .finally(() => setIsLoading(false));
  }, [guardId, agency, tick]);

  const reload = useCallback(() => setTick((t) => t + 1), []);
  return { guard, isLoading, error, reload };
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function ProspectGuardDetailPage() {
  const { id = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { agency } = useAuthContext();

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
    await addNote(content, agency?.ownerName ?? "Admin");
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
      currentUserName={agency?.ownerName ?? "Admin"}
      onBack={() => navigate(APP_ROUTES.prospectGuards)}
      onUpdateGuard={handleUpdateGuard}
      onUpdateStatus={handleUpdateStatus}
      onAddNote={handleAddNote}
      onDeleteNote={deleteNote}
      onDeleteGuard={handleDeleteGuard}
    />
  );
}
