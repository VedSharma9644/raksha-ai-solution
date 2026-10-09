import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { APP_ROUTES } from "../app/routePaths";
import { useAuthContext } from "../features/authentication";
import type { HrDashboardActionId } from "../features/dashboard";
import { HR_DASHBOARD_ACTIONS, HrDashboardScreen } from "../features/dashboard";
import { useEnabledModules } from "../features/modules/useEnabledModules";
import { useAgencyNotifications } from "../features/notifications/useAgencyNotifications";

const ACTION_ROUTES: Record<
  HrDashboardActionId,
  (typeof APP_ROUTES)[keyof typeof APP_ROUTES]
> = {
  "add-guard": APP_ROUTES.addGuard,
  "guard-list": APP_ROUTES.guardList,
  "manage-inventory": APP_ROUTES.manageInventory,
  "manage-leave": APP_ROUTES.manageLeave,
  "manage-relief": APP_ROUTES.manageRelief,
  "site-list": APP_ROUTES.siteList,
  attendance: APP_ROUTES.attendance,
  scheduling: APP_ROUTES.siteList, // scheduling starts from site list → schedule button
  "prospect-guards": APP_ROUTES.prospectGuards,
};

export function HrDashboardPage() {
  const navigate = useNavigate();
  const { refreshModules } = useAuthContext();
  const { isActionEnabled, isNotificationActionEnabled } = useEnabledModules();
  const {
    notifications,
    markRead,
    markAllRead,
    getAction,
  } = useAgencyNotifications();

  useEffect(() => {
    void refreshModules();
    const onFocus = () => {
      void refreshModules();
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [refreshModules]);

  const visibleActions = useMemo(
    () => HR_DASHBOARD_ACTIONS.filter((action) => isActionEnabled(action.id)),
    [isActionEnabled],
  );

  const visibleNotifications = useMemo(
    () =>
      notifications.filter((n) =>
        isNotificationActionEnabled(getAction(n.id)),
      ),
    [getAction, isNotificationActionEnabled, notifications],
  );

  return (
    <HrDashboardScreen
      actions={visibleActions}
      notifications={visibleNotifications}
      onSelectNotification={(notificationId) => {
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
          navigate(APP_ROUTES.manageInventory);
          return;
        }
        if (action === "leave") {
          navigate(APP_ROUTES.manageLeave);
          return;
        }
        if (action === "relief") {
          navigate(APP_ROUTES.manageRelief);
        }
      }}
      onMarkAllNotificationsRead={markAllRead}
      onActionClick={(actionId) => {
        if (!isActionEnabled(actionId)) {
          return;
        }
        navigate(ACTION_ROUTES[actionId]);
      }}
    />
  );
}
