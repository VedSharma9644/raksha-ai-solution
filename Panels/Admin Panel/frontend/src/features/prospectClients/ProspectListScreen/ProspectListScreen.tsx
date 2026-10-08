import { useMemo, useState } from "react";
import { AppScreenLayout } from "../../../components/AppScreenLayout";
import { Button } from "../../../components/Button";
import { PageHeader } from "../../../components/PageHeader";
import { TextField } from "../../../components/TextField";
import type { ProspectClient, ProspectStatus } from "@raskha/client-management";
import {
  PROSPECT_STATUS_OPTIONS,
  statusLabel,
  statusColorClass,
} from "../prospectFormTypes";
import "./ProspectListScreen.css";

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

export interface ProspectListScreenProps {
  prospects: ProspectClient[];
  isLoading: boolean;
  error: string;
  onBack: () => void;
  onAdd: () => void;
  onView: (id: string) => void;
  onEdit: (prospect: ProspectClient) => void;
  onDelete: (id: string) => void;
}

// Status pipeline tabs including "All"
const PIPELINE_TABS: Array<{ value: ProspectStatus | ""; label: string }> = [
  { value: "", label: "All" },
  ...PROSPECT_STATUS_OPTIONS.map((o) => ({
    value: o.value as ProspectStatus,
    label: o.label,
  })),
];

export function ProspectListScreen({
  prospects,
  isLoading,
  error,
  onBack,
  onAdd,
  onView,
  onEdit,
  onDelete,
}: ProspectListScreenProps) {
  const [activeTab, setActiveTab] = useState<ProspectStatus | "">("");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = useMemo(() => {
    let list = activeTab
      ? prospects.filter((p) => p.status === activeTab)
      : prospects;

    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (p) =>
          p.orgName.toLowerCase().includes(q) ||
          p.contactName.toLowerCase().includes(q) ||
          p.city.toLowerCase().includes(q) ||
          p.primaryPhone.includes(q)
      );
    }
    return list;
  }, [prospects, activeTab, searchQuery]);

  // Count per status for tab badges
  const countByStatus = useMemo(() => {
    const map: Record<string, number> = {};
    for (const p of prospects) {
      map[p.status] = (map[p.status] ?? 0) + 1;
    }
    return map;
  }, [prospects]);

  return (
    <AppScreenLayout>
      <div className="app-screen-layout__content prospect-list-screen">
        <PageHeader
          title="Prospect Clients"
          subtitle="Track and manage your prospective client pipeline."
          onBack={onBack}
          backLabel="Back to dashboard"
          actions={
            <Button onClick={onAdd} variant="primary" size="medium">
              + Add Prospect
            </Button>
          }
        />

        {/* Pipeline tabs */}
        <div className="prospect-list-screen__tabs" role="tablist">
          {PIPELINE_TABS.map((tab) => (
            <button
              key={tab.value}
              role="tab"
              aria-selected={activeTab === tab.value}
              className={`prospect-list-screen__tab${activeTab === tab.value ? " prospect-list-screen__tab--active" : ""}`}
              onClick={() => setActiveTab(tab.value)}
              type="button"
            >
              {tab.label}
              {tab.value && countByStatus[tab.value] !== undefined ? (
                <span className="prospect-list-screen__tab-count">
                  {countByStatus[tab.value]}
                </span>
              ) : null}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="prospect-list-screen__search">
          <TextField
            label=""
            name="prospectSearch"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by org, contact, city or phone…"
          />
        </div>

        {/* Error */}
        {error && <p className="prospect-list-screen__error">{error}</p>}

        {/* Loading */}
        {isLoading ? (
          <div className="prospect-list-screen__loading">
            <span className="prospect-list-screen__spinner" />
            Loading prospects…
          </div>
        ) : (
          <div className="prospect-list-screen__table-wrap">
            <table className="prospect-table">
              <thead>
                <tr>
                  <th scope="col">Organisation</th>
                  <th scope="col">Contact</th>
                  <th scope="col">City</th>
                  <th scope="col">Site Type</th>
                  <th scope="col">Follow-up</th>
                  <th scope="col">Lead Source</th>
                  <th scope="col">Status</th>
                  <th scope="col" style={{ width: "100px", textAlign: "center" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="prospect-table__empty">
                      {searchQuery || activeTab
                        ? "No prospects match the current filter."
                        : "No prospects yet. Click \"+ Add Prospect\" to get started."}
                    </td>
                  </tr>
                ) : (
                  filtered.map((p) => (
                    <tr
                      key={p.id}
                      className="prospect-table__row prospect-table__row--clickable"
                      onClick={() => onView(p.id)}
                    >
                      <td>
                        <div className="prospect-table__org">{p.orgName}</div>
                        {p.email && (
                          <div className="prospect-table__sub">{p.email}</div>
                        )}
                      </td>
                      <td>
                        <div className="prospect-table__contact-name">{p.contactName}</div>
                        {p.contactDesignation && (
                          <div className="prospect-table__sub">{p.contactDesignation}</div>
                        )}
                        <div className="prospect-table__phone">{p.primaryPhone}</div>
                      </td>
                      <td>{p.city || "—"}</td>
                      <td>{p.expectedSiteType || "—"}</td>
                      <td>
                        {p.followUpDate ? (
                          <span className={`prospect-table__followup${isOverdue(p.followUpDate) ? " prospect-table__followup--overdue" : ""}`}>
                            {formatDate(p.followUpDate)}
                          </span>
                        ) : "—"}
                      </td>
                      <td className="prospect-table__source">{leadSourceLabel(p.leadSource)}</td>
                      <td>
                        <span className={`prospect-badge ${statusColorClass(p.status)}`}>
                          {statusLabel(p.status)}
                        </span>
                      </td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <div className="prospect-table__actions">
                          <button
                            type="button"
                            className="prospect-action-btn prospect-action-btn--view"
                            title="View details"
                            onClick={() => onView(p.id)}
                          >
                            <IconEye />
                          </button>
                          <button
                            type="button"
                            className="prospect-action-btn prospect-action-btn--edit"
                            title="Edit"
                            onClick={() => onEdit(p)}
                          >
                            <IconPencil />
                          </button>
                          <button
                            type="button"
                            className="prospect-action-btn prospect-action-btn--delete"
                            title="Delete"
                            onClick={() => {
                              if (confirm(`Delete prospect "${p.orgName}"? This cannot be undone.`)) {
                                onDelete(p.id);
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

const LEAD_SOURCE_LABELS: Record<string, string> = {
  referral: "Referral",
  cold_call: "Cold Call",
  walk_in: "Walk-in",
  online: "Online",
  other: "Other",
};

function leadSourceLabel(src: string): string {
  return LEAD_SOURCE_LABELS[src] ?? src;
}
