import { useMemo } from "react";
import { isFormBuilderModuleEnabled } from "@raskha/shared";
import { useAuthContext } from "../authentication";

/**
 * Form Builder on/off from agency.enabledModules (cached at Raksha verify-login).
 * Super Admin is the source of truth at login; panels read the local agency cache.
 */
export function useFormBuilderStatus(_agencyId?: string) {
  const { agency, isLoading: isAuthLoading } = useAuthContext();

  const isEnabled = useMemo(
    () => isFormBuilderModuleEnabled(agency?.enabledModules),
    [agency?.enabledModules]
  );

  return {
    isEnabled,
    isLoading: isAuthLoading,
  };
}
