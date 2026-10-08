export type HrNotificationKind =
  | "upcoming_leave"
  | "leave_request"
  | "inventory_alert"
  | "attendance_alert"
  | "guard_update"
  | "general";

export interface HrNotification {
  id: string;
  kind: HrNotificationKind;
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
}

export const HR_NOTIFICATION_KIND_LABELS: Record<HrNotificationKind, string> = {
  upcoming_leave: "Upcoming leave",
  leave_request: "Leave request",
  inventory_alert: "Inventory",
  attendance_alert: "Attendance",
  guard_update: "Guard update",
  general: "Update",
};

/** @deprecated Prefer live feed from useAgencyNotifications */
export const SAMPLE_HR_NOTIFICATIONS: HrNotification[] = [];
