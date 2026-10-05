import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { APP_ROUTES } from "../app/routePaths";
import type { DashboardActionId } from "../features/dashboard";
import { AgencyDashboardScreen } from "../features/dashboard";
import type { AgencyNotification } from "../features/notifications";
import { SAMPLE_AGENCY_NOTIFICATIONS } from "../features/notifications";

const DASHBOARD_ACTION_ROUTES: Partial<
  Record<DashboardActionId, string>
> = {
  "add-guard": APP_ROUTES.addGuard,
  "add-site": APP_ROUTES.addSite,
  "employee-guard-list": APP_ROUTES.employeeList,
  "add-hr": APP_ROUTES.addHrStaff,
  "hr-list": APP_ROUTES.hrList,
};

export function AgencyDashboardPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<AgencyNotification[]>(
    SAMPLE_AGENCY_NOTIFICATIONS,
  );

  const sortedNotifications = useMemo(
    () =>
      [...notifications].sort(
        (left, right) =>
          new Date(right.createdAt).getTime() -
          new Date(left.createdAt).getTime(),
      ),
    [notifications],
  );

  function handleSelectNotification(notificationId: string) {
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === notificationId
          ? { ...notification, isRead: true }
          : notification,
      ),
    );
    console.info("Notification selected", notificationId);
  }

  function handleMarkAllNotificationsRead() {
    setNotifications((current) =>
      current.map((notification) => ({ ...notification, isRead: true })),
    );
  }

  function handleActionClick(actionId: DashboardActionId) {
    const route = DASHBOARD_ACTION_ROUTES[actionId];

    if (route) {
      navigate(route);
      return;
    }

    console.info("Dashboard action not routed yet", actionId);
  }

  return (
    <AgencyDashboardScreen
      notifications={sortedNotifications}
      onSelectNotification={handleSelectNotification}
      onMarkAllNotificationsRead={handleMarkAllNotificationsRead}
      onActionClick={handleActionClick}
    />
  );
}
