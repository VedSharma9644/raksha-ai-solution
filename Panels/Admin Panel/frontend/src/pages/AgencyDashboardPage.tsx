import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { APP_ROUTES } from "../app/routePaths";
import { useAuthContext } from "../features/authentication";
import type { DashboardActionId } from "../features/dashboard";
import { AgencyDashboardScreen, DASHBOARD_ACTIONS } from "../features/dashboard";
import { useEnabledModules } from "../features/modules/useEnabledModules";
import { useAgencyNotifications } from "../features/notifications/useAgencyNotifications";

const DASHBOARD_ACTION_ROUTES: Partial<
  Record<DashboardActionId, string>
> = {
  "form-builder": APP_ROUTES.formBuilder,
  "add-guard": APP_ROUTES.addGuard,
  "add-site": APP_ROUTES.addSite,
  "site-list": APP_ROUTES.siteList,
  "employee-guard-list": APP_ROUTES.employeeList,
  "add-hr": APP_ROUTES.addHrStaff,
  "hr-list": APP_ROUTES.hrList,
  "manage-inventory": APP_ROUTES.inventoryList,
  attendance: APP_ROUTES.attendance,
  scheduling: APP_ROUTES.siteList, // scheduling starts from site list → schedule button
};

export function AgencyDashboardPage() {
  const navigate = useNavigate();
  const { refreshAgency } = useAuthContext();
  const { isActionEnabled, isNotificationActionEnabled } = useEnabledModules();
  const {
    notifications,
    markRead,
    markAllRead,
    getAction,
  } = useAgencyNotifications();

  useEffect(() => {
    void refreshAgency();
    const onFocus = () => {
      void refreshAgency();
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [refreshAgency]);

  const visibleActions = useMemo(
    () => DASHBOARD_ACTIONS.filter((action) => isActionEnabled(action.id)),
    [isActionEnabled],
  );

  const visibleNotifications = useMemo(
    () =>
      notifications.filter((n) =>
        isNotificationActionEnabled(getAction(n.id)),
      ),
    [getAction, isNotificationActionEnabled, notifications],
  );

  function handleSelectNotification(notificationId: string) {
    const action = getAction(notificationId);
    markRead(notificationId);

    if (!isNotificationActionEnabled(action)) {
      return;
    }

    if (action === "attendance") {
      navigate(APP_ROUTES.attendance);
      return;
    }
    if (action === "inventory") {
      navigate(APP_ROUTES.inventoryList);
      return;
    }
    if (action === "leave") {
      navigate(APP_ROUTES.employeeList);
    }
  }

  function handleActionClick(actionId: DashboardActionId) {
    if (!isActionEnabled(actionId)) {
      return;
    }
    const route = DASHBOARD_ACTION_ROUTES[actionId];

    if (route) {
      navigate(route);
      return;
    }

    console.info("Dashboard action not routed yet", actionId);
  }

  return (
    <AgencyDashboardScreen
      actions={visibleActions}
      notifications={visibleNotifications}
      onSelectNotification={handleSelectNotification}
      onMarkAllNotificationsRead={markAllRead}
      onActionClick={handleActionClick}
    />
  );
}
