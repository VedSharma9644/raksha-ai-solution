import { useMemo, useState } from "react";
import {
  findSiteCoverageGaps,
  summarizeSiteCoverageGaps,
  type GuardShiftAssignment,
} from "@raskha/scheduling";
import type { Site } from "@raskha/site-management";
import type { Guard } from "@raskha/guard-management";
import { AppScreenLayout } from "../../../components/AppScreenLayout";
import { PageHeader } from "../../../components/PageHeader";
import { WeeklyRosterView } from "../WeeklyRosterView";
import { MonthlyRosterView } from "../MonthlyRosterView";
import { AssignShiftModal } from "../AssignShiftModal";
import "./SchedulingScreen.css";

type RosterTab = "weekly" | "monthly";

export interface SchedulingScreenProps {
  site: Site;
  assignments: GuardShiftAssignment[];
  guards: Guard[];
  isLoading: boolean;
  error: string;
  isSaving: boolean;
  saveError: string;
  /** Admin can create/edit assignments */
  canEdit: boolean;
  onBack: () => void;
  onCreateAssignment: (params: {
    guardId: string;
    guardName: string;
    shiftId: string;
    shiftLabel: string;
    shiftStartTime: string;
    shiftEndTime: string;
    recurringDays: import("@raskha/scheduling").DayOfWeek[];
    effectiveFrom: string;
    effectiveTo?: string | null;
  }) => Promise<boolean>;
  onUpdateAssignment: (
    assignmentId: string,
    params: Partial<{
      shiftId: string;
      shiftLabel: string;
      shiftStartTime: string;
      shiftEndTime: string;
      recurringDays: import("@raskha/scheduling").DayOfWeek[];
      effectiveFrom: string;
      effectiveTo?: string | null;
    }>
  ) => Promise<boolean>;
  onDeleteAssignment: (assignmentId: string) => Promise<boolean>;
}

