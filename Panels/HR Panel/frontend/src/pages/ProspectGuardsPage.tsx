import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ProspectGuardListScreen,
  AddProspectGuardModal,
  useProspectGuardList,
  useSaveProspectGuard,
} from "../features/prospectGuards";
import type { ProspectGuardListItem } from "../features/prospectGuards";
import { APP_ROUTES, prospectGuardDetailPath } from "../app/routePaths";
import type { ProspectGuardFormValues } from "../features/prospectGuards";

export function ProspectGuardsPage() {
  const navigate = useNavigate();

  const { guards, loading, error, refresh } = useProspectGuardList();
  const { saving, saveError, saveGuard, deleteGuard } = useSaveProspectGuard();

  // undefined = modal closed; null = add mode; object = edit mode
  const [modalGuard, setModalGuard] = useState<ProspectGuardListItem | null | undefined>(undefined);

  async function handleSave(values: ProspectGuardFormValues) {
    const existingId = modalGuard?.id;
    const id = await saveGuard(values, existingId);
    if (id) {
      setModalGuard(undefined);
      refresh();
    }
  }

  async function handleDelete(id: string) {
    const ok = await deleteGuard(id);
    if (ok) refresh();
  }

  return (
    <>
      <ProspectGuardListScreen
        guards={guards}
        isLoading={loading}
        error={error}
        onBack={() => navigate(APP_ROUTES.dashboard)}
        onAdd={() => setModalGuard(null)}
        onView={(id) => navigate(prospectGuardDetailPath(id))}
        onEdit={(g) => setModalGuard(g)}
        onDelete={handleDelete}
      />

      {modalGuard !== undefined && (
        <AddProspectGuardModal
          editGuard={modalGuard as never}
          isSaving={saving}
          saveError={saveError}
          onSave={handleSave}
          onClose={() => setModalGuard(undefined)}
        />
      )}
    </>
  );
}
