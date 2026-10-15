import { useCallback, useMemo, type ReactNode } from "react";
import {
  WebOpsProvider,
  type WebOpsContextValue,
} from "@raskha/web-ops";
import { useAuthContext } from "../authentication";
import { useBranchContext } from "../branches";
import { auth, db } from "../../lib/firebase";

export function AdminWebOpsProvider({ children }: { children: ReactNode }) {
  const { agency } = useAuthContext();
  const { activeBranchId } = useBranchContext();

  const getIdToken = useCallback(async () => {
    const user = auth.currentUser;
    if (!user) return null;
    return user.getIdToken();
  }, []);

  const value = useMemo<WebOpsContextValue>(
    () => ({
      role: "agency",
      agencyId: agency?.id ?? null,
      activeBranchId,
      db,
      getIdToken,
      capabilities: {
        canCorrectAttendance: true,
        canEditSites: true,
      },
    }),
    [agency?.id, activeBranchId, getIdToken]
  );

  return <WebOpsProvider value={value}>{children}</WebOpsProvider>;
}
