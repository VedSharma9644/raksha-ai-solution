import { APP_ROUTES } from "../../app/routePaths";
import type { DashboardActionId } from "../../features/dashboard";

export type AdminNavChild = {
  id: string;
  label: string;
  to: string;
  /** Optional module gate — omit = always when parent visible */
  module?: "attendance" | "leave" | "site_management" | "payroll" | "form_builder" | "employee_management" | "inventory";
};

export type AdminNavItem = {
  id: string;
  label: string;
  /** Top-level link when no children */
  to?: string;
  /** Maps to dashboard action gating */
  actionId?: DashboardActionId;
  children?: AdminNavChild[];
};

/**
 * Sidebar tree — mirrors former dashboard hubs (nested schedule + payments).
 */
export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    to: APP_ROUTES.dashboard,
  },
  {
    id: "form-builder",
    label: "Form Builder",
    to: APP_ROUTES.formBuilder,
    actionId: "form-builder",
  },
  {
    id: "sites",
    label: "Sites",
    to: APP_ROUTES.siteList,
    actionId: "site-list",
  },
  {
    id: "inventory",
    label: "Manage Inventory",
    to: APP_ROUTES.inventoryList,
    actionId: "manage-inventory",
  },
  {
    id: "guards",
    label: "Guards",
    to: APP_ROUTES.employeeList,
    actionId: "employee-guard-list",
  },
  {
    id: "hr",
    label: "HR",
    to: APP_ROUTES.hrList,
    actionId: "hr-list",
  },
  {
    id: "manage-schedule",
    label: "Manage schedule",
    actionId: "manage-schedule",
    children: [
      {
        id: "attendance",
        label: "Attendance",
        to: APP_ROUTES.attendance,
        module: "attendance",
      },
      {
        id: "leave",
        label: "Manage leave",
        to: APP_ROUTES.manageLeave,
        module: "leave",
      },
      {
        id: "relief",
        label: "Manage relief",
        to: APP_ROUTES.manageRelief,
        module: "leave",
      },
      {
        id: "scheduling",
        label: "Scheduling",
        to: APP_ROUTES.siteList,
        module: "site_management",
      },
    ],
  },
  {
    id: "prospect-leads",
    label: "Prospect leads",
    actionId: "prospect-leads",
    children: [
      {
        id: "prospect-hub",
        label: "Overview",
        to: APP_ROUTES.prospectLeads,
      },
      {
        id: "prospect-clients",
        label: "Client leads",
        to: APP_ROUTES.prospects,
      },
      {
        id: "prospect-guards",
        label: "Guard candidates",
        to: APP_ROUTES.prospectGuards,
      },
    ],
  },
  {
    id: "branches",
    label: "Branches",
    to: APP_ROUTES.branchList,
    actionId: "branches",
  },
  {
    id: "payment-management",
    label: "Payment management",
    actionId: "payment-management",
    children: [
      {
        id: "payment-hub",
        label: "Overview",
        to: APP_ROUTES.paymentManagement,
      },
      {
        id: "payroll",
        label: "Payroll",
        to: APP_ROUTES.payroll,
        module: "payroll",
      },
      {
        id: "earnings",
        label: "Earnings",
        to: APP_ROUTES.earnings,
        module: "site_management",
      },
      {
        id: "invoices",
        label: "Invoices",
        to: APP_ROUTES.invoices,
        module: "site_management",
      },
      {
        id: "money-out",
        label: "Money out",
        to: APP_ROUTES.moneyOut,
        module: "site_management",
      },
    ],
  },
];
