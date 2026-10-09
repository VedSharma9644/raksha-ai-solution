import { useNavigate, useParams } from "react-router-dom";
import { APP_ROUTES } from "../app/routePaths";
import { SchedulingScreen } from "../features/scheduling";
import { useScheduling } from "../features/scheduling/useScheduling";
import { useSaveShiftAssignment } from "../features/scheduling/useSaveShiftAssignment";
import { useGuardList } from "../features/guards/useGuardList";

export function SchedulingPage() {
  const { siteId } = useParams<{ siteId: string }>();
  const navigate = useNavigate();

  const id = siteId ?? "";
  const { site, assignments, isLoading, error, reload } = useScheduling(id);
  const { guards } = useGuardList();
  const { isSaving, saveError, createAssignment, updateAssignment, removeAssignment } =
    useSaveShiftAssignment();

  if (!isLoading && !site && !error) {
    return <p style={{ padding: "2rem" }}>Site not found.</p>;
  }

  if (!site) {
    return (
      <div style={{ padding: "2rem" }}>
        {error ? (
          <p style={{ color: "red" }}>{error}</p>
        ) : (
          <p>Loading…</p>
        )}
      </div>
    );
  }

  return (
    <SchedulingScreen
      site={site}
      assignments={assignments}
      guards={guards}
      isLoading={isLoading}
      error={error}
      isSaving={isSaving}
      saveError={saveError}
      canEdit={true}
      onBack={() => navigate(APP_ROUTES.siteList)}
      onCreateAssignment={async (params) => {
        const created = await createAssignment({
          siteId: id,
          ...params,
        });
        if (created) {
          reload();
          return true;
        }
        return false;
      }}
      onUpdateAssignment={async (assignmentId, params) => {
        const ok = await updateAssignment(assignmentId, params);
        if (ok) {
          reload();
        }
        return ok;
      }}
      onDeleteAssignment={async (assignmentId) => {
        const ok = await removeAssignment(assignmentId);
        if (ok) {
          reload();
        }
        return ok;
      }}
    />
  );
}
