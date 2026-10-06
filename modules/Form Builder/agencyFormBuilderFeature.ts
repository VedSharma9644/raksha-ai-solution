import {
  doc,
  getDoc,
  setDoc,
  getDocs,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import type { Firestore, Timestamp } from "firebase/firestore";

export interface AgencyFormBuilderFeature {
  agencyId: string;
  enabled: boolean;
  enabledAt?: Timestamp;
  updatedAt: Timestamp;
}

export const AGENCY_FORM_BUILDER_COLLECTION = "agencyFormBuilderFeatures";

/** Returns true when the Form Builder feature is ON for the given agency. */
export async function isFormBuilderEnabledForAgency(
  db: Firestore,
  agencyId: string,
): Promise<boolean> {
  const ref = doc(db, AGENCY_FORM_BUILDER_COLLECTION, agencyId);
  const snapshot = await getDoc(ref);
  if (!snapshot.exists()) return false;
  return (snapshot.data() as AgencyFormBuilderFeature).enabled === true;
}

/** Enable the Form Builder feature for an agency. */
export async function enableFormBuilderForAgency(
  db: Firestore,
  agencyId: string,
): Promise<void> {
  const ref = doc(db, AGENCY_FORM_BUILDER_COLLECTION, agencyId);
  const existing = await getDoc(ref);

  await setDoc(ref, {
    agencyId,
    enabled: true,
    enabledAt: existing.exists() && existing.data().enabledAt
      ? existing.data().enabledAt
      : serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

/** Disable the Form Builder feature for an agency. */
export async function disableFormBuilderForAgency(
  db: Firestore,
  agencyId: string,
): Promise<void> {
  const ref = doc(db, AGENCY_FORM_BUILDER_COLLECTION, agencyId);
  await setDoc(ref, {
    agencyId,
    enabled: false,
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

/** Fetch Form Builder status for all agencies (used by Super Admin list). */
export async function listFormBuilderFeatures(
  db: Firestore,
): Promise<AgencyFormBuilderFeature[]> {
  const snapshot = await getDocs(
    collection(db, AGENCY_FORM_BUILDER_COLLECTION),
  );
  return snapshot.docs.map(
    (d) => ({ ...d.data() } as AgencyFormBuilderFeature),
  );
}
