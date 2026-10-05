import { useMemo, useState } from "react";
import { AppScreenLayout } from "../../../components/AppScreenLayout";
import { PageHeader } from "../../../components/PageHeader";
import { SelectField } from "../../../components/SelectField";
import { TextField } from "../../../components/TextField";
import type { Subscriber } from "../subscriberTypes";
import "./SubscribersScreen.css";

const STATUS_LABELS = {
  active: "Active",
  trial: "Trial",
  expired: "Expired",
  cancelled: "Cancelled",
} as const;

export interface SubscribersScreenProps {
  subscribers: Subscriber[];
  onBack: () => void;
}

export function SubscribersScreen({
  subscribers,
  onBack,
}: SubscribersScreenProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const filteredSubscribers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return subscribers.filter((subscriber) => {
      const matchesQuery =
        query.length === 0 ||
        subscriber.agencyName.toLowerCase().includes(query) ||
        subscriber.planName.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter.length === 0 || subscriber.status === statusFilter;

      return matchesQuery && matchesStatus;
    });
  }, [searchQuery, statusFilter, subscribers]);

  return (
    <AppScreenLayout>
      <div className="app-screen-layout__content subscribers-screen">
        <PageHeader
          title="Subscribers"
          subtitle="Track who is paying, trialing, or expired across the platform."
          onBack={onBack}
          backLabel="Back to dashboard"
        />

        <div className="subscribers-screen__filters">
          <TextField
            label="Search"
            name="subscriberSearch"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Agency or plan"
          />
          <SelectField
            label="Status"
            name="subscriberStatus"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            placeholder="All statuses"
            options={[
              { value: "active", label: "Active" },
              { value: "trial", label: "Trial" },
              { value: "expired", label: "Expired" },
              { value: "cancelled", label: "Cancelled" },
            ]}
          />
        </div>

        <div className="subscribers-screen__table-wrap">
          <table className="subscribers-table">
            <thead>
              <tr>
                <th scope="col">Agency</th>
                <th scope="col">Plan</th>
                <th scope="col">Seats</th>
                <th scope="col">Started</th>
                <th scope="col">Renews</th>
                <th scope="col">Value</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubscribers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="subscribers-table__empty">
                    No subscribers match your filters.
                  </td>
                </tr>
              ) : (
                filteredSubscribers.map((subscriber) => (
                  <tr key={subscriber.id}>
                    <td>{subscriber.agencyName}</td>
                    <td>{subscriber.planName}</td>
                    <td>{subscriber.seats}</td>
                    <td>{subscriber.startedOn}</td>
                    <td>{subscriber.renewsOn}</td>
                    <td>{subscriber.monthlyValueLabel}</td>
                    <td>
                      <span
                        className={`subscribers-table__status subscribers-table__status--${subscriber.status}`}
                      >
                        {STATUS_LABELS[subscriber.status]}
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
