import { useMemo, useState } from "react";
import { AppScreenLayout } from "../../../components/AppScreenLayout";
import { Button } from "../../../components/Button";
import { PageHeader } from "../../../components/PageHeader";
import { TextField } from "../../../components/TextField";
import type { ProspectGuardStatus } from "@raskha/guard-management";
import {
  PROSPECT_GUARD_STATUS_OPTIONS,
  guardStatusLabel,
  guardStatusColorClass,
} from "../prospectGuardFormTypes";
import type { ProspectGuardListItem } from "../useProspectGuardList";
import "./ProspectGuardListScreen.css";

// ── Icons ────────────────────────────────────────────────────────────────────

function IconEye() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );
}

function IconPencil() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  );
}

function IconTrash() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6l-1 14H6L5 6"/>
      <path d="M10 11v6M14 11v6"/>
      <path d="M9 6V4h6v2"/>
    </svg>
  );
}

// ── Props ────────────────────────────────────────────────────────────────────

export interface ProspectGuardListScreenProps {
  guards: ProspectGuardListItem[];
  isLoading: boolean;
  error: string | null;
  onBack: () => void;
  onAdd: () => void;
  onView: (id: string) => void;
  onEdit: (guard: ProspectGuardListItem) => void;
  onDelete: (id: string) => void;
}

// Pipeline tabs
const PIPELINE_TABS: Array<{ value: ProspectGuardStatus | ""; label: string }> = [
  { value: "", label: "All" },
  ...PROSPECT_GUARD_STATUS_OPTIONS.map((o) => ({
    value: o.value as ProspectGuardStatus,
    label: o.label,
  })),
];

export function ProspectGuardListScreen({
  guards,
  isLoading,
  error,
  onBack,
  onAdd,
  onView,
  onEdit,
  onDelete,
}: ProspectGuardListScreenProps) {
  const [activeTab, setActiveTab] = useState<ProspectGuardStatus | "">("");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = useMemo(() => {
    let list = activeTab
      ? guards.filter((g) => g.status === activeTab)
      : guards;
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (g) =>
          g.fullName.toLowerCase().includes(q) ||
          g.phone.includes(q) ||
          g.email.toLowerCase().includes(q) ||
          g.city.toLowerCase().includes(q)
      );
    }
    return list;
  }, [guards, activeTab, searchQuery]);

  const countByStatus = useMemo(() => {
    const map: Record<string, number> = {};
    for (const g of guards) {
      map[g.status] = (map[g.status] ?? 0) + 1;
    }
    return map;
  }, [guards]);

  return (
    <AppScreenLayout>
      <div className="app-screen-layout__content prospect-guard-list-screen">
        <PageHeader
          title="Prospect Guards"
          subtitle="Track and manage your prospective guard candidates."
          onBack={onBack}
          backLabel="Back to dashboard"
          actions={
            <Button onClick={onAdd} variant="primary" size="medium">
              + Add Prospect Guard
            </Button>
          }
        />

        {/* Pipeline tabs */}
        <div className="prospect-guard-list-screen__tabs" role="tablist">
          {PIPELINE_TABS.map((tab) => (
            <button
              key={tab.value}
              role="tab"
              aria-selected={activeTab === tab.value}
              className={`prospect-guard-list-screen__tab${activeTab === tab.value ? " prospect-guard-list-screen__tab--active" : ""}`}
              onClick={() => setActiveTab(tab.value)}
              type="button"
            >
              {tab.label}
              {tab.value && countByStatus[tab.value] !== undefined ? (
                <span className="prospect-guard-list-screen__tab-count">
                  {countByStatus[tab.value]}
                </span>
              ) : null}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="prospect-guard-list-screen__search">
          <TextField
            label=""
            name="guardSearch"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, phone, email or city…"
          />
        </div>

        {/* Error */}
        {error && <p className="prospect-guard-list-screen__error">{error}</p>}

        {/* Loading */}
        {isLoading ? (
          <div className="prospect-guard-list-screen__loading">
            <span className="prospect-guard-list-screen__spinner" />
            Loading prospect guards…
          </div>
        ) : (
          <div className="prospect-guard-list-screen__table-wrap">
            <table className="prospect-guard-table">
              <thead>
                <tr>
                  <th scope="col">Name</th>
                  <th scope="col">Phone</th>
                  <th scope="col">City</th>
                  <th scope="col">Experience</th>
                  <th scope="col">Follow-up</th>
                  <th scope="col">Source</th>
                  <th scope="col">Status</th>
                  <th scope="col" style={{ width: "100px", textAlign: "center" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="prospect-guard-table__empty">
                      {searchQuery || activeTab
                        ? "No guards match the current filter."
                        : "No prospect guards yet. Click \"+ Add Prospect Guard\" to get started."}
                    </td>
                  </tr>
                ) : (
                  filtered.map((g) => (
                    <tr
                      key={g.id}
                      className="prospect-guard-table__row prospect-guard-table__row--clickable"
                      onClick={() => onView(g.id)}
                    >
                      <td>
                        <div className="prospect-guard-table__name">{g.fullName}</div>
                        {g.email && <div className="prospect-guard-table__sub">{g.email}</div>}
                      </td>
                      <td>
                        <div className="prospect-guard-table__phone">{g.phone}</div>
                      </td>
                      <td>{g.city || "—"}</td>
                      <td>{g.yearsOfExperience != null ? `${g.yearsOfExperience} yr${g.yearsOfExperience !== 1 ? "s" : ""}` : "—"}</td>
                      <td>
                        {g.followUpDate ? (
                          <span className={`prospect-guard-table__followup${isOverdue(g.followUpDate) ? " prospect-guard-table__followup--overdue" : ""}`}>
                            {formatDate(g.followUpDate)}
                          </span>
                        ) : "—"}
                      </td>
                      <td>{formatSource(g.applicationSource)}</td>
                      <td>
                        <span className={`guard-badge ${guardStatusColorClass(g.status)}`}>
                          {guardStatusLabel(g.status)}
                        </span>
                      </td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <div className="prospect-guard-table__actions">
                          <button
                            type="button"
                            className="prospect-guard-action-btn prospect-guard-action-btn--view"
                            title="View details"
                            onClick={() => onView(g.id)}
                          >
                            <IconEye />
                          </button>
                          <button
                            type="button"
                            className="prospect-guard-action-btn prospect-guard-action-btn--edit"
                            title="Edit"
                            onClick={() => onEdit(g)}
                          >
                            <IconPencil />
                          </button>
                          <button
                            type="button"
                            className="prospect-guard-action-btn prospect-guard-action-btn--delete"
                            title="Delete"
                            onClick={() => {
                              if (confirm(`Delete "${g.fullName}"? This cannot be undone.`)) {
                                onDelete(g.id);
                              }
                            }}
                          >
                            <IconTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppScreenLayout>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(isoDate: string): string {
  try {
    return new Date(isoDate).toLocaleDateString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
    });
  } catch {
    return isoDate;
  }
}

function isOverdue(isoDate: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(isoDate) < today;
}

const SOURCE_LABELS: Record<string, string> = {
  referral: "Referral", walk_in: "Walk-in", online: "Online", job_portal: "Job Portal", other: "Other",
};

function formatSource(src: string): string {
  return SOURCE_LABELS[src] ?? src;
}
