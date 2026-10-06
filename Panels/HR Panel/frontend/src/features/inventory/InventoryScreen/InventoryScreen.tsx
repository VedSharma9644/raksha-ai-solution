import { useMemo, useState } from "react";
import type { InventoryItem } from "@raskha/inventory-management";
import { AppScreenLayout } from "../../../components/AppScreenLayout";
import { PageHeader } from "../../../components/PageHeader";
import { SelectField } from "../../../components/SelectField";
import { TextField } from "../../../components/TextField";
import "./InventoryScreen.css";

const STATUS_LABELS = {
  in_stock:     "In Stock",
  low_stock:    "Low Stock",
  out_of_stock: "Out of Stock",
} as const;

export interface InventoryScreenProps {
  items: InventoryItem[];
  isLoading?: boolean;
  onBack: () => void;
}

export function InventoryScreen({
  items,
  isLoading = false,
  onBack,
}: InventoryScreenProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const categories = useMemo(
    () => [...new Set(items.map((i) => i.category))].sort(),
    [items],
  );

  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return items.filter((item) => {
      const matchesQuery =
        !query ||
        item.name.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query);
      const matchesCategory =
        !categoryFilter || item.category === categoryFilter;
      const matchesStatus = !statusFilter || item.status === statusFilter;
      return matchesQuery && matchesCategory && matchesStatus;
    });
  }, [items, searchQuery, categoryFilter, statusFilter]);

  return (
    <AppScreenLayout>
      <div className="app-screen-layout__content inventory-screen">
        <PageHeader
          title="Inventory"
          subtitle="View current stock levels for uniforms and equipment. Editing is available in the Admin Panel only."
          onBack={onBack}
          backLabel="Back to dashboard"
        />

        {isLoading && (
          <p className="inventory-screen__loading">Loading inventory…</p>
        )}

        {!isLoading && (
          <>
            <div className="inventory-screen__filters">
              <TextField
                label="Search"
                name="inventorySearch"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Item or category"
              />
              <SelectField
                label="Category"
                name="inventoryCategory"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                placeholder="All categories"
                options={categories.map((c) => ({ value: c, label: c }))}
              />
              <SelectField
                label="Status"
                name="inventoryStatus"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                placeholder="All statuses"
                options={[
                  { value: "in_stock",     label: "In Stock" },
                  { value: "low_stock",    label: "Low Stock" },
                  { value: "out_of_stock", label: "Out of Stock" },
                ]}
              />
            </div>

            <div className="inventory-screen__table-wrap">
              <table className="inventory-table">
                <thead>
                  <tr>
                    <th scope="col">Item</th>
                    <th scope="col">Category</th>
                    <th scope="col">Total</th>
                    <th scope="col">Assigned</th>
                    <th scope="col">Available</th>
                    <th scope="col">Unit</th>
                    <th scope="col">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="inventory-table__empty">
                        No inventory items have been added by the admin yet.
                      </td>
                    </tr>
                  ) : filteredItems.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="inventory-table__empty">
                        No items match your filters.
                      </td>
                    </tr>
                  ) : (
                    filteredItems.map((item) => {
                      const availableStock = item.totalStock - (item.assignedStock ?? 0);
                      return (
                        <tr key={item.id}>
                          <td className="inventory-table__name">{item.name}</td>
                          <td>{item.category}</td>
                          <td className="inventory-table__stock">{item.totalStock}</td>
                          <td className="inventory-table__assigned">{item.assignedStock ?? 0}</td>
                          <td className={`inventory-table__available${availableStock <= 0 ? " inventory-table__available--zero" : ""}`}>
                            {availableStock}
                          </td>
                          <td>{item.unit}</td>
                          <td>
                            <span
                              className={`inventory-table__status inventory-table__status--${item.status}`}
                            >
                              {STATUS_LABELS[item.status]}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </AppScreenLayout>
  );
}
