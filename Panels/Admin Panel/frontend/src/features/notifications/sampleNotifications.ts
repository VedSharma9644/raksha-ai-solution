import type { AgencyNotification } from "./notificationTypes";

export const SAMPLE_AGENCY_NOTIFICATIONS: AgencyNotification[] = [
  {
    id: "notif-1",
    kind: "upcoming_leave",
    title: "Leave starting tomorrow",
    message: "Guard Rajesh Kumar has approved leave from 6 Oct to 8 Oct.",
    createdAt: "2026-10-05T08:15:00.000Z",
    isRead: false,
  },
  {
    id: "notif-2",
    kind: "relieve_request",
    title: "Relieve request pending",
    message: "Supervisor Amit Singh requested relief at Gate 3, ABC Green Valley.",
    createdAt: "2026-10-05T07:40:00.000Z",
    isRead: false,
  },
  {
    id: "notif-3",
    kind: "attendance_alert",
    title: "Check-in delayed",
    message: "2 guards have not marked attendance for the morning shift.",
    createdAt: "2026-10-05T06:55:00.000Z",
    isRead: false,
  },
  {
    id: "notif-4",
    kind: "inventory_alert",
    title: "Uniform stock running low",
    message: "Large-size shirts are below the agency reorder level.",
    createdAt: "2026-10-04T16:20:00.000Z",
    isRead: true,
  },
];
