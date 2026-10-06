import { useMemo, useState } from "react";
import { AppScreenLayout } from "../../../components/AppScreenLayout";
import { Button } from "../../../components/Button";
import { PageHeader } from "../../../components/PageHeader";
import { TextField } from "../../../components/TextField";
import type { Site } from "@raskha/site-management";
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

export interface SiteListScreenProps {
  sites: Site[];
  onBack: () => void;
  onAddSite: () => void;
  onSelectSite: (siteId: string) => void;
}

export function SiteListScreen({
  sites,
  onBack,
  onAddSite,
  onSelectSite,
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
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="site-table__empty">
                    No sites found.
                  </td>
                </tr>
              ) : (
                filtered.map((site) => (
                  <tr
                    key={site.id}
                    className="site-table__row--clickable"
                    onClick={() => onSelectSite(site.id)}
                  >
                    <td>{site.siteName}</td>
                    <td>{SITE_TYPE_LABELS[site.siteType] ?? site.siteType}</td>
                    <td>{site.clientName}</td>
                    <td>{site.city}</td>
                    <td>{site.managerName}</td>
                    <td>
                      <span
                        className={`site-table__status site-table__status--${site.status}`}
                      >
                        {site.status === "active" ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppScreenLayout>
  );
}
