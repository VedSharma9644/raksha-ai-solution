import { useMemo, useState } from "react";
import { AppScreenLayout } from "../../../components/AppScreenLayout";
import { PageHeader } from "../../../components/PageHeader";
import { TextField } from "../../../components/TextField";
import { SelectField } from "../../../components/SelectField";
import type { AttendanceRecord, AttendanceStats } from "../attendanceTypes";
import { formatDuration } from "../attendanceTypes";
import { AttendanceDetailModal } from "../AttendanceDetailModal";
import "./AttendanceListScreen.css";

const GEOFENCE_LABELS: Record<AttendanceRecord["geofenceStatus"], string> = {
  passed: "✓ Verified",
  demo_passed: "◎ Demo",
  failed: "✗ Outside Zone",
};

export interface AttendanceListScreenProps {
  records: AttendanceRecord[];
  stats: AttendanceStats;
  sites: { siteId: string; siteName: string }[];
  onBack: () => void;
}

export function AttendanceListScreen({
  records,
  stats,
  sites,
  onBack,
}: AttendanceListScreenProps) {
  const [dateFilter, setDateFilter] = useState(() => {
    const now = new Date();
    return now.toISOString().slice(0, 10); // "YYYY-MM-DD"
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [siteFilter, setSiteFilter] = useState("all");
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return records.filter((r) => {
      if (r.punchInDate !== dateFilter) return false;
      if (siteFilter !== "all" && r.siteId !== siteFilter) return false;
      if (q) {
        const haystack = `${r.guardName} ${r.guardEmployeeCode}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [records, dateFilter, searchQuery, siteFilter]);

  const siteOptions = [
    { value: "all", label: "All Sites" },
    ...sites.map((s) => ({ value: s.siteId, label: s.siteName })),
  ];

  const onShiftCount = filtered.filter((r) => r.punchOutTime === null).length;
  const completedCount = filtered.filter((r) => r.punchOutTime !== null).length;

  return (
    <AppScreenLayout>
      <div className="att-list-screen">
        <PageHeader
          title="Guard Attendance"
          subtitle="Track daily punch-in and punch-out records for all guards."
          onBack={onBack}
          backLabel="Back to dashboard"
        />

        {/* ── Stat Cards ── */}
        <div className="att-stat-row">
          <div className="att-stat-card att-stat-card--present">
            <div className="att-stat-card__icon">✅</div>
            <div className="att-stat-card__body">
              <span className="att-stat-card__number">{stats.presentToday}</span>
              <span className="att-stat-card__label">Present Today</span>
            </div>
          </div>

          <div className="att-stat-card att-stat-card--absent">
            <div className="att-stat-card__icon">❌</div>
            <div className="att-stat-card__body">
              <span className="att-stat-card__number">{stats.absentToday}</span>
              <span className="att-stat-card__label">Absent Today</span>
            </div>
          </div>

          <div className="att-stat-card att-stat-card--onshift">
            <div className="att-stat-card__icon">🔵</div>
            <div className="att-stat-card__body">
              <span className="att-stat-card__number">{stats.onShift}</span>
              <span className="att-stat-card__label">Currently On Shift</span>
            </div>
          </div>

          <div className="att-stat-card att-stat-card--completed">
            <div className="att-stat-card__icon">🏁</div>
            <div className="att-stat-card__body">
              <span className="att-stat-card__number">
                {stats.presentToday - stats.onShift}
              </span>
              <span className="att-stat-card__label">Shifts Completed</span>
            </div>
          </div>
        </div>

        {/* ── Filters ── */}
        <div className="att-filters">
          <div className="att-filters__date">
            <label className="att-filters__date-label" htmlFor="att-date-filter">
              Date
            </label>
            <input
              id="att-date-filter"
              type="date"
              className="att-filters__date-input"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </div>

          <div className="att-filters__search">
            <TextField
              label="Search Guard"
              name="attSearch"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Name or employee code…"
            />
          </div>

          <div className="att-filters__site">
            <SelectField
              label="Site"
              name="attSite"
              value={siteFilter}
              options={siteOptions}
              onChange={(e) => setSiteFilter(e.target.value)}
            />
          </div>
        </div>

        {/* ── Results Summary ── */}
        <p className="att-results-summary">
          Showing <strong>{filtered.length}</strong> record{filtered.length !== 1 ? "s" : ""}
          {onShiftCount > 0 && (
            <span className="att-results-summary__active">
              &nbsp;·&nbsp;
              <span className="att-pulse-dot" />
              {onShiftCount} on shift
            </span>
          )}
          {completedCount > 0 && (
            <span className="att-results-summary__completed">
              &nbsp;·&nbsp;{completedCount} completed
            </span>
          )}
        </p>

        {/* ── Table ── */}
        <div className="att-table-wrap">
          {filtered.length === 0 ? (
            <div className="att-empty">
              <div className="att-empty__icon">🕐</div>
              <p className="att-empty__title">No records found</p>
              <p className="att-empty__sub">
                {searchQuery || siteFilter !== "all"
                  ? "Try adjusting your search or site filter."
                  : "Guards haven't marked attendance for this date yet."}
              </p>
            </div>
          ) : (
            <table className="att-table">
              <thead>
                <tr>
                  <th scope="col">Guard</th>
                  <th scope="col">Site / Post</th>
                  <th scope="col">Punch In</th>
                  <th scope="col">Punch Out</th>
                  <th scope="col">Duration</th>
                  <th scope="col">Status</th>
                  <th scope="col">Selfie</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((record) => {
                  const isOnShift = record.punchOutTime === null;
                  return (
                    <tr
                      key={record.id}
                      className="att-table__row"
                      onClick={() => setSelectedRecord(record)}
                      title="Click to view details"
                    >
                      {/* Guard */}
                      <td className="att-table__cell att-table__cell--guard">
                        <div className="att-guard-cell">
                          <span
                            className="att-guard-cell__avatar"
                            style={{ background: record.guardAvatarColor }}
                          >
                            {record.guardInitials}
                          </span>
                          <div className="att-guard-cell__info">
                            <span className="att-guard-cell__name">{record.guardName}</span>
                            <span className="att-guard-cell__code">{record.guardEmployeeCode}</span>
                          </div>
                        </div>
                      </td>

                      {/* Site */}
                      <td className="att-table__cell att-table__cell--site">
                        <span className="att-site-name">{record.siteName}</span>
                        <span className="att-site-post">{record.postName}</span>
                      </td>

                      {/* Punch In */}
                      <td className="att-table__cell att-table__cell--time">
                        <span className="att-time">{record.punchInTime}</span>
                        <span className="att-date">{record.punchInDate}</span>
                      </td>

                      {/* Punch Out */}
                      <td className="att-table__cell att-table__cell--time">
                        {isOnShift ? (
                          <span className="att-on-shift-badge">
                            <span className="att-pulse-dot" />
                            On Shift
                          </span>
                        ) : (
                          <>
                            <span className="att-time">{record.punchOutTime}</span>
                            <span className="att-date">{record.punchInDate}</span>
                          </>
                        )}
                      </td>

                      {/* Duration */}
                      <td className="att-table__cell att-table__cell--duration">
                        {record.durationMinutes !== null ? (
                          <span className="att-duration">
                            {formatDuration(record.durationMinutes)}
                          </span>
                        ) : (
                          <span className="att-duration att-duration--active">—</span>
                        )}
                      </td>

                      {/* Geofence Status */}
                      <td className="att-table__cell">
                        <span
                          className={`att-geo-badge att-geo-badge--${record.punchInGeofenceStatus}`}
                        >
                          {GEOFENCE_LABELS[record.punchInGeofenceStatus]}
                        </span>
                      </td>

                      {/* Selfie */}
                      <td className="att-table__cell att-table__cell--selfie">
                        <img
                          src={record.punchInSelfieUrl}
                          alt={`${record.guardName}`}
                          className="att-selfie-thumb"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                          }}
                        />
                        <span
                          className="att-selfie-fallback"
                          style={{ background: record.guardAvatarColor }}
                        >
                          {record.guardInitials}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ── Detail Modal ── */}
      {selectedRecord !== null && (
        <AttendanceDetailModal
          record={selectedRecord}
          onClose={() => setSelectedRecord(null)}
        />
      )}
    </AppScreenLayout>
  );
}
