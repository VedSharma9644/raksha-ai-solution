import { auth } from "../../lib/firebase";

function resolveAdminApiBase(): string {
  const fromEnv = import.meta.env.VITE_ADMIN_API_URL?.replace(/\/$/, "");
  if (import.meta.env.DEV) {
    const forceRemote = import.meta.env.VITE_ADMIN_API_FORCE_REMOTE === "true";
    if (!forceRemote) {
      return "http://localhost:3001";
    }
  }
  return fromEnv || "http://localhost:3001";
}

const API_BASE = resolveAdminApiBase();

export type NotificationAction = "leave" | "attendance" | "inventory" | "none";

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

async function authHeaders(): Promise<Headers> {
  const headers = new Headers({ "Content-Type": "application/json" });
  const user = auth.currentUser;
  if (!user) {
    throw new Error("You must be signed in to view notifications.");
  }
  const token = await user.getIdToken();
  headers.set("Authorization", `Bearer ${token}`);
  return headers;
}

export async function fetchAgencyNotifications(): Promise<NotificationsResponse> {
  const response = await fetch(`${API_BASE}/api/notifications`, {
    headers: await authHeaders(),
  });
  const data = (await response.json().catch(() => ({}))) as NotificationsResponse & {
    error?: string;
  };
  if (!response.ok) {
    throw new Error(data.error ?? `Request failed (${response.status})`);
  }
  return data;
}
