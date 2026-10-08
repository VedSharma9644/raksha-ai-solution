import { useCallback, useMemo } from "react";
import {
  isAdminDashboardActionEnabled,
  isModuleEnabled,
  isPathModuleEnabled,
  moduleForNotificationAction,
  requiredModuleForAdminPath,
  resolveEnabledModules,
  type PlatformModuleId,
} from "@raskha/shared";

import { useAuthContext } from "../authentication";

export function useEnabledModules() {
  const { agency } = useAuthContext();

  const enabledModules = useMemo(
    () => resolveEnabledModules(agency?.enabledModules),
    [agency?.enabledModules],
  );

  const hasModule = useCallback(
    (moduleId: PlatformModuleId) => isModuleEnabled(enabledModules, moduleId),
    [enabledModules],
  );

  const isActionEnabled = useCallback(
    (actionId: string) =>
      isAdminDashboardActionEnabled(actionId, enabledModules),
    [enabledModules],
  );

  const isPathEnabled = useCallback(
    (pathname: string) =>
      isPathModuleEnabled(requiredModuleForAdminPath(pathname), enabledModules),
    [enabledModules],
  );

  const isNotificationActionEnabled = useCallback(
    (action: string | undefined) => {
      const moduleId = moduleForNotificationAction(action);
      if (!moduleId) {
        return true;
      }
      return isModuleEnabled(enabledModules, moduleId);
    },
    [enabledModules],
  );

  return {
    enabledModules,
    hasModule,
    isActionEnabled,
    isPathEnabled,
    isNotificationActionEnabled,
  };
}
