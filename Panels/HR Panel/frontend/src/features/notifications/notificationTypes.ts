export type HrNotificationKind =
  | "upcoming_leave"
  | "leave_request"
  | "inventory_alert"
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
  guard_update: "Guard update",
  general: "Update",
};

export const SAMPLE_HR_NOTIFICATIONS: HrNotification[] = [
  {
    id: "hr-notif-1",
    kind: "leave_request",
    title: "New leave request",
    message: "Guard Suresh Patil requested leave from 8 Oct to 10 Oct.",
    createdAt: "2026-10-05T09:10:00.000Z",
    isRead: false,
  },
  {
    id: "hr-notif-2",
    kind: "upcoming_leave",
    title: "Leave starting tomorrow",
    message: "Guard Rajesh Kumar starts approved leave tomorrow.",
    createdAt: "2026-10-05T08:20:00.000Z",
    isRead: false,
  },
  {
    id: "hr-notif-3",
    kind: "inventory_alert",
    title: "Uniform stock low",
    message: "Large-size shirts need restocking before next onboarding batch.",
    createdAt: "2026-10-04T15:40:00.000Z",
    isRead: false,
  },
  {
    id: "hr-notif-4",
    kind: "guard_update",
    title: "Guard profile incomplete",
    message: "Farhan Ali is missing emergency contact details.",
    createdAt: "2026-10-04T12:05:00.000Z",
    isRead: true,
  },
];
