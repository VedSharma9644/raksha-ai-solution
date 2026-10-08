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
} from "firebase/firestore";
import { SITES_COLLECTION } from "./site";
import type { Site, SiteStatus, SiteType, SiteShiftConfig } from "./site";

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
}

export async function deleteSite(
  db: Firestore,
  siteId: string
): Promise<void> {
  const ref = doc(db, SITES_COLLECTION, siteId);
  await deleteDoc(ref);
}
