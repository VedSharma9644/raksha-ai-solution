import { useNavigate } from "react-router-dom";
import { APP_ROUTES } from "../app/routePaths";
import {
  AgencyListScreen,
  useAgencyList,
  useDeleteAgency,
  useFormBuilderManager,
} from "../features/agencies";

export function AgencyListPage() {
  const navigate = useNavigate();
  const { agencies, isLoading, error, reload } = useAgencyList();
  const { isEnabled, toggleFormBuilder, isLoading: fbLoading } =
    useFormBuilderManager();
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
      onSelectAgency={(agencyId) => {
        navigate(APP_ROUTES.featureControl);
        console.info("Agency selected", agencyId);
      }}
      onRequestDelete={deleteAgency.requestDelete}
      formBuilderStatus={isEnabled}
      onToggleFormBuilder={toggleFormBuilder}
      isFormBuilderLoading={fbLoading}
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
