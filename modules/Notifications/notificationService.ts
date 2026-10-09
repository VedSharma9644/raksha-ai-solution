import { getFirestore, Timestamp } from "firebase-admin/firestore";

import { sendExpoPushMessages } from "./expoPush";
import {
  disablePushTokens,
  listActivePushTokensForGuard,
} from "./pushTokenService";
import {
  GUARD_NOTIFICATIONS_COLLECTION,
  type GuardNotificationDto,
  type GuardNotificationType,
  type NotifyGuardParams,
} from "./types";

function asData(raw: unknown): Record<string, unknown> {
  return (raw ?? {}) as Record<string, unknown>;
}

export async function createGuardInboxNotification(params: {
  guardId: string;
  agencyId: string;
  type: GuardNotificationType;
  title: string;
  body: string;
  data?: Record<string, string>;
}): Promise<{ id: string }> {
  const ref = getFirestore().collection(GUARD_NOTIFICATIONS_COLLECTION).doc();
  const now = Timestamp.now();
  await ref.set({
    guardId: params.guardId,
    agencyId: params.agencyId,
    type: params.type,
    title: params.title,
    body: params.body,
    data: params.data ?? {},
    read: false,
    createdAt: now,
  });
  return { id: ref.id };
}

/**
 * Persist inbox row + Expo push. Safe to call from leave/attendance flows.
 */
export async function notifyGuard(params: NotifyGuardParams): Promise<{
  notificationId: string | null;
  pushSent: number;
}> {
  const guardId = params.guardId.trim();
  const agencyId = params.agencyId.trim();
  if (!guardId || !agencyId) {
    return { notificationId: null, pushSent: 0 };
  }

  let notificationId: string | null = null;
  if (params.persist !== false) {
    const created = await createGuardInboxNotification({
      guardId,
      agencyId,
      type: params.type,
      title: params.title,
      body: params.body,
      data: params.data,
    });
    notificationId = created.id;
  }

  let pushSent = 0;
  if (params.push !== false) {
    const tokens = await listActivePushTokensForGuard(guardId);
    if (tokens.length > 0) {
      const data: Record<string, string> = {
        type: params.type,
        ...(params.data ?? {}),
      };
      if (notificationId) {
        data.notificationId = notificationId;
      }

      const { invalidTokens } = await sendExpoPushMessages(
        tokens.map((t) => ({
          to: t.expoPushToken,
          title: params.title,
          body: params.body,
          data,
          sound: "default",
          channelId: "raskha-guard",
          priority: "high",
        }))
      );
      pushSent = tokens.length - invalidTokens.length;
      if (invalidTokens.length > 0) {
        await disablePushTokens(invalidTokens);
      }
    }
  }

  return { notificationId, pushSent };
}

export async function listGuardNotifications(params: {
  guardId: string;
  limit?: number;
}): Promise<{ notifications: GuardNotificationDto[]; unreadCount: number }> {
  const guardId = params.guardId.trim();
  const limit = Math.min(Math.max(params.limit ?? 50, 1), 100);

  const snap = await getFirestore()
    .collection(GUARD_NOTIFICATIONS_COLLECTION)
    .where("guardId", "==", guardId)
    .get();

  const mapped = snap.docs.map((doc) => {
    const data = asData(doc.data());
    const createdAt = data.createdAt as { toDate?: () => Date } | undefined;
    return {
      id: doc.id,
      type: (data.type as GuardNotificationType) ?? "general",
      title: String(data.title ?? ""),
      body: String(data.body ?? ""),
      data: (data.data as Record<string, string>) ?? {},
      read: Boolean(data.read),
      createdAt: createdAt?.toDate?.()?.toISOString?.() ?? new Date(0).toISOString(),
      sortMs: createdAt?.toDate?.()?.getTime?.() ?? 0,
    };
  });

  const unreadCount = mapped.filter((r) => !r.read).length;
  const rows = mapped.sort((a, b) => b.sortMs - a.sortMs).slice(0, limit);

  return {
    notifications: rows.map(({ sortMs: _s, ...dto }) => dto),
    unreadCount,
  };
}

export async function markGuardNotificationsRead(params: {
  guardId: string;
  notificationIds?: string[];
  all?: boolean;
}): Promise<{ ok: true; updated: number }> {
  const guardId = params.guardId.trim();
  const db = getFirestore();
  const col = db.collection(GUARD_NOTIFICATIONS_COLLECTION);

  if (params.all) {
    const snap = await col.where("guardId", "==", guardId).get();
    const batch = db.batch();
    let updated = 0;
    snap.docs.forEach((doc) => {
      if (doc.data()?.read === true) {
        return;
      }
      batch.update(doc.ref, { read: true });
      updated += 1;
    });
    if (updated > 0) {
      await batch.commit();
    }
    return { ok: true, updated };
  }

  const ids = (params.notificationIds ?? []).filter(Boolean);
  if (ids.length === 0) {
    return { ok: true, updated: 0 };
  }

  const batch = db.batch();
  let updated = 0;
  for (const id of ids) {
    const ref = col.doc(id);
    const snap = await ref.get();
    if (!snap.exists) {
      continue;
    }
    if (String(snap.data()?.guardId ?? "") !== guardId) {
      continue;
    }
    batch.update(ref, { read: true });
    updated += 1;
  }
  if (updated > 0) {
    await batch.commit();
  }
  return { ok: true, updated };
}

