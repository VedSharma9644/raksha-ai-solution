import { useCallback, useMemo, type ReactNode } from "react";
import {
  WebOpsProvider,
  type WebOpsContextValue,
} from "@raskha/web-ops";
import { useAuthContext } from "../authentication";
import { useBranchContext } from "../branches";
import { auth, db } from "../../lib/firebase";

/** HR panel shares the Admin API; capabilities are read-only for sites/attendance corrections. */
export function HrWebOpsProvider({ children }: { children: ReactNode }) {
  const { hrStaff } = useAuthContext();
  const { activeBranchId } = useBranchContext();

  const getIdToken = useCallback(async () => {
    const user = auth.currentUser;
    if (!user) return null;
    return user.getIdToken();
  }, []);

  // Legacy HR docs without assignedSiteIds → null (all branch sites).
  // Explicit [] means Admin cleared all site assignments.
  const assignedSiteIds =
    hrStaff == null
      ? null
      : hrStaff.assignedSiteIds === undefined
        ? null
        : hrStaff.assignedSiteIds;

  const value = useMemo<WebOpsContextValue>(
    () => ({
      role: "hr",
      agencyId: hrStaff?.agencyId ?? null,
      activeBranchId,
      assignedSiteIds,
      db,
      getIdToken,
      capabilities: {
        canCorrectAttendance: false,
        canEditSites: false,
      },
    }),
    [hrStaff?.agencyId, activeBranchId, assignedSiteIds, getIdToken]
  );

  return <WebOpsProvider value={value}>{children}</WebOpsProvider>;
}
