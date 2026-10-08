import { useState } from "react";
import { AppScreenLayout } from "../../../components/AppScreenLayout";
import { PageHeader } from "../../../components/PageHeader";
import { Button } from "../../../components/Button";
// SelectField not needed here — status is changed via a native <select> in the header
import type { ProspectClient, ProspectNote } from "@raskha/client-management";
import { AddProspectModal } from "../AddProspectModal/AddProspectModal";
import type { ProspectFormValues } from "../prospectFormTypes";
import {
  PROSPECT_STATUS_OPTIONS,
  LEAD_SOURCE_OPTIONS,
  EXPECTED_SITE_TYPE_OPTIONS,
  statusLabel,
  statusColorClass,
} from "../prospectFormTypes";
import "./ProspectDetailScreen.css";

// ── Props ─────────────────────────────────────────────────────────────────────

export interface ProspectDetailScreenProps {
  prospect: ProspectClient;
  notes: ProspectNote[];
  isLoadingNotes: boolean;
  notesError: string;
  isSavingProspect: boolean;
  saveProspectError: string;
  isSavingNote: boolean;
  saveNoteError: string;
  currentUserName: string;
  onBack: () => void;
  onUpdateProspect: (values: Partial<ProspectFormValues>) => void;
  onUpdateStatus: (status: string) => void;
  onAddNote: (content: string) => void;
  onDeleteNote: (noteId: string) => void;
  onDeleteProspect: () => void;
}

// ── Helper to format Firestore Timestamp or ISO string ───────────────────────

