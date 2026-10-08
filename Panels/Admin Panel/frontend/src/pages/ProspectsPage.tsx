import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../features/authentication";
import {
  ProspectListScreen,
  AddProspectModal,
  useProspectList,
  useSaveProspect,
} from "../features/prospectClients";
import type { ProspectClient } from "@raskha/client-management";
import { APP_ROUTES, prospectDetailPath } from "../app/routePaths";

export function ProspectsPage() {
  const navigate = useNavigate();
  const { agency } = useAuthContext();

  const { prospects, isLoading, error, reload } = useProspectList();
  const { createProspect, updateProspect, deleteProspect, isSaving, saveError } =
    useSaveProspect();

  const [modalProspect, setModalProspect] = useState<ProspectClient | null | undefined>(
    undefined // undefined = modal closed
  );

  async function handleSave(values: Parameters<typeof createProspect>[0]) {
    const ok = modalProspect
      ? await updateProspect(modalProspect.id, values)
      : await createProspect(values);
    if (ok) {
      setModalProspect(undefined);
      reload();
    }
  }

  async function handleDelete(id: string) {
    const ok = await deleteProspect(id);
    if (ok) reload();
  }

  // Suppress TS unused warning — needed for future typing
  void agency;

  return (
    <>
      <ProspectListScreen
        prospects={prospects}
        isLoading={isLoading}
        error={error}
        onBack={() => navigate(APP_ROUTES.dashboard)}
        onAdd={() => setModalProspect(null)}        // null = add mode
        onView={(id) => navigate(prospectDetailPath(id))}
        onEdit={(p) => setModalProspect(p)}
        onDelete={handleDelete}
      />

      {modalProspect !== undefined && (
        <AddProspectModal
          editProspect={modalProspect}
          isSaving={isSaving}
          saveError={saveError}
          onSave={handleSave}
          onClose={() => setModalProspect(undefined)}
        />
      )}
    </>
  );
}
