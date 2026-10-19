import { useMemo, useState } from "react";
import type { InventoryCatalogRow } from "../inventoryHooks";
import { AppScreenLayout } from "../../../components/AppScreenLayout";
import { Button } from "../../../components/Button";
import { PageHeader } from "../../../components/PageHeader";
import { SelectField } from "../../../components/SelectField";
import { TextField } from "../../../components/TextField";
import "./InventoryListScreen.css";

const STATUS_LABELS = {
  in_stock:     "In Stock",
  low_stock:    "Low Stock",
  out_of_stock: "Out of Stock",
} as const;

export interface InventoryListScreenProps {
  items: InventoryCatalogRow[];
  isSeeding?: boolean;
  onBack: () => void;
  onAddItem: () => void;
  onSelectItem: (itemId: string) => void;
  onViewBranchStock: (itemId: string) => void;
  onSeedDefaults: () => void;
}

export function InventoryListScreen({
  items,
  isSeeding = false,
  onBack,
  onAddItem,
  onSelectItem,
  onViewBranchStock,
  onSeedDefaults,
}: InventoryListScreenProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return items.filter((item) => {
      const matchesQuery =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q);
      const matchesCategory =
        !categoryFilter || item.category === categoryFilter;
      const matchesStatus = !statusFilter || item.status === statusFilter;
      return matchesQuery && matchesCategory && matchesStatus;
    });
  }, [items, searchQuery, categoryFilter, statusFilter]);

  const categories = useMemo(
    () => [...new Set(items.map((i) => i.category))].sort(),
    [items],
  );

  return (
    <AppScreenLayout>
      <div className="app-screen-layout__content inventory-list-screen">
        <PageHeader
          title="Agency Inventory Catalog"
          subtitle="Agency-wide master items. Available = not yet allocated to branches. Use Branches to distribute stock."
          onBack={onBack}
          backLabel="Back to dashboard"
          actions={
            <Button type="button" onClick={onAddItem}>
              + Add Item
            </Button>
          }
        />

        <div className="inventory-list-screen__filters">
          <TextField
            label="Search"
            name="inventorySearch"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Item name or category"
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
              { value: "in_stock", label: "In Stock" },
              { value: "low_stock", label: "Low Stock" },
              { value: "out_of_stock", label: "Out of Stock" },
            ]}
          />
        </div>

        {items.length === 0 && (
          <div className="inventory-list-screen__empty-state">
            <p>No inventory items yet.</p>
            <Button type="button" onClick={onSeedDefaults} disabled={isSeeding}>
              {isSeeding ? "Adding defaults…" : "Add Default Items"}
            </Button>
            <p className="inventory-list-screen__empty-hint">
              Adds all standard items (Shirt, Pant, Cap, Shoes, Torch, etc.) with 0 stock.
            </p>
          </div>
        )}

        {items.length > 0 && (
          <div className="inventory-list-screen__table-wrap">
            <table className="inventory-list-table">
              <thead>
                <tr>
                  <th scope="col">Item</th>
                  <th scope="col">Category</th>
                  <th scope="col">Total</th>
                  <th scope="col">Allocated to Branches</th>
                  <th scope="col">Assigned to Guards</th>
                  <th scope="col">Unallocated</th>
                  <th scope="col">Threshold</th>
                  <th scope="col">Unit</th>
                  <th scope="col">Status</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="inventory-list-table__empty">
                      No items match your filters.
                    </td>
                  </tr>
                ) : (
                  filtered.map((item) => (
                    <tr key={item.id}>
                      <td className="inventory-list-table__name">{item.name}</td>
                      <td>{item.category}</td>
                      <td className="inventory-list-table__stock">{item.totalStock}</td>
                      <td className="inventory-list-table__assigned">
                        {item.allocatedToBranches}
                      </td>
                      <td className="inventory-list-table__assigned">
                        {item.assignedToGuards}
                      </td>
                      <td
                        className={`inventory-list-table__available${
                          item.unallocated <= 0
                            ? " inventory-list-table__available--zero"
                            : ""
                        }`}
                      >
                        {item.unallocated}
                      </td>
                      <td>{item.thresholdStock}</td>
                      <td>{item.unit}</td>
                      <td>
                        <span
                          className={`inventory-list-table__status inventory-list-table__status--${item.status}`}
                        >
                          {STATUS_LABELS[item.status]}
                        </span>
                      </td>
                      <td className="inventory-list-table__actions">
                        <button
                          type="button"
                          className="inventory-list-table__edit-btn"
                          onClick={() => onSelectItem(item.id)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="inventory-list-table__branch-btn"
                          onClick={() => onViewBranchStock(item.id)}
                          title="View branch distribution"
                        >
                          🏢 Branches
                        </button>
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
