import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import type { Firestore, Timestamp } from "firebase/firestore";

export interface AgencyModuleAccess {
  agencyId: string;
  enabledFeatureIds: string[];
  updatedAt?: Timestamp;
}

export const AGENCY_MODULE_ACCESS_COLLECTION = "agencyModuleAccess";

/** Canonical module id for Form Builder (custom forms). */
export const FORM_BUILDER_MODULE_ID = "form_builder";

/** Defaults when an agency has never been configured. */
export const DEFAULT_ENABLED_FEATURE_IDS: string[] = [
  "employee_management",
  "site_management",
  "inventory",
];

export function isModuleEnabled(
  enabledModules: string[] | undefined | null,
  moduleId: string
): boolean {
  return Array.isArray(enabledModules) && enabledModules.includes(moduleId);
}

export function isFormBuilderModuleEnabled(
  enabledModules: string[] | undefined | null
): boolean {
  return isModuleEnabled(enabledModules, FORM_BUILDER_MODULE_ID);
}

export async function getAgencyModuleAccess(
  db: Firestore,
  agencyId: string
): Promise<AgencyModuleAccess> {
  const snapshot = await getDoc(
    doc(db, AGENCY_MODULE_ACCESS_COLLECTION, agencyId)
  );
  if (!snapshot.exists()) {
    return {
      agencyId,
      enabledFeatureIds: [...DEFAULT_ENABLED_FEATURE_IDS],
    };
  }
  const data = snapshot.data() as AgencyModuleAccess;
  return {
    agencyId,
    enabledFeatureIds: Array.isArray(data.enabledFeatureIds)
      ? data.enabledFeatureIds.filter((id) => typeof id === "string")
      : [...DEFAULT_ENABLED_FEATURE_IDS],
    updatedAt: data.updatedAt,
  };
}

export async function listAgencyModuleAccess(
  db: Firestore
): Promise<AgencyModuleAccess[]> {
  const snapshot = await getDocs(
    collection(db, AGENCY_MODULE_ACCESS_COLLECTION)
  );
  return snapshot.docs.map((item) => {
    const data = item.data() as AgencyModuleAccess;
    return {
      agencyId: data.agencyId || item.id,
      enabledFeatureIds: Array.isArray(data.enabledFeatureIds)
        ? data.enabledFeatureIds.filter((id) => typeof id === "string")
        : [],
      updatedAt: data.updatedAt,
    };
  });
}

export async function saveAgencyModuleAccess(
  db: Firestore,
  agencyId: string,
  enabledFeatureIds: string[]
): Promise<AgencyModuleAccess> {
  const uniqueIds = [...new Set(enabledFeatureIds.filter(Boolean))];
  const ref = doc(db, AGENCY_MODULE_ACCESS_COLLECTION, agencyId);
  await setDoc(
    ref,
    {
      agencyId,
      enabledFeatureIds: uniqueIds,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
  return {
    agencyId,
    enabledFeatureIds: uniqueIds,
  };
}
