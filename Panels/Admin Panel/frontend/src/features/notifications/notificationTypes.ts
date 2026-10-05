export type NotificationKind =
  | "upcoming_leave"
  | "relieve_request"
  | "attendance_alert"
  | "inventory_alert"
  | "general";

export interface AgencyNotification {
  id: string;
  kind: NotificationKind;
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
}

export const NOTIFICATION_KIND_LABELS: Record<NotificationKind, string> = {
  upcoming_leave: "Upcoming leave",
  relieve_request: "Relieve request",
  attendance_alert: "Attendance",
  inventory_alert: "Inventory",
  general: "Update",
};