function formatTimestamp(ts: unknown): string {
  if (!ts) return "";
  // Firestore Timestamp-like
  if (typeof ts === "object" && ts !== null && "seconds" in ts) {
    const t = ts as { seconds: number };
    return new Date(t.seconds * 1000).toLocaleString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  }
  // ISO string
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

function leadSourceLabel(src: string): string {
  return LEAD_SOURCE_OPTIONS.find((o) => o.value === src)?.label ?? src;
}

function siteTypeLabel(type: string): string {
  return EXPECTED_SITE_TYPE_OPTIONS.find((o) => o.value === type)?.label ?? type;
}

// ── Initials avatar for note author ──────────────────────────────────────────

function AuthorAvatar({ name }: { name: string }) {
  const initials = name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  return <span className="note-avatar" aria-hidden="true">{initials}</span>;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function ProspectDetailScreen({
  prospect,
  notes,
  isLoadingNotes,
  notesError,
  isSavingProspect,
  saveProspectError,
  isSavingNote,
  saveNoteError,
  currentUserName,
  onBack,
  onUpdateProspect,
  onUpdateStatus,
  onAddNote,
  onDeleteNote,
  onDeleteProspect,
}: ProspectDetailScreenProps) {
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
      <div className="app-screen-layout__content prospect-detail-screen">
        <PageHeader
          title={prospect.orgName}
          subtitle={`${prospect.city ? prospect.city + " · " : ""}${siteTypeLabel(prospect.expectedSiteType) || "Unknown type"}`}
          onBack={onBack}
          backLabel="Back to Prospects"
          actions={
            <div className="prospect-detail-screen__header-actions">
              <select
                className="prospect-detail-screen__status-select"
                value={prospect.status}
                onChange={(e) => onUpdateStatus(e.target.value)}
                disabled={isSavingProspect}
                aria-label="Change status"
              >
                {PROSPECT_STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <Button
                onClick={() => setShowEditModal(true)}
                variant="secondary"
                size="medium"
              >
                Edit
              </Button>
              <Button
                onClick={() => {
                  if (confirm(`Delete "${prospect.orgName}"? All notes will also be deleted. This cannot be undone.`)) {
                    onDeleteProspect();
                  }
                }}
                variant="ghost"
                size="medium"
                className="prospect-detail-screen__delete-btn"
              >
                Delete
              </Button>
            </div>
          }
        />

        {saveProspectError && (
          <p className="prospect-detail-screen__error">{saveProspectError}</p>
        )}

        {/* Two-column layout */}
        <div className="prospect-detail-screen__layout">

          {/* ── Left: Info panel ── */}
          <div className="prospect-detail-screen__info-panel">

            {/* Status badge */}
            <div className="prospect-detail-screen__status-row">
              <span className={`prospect-badge ${statusColorClass(prospect.status)}`}>
                {statusLabel(prospect.status)}
              </span>
              {prospect.followUpDate && (
                <span className="prospect-detail-screen__followup">
                  📅 Follow-up: {formatDate(prospect.followUpDate)}
                </span>
              )}
            </div>

            {/* Info sections */}
            <section className="prospect-detail-screen__section">
              <h3 className="prospect-detail-screen__section-title">Organisation</h3>
              <div className="prospect-detail-screen__info-grid">
                <InfoRow label="Org Name"      value={prospect.orgName} />
                <InfoRow label="City"          value={prospect.city} />
                <InfoRow label="Site Type"     value={siteTypeLabel(prospect.expectedSiteType)} />
                <InfoRow label="Guards Needed" value={prospect.expectedGuardCount != null ? String(prospect.expectedGuardCount) : "—"} />
                <InfoRow label="Monthly Value" value={prospect.expectedMonthlyValue ? `₹ ${prospect.expectedMonthlyValue}` : "—"} />
                <InfoRow label="Lead Source"   value={leadSourceLabel(prospect.leadSource)} />
              </div>
            </section>

            <section className="prospect-detail-screen__section">
              <h3 className="prospect-detail-screen__section-title">Contact Person</h3>
              <div className="prospect-detail-screen__info-grid">
                <InfoRow label="Name"        value={prospect.contactName} />
                <InfoRow label="Designation" value={prospect.contactDesignation} />
                <InfoRow label="Phone"       value={prospect.primaryPhone} mono />
                {prospect.alternatePhone && (
                  <InfoRow label="Alt Phone" value={prospect.alternatePhone} mono />
                )}
                {prospect.email && (
                  <InfoRow label="Email" value={prospect.email} />
                )}
              </div>
            </section>

            <section className="prospect-detail-screen__section">
              <h3 className="prospect-detail-screen__section-title">Details</h3>
              <div className="prospect-detail-screen__info-grid">
                <InfoRow label="Added on" value={formatTimestamp(prospect.createdAt)} />
                <InfoRow label="Updated"  value={formatTimestamp(prospect.updatedAt)} />
              </div>
            </section>
          </div>

          {/* ── Right: Notes timeline ── */}
          <div className="prospect-detail-screen__notes-panel">
            <h3 className="prospect-detail-screen__notes-title">Activity Log</h3>

            {/* Add note form */}
            <form className="prospect-detail-screen__note-form" onSubmit={handleAddNote}>
              <textarea
                className="prospect-detail-screen__note-input"
                placeholder="Add a progress note, follow-up outcome, or update…"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                rows={3}
                disabled={isSavingNote}
              />
              {saveNoteError && (
                <p className="prospect-detail-screen__note-error">{saveNoteError}</p>
              )}
              <div className="prospect-detail-screen__note-form-footer">
                <span className="prospect-detail-screen__note-author">
                  As: <strong>{currentUserName}</strong>
                </span>
                <button
                  type="submit"
                  className="prospect-detail-screen__add-note-btn"
                  disabled={isSavingNote || !newNote.trim()}
                >
                  {isSavingNote ? "Adding…" : "+ Add Note"}
                </button>
              </div>
            </form>

            {/* Notes list */}
            {isLoadingNotes ? (
              <p className="prospect-detail-screen__notes-loading">Loading notes…</p>
            ) : notesError ? (
              <p className="prospect-detail-screen__note-error">{notesError}</p>
            ) : notes.length === 0 ? (
              <p className="prospect-detail-screen__notes-empty">
                No notes yet. Add your first activity note above.
              </p>
            ) : (
              <ol className="prospect-detail-screen__timeline">
                {notes.map((note) => (
                  <li key={note.id} className="prospect-timeline-item">
                    <div className="prospect-timeline-item__dot" aria-hidden="true" />
                    <div className="prospect-timeline-item__card">
                      <div className="prospect-timeline-item__meta">
                        <AuthorAvatar name={note.authorName} />
                        <span className="prospect-timeline-item__author">{note.authorName}</span>
                        <span className="prospect-timeline-item__time">
                          {formatTimestamp(note.createdAt)}
                        </span>
                        <button
                          type="button"
                          className="prospect-timeline-item__delete"
                          title="Delete note"
                          onClick={() => {
                            if (confirm("Delete this note?")) onDeleteNote(note.id);
                          }}
                        >
                          ✕
                        </button>
                      </div>
                      <p className="prospect-timeline-item__content">{note.content}</p>
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
        <AddProspectModal
          editProspect={prospect}
          isSaving={isSavingProspect}
          saveError={saveProspectError}
          onSave={(values) => {
            onUpdateProspect(values);
            setShowEditModal(false);
          }}
          onClose={() => setShowEditModal(false)}
        />
      )}
    </AppScreenLayout>
  );
}

// ── Small InfoRow helper ──────────────────────────────────────────────────────

function InfoRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="prospect-info-row">
      <dt className="prospect-info-row__label">{label}</dt>
      <dd className={`prospect-info-row__value${mono ? " prospect-info-row__value--mono" : ""}`}>
        {value || "—"}
      </dd>
    </div>
  );
}
