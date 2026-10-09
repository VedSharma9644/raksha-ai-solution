import { getFirestore } from "firebase-admin/firestore";
import { GUARDS_COLLECTION } from "@raskha/guard-management";
import { SITES_COLLECTION } from "@raskha/site-management";

import { resolveTodayDuty } from "./todayDuty";

const AGENCIES_COLLECTION = "agencies";
const GUARD_INVENTORY_ASSIGNMENT_COLLECTION = "guardInventoryAssignments";

export type GuardProfileGearItem = {
  id: string;
  itemName: string;
  category: string;
  unit: string;
  quantity: number;
};

export type GuardProfileDto = {
  guardId: string;
  employeeCode: string;
  fullName: string;
  postName: string;
  profilePictureUrl: string;
  agencyId: string;
  agencyName: string;
  agencyPhone: string;
  site: {
    id: string;
    siteName: string;
    address: string;
    city: string;
    postName: string;
    hrName: string;
    hrContact: string;
    siteSupervisor: string;
    geofenceRadiusMeters: number | null;
  };
  shiftFrom: string;
  shiftTo: string;
  shiftLabel: string;
  dutySource: "roster" | "profile";
  esiNumber: string;
  pfNumber: string;
  hasPoliceVerification: boolean;
  hasCharacterCertificate: boolean;
  aadhaarLinked: boolean;
  gear: GuardProfileGearItem[];
};

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value.trim() : fallback;
}

function asNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function digitsOnlyPhone(value: string): string {
  return value.replace(/\D/g, "");
}

/**
 * Full Guard Profile payload for the mobile app:
 * agency + site HR contact + issued inventory gear + compliance flags.
 */
export async function getGuardProfile(params: {
  guardId: string;
  agencyId: string;
  employeeCode?: string;
  fullName?: string;
  postName?: string;
  profilePictureUrl?: string;
  assignedSiteId?: string;
  profileShiftFrom?: string;
  profileShiftTo?: string;
  profileSiteName?: string;
}): Promise<GuardProfileDto> {
  const db = getFirestore();
  const guardId = params.guardId.trim();
  const agencyId = params.agencyId.trim();

  const [guardSnap, agencySnap, duty, gearSnap] = await Promise.all([
    guardId ? db.collection(GUARDS_COLLECTION).doc(guardId).get() : Promise.resolve(null),
    agencyId ? db.collection(AGENCIES_COLLECTION).doc(agencyId).get() : Promise.resolve(null),
    resolveTodayDuty({
      guardId,
      agencyId,
      profileShiftFrom: params.profileShiftFrom,
      profileShiftTo: params.profileShiftTo,
      profileSiteId: params.assignedSiteId,
      profileSiteName: params.profileSiteName,
      profilePostName: params.postName,
    }),
    guardId && agencyId
      ? db
          .collection(GUARD_INVENTORY_ASSIGNMENT_COLLECTION)
          .where("guardId", "==", guardId)
          .where("agencyId", "==", agencyId)
          .get()
      : Promise.resolve(null),
  ]);

  const guardData = (guardSnap?.exists ? guardSnap.data() : {}) as Record<
    string,
    unknown
  >;
  const agencyData = (agencySnap?.exists ? agencySnap.data() : {}) as Record<
    string,
    unknown
  >;

  const siteId =
    duty.siteId ||
    asString(params.assignedSiteId) ||
    asString(guardData.assignedSiteId);

  let siteData: Record<string, unknown> = {};
  if (siteId) {
    try {
      const siteSnap = await db.collection(SITES_COLLECTION).doc(siteId).get();
      if (siteSnap.exists) {
        siteData = (siteSnap.data() ?? {}) as Record<string, unknown>;
      }
    } catch {
      siteData = {};
    }
  }

  const hrName = asString(siteData.hrName);
  const hrContact = asString(siteData.hrContact);
  const agencyPhone = asString(agencyData.phone);

  const gear: GuardProfileGearItem[] = (gearSnap?.docs ?? []).map((docSnap) => {
    const data = docSnap.data() as Record<string, unknown>;
    return {
      id: docSnap.id,
      itemName: asString(data.itemName, "Issued item"),
      category: asString(data.category, "General"),
      unit: asString(data.unit, "pcs"),
      quantity:
        typeof data.quantity === "number" && Number.isFinite(data.quantity)
          ? data.quantity
          : 1,
    };
  });

  return {
    guardId,
    employeeCode:
      asString(params.employeeCode) || asString(guardData.employeeCode),
    fullName: asString(params.fullName) || asString(guardData.fullName, "Guard"),
    postName:
      duty.postName ||
      asString(params.postName) ||
      asString(guardData.post, "Assigned Post"),
    profilePictureUrl:
      asString(params.profilePictureUrl) ||
      asString(guardData.profilePictureUrl),
    agencyId,
    agencyName: asString(agencyData.name, "Security Agency"),
    agencyPhone,
    site: {
      id: siteId,
      siteName:
        duty.siteName ||
        asString(siteData.siteName) ||
        asString(params.profileSiteName, "Assigned Site"),
      address: asString(siteData.address),
      city: asString(siteData.city),
      postName:
        duty.postName ||
        asString(params.postName) ||
        asString(guardData.post, "Assigned Post"),
      hrName,
      hrContact,
      siteSupervisor: asString(siteData.siteSupervisor),
      geofenceRadiusMeters: asNumber(siteData.geofenceRadiusMeters),
    },
    shiftFrom: duty.shiftFrom,
    shiftTo: duty.shiftTo,
    shiftLabel: duty.shiftLabel,
    dutySource: duty.source,
    esiNumber: asString(guardData.esiNumber),
    pfNumber: asString(guardData.pfNumber),
    hasPoliceVerification: Boolean(asString(guardData.policeVerificationUrl)),
    hasCharacterCertificate: Boolean(
      asString(guardData.characterCertificateUrl)
    ),
    aadhaarLinked: Boolean(asString(guardData.aadhaarNumber)),
    gear,
  };
}

export function toTelHref(phone: string): string | null {
  const digits = digitsOnlyPhone(phone);
  if (digits.length < 8) {
    return null;
  }
  return digits.startsWith("91") && digits.length > 10
    ? `+${digits}`
    : digits.length === 10
      ? `+91${digits}`
      : `+${digits}`;
}
