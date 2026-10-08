import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import {
  isPathModuleEnabled,
  requiredModuleForHrPath,
  resolveEnabledModules,
} from "@raskha/shared";

import { useAuthContext } from "../features/authentication";
import { APP_ROUTES } from "../app/routePaths";

type ModuleProtectedRouteProps = {
  children: ReactNode;
};

export function ModuleProtectedRoute({ children }: ModuleProtectedRouteProps) {
  const { hrStaff, enabledModules: rawModules, isLoading } = useAuthContext();
  const location = useLocation();

  if (isLoading) {
    return null;
  }

  if (!hrStaff) {
    return <Navigate to={APP_ROUTES.login} replace />;
  }

  const enabledModules = resolveEnabledModules(rawModules);
  const required = requiredModuleForHrPath(location.pathname);
  if (!isPathModuleEnabled(required, enabledModules)) {
    return <Navigate to={APP_ROUTES.dashboard} replace />;
  }

  return <>{children}</>;
}
