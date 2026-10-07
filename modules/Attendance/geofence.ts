import type { GeofenceCheckResult, GeofenceStatus } from "./attendance";

export type SiteGeofenceInput = {
  latitude?: number | null;
  longitude?: number | null;
  geofenceRadiusMeters?: number | null;
};

export type CheckGeofenceParams = {
  lat: number;
  lng: number;
  accuracyMeters?: number;
  site?: SiteGeofenceInput | null;
  /**
   * Demo always-pass applies only when the assigned site has no coordinates.
   * When site lat/lng exist, distance matching always runs.
   */
  demoMode?: boolean;
};

const EARTH_RADIUS_METERS = 6_371_000;
export const DEFAULT_GEOFENCE_RADIUS_METERS = 150;

export function haversineMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_METERS * Math.asin(Math.sqrt(a));
}

function isValidCoordinate(lat: number, lng: number): boolean {
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
}

/**
 * Match user GPS against site.latitude / site.longitude when present.
 * Falls back to demo unlock only if the site has no configured coordinates.
 */
export function checkGeofence(params: CheckGeofenceParams): GeofenceCheckResult {
  const { lat, lng, site, accuracyMeters = 5 } = params;
  const demoMode = params.demoMode !== false;

  if (!isValidCoordinate(lat, lng)) {
    return {
      unlocked: false,
      status: "failed",
      accuracyMeters,
      distanceMeters: null,
      message: "Invalid GPS coordinates.",
    };
  }

  const siteLat = site?.latitude ?? null;
  const siteLng = site?.longitude ?? null;
  const hasSiteCoords =
    siteLat != null &&
    siteLng != null &&
    isValidCoordinate(siteLat, siteLng);

  if (hasSiteCoords) {
    const radius =
      site?.geofenceRadiusMeters && site.geofenceRadiusMeters > 0
        ? site.geofenceRadiusMeters
        : Number(process.env.GEOFENCE_DEFAULT_RADIUS_METERS) ||
          DEFAULT_GEOFENCE_RADIUS_METERS;

    const distanceMeters = haversineMeters(lat, lng, siteLat, siteLng);
    const status: GeofenceStatus =
      distanceMeters <= radius ? "passed" : "failed";

    return {
      unlocked: status === "passed",
      status,
      accuracyMeters,
      distanceMeters: Math.round(distanceMeters),
      message:
        status === "passed"
          ? `Inside geofence (${Math.round(distanceMeters)}m / ${radius}m).`
          : `Outside geofence (${Math.round(distanceMeters)}m / ${radius}m).`,
    };
  }

  if (demoMode) {
    return {
      unlocked: true,
      status: "demo_passed",
      accuracyMeters,
      distanceMeters: 0,
      message: "Geofence unlocked (demo mode — site coordinates not set).",
    };
  }

  return {
    unlocked: false,
    status: "failed",
    accuracyMeters,
    distanceMeters: null,
    message: "Site geofence coordinates are not configured.",
  };
}
