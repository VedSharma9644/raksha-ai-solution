import { Timestamp } from "firebase/firestore";

export type SiteStatus = "active" | "inactive";

export type SiteType =
  | "industrial"
  | "hospital"
  | "hotel"
  | "mall"
  | "company"
  | "temple"
  | "workshop"
  | "refinery"
  | "bank"
  | "medical-college"
  | "other";

export interface Site {
  id: string;
  agencyId: string;

  // Basic info
  siteName: string;
  siteType: SiteType | "";
  clientName: string;
  address: string;
  city: string;

  // Manager
  managerName: string;
  managerContact: string;

  // HR contact at site
  hrName: string;
  hrContact: string;

  // Supervisor
  siteSupervisor: string;

  // Legacy / optional contact
  contactPerson: string;
  contactPhone: string;

  // Geofence (set by Admin/HR on the site)
  latitude?: number | null;
  longitude?: number | null;
  geofenceRadiusMeters?: number | null;

  notes: string;
  status: SiteStatus;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export const SITES_COLLECTION = "sites";
