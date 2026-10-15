import { adminFetch } from "@raskha/shared";

export type NotificationAction =
  | "leave"
  | "relief"
  | "attendance"
  | "inventory"
  | "none";

export type ApiNotification = {
  id: string;
  kind: string;
  title: string;
  message: string;
  createdAt: string;
  action: NotificationAction;
};

export type NotificationsResponse = {
  date: string;
  notifications: ApiNotification[];
};

export async function fetchAgencyNotifications(): Promise<NotificationsResponse> {
  return adminFetch<NotificationsResponse>("/api/notifications", {
    errorMessage: "You must be signed in to view notifications.",
  });
}
