import type { ButtonHTMLAttributes } from "react";
import "./NotificationButton.css";

export interface NotificationButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  unreadCount?: number;
  label?: string;
}

export function NotificationButton({
  unreadCount = 0,
  label = "Notifications",
  className = "",
  type = "button",
  ...rest
}: NotificationButtonProps) {
  const hasUnread = unreadCount > 0;
  const badgeLabel =
    unreadCount > 99 ? "99+" : hasUnread ? String(unreadCount) : undefined;

  const classes = ["notification-button", className].filter(Boolean).join(" ");

  return (
    <button
      type={type}
      className={classes}
      aria-label={
        hasUnread ? `${label}, ${unreadCount} unread` : label
      }
      {...rest}
    >
      <span className="notification-button__icon" aria-hidden="true">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 3a5 5 0 0 0-5 5v2.2c0 .7-.2 1.4-.6 2L5 14.8c-.5.7 0 1.7.8 1.7h12.4c.8 0 1.3-1 .8-1.7l-1.4-2.6c-.4-.6-.6-1.3-.6-2V8a5 5 0 0 0-5-5Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path
            d="M10 18a2 2 0 0 0 4 0"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      </span>
      <span className="notification-button__text">{label}</span>
      {badgeLabel ? (
        <span className="notification-button__badge">{badgeLabel}</span>
      ) : null}
    </button>
  );
}
