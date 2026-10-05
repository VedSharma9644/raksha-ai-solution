import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { APP_ROUTES } from "../app/routePaths";
import type { HrDashboardActionId } from "../features/dashboard";
import { HrDashboardScreen } from "../features/dashboard";
import type { HrNotification } from "../features/notifications";
import { SAMPLE_HR_NOTIFICATIONS } from "../features/notifications";

const ACTION_ROUTES: Record<
  HrDashboardActionId,
  (typeof APP_ROUTES)[keyof typeof APP_ROUTES]
> = {
  "add-guard": APP_ROUTES.addGuard,
  "guard-list": APP_ROUTES.guardList,
  "manage-inventory": APP_ROUTES.manageInventory,
  "manage-leave": APP_ROUTES.manageLeave,
};

export function HrDashboardPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<HrNotification[]>(
    SAMPLE_HR_NOTIFICATIONS,
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

  return (
    <HrDashboardScreen
      notifications={sortedNotifications}
      onSelectNotification={(notificationId) => {
        setNotifications((current) =>
          current.map((notification) =>
            notification.id === notificationId
              ? { ...notification, isRead: true }
              : notification,
          ),
        );
      }}
      onMarkAllNotificationsRead={() => {
        setNotifications((current) =>
          current.map((notification) => ({ ...notification, isRead: true })),
        );
      }}
      onActionClick={(actionId) => navigate(ACTION_ROUTES[actionId])}
    />
  );
}
