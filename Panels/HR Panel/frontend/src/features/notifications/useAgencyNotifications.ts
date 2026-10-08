import { useCallback, useEffect, useMemo, useState } from "react";

import { auth } from "../../lib/firebase";
import { useAuthContext } from "../authentication";
import {
  fetchAgencyNotifications,
  type NotificationAction,
} from "./notificationApi";
import type { HrNotification, HrNotificationKind } from "./notificationTypes";

const READ_STORAGE_PREFIX = "raskha.hr.notifications.read";

function readKey(agencyId: string, uid: string): string {
  return `${READ_STORAGE_PREFIX}:${agencyId}:${uid}`;
}

function loadReadIds(agencyId: string, uid: string): Set<string> {
  try {
    const raw = localStorage.getItem(readKey(agencyId, uid));
    if (!raw) {
      return new Set();
    }
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return new Set();
    }
    return new Set(parsed.filter((id): id is string => typeof id === "string"));
  } catch {
    return new Set();
  }
}

function saveReadIds(agencyId: string, uid: string, ids: Set<string>): void {
  try {
    localStorage.setItem(readKey(agencyId, uid), JSON.stringify([...ids]));
  } catch {
    // ignore
  }
}

const KNOWN_KINDS = new Set<HrNotificationKind>([
  "upcoming_leave",
  "leave_request",
  "relieve_request",
  "inventory_alert",
  "attendance_alert",
  "guard_update",
  "general",
]);

function asKind(value: string): HrNotificationKind {
  if (KNOWN_KINDS.has(value as HrNotificationKind)) {
    return value as HrNotificationKind;
  }
  return "general";
}

export type HrNotificationItem = HrNotification & {
  action: NotificationAction;
};

export function useAgencyNotifications() {
  const { hrStaff } = useAuthContext();
  const agencyId = hrStaff?.agencyId;
  const [items, setItems] = useState<HrNotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!agencyId) {
      setItems([]);
      setIsLoading(false);
      return;
    }
    const uid = auth.currentUser?.uid ?? agencyId;
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchAgencyNotifications();
      const readIds = loadReadIds(agencyId, uid);
      setItems(
        (data.notifications ?? []).map((n) => ({
          id: n.id,
          kind: asKind(n.kind),
          title: n.title,
          message: n.message,
          createdAt: n.createdAt,
          isRead: readIds.has(n.id),
          action: n.action ?? "none",
        })),
      );
    } catch (err: unknown) {
      const e = err as { message?: string };
      setItems([]);
      setError(e.message ?? "Failed to load notifications.");
    } finally {
      setIsLoading(false);
    }
  }, [agencyId]);

  useEffect(() => {
    void load();
  }, [load]);

  const sorted = useMemo(
    () =>
      [...items].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [items],
  );

  const markRead = useCallback(
    (notificationId: string) => {
      if (!agencyId) {
        return;
      }
      const uid = auth.currentUser?.uid ?? agencyId;
      setItems((current) => {
        const next = current.map((n) =>
          n.id === notificationId ? { ...n, isRead: true } : n,
        );
        saveReadIds(
          agencyId,
          uid,
          new Set(next.filter((n) => n.isRead).map((n) => n.id)),
        );
        return next;
      });
    },
    [agencyId],
  );

  const markAllRead = useCallback(() => {
    if (!agencyId) {
      return;
    }
    const uid = auth.currentUser?.uid ?? agencyId;
    setItems((current) => {
      const next = current.map((n) => ({ ...n, isRead: true }));
      saveReadIds(agencyId, uid, new Set(next.map((n) => n.id)));
      return next;
    });
  }, [agencyId]);

  const getAction = useCallback(
    (notificationId: string): NotificationAction => {
      return items.find((n) => n.id === notificationId)?.action ?? "none";
    },
    [items],
  );

  return {
    notifications: sorted,
    isLoading,
    error,
    refresh: load,
    markRead,
    markAllRead,
    getAction,
  };
}
