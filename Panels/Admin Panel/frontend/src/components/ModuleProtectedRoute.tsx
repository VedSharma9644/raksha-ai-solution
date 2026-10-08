import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import {
  isPathModuleEnabled,
  requiredModuleForAdminPath,
  resolveEnabledModules,
} from "@raskha/shared";

import { useAuthContext } from "../features/authentication";
import { APP_ROUTES } from "../app/routePaths";

type ModuleProtectedRouteProps = {
  children: ReactNode;
};

/**
 * Blocks module routes when Super Admin has not enabled that module for the agency.
 */
export function ModuleProtectedRoute({ children }: ModuleProtectedRouteProps) {
  const { agency, isLoading } = useAuthContext();
  const location = useLocation();

  if (isLoading) {
    return null;
  }

  if (!agency) {
    return <Navigate to={APP_ROUTES.login} replace />;
  }

  const enabledModules = resolveEnabledModules(agency.enabledModules);
  const required = requiredModuleForAdminPath(location.pathname);
  if (!isPathModuleEnabled(required, enabledModules)) {
    return <Navigate to={APP_ROUTES.dashboard} replace />;
  }

  return <>{children}</>;
}
