import { FieldValue, getFirestore } from "firebase-admin/firestore";
import {
  ATTENDANCE_DAY_OVERRIDES_COLLECTION,
  attendanceOverrideDocIdFromReliefBonusId,
  attendanceReliefBonusDutyId,
  daysInCalendarMonth,
  dutyDateFromParts,
  isAttendanceReliefBonusDutyId,
  listAttendanceOverrideRecordsForGuard,
} from "@raskha/attendance";

import type { ReliefDutyBonusRow } from "./payrollRun";

export const PAYROLL_RELIEF_BONUSES_COLLECTION = "payrollReliefBonuses";
export const RELIEF_REQUESTS_COLLECTION = "reliefRequests";

export type { ReliefDutyBonusRow };

function bonusDocId(agencyId: string, reliefRequestId: string): string {
  return `${agencyId}_${reliefRequestId}`;
}

function monthBounds(year: number, month: number): {
  startDate: string;
  endDate: string;
} {
  const daysInMonth = daysInCalendarMonth(year, month);
  return {
    startDate: dutyDateFromParts(year, month, 1),
    endDate: dutyDateFromParts(year, month, daysInMonth),
  };
}

async function attachBonusAmounts(
  agencyId: string,
  duties: Omit<ReliefDutyBonusRow, "amount">[]
): Promise<ReliefDutyBonusRow[]> {
  const db = getFirestore();
  const rows: ReliefDutyBonusRow[] = [];
  for (const duty of duties) {
    const bonusSnap = await db
      .collection(PAYROLL_RELIEF_BONUSES_COLLECTION)
      .doc(bonusDocId(agencyId, duty.reliefRequestId))
      .get();
    const amountRaw = bonusSnap.exists
      ? Number((bonusSnap.data() as { amount?: unknown }).amount)
      : 0;
    rows.push({
      ...duty,
      amount: Number.isFinite(amountRaw) && amountRaw > 0 ? amountRaw : 0,
    });
  }
  return rows;
}

/** Approved relief duties where this guard was the assignee in the month. */
export async function listReliefDutiesForGuardMonth(params: {
  agencyId: string;
  guardId: string;
  year: number;
  month: number;
}): Promise<ReliefDutyBonusRow[]> {
  const { agencyId, guardId, year, month } = params;
  const { startDate, endDate } = monthBounds(year, month);
  const db = getFirestore();

  const snap = await db
    .collection(RELIEF_REQUESTS_COLLECTION)
    .where("agencyId", "==", agencyId)
    .where("assignedGuardId", "==", guardId)
    .where("status", "==", "approved")
    .get();

  const duties: Omit<ReliefDutyBonusRow, "amount">[] = [];
  const datesWithRealRelief = new Set<string>();

  for (const doc of snap.docs) {
    const data = doc.data() as {
      dutyDate?: string;
      siteName?: string;
      postName?: string;
      shiftFrom?: string;
      shiftTo?: string;
      guardName?: string;
      method?: string;
    };
    const dutyDate = String(data.dutyDate ?? "").trim();
    if (!dutyDate || dutyDate < startDate || dutyDate > endDate) {
      continue;
    }
    datesWithRealRelief.add(dutyDate);
    duties.push({
      reliefRequestId: doc.id,
      dutyDate,
      siteName: String(data.siteName ?? "").trim() || "Site",
      postName: String(data.postName ?? "").trim() || "Post",
      shiftFrom: String(data.shiftFrom ?? "").trim() || "—",
      shiftTo: String(data.shiftTo ?? "").trim() || "—",
      requesterName: String(data.guardName ?? "").trim() || "Guard",
      method: String(data.method ?? "").trim() || "cover",
    });
  }

  // Admin backfill: attendance corrections with status "relief".
  const overrideRecords = await listAttendanceOverrideRecordsForGuard({
    agencyId,
    guardId,
    startDate,
    endDate,
  });
  for (const override of overrideRecords) {
    if (override.status !== "relief") continue;
    if (datesWithRealRelief.has(override.dutyDate)) continue;
    const note = String(override.note ?? "").trim();
    duties.push({
      reliefRequestId: attendanceReliefBonusDutyId(
        agencyId,
        guardId,
        override.dutyDate
      ),
      dutyDate: override.dutyDate,
      siteName: "Admin correction",
      postName: note ? note.slice(0, 80) : "Relief duty",
      shiftFrom: "—",
      shiftTo: "—",
      requesterName: "Admin correction",
      method: "cover",
    });
  }

  duties.sort((a, b) => a.dutyDate.localeCompare(b.dutyDate));
  return attachBonusAmounts(agencyId, duties);
}

