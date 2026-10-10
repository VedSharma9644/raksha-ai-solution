import { useMemo, useState } from "react";
import { AppScreenLayout } from "../../../components/AppScreenLayout";
import { Button } from "../../../components/Button";
import { PageHeader } from "../../../components/PageHeader";
import { TextField } from "../../../components/TextField";
import type { Site } from "@raskha/site-management";
import type { Guard } from "@raskha/guard-management";
import "./SiteListScreen.css";

const SITE_TYPE_LABELS: Record<string, string> = {
  industrial: "Industrial",
  hospital: "Hospital",
  hotel: "Hotel",
  mall: "Mall",
  company: "Company",
  temple: "Temple",
  workshop: "Workshop",
  refinery: "Refinery",
  bank: "Bank",
  "medical-college": "Medical College",
  other: "Other",
};

// ── Icon components ──────────────────────────────────────────────────────────
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

function IconCalendar() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  );
}


function IconShield() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  );
}

export interface SiteListScreenProps {
  sites: Site[];
  guards: Guard[];
  /** Site IDs with understaffed shifts in the next 7 days. */
  understaffedSiteIds?: string[];
  coverageSummary?: string;
  onBack: () => void;
  onAddSite: () => void;
  onSelectSite: (siteId: string) => void;
  onAssignGuards: (siteId: string) => void;
  onSchedule: (siteId: string) => void;
}

export function SiteListScreen({
  sites,
  guards,
  understaffedSiteIds = [],
  coverageSummary,
  onBack,
  onAddSite,
  onSelectSite,
  onAssignGuards,
  onSchedule,
}: SiteListScreenProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const understaffedSet = useMemo(
    () => new Set(understaffedSiteIds),
    [understaffedSiteIds]
  );

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return sites;
    return sites.filter(
      (s) =>
        s.siteName.toLowerCase().includes(q) ||
        s.clientName.toLowerCase().includes(q) ||
        s.city.toLowerCase().includes(q) ||
        s.managerName?.toLowerCase().includes(q)
    );
  }, [sites, searchQuery]);

  // Guard count per site — computed client-side, no extra reads
  const guardCountBySite = useMemo(() => {
    const map: Record<string, number> = {};
    for (const g of guards) {
      if (g.assignedSiteId) {
        map[g.assignedSiteId] = (map[g.assignedSiteId] ?? 0) + 1;
      }
    }
    return map;
  }, [guards]);

  return (
    <AppScreenLayout>
      <div className="app-screen-layout__content site-list-screen">
        <PageHeader
          title="Site List"
          subtitle="View and manage all client sites registered under this agency."
          onBack={onBack}
          backLabel="Back to dashboard"
          actions={
            <Button type="button" onClick={onAddSite}>
              + Add Site
            </Button>
          }
        />

        {coverageSummary ? (
          <div className="site-list-screen__coverage-banner" role="status">
            <strong>Next 7 days — scheduling gaps</strong>
            <p>{coverageSummary}</p>
            <p className="site-list-screen__coverage-hint">
              Open Schedule on a highlighted site to assign missing guards.
            </p>
          </div>
        ) : null}

        <div className="site-list-screen__filters">
          <TextField
            label="Search"
            name="siteSearch"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Site name, client, city, or manager"
          />
        </div>

        <div className="site-list-screen__table-wrap">
          <table className="site-table">
            <thead>
              <tr>
                <th scope="col">Site Name</th>
                <th scope="col">Type</th>
                <th scope="col">Client</th>
                <th scope="col">City</th>
                <th scope="col">Manager</th>
                <th scope="col" style={{ textAlign: "center" }}>Guards</th>
                <th scope="col">Status</th>
                <th scope="col" style={{ width: "120px", textAlign: "center" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="site-table__empty">
                    No sites found.
                  </td>
                </tr>
              ) : (
                filtered.map((site) => {
                  const count = guardCountBySite[site.id] ?? 0;
                  const needsSchedule = understaffedSet.has(site.id);
                  return (
                    <tr
                      key={site.id}
                      className={`site-table__row${needsSchedule ? " site-table__row--coverage-risk" : ""}`}
                    >
                      <td className="site-table__name">
                        {site.siteName}
                        {needsSchedule ? (
                          <span className="site-table__coverage-chip" title="Understaffed in the next 7 days">
                            Needs schedule
                          </span>
                        ) : null}
                      </td>
                      <td>{SITE_TYPE_LABELS[site.siteType] ?? site.siteType}</td>
                      <td>{site.clientName}</td>
                      <td>{site.city}</td>
                      <td>{site.managerName}</td>
                      <td style={{ textAlign: "center" }}>
                        <span className={`site-table__guard-count ${count > 0 ? "site-table__guard-count--active" : ""}`}>
                          {count}
                        </span>
                      </td>
                      <td>
                        <span className={`site-table__status site-table__status--${site.status}`}>
                          {site.status === "active" ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td>
                        <div className="site-table__actions">
                          <button
                            type="button"
                            className="site-action-btn site-action-btn--edit"
                            onClick={() => onSelectSite(site.id)}
                            title="Edit site"
                            aria-label={`Edit ${site.siteName}`}
                          >
                            <IconPencil />
                          </button>
                          <button
                            type="button"
                            className="site-action-btn site-action-btn--schedule"
                            onClick={() => onSchedule(site.id)}
                            title="View schedule"
                            aria-label={`Schedule for ${site.siteName}`}
                          >
                            <IconCalendar />
                          </button>
                          <button
                            type="button"
                            className="site-action-btn site-action-btn--assign"
                            onClick={() => onAssignGuards(site.id)}
                            title="Assign guards"
                            aria-label={`Assign guards to ${site.siteName}`}
                          >
                            <IconShield />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppScreenLayout>
  );
}
