import { useState } from "react";
import { AppScreenLayout } from "../../../components/AppScreenLayout";
import { PageHeader } from "../../../components/PageHeader";
import { Button } from "../../../components/Button";
import type { ProspectGuard } from "@raskha/guard-management";
import { AddProspectGuardModal } from "../AddProspectGuardModal/AddProspectGuardModal";
import type { ProspectGuardFormValues } from "../prospectGuardFormTypes";
import {
  PROSPECT_GUARD_STATUS_OPTIONS,
  APPLICATION_SOURCE_OPTIONS,
  GENDER_OPTIONS,
  PHYSICAL_FITNESS_OPTIONS,
  guardStatusLabel,
  guardStatusColorClass,
} from "../prospectGuardFormTypes";
import type { ProspectGuardNote } from "../useProspectGuardNotes";
import "./ProspectGuardDetailScreen.css";

// ── Props ─────────────────────────────────────────────────────────────────────

export interface ProspectGuardDetailScreenProps {
  guard: ProspectGuard;
  notes: ProspectGuardNote[];
  isLoadingNotes: boolean;
  notesError: string | null;
  isSavingGuard: boolean;
  saveGuardError: string | null;
  isSavingNote: boolean;
  currentUserName: string;
  onBack: () => void;
  onUpdateGuard: (values: Partial<ProspectGuardFormValues>) => void;
  onUpdateStatus: (status: string) => void;
  onAddNote: (content: string) => void;
  onDeleteNote: (noteId: string) => void;
  onDeleteGuard: () => void;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatTimestamp(ts: unknown): string {
  if (!ts) return "";
  if (typeof ts === "object" && ts !== null && "seconds" in ts) {
    const t = ts as { seconds: number };
    return new Date(t.seconds * 1000).toLocaleString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  }
  if (typeof ts === "string") {
    return new Date(ts).toLocaleString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  }
  return "";
}

function formatDate(isoDate: string | null | undefined): string {
  if (!isoDate) return "—";
  try {
    return new Date(isoDate).toLocaleDateString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
    });
  } catch { return isoDate; }
}

function labelFor(options: { value: string; label: string }[], value: string): string {
  return options.find((o) => o.value === value)?.label ?? value;
}

