import { useEffect, useId, useRef, useState } from "react";
import { NotificationButton } from "../../../components/NotificationButton";
import type { AgencyNotification } from "../notificationTypes";
import { NotificationDropdown } from "../NotificationDropdown";
import "./NotificationMenu.css";

export interface NotificationMenuProps {
  notifications: AgencyNotification[];
  onSelectNotification: (notificationId: string) => void;
  onMarkAllRead?: () => void;
}

export function NotificationMenu({
  notifications,
  onSelectNotification,
  onMarkAllRead,
}: NotificationMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const dropdownId = useId();
  const unreadCount = notifications.filter((item) => !item.isRead).length;

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  function handleSelectNotification(notificationId: string) {
    onSelectNotification(notificationId);
    setIsOpen(false);
  }

  return (
    <div className="notification-menu" ref={menuRef}>
      <NotificationButton
        unreadCount={unreadCount}
        aria-expanded={isOpen}
        aria-controls={dropdownId}
        aria-haspopup="true"
        onClick={() => setIsOpen((current) => !current)}
      />

      <NotificationDropdown
        id={dropdownId}
        notifications={notifications}
        isOpen={isOpen}
        onSelectNotification={handleSelectNotification}
        onMarkAllRead={onMarkAllRead}
      />
    </div>
  );
}
