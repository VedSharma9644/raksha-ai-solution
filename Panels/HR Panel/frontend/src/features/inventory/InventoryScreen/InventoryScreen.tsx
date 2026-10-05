import { useMemo, useState } from "react";
import { AppScreenLayout } from "../../../components/AppScreenLayout";
import { PageHeader } from "../../../components/PageHeader";
import { SelectField } from "../../../components/SelectField";
import { TextField } from "../../../components/TextField";
import type { InventoryItem } from "../inventoryTypes";
import "./InventoryScreen.css";

const STATUS_LABELS = {
  in_stock: "In stock",
  low_stock: "Low stock",
  out_of_stock: "Out of stock",
} as const;

export interface InventoryScreenProps {
  items: InventoryItem[];
  onBack: () => void;
}

export function InventoryScreen({ items, onBack }: InventoryScreenProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return items.filter((item) => {
      const matchesQuery =
        query.length === 0 ||
        item.name.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter.length === 0 || item.status === statusFilter;

      return matchesQuery && matchesStatus;
    });
  }, [items, searchQuery, statusFilter]);

  return (
    <AppScreenLayout>
      <div className="app-screen-layout__content inventory-screen">
        <PageHeader
          title="Manage Inventory"
          subtitle="Track uniforms and equipment stock. Costs and purchase records are not available in HR."
          onBack={onBack}
          backLabel="Back to dashboard"
        />

        <div className="inventory-screen__filters">
          <TextField
            label="Search"
            name="inventorySearch"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Item or category"
          />
          <SelectField
            label="Status"
            name="inventoryStatus"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            placeholder="All statuses"
            options={[
              { value: "in_stock", label: "In stock" },
              { value: "low_stock", label: "Low stock" },
              { value: "out_of_stock", label: "Out of stock" },
            ]}
          />
        </div>

        <div className="inventory-screen__table-wrap">
          <table className="inventory-table">
            <thead>
              <tr>
                <th scope="col">Item</th>
                <th scope="col">Category</th>
                <th scope="col">Quantity</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={4} className="inventory-table__empty">
                    No inventory items match your filters.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td>{item.category}</td>
                    <td>
                      {item.quantity} {item.unit}
                    </td>
                    <td>
                      <span
                        className={`inventory-table__status inventory-table__status--${item.status}`}
                      >
                        {STATUS_LABELS[item.status]}
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
