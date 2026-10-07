import { getFirestore } from "firebase-admin/firestore";
import { SITES_COLLECTION } from "@raskha/site-management";

import type { SiteGeofenceInput } from "./geofence";

export type SiteGeofenceContext = SiteGeofenceInput & {
  siteId: string;
  siteName: string;
};

function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

/**
 * Load site geofence fields from Firestore (Admin SDK).
 * Returns null when the site doc is missing.
 */
export async function getSiteGeofenceById(
  siteId: string
): Promise<SiteGeofenceContext | null> {
  if (!siteId?.trim()) {
    return null;
  }

  const snap = await getFirestore()
    .collection(SITES_COLLECTION)
    .doc(siteId.trim())
    .get();

  if (!snap.exists) {
    return null;
  }

  const data = snap.data() ?? {};
  return {
    siteId: snap.id,
    siteName:
      typeof data.siteName === "string" && data.siteName.trim()
        ? data.siteName
        : "Assigned Site",
    latitude: toNumber(data.latitude),
    longitude: toNumber(data.longitude),
    geofenceRadiusMeters: toNumber(data.geofenceRadiusMeters),
  };
}
