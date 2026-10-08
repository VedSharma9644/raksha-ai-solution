import { getFirestore, type Timestamp } from "firebase-admin/firestore";
import { listAgencyAttendanceForDate } from "@raskha/attendance";
import { INVENTORY_COLLECTION } from "@raskha/inventory-management";
import { listLeaveRequestsForAgency } from "@raskha/leave";

const IST = "Asia/Kolkata";

export type AgencyNotificationKind =
  | "leave_request"
  | "upcoming_leave"
  | "attendance_alert"
  | "inventory_alert"
  | "general";

export type AgencyNotificationAction =
  | "leave"
  | "attendance"
  | "inventory"
  | "none";

export type AgencyNotificationDto = {
  id: string;
  kind: AgencyNotificationKind;
  title: string;
  message: string;
  createdAt: string;
  action: AgencyNotificationAction;
};

export type AgencyNotificationsResponse = {
  date: string;
  notifications: AgencyNotificationDto[];
};

function todayIstDateKey(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: IST,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function addDaysToDateKey(dateKey: string, days: number): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  date.setUTCDate(date.getUTCDate() + days);
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
}

function toIso(value: unknown, fallback = new Date()): string {
  if (
    value &&
    typeof value === "object" &&
    "toDate" in value &&
    typeof (value as Timestamp).toDate === "function"
  ) {
    return (value as Timestamp).toDate().toISOString();
  }
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString();
  }
  return fallback.toISOString();
}

function formatLeaveRange(startDate: string, endDate: string): string {
  if (!startDate) {
    return "upcoming dates";
  }
  if (!endDate || endDate === startDate) {
    return startDate;
  }
  return `${startDate} to ${endDate}`;
}

/**
 * Live operational notifications for Admin + HR dashboards.
 */
export async function listAgencyNotifications(
  agencyId: string
): Promise<AgencyNotificationsResponse> {
  const trimmed = agencyId.trim();
  if (!trimmed) {
    throw Object.assign(new Error("agencyId is required."), { statusCode: 400 });
  }

  const today = todayIstDateKey();
  const tomorrow = addDaysToDateKey(today, 1);
  const nowIso = new Date().toISOString();

  const [leaves, attendance, inventorySnap] = await Promise.all([
    listLeaveRequestsForAgency({
      agencyId: trimmed,
      status: ["pending", "approved"],
    }),
    listAgencyAttendanceForDate({ agencyId: trimmed, date: today }),
    getFirestore()
      .collection(INVENTORY_COLLECTION)
      .where("agencyId", "==", trimmed)
      .get(),
  ]);

  const notifications: AgencyNotificationDto[] = [];

  for (const leave of leaves) {
    if (leave.status === "pending") {
      notifications.push({
        id: `leave:pending:${leave.id}`,
        kind: "leave_request",
        title: "New leave request",
        message: `${leave.guardName || "A guard"} requested ${leave.leaveType} leave (${formatLeaveRange(leave.startDate, leave.endDate)}).`,
        createdAt: toIso(leave.appliedAt, new Date()),
        action: "leave",
      });
    } else if (
      leave.status === "approved" &&
      (leave.startDate === today || leave.startDate === tomorrow)
    ) {
      const when = leave.startDate === today ? "today" : "tomorrow";
      notifications.push({
        id: `leave:upcoming:${leave.id}`,
        kind: "upcoming_leave",
        title: `Leave starting ${when}`,
        message: `${leave.guardName || "A guard"} has approved leave from ${formatLeaveRange(leave.startDate, leave.endDate)}.`,
        createdAt: toIso(leave.updatedAt ?? leave.appliedAt, new Date()),
        action: "leave",
      });
    }
  }

  if (attendance.stats.absentToday > 0) {
    notifications.push({
      id: `attendance:absent:${today}`,
      kind: "attendance_alert",
      title: "Missed attendance",
      message: `${attendance.stats.absentToday} active guard${attendance.stats.absentToday === 1 ? " has" : "s have"} not punched in today (${today}).`,
      createdAt: nowIso,
      action: "attendance",
    });
  }

  for (const doc of inventorySnap.docs) {
    const data = doc.data() ?? {};
    const status = String(data.status ?? "");
    if (status !== "low_stock" && status !== "out_of_stock") {
      continue;
    }
    const name = String(data.name ?? "Inventory item");
    const totalStock = Number(data.totalStock ?? 0);
    const assignedStock = Number(data.assignedStock ?? 0);
    const available = Math.max(0, totalStock - assignedStock);
    const unit = String(data.unit ?? "pcs");

    notifications.push({
      id: `inventory:${status}:${doc.id}`,
      kind: "inventory_alert",
      title:
        status === "out_of_stock" ? "Inventory out of stock" : "Inventory running low",
      message:
        status === "out_of_stock"
          ? `${name} has no available stock left.`
          : `${name} is low — ${available} ${unit} available.`,
      createdAt: toIso(data.updatedAt, new Date()),
      action: "inventory",
    });
  }

  notifications.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return { date: today, notifications };
}
