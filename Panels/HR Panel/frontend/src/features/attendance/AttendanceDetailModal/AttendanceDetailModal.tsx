import { useEffect, useState } from "react";
import type { AttendanceRecord, IntervalCheckin, GeofenceStatus } from "../attendanceTypes";
import { formatDuration } from "../attendanceTypes";
import "./AttendanceDetailModal.css";

export interface AttendanceDetailModalProps {
  record: AttendanceRecord;
  onClose: () => void;
}

const GEO_LABEL: Record<GeofenceStatus, string> = {
  passed: "✓ Verified",
  demo_passed: "◎ Demo",
  failed: "✗ Outside Zone",
};

// ── Small reusable photo card ───────────────────────────────────────────────
interface PhotoCardProps {
  label: string;
  time: string | null;
  selfieUrl: string | null;
  geofenceStatus: GeofenceStatus | null;
  accuracyMeters?: number;
  guardInitials: string;
  guardAvatarColor: string;
  isOnShift?: boolean;
  onExpand?: (url: string) => void;
}

function PhotoCard({
  label,
  time,
  selfieUrl,
  geofenceStatus,
  accuracyMeters,
  guardInitials,
  guardAvatarColor,
  isOnShift,
  onExpand,
}: PhotoCardProps) {
  return (
    <div className={`att-photo-card ${isOnShift ? "att-photo-card--pending" : ""}`}>
      <p className="att-photo-card__label">{label}</p>

      <div
        className="att-photo-card__img-wrap"
        role={selfieUrl && onExpand ? "button" : undefined}
        tabIndex={selfieUrl && onExpand ? 0 : undefined}
        aria-label={selfieUrl ? `Enlarge ${label} photo` : undefined}
        onClick={() => selfieUrl && onExpand?.(selfieUrl)}
        onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === " ") && selfieUrl) onExpand?.(selfieUrl);
        }}
      >
        {isOnShift ? (
          <div className="att-photo-card__pending">
            <span className="att-pulse-dot att-pulse-dot--lg" />
            <span className="att-photo-card__pending-text">On shift…</span>
          </div>
        ) : selfieUrl ? (
          <>
            <img
              src={selfieUrl}
              alt={`${label} selfie`}
              className="att-photo-card__img"
              onError={(e) => {
                const img = e.target as HTMLImageElement;
                img.style.display = "none";
                const next = img.nextElementSibling as HTMLElement | null;
                if (next) next.style.display = "flex";
              }}
            />
            <span
              className="att-photo-card__initials"
              style={{ background: guardAvatarColor, display: "none" }}
            >
              {guardInitials}
            </span>
            <span className="att-photo-card__expand-hint">🔍 Tap to enlarge</span>
          </>
        ) : (
          <span
            className="att-photo-card__initials"
            style={{ background: guardAvatarColor }}
          >
            {guardInitials}
          </span>
        )}
      </div>

      {time && <p className="att-photo-card__time">{time}</p>}

      {geofenceStatus && (
        <span className={`att-modal__geo-badge att-modal__geo-badge--${geofenceStatus}`}>
          {GEO_LABEL[geofenceStatus]}
          {accuracyMeters !== undefined && ` · ${accuracyMeters}m`}
        </span>
      )}
    </div>
  );
}

// ── Interval check-in row in timeline ──────────────────────────────────────
interface TlIntervalProps {
  ci: IntervalCheckin;
  onExpand: (url: string) => void;
}