function AuthorAvatar({ name }: { name: string }) {
  const initials = name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  return <span className="guard-note-avatar" aria-hidden="true">{initials}</span>;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function ProspectGuardDetailScreen({
  guard,
  notes,
  isLoadingNotes,
  notesError,
  isSavingGuard,
  saveGuardError,
  isSavingNote,
  currentUserName,
  onBack,
  onUpdateGuard,
  onUpdateStatus,
  onAddNote,
  onDeleteNote,
  onDeleteGuard,
}: ProspectGuardDetailScreenProps) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [newNote, setNewNote] = useState("");

  function handleAddNote(e: React.FormEvent) {
    e.preventDefault();
    if (!newNote.trim()) return;
    onAddNote(newNote.trim());
    setNewNote("");
  }

  return (
    <AppScreenLayout>
      <div className="app-screen-layout__content prospect-guard-detail-screen">
        <PageHeader
          title={guard.fullName}
          subtitle={`${guard.city ? guard.city + " · " : ""}${guard.phone}`}
          onBack={onBack}
          backLabel="Back to Prospect Guards"
          actions={
            <div className="prospect-guard-detail-screen__header-actions">
              <select
                className="prospect-guard-detail-screen__status-select"
                value={guard.status}
                onChange={(e) => onUpdateStatus(e.target.value)}
                disabled={isSavingGuard}
                aria-label="Change status"
              >
                {PROSPECT_GUARD_STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <Button onClick={() => setShowEditModal(true)} variant="secondary" size="medium">
                Edit
              </Button>
              <Button
                onClick={() => {
                  if (confirm(`Delete "${guard.fullName}"? All notes will also be deleted. This cannot be undone.`)) {
                    onDeleteGuard();
                  }
                }}
                variant="ghost"
                size="medium"
                className="prospect-guard-detail-screen__delete-btn"
              >
                Delete
              </Button>
            </div>
          }
        />

        {saveGuardError && (
          <p className="prospect-guard-detail-screen__error">{saveGuardError}</p>
        )}

        {/* Two-column layout */}
        <div className="prospect-guard-detail-screen__layout">

          {/* ── Left: Info panel ── */}
          <div className="prospect-guard-detail-screen__info-panel">

            {/* Status badge */}
            <div className="prospect-guard-detail-screen__status-row">
              <span className={`guard-badge ${guardStatusColorClass(guard.status)}`}>
                {guardStatusLabel(guard.status)}
              </span>
              {guard.followUpDate && (
                <span className="prospect-guard-detail-screen__followup">
                  📅 Follow-up: {formatDate(guard.followUpDate)}
                </span>
              )}
            </div>

            {/* Personal */}
            <section className="prospect-guard-detail-screen__section">
              <h3 className="prospect-guard-detail-screen__section-title">Personal Details</h3>
              <div className="prospect-guard-detail-screen__info-grid">
                <InfoRow label="Full Name"   value={guard.fullName} />
                <InfoRow label="Gender"      value={labelFor(GENDER_OPTIONS, guard.gender)} />
                <InfoRow label="Date of Birth" value={formatDate(guard.dateOfBirth)} />
                <InfoRow label="City"        value={guard.city} />
              </div>
            </section>

            {/* Contact */}
            <section className="prospect-guard-detail-screen__section">
              <h3 className="prospect-guard-detail-screen__section-title">Contact</h3>
              <div className="prospect-guard-detail-screen__info-grid">
                <InfoRow label="Phone"         value={guard.phone} mono />
                {guard.alternatePhone && <InfoRow label="Alt Phone" value={guard.alternatePhone} mono />}
                {guard.email && <InfoRow label="Email" value={guard.email} />}
              </div>
            </section>

            {/* ID Documents */}
            <section className="prospect-guard-detail-screen__section">
              <h3 className="prospect-guard-detail-screen__section-title">ID Documents</h3>
              <div className="prospect-guard-detail-screen__info-grid">
                <InfoRow label="Aadhaar" value={guard.aadhaarNumber} mono />
                <InfoRow label="PAN"     value={guard.panNumber} mono />
              </div>
            </section>

            {/* Experience & Physical */}
            <section className="prospect-guard-detail-screen__section">
              <h3 className="prospect-guard-detail-screen__section-title">Experience & Physical</h3>
              <div className="prospect-guard-detail-screen__info-grid">
                <InfoRow label="Experience"       value={guard.yearsOfExperience != null ? `${guard.yearsOfExperience} yr(s)` : "—"} />
                <InfoRow label="Prev. Employer"   value={guard.previousEmployer} />
                <InfoRow label="Height"           value={guard.height ? `${guard.height} cm` : "—"} />
                <InfoRow label="Weight"           value={guard.weight ? `${guard.weight} kg` : "—"} />
                <InfoRow label="Physical Fitness" value={labelFor(PHYSICAL_FITNESS_OPTIONS, guard.physicalFitness)} />
              </div>
            </section>

            {/* Interview */}
            <section className="prospect-guard-detail-screen__section">
              <h3 className="prospect-guard-detail-screen__section-title">Interview</h3>
              <div className="prospect-guard-detail-screen__info-grid">
                <InfoRow label="Interview Date" value={formatDate(guard.interviewDate)} />
                <InfoRow label="Interviewer"    value={guard.interviewerName} />
              </div>
            </section>

            {/* Pipeline */}
            <section className="prospect-guard-detail-screen__section">
              <h3 className="prospect-guard-detail-screen__section-title">Pipeline</h3>
              <div className="prospect-guard-detail-screen__info-grid">
                <InfoRow label="Application Source" value={labelFor(APPLICATION_SOURCE_OPTIONS, guard.applicationSource)} />
                <InfoRow label="Added on"  value={formatTimestamp(guard.createdAt)} />
                <InfoRow label="Updated"   value={formatTimestamp(guard.updatedAt)} />
              </div>
            </section>
          </div>

          {/* ── Right: Notes timeline ── */}
          <div className="prospect-guard-detail-screen__notes-panel">
            <h3 className="prospect-guard-detail-screen__notes-title">Activity Log</h3>

            {/* Add note form */}
            <form className="prospect-guard-detail-screen__note-form" onSubmit={handleAddNote}>
              <textarea
                className="prospect-guard-detail-screen__note-input"
                placeholder="Add a progress note, interview outcome, or update…"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                rows={3}
                disabled={isSavingNote}
              />
              <div className="prospect-guard-detail-screen__note-form-footer">
                <span className="prospect-guard-detail-screen__note-author">
                  As: <strong>{currentUserName}</strong>
                </span>
                <button
                  type="submit"
                  className="prospect-guard-detail-screen__add-note-btn"
                  disabled={isSavingNote || !newNote.trim()}
                >
                  {isSavingNote ? "Adding…" : "+ Add Note"}
                </button>
              </div>
            </form>

            {/* Notes list */}
            {isLoadingNotes ? (
              <p className="prospect-guard-detail-screen__notes-loading">Loading notes…</p>
            ) : notesError ? (
              <p className="prospect-guard-detail-screen__note-error">{notesError}</p>
            ) : notes.length === 0 ? (
              <p className="prospect-guard-detail-screen__notes-empty">
                No notes yet. Add your first activity note above.
              </p>
            ) : (
              <ol className="prospect-guard-detail-screen__timeline">
                {notes.map((note) => (
                  <li key={note.id} className="guard-timeline-item">
                    <div className="guard-timeline-item__dot" aria-hidden="true" />
                    <div className="guard-timeline-item__card">
                      <div className="guard-timeline-item__meta">
                        <AuthorAvatar name={note.authorName} />
                        <span className="guard-timeline-item__author">{note.authorName}</span>
                        <span className="guard-timeline-item__time">
                          {formatTimestamp(note.createdAt)}
                        </span>
                        <button
                          type="button"
                          className="guard-timeline-item__delete"
                          title="Delete note"
                          onClick={() => {
                            if (confirm("Delete this note?")) onDeleteNote(note.id);
                          }}
                        >
                          ✕
                        </button>
                      </div>
                      <p className="guard-timeline-item__content">{note.content}</p>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      </div>

      {/* Edit modal */}
      {showEditModal && (
        <AddProspectGuardModal
          editGuard={guard}
          isSaving={isSavingGuard}
          saveError={saveGuardError}
          onSave={(values) => {
            onUpdateGuard(values);
            setShowEditModal(false);
          }}
          onClose={() => setShowEditModal(false)}
        />
      )}
    </AppScreenLayout>
  );
}

// ── InfoRow ───────────────────────────────────────────────────────────────────

function InfoRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="guard-info-row">
      <dt className="guard-info-row__label">{label}</dt>
      <dd className={`guard-info-row__value${mono ? " guard-info-row__value--mono" : ""}`}>
        {value || "—"}
      </dd>
    </div>
  );
}