export async function sumReliefBonusesForGuardMonth(params: {
  agencyId: string;
  guardId: string;
  year: number;
  month: number;
}): Promise<number> {
  const rows = await listReliefDutiesForGuardMonth(params);
  return (
    Math.round(rows.reduce((sum, r) => sum + (r.amount || 0), 0) * 100) / 100
  );
}

export async function saveReliefBonusAmounts(params: {
  agencyId: string;
  guardId: string;
  year: number;
  month: number;
  entries: Array<{ reliefRequestId: string; amount: number }>;
}): Promise<ReliefDutyBonusRow[]> {
  const { agencyId, guardId, year, month, entries } = params;
  const db = getFirestore();

  for (const entry of entries) {
    const reliefRequestId = String(entry.reliefRequestId ?? "").trim();
    if (!reliefRequestId) continue;

    const amount = Math.round(Number(entry.amount) * 100) / 100;
    if (!Number.isFinite(amount) || amount < 0) {
      throw Object.assign(
        new Error("Relief bonus amount must be zero or a positive number."),
        { statusCode: 400 }
      );
    }

    let dutyDate = "";
    let siteName = "";
    let requesterName = "";

    if (isAttendanceReliefBonusDutyId(reliefRequestId)) {
      const overrideDocId =
        attendanceOverrideDocIdFromReliefBonusId(reliefRequestId);
      if (!overrideDocId) {
        throw Object.assign(new Error("Invalid relief correction id."), {
          statusCode: 400,
        });
      }
      const overrideSnap = await db
        .collection(ATTENDANCE_DAY_OVERRIDES_COLLECTION)
        .doc(overrideDocId)
        .get();
      if (!overrideSnap.exists) {
        throw Object.assign(
          new Error("Attendance relief correction not found."),
          { statusCode: 404 }
        );
      }
      const override = overrideSnap.data() as {
        agencyId?: string;
        guardId?: string;
        dutyDate?: string;
        status?: string;
        note?: string;
      };
      if (String(override.agencyId ?? "") !== agencyId) {
        throw Object.assign(
          new Error("Attendance relief correction not found."),
          { statusCode: 404 }
        );
      }
      if (String(override.guardId ?? "") !== guardId) {
        throw Object.assign(
          new Error("This relief correction is not for this guard."),
          { statusCode: 400 }
        );
      }
      if (override.status !== "relief") {
        throw Object.assign(
          new Error("Only relief attendance corrections can receive a bonus."),
          { statusCode: 400 }
        );
      }
      dutyDate = String(override.dutyDate ?? "");
      siteName = "Admin correction";
      requesterName = String(override.note ?? "").trim() || "Admin correction";
    } else {
      const reliefSnap = await db
        .collection(RELIEF_REQUESTS_COLLECTION)
        .doc(reliefRequestId)
        .get();
      if (!reliefSnap.exists) {
        throw Object.assign(new Error("Relief request not found."), {
          statusCode: 404,
        });
      }
      const relief = reliefSnap.data() as {
        agencyId?: string;
        assignedGuardId?: string;
        dutyDate?: string;
        siteName?: string;
        guardName?: string;
        status?: string;
      };
      if (String(relief.agencyId ?? "") !== agencyId) {
        throw Object.assign(new Error("Relief request not found."), {
          statusCode: 404,
        });
      }
      if (String(relief.assignedGuardId ?? "") !== guardId) {
        throw Object.assign(
          new Error("This relief duty is not assigned to this guard."),
          { statusCode: 400 }
        );
      }
      if (relief.status !== "approved") {
        throw Object.assign(
          new Error("Only approved relief duties can receive a bonus."),
          { statusCode: 400 }
        );
      }
      dutyDate = String(relief.dutyDate ?? "");
      siteName = String(relief.siteName ?? "");
      requesterName = String(relief.guardName ?? "");
    }

    const ref = db
      .collection(PAYROLL_RELIEF_BONUSES_COLLECTION)
      .doc(bonusDocId(agencyId, reliefRequestId));

    if (amount === 0) {
      const existing = await ref.get();
      if (existing.exists) {
        await ref.delete();
      }
      continue;
    }

    const existing = await ref.get();
    await ref.set(
      {
        id: bonusDocId(agencyId, reliefRequestId),
        agencyId,
        guardId,
        reliefRequestId,
        dutyDate,
        amount,
        siteName,
        requesterName,
        updatedAt: FieldValue.serverTimestamp(),
        ...(existing.exists
          ? {}
          : { createdAt: FieldValue.serverTimestamp() }),
      },
      { merge: true }
    );
  }

  return listReliefDutiesForGuardMonth({ agencyId, guardId, year, month });
}