function TlIntervalRow({ ci, onExpand }: TlIntervalProps) {
  return (
    <div className="att-tl-item att-tl-item--checkin">
      <div className="att-tl-dot-wrap">
        <span className="att-tl-dot att-tl-dot--checkin" />
      </div>
      <div className="att-tl-content">
        <div className="att-tl-content__row">
          <div className="att-tl-content__info">
            <span className="att-tl-event">Check-in #{ci.sequenceNumber}</span>
            <span className="att-tl-time">{ci.checkinTime}</span>
            <span className={`att-tl-geo att-tl-geo--${ci.geofenceStatus}`}>
              {GEO_LABEL[ci.geofenceStatus]}
            </span>
          </div>
          <button
            type="button"
            className="att-tl-thumb-btn"
            onClick={() => onExpand(ci.selfieUrl)}
            aria-label={`View check-in #${ci.sequenceNumber} photo`}
          >
            <img
              src={ci.selfieUrl}
              alt={`Check-in #${ci.sequenceNumber}`}
              className="att-tl-thumb"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
            <span className="att-tl-thumb__overlay">🔍</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main modal ──────────────────────────────────────────────────────────────
export function AttendanceDetailModal({ record, onClose }: AttendanceDetailModalProps) {
  const [expandedPhotoUrl, setExpandedPhotoUrl] = useState<string | null>(null);

  const isOnShift = record.punchOutTime === null;
  const totalEvents = 2 + record.intervalCheckins.length; // punch-in + check-ins + punch-out
  const hasIntervalCheckins = record.intervalCheckins.length > 0;

  // Close modal on Escape; close lightbox first if open
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        if (expandedPhotoUrl) setExpandedPhotoUrl(null);
        else onClose();
      }
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose, expandedPhotoUrl]);

  // Build the sorted timeline events
  const timelineEvents = [
    { type: "punch_in" as const },
    ...record.intervalCheckins
      .slice()
      .sort((a, b) => a.sequenceNumber - b.sequenceNumber)
      .map((ci) => ({ type: "checkin" as const, ci })),
    { type: "punch_out" as const },
  ];

  return (
    <>
      {/* ── Photo lightbox (above modal) ── */}
      {expandedPhotoUrl && (
        <div
          className="att-lightbox"
          onClick={() => setExpandedPhotoUrl(null)}
          role="dialog"
          aria-label="Expanded photo"
        >
          <button
            type="button"
            className="att-lightbox__close"
            onClick={() => setExpandedPhotoUrl(null)}
          >
            ✕
          </button>
          <img
            src={expandedPhotoUrl}
            alt="Expanded selfie"
            className="att-lightbox__img"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* ── Modal overlay ── */}
      <div
        className="att-modal-overlay"
        role="dialog"
        aria-modal="true"
        aria-label={`Attendance details for ${record.guardName}`}
        onClick={onClose}
      >
        <div className="att-modal" onClick={(e) => e.stopPropagation()}>

          {/* ── Header ── */}
          <div className="att-modal__header">
            <div className="att-modal__header-info">
              <span className="att-modal__header-title">{record.guardName}</span>
              <div className="att-modal__header-meta">
                <span className="att-modal__header-code">{record.guardEmployeeCode}</span>
                {record.durationMinutes !== null && (
                  <>
                    <span className="att-modal__header-sep">·</span>
                    <span className="att-modal__header-duration">
                      ⏱ {formatDuration(record.durationMinutes)} total
                    </span>
                  </>
                )}
                {hasIntervalCheckins && (
                  <>
                    <span className="att-modal__header-sep">·</span>
                    <span className="att-modal__header-events">
                      {totalEvents} events
                    </span>
                  </>
                )}
              </div>
            </div>
            <button
              type="button"
              className="att-modal__close"
              onClick={onClose}
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          <div className="att-modal__scroll">
            {/* ── Photos row ── */}
            <div className="att-modal__photos">
              <PhotoCard
                label="📸 Punch In"
                time={record.punchInTime}
                selfieUrl={record.punchInSelfieUrl}
                geofenceStatus={record.punchInGeofenceStatus}
                accuracyMeters={record.punchInAccuracyMeters}
                guardInitials={record.guardInitials}
                guardAvatarColor={record.guardAvatarColor}
                onExpand={setExpandedPhotoUrl}
              />
              <PhotoCard
                label="📸 Punch Out"
                time={record.punchOutTime}
                selfieUrl={record.punchOutSelfieUrl}
                geofenceStatus={record.punchOutGeofenceStatus}
                guardInitials={record.guardInitials}
                guardAvatarColor={record.guardAvatarColor}
                isOnShift={isOnShift}
                onExpand={setExpandedPhotoUrl}
              />
            </div>

            {/* ── Site bar ── */}
            <div className="att-modal__site-bar">
              <span className="att-modal__site-bar-icon">📍</span>
              <div className="att-modal__site-bar-info">
                <span className="att-modal__site-bar-name">{record.siteName}</span>
                <span className="att-modal__site-bar-post">{record.postName}</span>
              </div>
              <div className="att-modal__site-bar-coords">
                <span>{record.punchInLat.toFixed(5)}, {record.punchInLng.toFixed(5)}</span>
              </div>
            </div>

            {/* ── Shift timeline ── */}
            <div className="att-modal__timeline-section">
              <p className="att-modal__section-label">⏱ Shift Timeline</p>

              <div className="att-tl">
                {timelineEvents.map((event, index) => {
                  const isLast = index === timelineEvents.length - 1;

                  if (event.type === "punch_in") {
                    return (
                      <div key="punch-in" className="att-tl-item att-tl-item--in">
                        <div className="att-tl-dot-wrap">
                          <span className="att-tl-dot att-tl-dot--in" />
                          {!isLast && <span className="att-tl-line" />}
                        </div>
                        <div className="att-tl-content">
                          <div className="att-tl-content__row">
                            <div className="att-tl-content__info">
                              <span className="att-tl-event">Punch In</span>
                              <span className="att-tl-time">{record.punchInTime}</span>
                              <span className={`att-tl-geo att-tl-geo--${record.punchInGeofenceStatus}`}>
                                {GEO_LABEL[record.punchInGeofenceStatus]} · {record.punchInAccuracyMeters}m
                              </span>
                            </div>
                            <button
                              type="button"
                              className="att-tl-thumb-btn"
                              onClick={() => setExpandedPhotoUrl(record.punchInSelfieUrl)}
                              aria-label="View punch-in photo"
                            >
                              <img
                                src={record.punchInSelfieUrl}
                                alt="Punch in"
                                className="att-tl-thumb"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = "none";
                                }}
                              />
                              <span className="att-tl-thumb__overlay">🔍</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  if (event.type === "checkin") {
                    return (
                      <div key={event.ci.id} className="att-tl-dot-wrap-outer">
                        <div className="att-tl-dot-wrap">
                          <span className="att-tl-dot att-tl-dot--checkin" />
                          {!isLast && <span className="att-tl-line" />}
                        </div>
                        <TlIntervalRow ci={event.ci} onExpand={setExpandedPhotoUrl} />
                      </div>
                    );
                  }

                  // punch_out
                  return (
                    <div key="punch-out" className="att-tl-item">
                      <div className="att-tl-dot-wrap">
                        {isOnShift ? (
                          <span className="att-tl-dot att-tl-dot--active">
                            <span className="att-tl-pulse" />
                          </span>
                        ) : (
                          <span className="att-tl-dot att-tl-dot--out" />
                        )}
                      </div>
                      <div className="att-tl-content">
                        {isOnShift ? (
                          <div className="att-tl-content__row">
                            <div className="att-tl-content__info">
                              <span className="att-tl-event">On Shift</span>
                              <span className="att-tl-time att-tl-time--active">Currently active</span>
                            </div>
                          </div>
                        ) : (
                          <div className="att-tl-content__row">
                            <div className="att-tl-content__info">
                              <span className="att-tl-event">Punch Out</span>
                              <span className="att-tl-time">{record.punchOutTime}</span>
                              {record.punchOutGeofenceStatus && (
                                <span className={`att-tl-geo att-tl-geo--${record.punchOutGeofenceStatus}`}>
                                  {GEO_LABEL[record.punchOutGeofenceStatus]}
                                </span>
                              )}
                            </div>
                            {record.punchOutSelfieUrl && (
                              <button
                                type="button"
                                className="att-tl-thumb-btn"
                                onClick={() => setExpandedPhotoUrl(record.punchOutSelfieUrl!)}
                                aria-label="View punch-out photo"
                              >
                                <img
                                  src={record.punchOutSelfieUrl}
                                  alt="Punch out"
                                  className="att-tl-thumb"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = "none";
                                  }}
                                />
                                <span className="att-tl-thumb__overlay">🔍</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── Map placeholder ── */}
            <div className="att-modal__map-placeholder">
              <div className="att-modal__map-icon">🗺</div>
              <p className="att-modal__map-title">Location Map</p>
              <p className="att-modal__map-sub">
                Live map will be available once app data structure is finalised.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
