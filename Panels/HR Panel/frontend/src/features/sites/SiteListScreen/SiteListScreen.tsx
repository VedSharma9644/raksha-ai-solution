import { useMemo, useState } from "react";
import { AppScreenLayout } from "../../../components/AppScreenLayout";
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
  onBack: () => void;
  onAssignGuards: (siteId: string) => void;
  onSchedule: (siteId: string) => void;
}

export function SiteListScreen({
  sites,
  guards,
  onBack,
  onAssignGuards,
  onSchedule,
}: SiteListScreenProps) {
  const [searchQuery, setSearchQuery] = useState("");

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
          subtitle="View all client sites and manage guard assignments."
          onBack={onBack}
          backLabel="Back to dashboard"
        />

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
                <th scope="col" style={{ width: "80px", textAlign: "center" }}>Actions</th>
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
                  return (
                    <tr key={site.id} className="site-table__row">
                      <td className="site-table__name">{site.siteName}</td>
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
                      <td style={{ textAlign: "center" }}>
                        <div className="site-table__actions">
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