export function SchedulingScreen({
  site,
  assignments,
  guards,
  isLoading,
  error,
  isSaving,
  saveError,
  canEdit,
  onBack,
  onCreateAssignment,
  onUpdateAssignment,
  onDeleteAssignment,
}: SchedulingScreenProps) {
  const [tab, setTab] = useState<RosterTab>("weekly");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<GuardShiftAssignment | null>(null);
  const [preselectedShiftId, setPreselectedShiftId] = useState<string>("");
  const [preselectedDate, setPreselectedDate] = useState<string>("");

  const shifts = site.shiftConfig?.shifts ?? [];
  // Include any guard that appears in an assignment (covers stale assignedSiteId in local state)
  const assignedGuardIds = useMemo(
    () => new Set(assignments.map((a) => a.guardId)),
    [assignments],
  );
  const siteGuards = useMemo(
    () => guards.filter((g) => g.assignedSiteId === site.id || assignedGuardIds.has(g.id)),
    [guards, site.id, assignedGuardIds],
  );

  const nextWeekCoverage = useMemo(
    () =>
      findSiteCoverageGaps({
        site: {
          id: site.id,
          siteName: site.siteName,
          status: site.status,
          shiftConfig: site.shiftConfig,
        },
        assignments,
        days: 7,
      }),
    [site, assignments]
  );
  const coverageSummary = summarizeSiteCoverageGaps(nextWeekCoverage);
  const previewGaps = nextWeekCoverage.gaps.slice(0, 4);

  function openCreateModal(shiftId?: string, date?: string) {
    setEditingAssignment(null);
    setPreselectedShiftId(shiftId ?? "");
    setPreselectedDate(date ?? "");
    setModalOpen(true);
  }

  function openEditModal(assignment: GuardShiftAssignment) {
    setEditingAssignment(assignment);
    setPreselectedShiftId("");
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingAssignment(null);
    setPreselectedShiftId("");
    setPreselectedDate("");
  }

  async function handleSave(params: Parameters<typeof onCreateAssignment>[0]) {
    const ok = editingAssignment
      ? await onUpdateAssignment(editingAssignment.id, params)
      : await onCreateAssignment(params);
    if (ok) {
      closeModal();
    }
  }

  async function handleDelete(assignmentId: string) {
    const ok = await onDeleteAssignment(assignmentId);
    if (ok) {
      closeModal();
    }
  }

  // Prepopulate preselectedShiftId for shifts in modal
  const modalShifts = preselectedShiftId
    ? shifts.filter((s) => s.id === preselectedShiftId).concat(shifts.filter((s) => s.id !== preselectedShiftId))
    : shifts;

  return (
    <AppScreenLayout>
      <div className="app-screen-layout__content scheduling-screen">
        <PageHeader
          title="Schedule"
          subtitle={`${site.siteName} — ${site.clientName}`}
          onBack={onBack}
          backLabel="Back to Site List"
          actions={
            canEdit ? (
              <button
                type="button"
                className="scheduling-screen__assign-btn"
                onClick={() => openCreateModal()}
                disabled={shifts.length === 0}
                title={shifts.length === 0 ? "Edit the site to add shifts first" : "Assign a guard to a shift"}
              >
                + Assign Guard to Shift
              </button>
            ) : undefined
          }
        />

        {/* Site shift summary */}
        {shifts.length > 0 && (
          <div className="scheduling-screen__shift-summary">
            {site.shiftConfig?.has24hSurveillance && (
              <span className="scheduling-screen__badge scheduling-screen__badge--24h">
                24h Surveillance
              </span>
            )}
            {site.intervalCheckinMinutes && (
              <span className="scheduling-screen__badge scheduling-screen__badge--interval">
                Check-in every {site.intervalCheckinMinutes} min
              </span>
            )}
            {shifts.map((s) => (
              <span
                key={s.id}
                className={`scheduling-screen__badge scheduling-screen__badge--${s.shiftType}`}
              >
                {s.label}: {s.startTime}–{s.endTime} ({s.requiredGuards} guards)
              </span>
            ))}
          </div>
        )}

        {shifts.length === 0 && !isLoading && (
          <div className="scheduling-screen__no-shifts-banner">
            <span className="scheduling-screen__no-shifts-icon">ℹ</span>
            <div>
              <strong>No shift slots configured.</strong>
              {canEdit && (
                <> Edit this site to add Day / Night shift requirements.</>
              )}
            </div>
          </div>
        )}

        {!isLoading && coverageSummary ? (
          <div className="scheduling-screen__coverage-banner" role="status">
            <span className="scheduling-screen__coverage-icon" aria-hidden>
              ⚠
            </span>
            <div className="scheduling-screen__coverage-copy">
              <strong>Scheduling attention needed</strong>
              <p>{coverageSummary}</p>
              {previewGaps.length > 0 ? (
                <ul className="scheduling-screen__coverage-list">
                  {previewGaps.map((gap) => (
                    <li key={`${gap.dutyDate}-${gap.shiftId}`}>
                      {gap.dayLabel} · {gap.shiftLabel}: {gap.assigned}/{gap.required}{" "}
                      guard{gap.required === 1 ? "" : "s"}
                      {gap.assigned === 0 ? " (none assigned)" : ` (${gap.shortBy} short)`}
                    </li>
                  ))}
                  {nextWeekCoverage.gapCount > previewGaps.length ? (
                    <li>
                      +{nextWeekCoverage.gapCount - previewGaps.length} more…
                    </li>
                  ) : null}
                </ul>
              ) : null}
              {canEdit ? (
                <p className="scheduling-screen__coverage-hint">
                  Assign guards for the open days so this site stays covered.
                </p>
              ) : null}
            </div>
          </div>
        ) : null}

        {error && (
          <p className="scheduling-screen__error" role="alert">{error}</p>
        )}

        {/* Tabs */}
        <div className="scheduling-screen__tabs">
          <button
            type="button"
            className={`scheduling-screen__tab${tab === "weekly" ? " scheduling-screen__tab--active" : ""}`}
            onClick={() => setTab("weekly")}
          >
            Weekly Roster
          </button>
          <button
            type="button"
            className={`scheduling-screen__tab${tab === "monthly" ? " scheduling-screen__tab--active" : ""}`}
            onClick={() => setTab("monthly")}
          >
            Monthly Roster
          </button>
        </div>

        {isLoading ? (
          <div className="scheduling-screen__loading">
            <span className="scheduling-screen__spinner" />
            Loading schedule…
          </div>
        ) : (
          <div className="scheduling-screen__content">
            {tab === "weekly" ? (
              <WeeklyRosterView
                shifts={shifts}
                assignments={assignments}
                guards={siteGuards}
                canEdit={canEdit}
                onEditAssignment={openEditModal}
                onAddAssignment={(shiftId, date) => openCreateModal(shiftId, date)}
              />
            ) : (
              <MonthlyRosterView
                shifts={shifts}
                assignments={assignments}
                guards={siteGuards}
                canEdit={canEdit}
                onAddAssignment={openCreateModal}
                onEditAssignment={openEditModal}
              />
            )}
          </div>
        )}

        {modalOpen && (
          <AssignShiftModal
            guards={siteGuards}
            allGuards={guards}
            assignments={assignments}
            shifts={modalShifts}
            existingAssignment={editingAssignment}
            prefilledDate={preselectedDate || undefined}
            isSaving={isSaving}
            saveError={saveError}
            onSave={handleSave}
            onDelete={canEdit ? handleDelete : undefined}
            onClose={closeModal}
          />
        )}
      </div>
    </AppScreenLayout>
  );
}
