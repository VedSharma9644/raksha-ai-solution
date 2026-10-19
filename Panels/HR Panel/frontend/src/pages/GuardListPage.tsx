import { useNavigate } from "react-router-dom";
import { APP_ROUTES, viewGuardPath } from "../app/routePaths";
import {
  GuardListScreen,
  useDeleteGuard,
  useGuardList,
} from "../features/guards";
import type { GuardListItem } from "../features/guards";

export function GuardListPage() {
  const navigate = useNavigate();
  const { guards, isLoading, error, reload } = useGuardList();
  const { removeGuard } = useDeleteGuard();

  const listItems: GuardListItem[] = guards.map((g) => ({
    id: g.id,
    fullName: g.fullName,
    employeeCode: g.employeeCode,
    phone: g.phone,
    status: g.status,
    profilePictureUrl: g.profilePictureUrl || undefined,
  }));

  if (isLoading) {
    return <p style={{ padding: "2rem" }}>Loading guards…</p>;
  }

  return (
    <>
      {error && <p style={{ color: "red", padding: "1rem" }}>{error}</p>}
      <GuardListScreen
        guards={listItems}
        onBack={() => navigate(APP_ROUTES.dashboard)}
        onAddGuard={() => navigate(APP_ROUTES.addGuard)}
        onViewGuard={(guardId) => navigate(viewGuardPath(guardId))}
        onDeleteGuard={(guardId) => {
          const guard = listItems.find((g) => g.id === guardId);
          void removeGuard(guardId, guard?.fullName ?? "this guard", () =>
            reload(),
          );
        }}
      />
    </>
  );
}