export async function notifyLeaveDecision(params: {
  guardId: string;
  agencyId: string;
  leaveRequestId: string;
  status: "approved" | "rejected";
  leaveTypeLabel?: string;
  startDate?: string;
  endDate?: string;
}): Promise<void> {
  const approved = params.status === "approved";
  const range =
    params.startDate && params.endDate
      ? params.startDate === params.endDate
        ? params.startDate
        : `${params.startDate} to ${params.endDate}`
      : "your requested dates";

  await notifyGuard({
    guardId: params.guardId,
    agencyId: params.agencyId,
    type: "leave_decision",
    title: approved ? "Leave approved" : "Leave not approved",
    body: approved
      ? `Your ${params.leaveTypeLabel ?? "leave"} for ${range} was approved.`
      : `Your ${params.leaveTypeLabel ?? "leave"} for ${range} was rejected.`,
    data: {
      screen: "leaveTimeOff",
      leaveRequestId: params.leaveRequestId,
      status: params.status,
    },
  });
}

export async function notifyReliefDecision(params: {
  guardId: string;
  agencyId: string;
  reliefRequestId: string;
  status: "approved" | "rejected";
  methodLabel?: string;
  dutyDate?: string;
  assignedGuardName?: string;
}): Promise<void> {
  const approved = params.status === "approved";
  const method = params.methodLabel ?? "relief request";
  const dateLabel = params.dutyDate ?? "your duty date";

  await notifyGuard({
    guardId: params.guardId,
    agencyId: params.agencyId,
    type: "relief_decision",
    title: approved ? "Relief approved" : "Relief not approved",
    body: approved
      ? `Your ${method} for ${dateLabel} was approved${
          params.assignedGuardName
            ? `. ${params.assignedGuardName} will take over.`
            : "."
        }`
      : `Your ${method} for ${dateLabel} was rejected.`,
    data: {
      screen: "incomingReliefRequests",
      reliefRequestId: params.reliefRequestId,
      status: params.status,
    },
  });
}

export async function notifyReliefAssignment(params: {
  guardId: string;
  agencyId: string;
  reliefRequestId: string;
  requesterName?: string;
  methodLabel?: string;
  dutyDate?: string;
  siteName?: string;
}): Promise<void> {
  const requester = params.requesterName ?? "a colleague";
  const method = params.methodLabel ?? "shift relief";
  const dateLabel = params.dutyDate ?? "duty day";
  const site = params.siteName ? ` at ${params.siteName}` : "";

  await notifyGuard({
    guardId: params.guardId,
    agencyId: params.agencyId,
    type: "relief_assignment",
    title: "You were assigned relief duty",
    body: `Admin/HR assigned you to cover ${requester}'s ${method} on ${dateLabel}${site}.`,
    data: {
      screen: "incomingReliefRequests",
      reliefRequestId: params.reliefRequestId,
      status: "assigned",
    },
  });
}

/**
 * Push + inbox when Admin/HR creates, updates, or removes a shift assignment.
 * Guard app treats this as an immediate roster refresh signal.
 */
export async function notifyRosterUpdate(params: {
  guardId: string;
  agencyId: string;
  action: "assigned" | "updated" | "removed";
  siteName?: string;
  shiftLabel?: string;
  shiftStartTime?: string;
  shiftEndTime?: string;
}): Promise<void> {
  const site = params.siteName?.trim() || "your site";
  const shift = params.shiftLabel?.trim() || "duty";
  const window =
    params.shiftStartTime && params.shiftEndTime
      ? ` (${params.shiftStartTime}–${params.shiftEndTime})`
      : "";

  let title = "Roster updated";
  let body = `Your duty assignment at ${site} was updated.`;
  if (params.action === "assigned") {
    title = "New shift assigned";
    body = `You were assigned ${shift}${window} at ${site}.`;
  } else if (params.action === "removed") {
    title = "Shift removed";
    body = `Your ${shift} assignment at ${site} was removed.`;
  } else {
    body = `Your ${shift}${window} at ${site} was updated.`;
  }

  await notifyGuard({
    guardId: params.guardId,
    agencyId: params.agencyId,
    type: "roster_update",
    title,
    body,
    data: {
      screen: "home",
      type: "roster_update",
      action: params.action,
      refresh: "roster",
    },
  });
}
