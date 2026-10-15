import { FieldValue, getFirestore } from "firebase-admin/firestore";

import {
  AGENCY_INVOICE_SETTINGS_COLLECTION,
  defaultAgencyInvoiceSettings,
  type AgencyInvoiceSettings,
} from "./invoiceTypes";

export async function getAgencyInvoiceSettings(
  agencyId: string
): Promise<AgencyInvoiceSettings> {
  const snap = await getFirestore()
    .collection(AGENCY_INVOICE_SETTINGS_COLLECTION)
    .doc(agencyId)
    .get();

  if (!snap.exists) {
    const agencySnap = await getFirestore()
      .collection("agencies")
      .doc(agencyId)
      .get();
    const agency = (agencySnap.data() ?? {}) as {
      name?: string;
      email?: string;
      phone?: string;
      address?: string;
    };
    return defaultAgencyInvoiceSettings(agencyId, {
      legalName: agency.name ?? "",
      email: agency.email ?? "",
      phone: agency.phone ?? "",
      address: agency.address ?? "",
    });
  }

  return defaultAgencyInvoiceSettings(
    agencyId,
    snap.data() as Partial<AgencyInvoiceSettings>
  );
}

export async function saveAgencyInvoiceSettings(
  agencyId: string,
  body: unknown
): Promise<AgencyInvoiceSettings> {
  const raw =
    body && typeof body === "object"
      ? ((body as { settings?: unknown }).settings ?? body)
      : {};
  const settings = defaultAgencyInvoiceSettings(
    agencyId,
    raw as Partial<AgencyInvoiceSettings>
  );

  await getFirestore()
    .collection(AGENCY_INVOICE_SETTINGS_COLLECTION)
    .doc(agencyId)
    .set(
      {
        ...settings,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

  return settings;
}
