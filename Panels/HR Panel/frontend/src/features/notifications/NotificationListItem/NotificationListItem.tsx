import type { HrNotification } from "../notificationTypes";
import { HR_NOTIFICATION_KIND_LABELS } from "../notificationTypes";
import "./NotificationListItem.css";

export interface NotificationListItemProps {
  notification: HrNotification;
  onSelect: (notificationId: string) => void;
}

function formatRelativeTime(isoDate: string): string {
  const createdAt = new Date(isoDate).getTime();
  const minutes = Math.max(0, Math.floor((Date.now() - createdAt) / 60000));

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  return `${Math.floor(hours / 24)}d ago`;
}

export function NotificationListItem({
  notification,
  onSelect,
}: NotificationListItemProps) {
  return (
    <button
      type="button"
      className={[
        "notification-list-item",
        notification.isRead ? "" : "notification-list-item--unread",
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={() => onSelect(notification.id)}
    >
      <span className="notification-list-item__meta">
        <span
          className={[
            "notification-list-item__kind",
            `notification-list-item__kind--${notification.kind}`,
          ].join(" ")}
        >
          {HR_NOTIFICATION_KIND_LABELS[notification.kind]}
        </span>
        <time dateTime={notification.createdAt}>
          {formatRelativeTime(notification.createdAt)}
        </time>
      </span>
      <span className="notification-list-item__title">{notification.title}</span>
      <span className="notification-list-item__message">
        {notification.message}
      </span>
    </button>
  );
}
