import { useCallback, useMemo } from "react";
import {
  isHrDashboardActionEnabled,
  isModuleEnabled,
  isPathModuleEnabled,
  moduleForNotificationAction,
  requiredModuleForHrPath,
  resolveEnabledModules,
  type PlatformModuleId,
} from "@raskha/shared";

import { useAuthContext } from "../authentication";

export function useEnabledModules() {
  const { enabledModules: rawModules } = useAuthContext();

  const enabledModules = useMemo(
    () => resolveEnabledModules(rawModules),
    [rawModules],
  );

  const hasModule = useCallback(
    (moduleId: PlatformModuleId) => isModuleEnabled(enabledModules, moduleId),
    [enabledModules],
  );

  const isActionEnabled = useCallback(
    (actionId: string) => isHrDashboardActionEnabled(actionId, enabledModules),
    [enabledModules],
  );

  const isPathEnabled = useCallback(
    (pathname: string) =>
      isPathModuleEnabled(requiredModuleForHrPath(pathname), enabledModules),
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
