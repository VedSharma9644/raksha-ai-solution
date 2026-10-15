import {
  DEFAULT_ENABLED_FEATURE_IDS,
  isModuleEnabled,
} from "./agencyModuleAccess";

/** Platform module ids controlled by Super Admin (must stay in sync with Feature Control catalog). */
export const PLATFORM_MODULE_IDS = [
  "form_builder",
  "employee_management",
  "attendance",
  "leave",
  "inventory",
  "payroll",
  "site_management",
  "reports",
] as const;

export type PlatformModuleId = (typeof PLATFORM_MODULE_IDS)[number];

/**
 * Admin dashboard action id → required module.
 * Cards/routes without a mapping stay visible.
 */
export const ADMIN_DASHBOARD_ACTION_MODULE: Record<string, PlatformModuleId> = {
  "form-builder": "form_builder",
  "employee-guard-list": "employee_management",
  "hr-list": "employee_management",
  "site-list": "site_management",
  "manage-inventory": "inventory",
};

/**
 * HR dashboard action id → required module.
 */
export const HR_DASHBOARD_ACTION_MODULE: Record<string, PlatformModuleId> = {
  "guard-list": "employee_management",
  "site-list": "site_management",
  "manage-inventory": "inventory",
  "prospect-guards": "employee_management",
};

/** Admin app paths (path patterns) → required module. */
export const ADMIN_ROUTE_MODULE: Array<{
  match: (path: string) => boolean;
  moduleId: PlatformModuleId;
}> = [
  { match: (p) => p === "/form-builder", moduleId: "form_builder" },
  {
    match: (p) =>
      p.startsWith("/guards") || p === "/employees" || p.startsWith("/hr"),
    moduleId: "employee_management",
  },
  {
    match: (p) => p.startsWith("/sites"),
    moduleId: "site_management",
  },
  {
    match: (p) => p.startsWith("/inventory"),
    moduleId: "inventory",
  },
  {
    match: (p) => p === "/attendance",
    moduleId: "attendance",
  },
  {
    match: (p) => p.startsWith("/leave"),
    moduleId: "leave",
  },
  {
    match: (p) => p.startsWith("/relief"),
    moduleId: "leave",
  },
  {
    match: (p) => p === "/general-settings" || p.startsWith("/payroll"),
    moduleId: "payroll",
  },
  {
    match: (p) => p.startsWith("/earnings"),
    moduleId: "site_management",
  },
  {
    match: (p) => p.startsWith("/invoices"),
    moduleId: "site_management",
  },
  {
    match: (p) => p.startsWith("/money-out"),
    moduleId: "site_management",
  },
];

/** HR app paths → required module. */
export const HR_ROUTE_MODULE: Array<{
  match: (path: string) => boolean;
  moduleId: PlatformModuleId;
}> = [
  {
    match: (p) => p.startsWith("/guards"),
    moduleId: "employee_management",
  },
  {
    match: (p) => p.startsWith("/sites"),
    moduleId: "site_management",
  },
  {
    match: (p) => p.startsWith("/inventory"),
    moduleId: "inventory",
  },
  {
    match: (p) => p.startsWith("/leave"),
    moduleId: "leave",
  },
  {
    match: (p) => p.startsWith("/relief"),
    moduleId: "leave",
  },
  {
    match: (p) => p === "/attendance",
    moduleId: "attendance",
  },
  {
    match: (p) => p === "/general-settings",
    moduleId: "payroll",
  },
];

/**
 * Resolve modules for UI gating.
 * - missing / null → platform defaults
 * - explicit array (including empty) → use as-is (Super Admin locked them down)
 */
export function resolveEnabledModules(
  enabledModules: string[] | undefined | null
): string[] {
  if (!Array.isArray(enabledModules)) {
    return [...DEFAULT_ENABLED_FEATURE_IDS];
  }
  return enabledModules.filter((id) => typeof id === "string" && id.length > 0);
}

export function isAdminDashboardActionEnabled(
  actionId: string,
  enabledModules: string[] | undefined | null
): boolean {
  const moduleId = ADMIN_DASHBOARD_ACTION_MODULE[actionId];
  if (!moduleId) {
    return true;
  }
  return isModuleEnabled(resolveEnabledModules(enabledModules), moduleId);
}

export function isHrDashboardActionEnabled(
  actionId: string,
  enabledModules: string[] | undefined | null
): boolean {
  const moduleId = HR_DASHBOARD_ACTION_MODULE[actionId];
  if (!moduleId) {
    return true;
  }
  return isModuleEnabled(resolveEnabledModules(enabledModules), moduleId);
}

export function requiredModuleForAdminPath(
  pathname: string
): PlatformModuleId | null {
  for (const rule of ADMIN_ROUTE_MODULE) {
    if (rule.match(pathname)) {
      return rule.moduleId;
    }
  }
  return null;
}

export function requiredModuleForHrPath(
  pathname: string
): PlatformModuleId | null {
  for (const rule of HR_ROUTE_MODULE) {
    if (rule.match(pathname)) {
      return rule.moduleId;
    }
  }
  return null;
}

export function isPathModuleEnabled(
  moduleId: PlatformModuleId | null,
  enabledModules: string[] | undefined | null
): boolean {
  if (!moduleId) {
    return true;
  }
  return isModuleEnabled(resolveEnabledModules(enabledModules), moduleId);
}

/** Map notification action → module for filtering the bell feed. */
export function moduleForNotificationAction(
  action: string | undefined | null
): PlatformModuleId | null {
  if (action === "leave") return "leave";
  if (action === "relief") return "leave";
  if (action === "attendance") return "attendance";
  if (action === "inventory") return "inventory";
  return null;
}
