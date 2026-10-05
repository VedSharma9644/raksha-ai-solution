import type { HrNotification } from "../notificationTypes";
import { NotificationListItem } from "../NotificationListItem";
import "./NotificationDropdown.css";

export interface NotificationDropdownProps {
  id: string;
  notifications: HrNotification[];
  isOpen: boolean;
  onSelectNotification: (notificationId: string) => void;
  onMarkAllRead?: () => void;
}

export function NotificationDropdown({
  id,
  notifications,
  isOpen,
  onSelectNotification,
  onMarkAllRead,
}: NotificationDropdownProps) {
  if (!isOpen) return null;

  const unreadCount = notifications.filter((item) => !item.isRead).length;

  return (
    <div
      id={id}
      className="notification-dropdown"
      role="region"
      aria-label="Notifications"
    >
      <div className="notification-dropdown__header">
        <div>
          <p className="notification-dropdown__title">Notifications</p>
          <p className="notification-dropdown__subtitle">
            {unreadCount > 0
              ? `${unreadCount} unread`
              : "You are all caught up"}
          </p>
        </div>
        {onMarkAllRead && unreadCount > 0 ? (
          <button
            type="button"
            className="notification-dropdown__mark-all"
            onClick={onMarkAllRead}
          >
            Mark all read
          </button>
        ) : null}
      </div>

      {notifications.length === 0 ? (
        <p className="notification-dropdown__empty">
          Leave and inventory alerts will appear here.
        </p>
      ) : (
        <div className="notification-dropdown__list" role="list">
          {notifications.map((notification) => (
            <div key={notification.id} role="listitem">
              <NotificationListItem
                notification={notification}
                onSelect={onSelectNotification}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
