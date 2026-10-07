import { useEffect } from "react";
import { createPortal } from "react-dom";
import type { Guard } from "@raskha/guard-management";
import "./GuardProfileModal.css";

export interface GuardProfileModalProps {
  guard: Guard | null;
  onClose: () => void;
}

const STATUS_LABELS: Record<string, string> = {
  active: "Active",
  on_leave: "On Leave",
  inactive: "Inactive",
};

const STATUS_COLORS: Record<string, string> = {
  active: "guard-profile-modal__status--active",
  on_leave: "guard-profile-modal__status--on_leave",
  inactive: "guard-profile-modal__status--inactive",
};

function InfoRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="guard-profile-modal__info-row">
      <span className="guard-profile-modal__info-label">{label}</span>
      <span className="guard-profile-modal__info-value">{value || "—"}</span>
    </div>
  );
}

function SectionHeading({ title }: { title: string }) {
  return <p className="guard-profile-modal__section-heading">{title}</p>;
}

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .slice(0, 2)
    .join("");
}

export function GuardProfileModal({ guard, onClose }: GuardProfileModalProps) {
  // Close on Escape key
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  // Prevent body scroll while modal is open
  useEffect(() => {
    if (guard) {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }
  }, [guard]);

  if (!guard) return null;

  return createPortal(
    <div
      className="guard-profile-modal__backdrop"
      role="dialog"
      aria-modal="true"
      aria-label={`Profile: ${guard.fullName}`}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="guard-profile-modal__card">
        {/* ── Header ── */}
        <div className="guard-profile-modal__header">
          <div className="guard-profile-modal__hero">
            {guard.profilePictureUrl ? (
              <img
                src={guard.profilePictureUrl}
                alt={guard.fullName}
                className="guard-profile-modal__avatar"
              />
            ) : (
              <div className="guard-profile-modal__avatar guard-profile-modal__avatar--initials">
                {getInitials(guard.fullName)}
              </div>
            )}
            <div className="guard-profile-modal__hero-info">
              <h2 className="guard-profile-modal__name">{guard.fullName}</h2>
              <p className="guard-profile-modal__sub">
                {guard.employeeCode}
                {guard.post ? ` · ${guard.post}` : ""}
              </p>
              <span className={`guard-profile-modal__status ${STATUS_COLORS[guard.status] ?? ""}`}>
                {STATUS_LABELS[guard.status] ?? guard.status}
              </span>
            </div>
          </div>
          <button
            type="button"
            className="guard-profile-modal__close"
            onClick={onClose}
            aria-label="Close"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* ── Body ── */}
        <div className="guard-profile-modal__body">
          <SectionHeading title="Personal Details" />
          <div className="guard-profile-modal__info-grid">
            <InfoRow label="Father's Name" value={guard.fatherName} />
            <InfoRow label="Mobile" value={guard.phone} />
            <InfoRow label="Email" value={guard.email} />
            <InfoRow label="Caste" value={guard.caste} />
            <InfoRow label="Height" value={guard.height} />
          </div>
          {guard.address && (
            <div className="guard-profile-modal__address">
              <span className="guard-profile-modal__info-label">Address</span>
              <span className="guard-profile-modal__info-value">{guard.address}</span>
            </div>
          )}

          <SectionHeading title="Identity Documents" />
          <div className="guard-profile-modal__info-grid">
            <InfoRow label="Aadhaar Number" value={guard.aadhaarNumber} />
            <InfoRow label="PAN Number" value={guard.panNumber} />
          </div>

          <SectionHeading title="Employment Details" />
          <div className="guard-profile-modal__info-grid">
            <InfoRow label="Post / Designation" value={guard.post} />
            <InfoRow label="Joining Date" value={guard.joiningDate} />
            <InfoRow label="Salary" value={guard.salary ? `₹${guard.salary}` : undefined} />
            <InfoRow label="Experience" value={guard.experience} />
            <InfoRow label="Education" value={guard.education} />
            <InfoRow label="Guard Type" value={guard.guardType} />
            <InfoRow label="Interested City" value={guard.interestedCity} />
            <InfoRow
              label="Shift Timing"
              value={guard.shiftFrom && guard.shiftTo ? `${guard.shiftFrom} – ${guard.shiftTo}` : undefined}
            />
          </div>

          <SectionHeading title="Financial &amp; Compliance" />
          <div className="guard-profile-modal__info-grid">
            <InfoRow label="Bank Account" value={guard.bankAccount} />
            <InfoRow label="ESI Number" value={guard.esiNumber} />
            <InfoRow label="PF Number" value={guard.pfNumber} />
          </div>

          {guard.notes && (
            <>
              <SectionHeading title="Notes" />
              <p className="guard-profile-modal__notes">{guard.notes}</p>
            </>
          )}

          {(guard.characterCertificateUrl || guard.policeVerificationUrl) && (
            <>
              <SectionHeading title="Documents" />
              <div className="guard-profile-modal__docs">
                {guard.characterCertificateUrl && (
                  <a href={guard.characterCertificateUrl} target="_blank" rel="noopener noreferrer" className="guard-profile-modal__doc-link">
                    📄 Character Certificate
                  </a>
                )}
                {guard.policeVerificationUrl && (
                  <a href={guard.policeVerificationUrl} target="_blank" rel="noopener noreferrer" className="guard-profile-modal__doc-link">
                    📄 Police Verification
                  </a>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
