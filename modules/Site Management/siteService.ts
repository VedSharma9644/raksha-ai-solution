import {
  Firestore,
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
import { SITES_COLLECTION } from "./site";
import type { Site, SiteStatus, SiteType, SiteShiftConfig } from "./site";

const SHIFT_ASSIGNMENTS_COLLECTION = "shiftAssignments";

/**
 * Keep roster assignment snapshots in sync when site shift slots change
 * (times / labels). Guard app also hydrates live on read — this keeps Admin/HR
 * roster UIs accurate too.
 */
async function syncAssignmentsToShiftConfig(
  db: Firestore,
  siteId: string,
  shiftConfig: SiteShiftConfig | null | undefined
): Promise<void> {
  if (!shiftConfig?.shifts?.length) {
    return;
  }
  const byId = new Map(shiftConfig.shifts.map((s) => [s.id, s]));
  const snap = await getDocs(
    query(
      collection(db, SHIFT_ASSIGNMENTS_COLLECTION),
      where("siteId", "==", siteId)
    )
  );
  if (snap.empty) {
    return;
  }

  let batch = writeBatch(db);
  let ops = 0;
  const commitIfNeeded = async (force = false) => {
    if (ops === 0) {
      return;
    }
    if (!force && ops < 400) {
      return;
    }
    await batch.commit();
    batch = writeBatch(db);
    ops = 0;
  };

  for (const d of snap.docs) {
    const data = d.data() as {
      shiftId?: string;
      shiftLabel?: string;
      shiftStartTime?: string;
      shiftEndTime?: string;
    };
    const live = data.shiftId ? byId.get(data.shiftId) : undefined;
    if (!live) {
      continue;
    }
    if (
      data.shiftLabel === live.label &&
      data.shiftStartTime === live.startTime &&
      data.shiftEndTime === live.endTime
    ) {
      continue;
    }
    batch.update(d.ref, {
      shiftLabel: live.label,
      shiftStartTime: live.startTime,
      shiftEndTime: live.endTime,
      updatedAt: serverTimestamp(),
    });
    ops += 1;
    await commitIfNeeded();
  }
  await commitIfNeeded(true);
}

export interface AddSiteParams {
  agencyId: string;
  siteName: string;
  siteType: SiteType | "";
  clientName: string;
  address: string;
  city: string;
  managerName: string;
  managerContact: string;
  hrName: string;
  hrContact: string;
  siteSupervisor: string;
  contactPerson: string;
  contactPhone: string;
  notes: string;
  latitude?: number;
  longitude?: number;
  geofenceRadiusMeters?: number | null;
  intervalCheckinMinutes?: number | null;
  shiftConfig?: SiteShiftConfig | null;
}

export interface UpdateSiteParams {
  siteName?: string;
  siteType?: SiteType | "";
  clientName?: string;
  address?: string;
  city?: string;
  managerName?: string;
  managerContact?: string;
  hrName?: string;
  hrContact?: string;
  siteSupervisor?: string;
  contactPerson?: string;
  contactPhone?: string;
  notes?: string;
  status?: SiteStatus;
  latitude?: number;
  longitude?: number;
  geofenceRadiusMeters?: number | null;
  intervalCheckinMinutes?: number | null;
  shiftConfig?: SiteShiftConfig | null;
}

export async function addSite(
  db: Firestore,
  params: AddSiteParams
): Promise<Site> {
  const siteData = {
    ...params,
    status: "active" as SiteStatus,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const ref = await addDoc(collection(db, SITES_COLLECTION), siteData);

  return { id: ref.id, ...siteData } as unknown as Site;
}

export async function getSiteById(
  db: Firestore,
  siteId: string
): Promise<Site | null> {
  const ref = doc(db, SITES_COLLECTION, siteId);
  const snapshot = await getDoc(ref);

  if (!snapshot.exists()) return null;

  return { id: snapshot.id, ...snapshot.data() } as Site;
}

export async function listSitesByAgency(
  db: Firestore,
  agencyId: string
): Promise<Site[]> {
  const q = query(
    collection(db, SITES_COLLECTION),
    where("agencyId", "==", agencyId)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Site));
}

export async function updateSite(
  db: Firestore,
  siteId: string,
  updates: UpdateSiteParams
): Promise<void> {
  const ref = doc(db, SITES_COLLECTION, siteId);
  await updateDoc(ref, { ...updates, updatedAt: serverTimestamp() });

  if (Object.prototype.hasOwnProperty.call(updates, "shiftConfig")) {
    await syncAssignmentsToShiftConfig(db, siteId, updates.shiftConfig);
  }
}

export async function deleteSite(
  db: Firestore,
  siteId: string
): Promise<void> {
  const ref = doc(db, SITES_COLLECTION, siteId);
  await deleteDoc(ref);
}
