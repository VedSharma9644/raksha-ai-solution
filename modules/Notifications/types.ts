import type { Timestamp } from "firebase-admin/firestore";

export const GUARD_PUSH_TOKENS_COLLECTION = "guardPushTokens";
export const GUARD_NOTIFICATIONS_COLLECTION = "guardNotifications";

export type GuardNotificationType =
  | "leave_decision"
  | "relief_decision"
  | "relief_assignment"
  | "shift_start_reminder"
  | "login_reminder"
  | "shift_end_reminder"
  | "sign_out_reminder"
  | "general";

export type GuardNotificationRecord = {
  id: string;
  guardId: string;
  agencyId: string;
  type: GuardNotificationType;
  title: string;
  body: string;
  data: Record<string, string>;
  read: boolean;
  createdAt: Timestamp;
};

export type GuardPushTokenRecord = {
  id: string;
  guardId: string;
  agencyId: string;
  expoPushToken: string;
  platform: "ios" | "android" | "web" | "unknown";
  deviceId: string;
  disabled: boolean;
  updatedAt: Timestamp;
  createdAt: Timestamp;
};

export type GuardNotificationDto = {
  id: string;
  type: GuardNotificationType;
  title: string;
  body: string;
  data: Record<string, string>;
  read: boolean;
  createdAt: string;
};

export type NotifyGuardParams = {
  guardId: string;
  agencyId: string;
  type: GuardNotificationType;
  title: string;
  body: string;
  data?: Record<string, string>;
  /** Persist inbox row (default true). */
  persist?: boolean;
  /** Send Expo remote push (default true). */
  push?: boolean;
};
