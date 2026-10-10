import { useMemo, useState } from "react";
import type { BranchInventoryRow } from "../inventoryHooks";
import { AppScreenLayout } from "../../../components/AppScreenLayout";
import { Button } from "../../../components/Button";
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
  rows: BranchInventoryRow[];
  isLoading?: boolean;
  onBack: () => void;
  onAddItem: () => void;
  onSelectRow: (row: BranchInventoryRow) => void;
}

export function InventoryScreen({
  rows,
  isLoading = false,
  onBack,
  onAddItem,
  onSelectRow,
}: InventoryScreenProps) {
  const [searchQuery, setSearchQuery]     = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter]   = useState("");

  const categories = useMemo(
    () => [...new Set(rows.map((r) => r.category))].sort(),
    [rows],
  );

  const filtered = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return rows.filter((row) => {
      const matchesQuery    = !query || row.name.toLowerCase().includes(query) || row.category.toLowerCase().includes(query);
      const matchesCategory = !categoryFilter || row.category === categoryFilter;
      const matchesStatus   = !statusFilter || row.status === statusFilter;
      return matchesQuery && matchesCategory && matchesStatus;
    });
  }, [rows, searchQuery, categoryFilter, statusFilter]);

  return (
    <AppScreenLayout>
      <div className="app-screen-layout__content inventory-screen">
        <PageHeader
          title="Branch Inventory"
          subtitle="Manage allocated stock and guard assignments for your branch."
          onBack={onBack}
          backLabel="Back to dashboard"
          actions={
            <Button type="button" onClick={onAddItem}>
              + Set Stock
            </Button>
          }
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
                    <th scope="col">Allocated</th>
                    <th scope="col">Assigned to Guards</th>
                    <th scope="col">Available</th>
                    <th scope="col">Threshold</th>
                    <th scope="col">Unit</th>
                    <th scope="col">Status</th>
                    <th scope="col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="inventory-table__empty">
                        No inventory items found. Admin must add master items first.
                      </td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="inventory-table__empty">
                        No items match your filters.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((row) => (
                      <tr key={row.id}>
                        <td className="inventory-table__name">{row.name}</td>
                        <td>{row.category}</td>
                        <td className="inventory-table__stock">{row.allocatedStock}</td>
                        <td className="inventory-table__assigned">{row.assignedStock}</td>
                        <td className={`inventory-table__available${row.availableStock <= 0 ? " inventory-table__available--zero" : ""}`}>
                          {row.availableStock}
                        </td>
                        <td className="inventory-table__stock">{row.thresholdStock}</td>
                        <td>{row.unit}</td>
                        <td>
                          <span className={`inventory-table__status inventory-table__status--${row.status}`}>
                            {STATUS_LABELS[row.status]}
                          </span>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="inventory-table__edit-btn"
                            onClick={() => onSelectRow(row)}
                          >
                            {row.hasBranchStock ? "Edit" : "Set Stock"}
                          </button>
                        </td>
                      </tr>
                    ))
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
