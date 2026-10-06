import { useNavigate } from "react-router-dom";
import { APP_ROUTES } from "../app/routePaths";
import {
  AgencyListScreen,
  useAgencyList,
  useDeleteAgency,
} from "../features/agencies";

export function AgencyListPage() {
  const navigate = useNavigate();
  const {
    agencies,
    isLoading,
    error,
    reload,
    setAgencyActive,
    statusUpdatingId,
  } = useAgencyList();
  const deleteAgency = useDeleteAgency();

  return (
    <AgencyListScreen
      agencies={agencies}
      isLoading={isLoading}
      listError={error}
      onBack={() => navigate(APP_ROUTES.dashboard)}
      onEditAgency={(agencyId) =>
        navigate(APP_ROUTES.editAgency.replace(":agencyId", agencyId))
      }
      onOpenModules={(agencyId) =>
        navigate(APP_ROUTES.agencyModules.replace(":agencyId", agencyId))
      }
      onRequestDelete={deleteAgency.requestDelete}
      onToggleAgencyActive={setAgencyActive}
      statusUpdatingId={statusUpdatingId}
      deletePendingAgencyId={deleteAgency.pendingAgencyId}
      deleteNotified={deleteAgency.notified}
      deleteDebugOtp={deleteAgency.debugOtp}
      deleteError={deleteAgency.error}
      isDeleteRequesting={deleteAgency.isRequesting}
      isDeleteConfirming={deleteAgency.isConfirming}
      onCancelDelete={deleteAgency.cancelDelete}
      onConfirmDelete={async (otp) => {
        const ok = await deleteAgency.confirmDelete(otp);
        if (ok) await reload();
      }}
    />
  );
}
