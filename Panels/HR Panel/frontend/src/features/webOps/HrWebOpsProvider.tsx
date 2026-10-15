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

  const value = useMemo<WebOpsContextValue>(
    () => ({
      role: "hr",
      agencyId: hrStaff?.agencyId ?? null,
      activeBranchId,
      db,
      getIdToken,
      capabilities: {
        canCorrectAttendance: false,
        canEditSites: false,
      },
    }),
    [hrStaff?.agencyId, activeBranchId, getIdToken]
  );

  return <WebOpsProvider value={value}>{children}</WebOpsProvider>;
}
