/**
 * Normalize geofence detail so accuracy shows whole meters
 * (e.g. "Accuracy: 35.11000061035156m" → "Accuracy: 35m").
 */
export function formatGeofenceDetailForDisplay(detail: string): string {
  return detail.replace(/Accuracy:\s*([\d.]+)\s*m/gi, (_match, raw: string) => {
    const n = Number(raw);
    const meters = Number.isFinite(n) ? Math.max(0, Math.round(n)) : 0;
    return `Accuracy: ${meters}m`;
  });
}
