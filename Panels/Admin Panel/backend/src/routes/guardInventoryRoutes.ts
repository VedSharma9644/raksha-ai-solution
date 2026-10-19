import { Router } from "express";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import {
  requireAgencyCaller,
  type AgencyAuthRequest,
} from "../middleware/requireAgencyCaller";
import type { Response } from "express";

const ASSIGNMENTS = "guardInventoryAssignments";
const INVENTORY = "inventoryItems";
const BRANCH_STOCK = "branchStock";

type StockStatus = "in_stock" | "low_stock" | "out_of_stock";

function inventoryStatus(available: number, threshold: number): StockStatus {
  if (available <= 0) return "out_of_stock";
  if (available <= threshold) return "low_stock";
  return "in_stock";
}

function branchStatus(available: number, threshold: number): StockStatus {
  if (available <= 0) return "out_of_stock";
  if (available <= threshold) return "low_stock";
  return "in_stock";
}

async function adjustMasterAssigned(
  db: FirebaseFirestore.Firestore,
  itemId: string,
  delta: number
): Promise<void> {
  const ref = db.collection(INVENTORY).doc(itemId);
  const snap = await ref.get();
  if (!snap.exists) return;
  const data = snap.data() as {
    totalStock?: number;
    assignedStock?: number;
    thresholdStock?: number;
  };
  const newAssigned = Math.max(0, Number(data.assignedStock ?? 0) + delta);
  const available = Number(data.totalStock ?? 0) - newAssigned;
  await ref.update({
    assignedStock: newAssigned,
    status: inventoryStatus(available, Number(data.thresholdStock ?? 0)),
    updatedAt: FieldValue.serverTimestamp(),
  });
}

async function adjustBranchAssigned(
  db: FirebaseFirestore.Firestore,
  branchStockId: string,
  delta: number
): Promise<void> {
  const ref = db.collection(BRANCH_STOCK).doc(branchStockId);
  const snap = await ref.get();
  if (!snap.exists) return;
  const data = snap.data() as {
    allocatedStock?: number;
    assignedStock?: number;
    thresholdStock?: number;
  };
  const allocated = Number(data.allocatedStock ?? 0);
  const newAssigned = Math.max(0, Number(data.assignedStock ?? 0) + delta);
  if (delta > 0 && newAssigned > allocated) {
    throw new Error(
      `Not enough branch stock. Available: ${allocated - Number(data.assignedStock ?? 0)}.`
    );
  }
  const available = allocated - newAssigned;
  await ref.update({
    assignedStock: newAssigned,
    status: branchStatus(available, Number(data.thresholdStock ?? 0)),
    updatedAt: FieldValue.serverTimestamp(),
  });
}

export function createGuardInventoryRoutes(): Router {
  const router = Router();
  router.use(requireAgencyCaller);

  // GET /api/guard-inventory/by-guard/:guardId
  router.get("/by-guard/:guardId", async (req: AgencyAuthRequest, res: Response) => {
    try {
      const agencyId = req.agencyId!;
      const guardId = String(req.params.guardId);
      const db = getFirestore();
      const snap = await db
        .collection(ASSIGNMENTS)
        .where("agencyId", "==", agencyId)
        .where("guardId", "==", guardId)
        .get();

      // Collapse duplicate rows for the same item (legacy data) into one
      const byItem = new Map<
        string,
        { id: string; data: FirebaseFirestore.DocumentData; refsToDelete: FirebaseFirestore.DocumentReference[] }
      >();
      for (const d of snap.docs) {
        const data = d.data();
        const itemId = String(data.itemId ?? "");
        const existing = byItem.get(itemId);
        if (!existing) {
          byItem.set(itemId, { id: d.id, data, refsToDelete: [] });
          continue;
        }
        const mergedQty =
          Number(existing.data.quantity ?? 0) + Number(data.quantity ?? 0);
        existing.data = { ...existing.data, quantity: mergedQty };
        existing.refsToDelete.push(d.ref);
      }

      const rows: Record<string, unknown>[] = [];
      for (const { id, data, refsToDelete } of byItem.values()) {
        if (refsToDelete.length > 0) {
          await db.collection(ASSIGNMENTS).doc(id).update({
            quantity: Number(data.quantity ?? 0),
            updatedAt: FieldValue.serverTimestamp(),
          });
          // Extras already counted in stock — delete without stock adjust
          await Promise.all(refsToDelete.map((ref) => ref.delete()));
        }
        rows.push({ id, ...data });
      }

      res.json(rows);
    } catch (err: unknown) {
      const e = err as { message?: string };
      res.status(500).json({ error: e.message ?? "Failed to load assignments." });
    }
  });

  // POST /api/guard-inventory/assign
  router.post("/assign", async (req: AgencyAuthRequest, res: Response) => {
    try {
      const agencyId = req.agencyId!;
      const {
        guardId,
        itemId,
        itemName,
        category,
        unit,
        quantity,
        branchId,
        branchStockId,
      } = req.body as {
        guardId?: string;
        itemId?: string;
        itemName?: string;
        category?: string;
        unit?: string;
        quantity?: number;
        branchId?: string | null;
        branchStockId?: string | null;
      };

      const qty = Number(quantity) || 0;
      if (!guardId?.trim() || !itemId?.trim() || qty <= 0) {
        res.status(400).json({ error: "guardId, itemId, and a positive quantity are required." });
        return;
      }

      const db = getFirestore();

      // One assignment row per guard+item — merge extras / add quantity
      const existingSnap = await db
        .collection(ASSIGNMENTS)
        .where("agencyId", "==", agencyId)
        .where("guardId", "==", guardId)
        .get();
      const existingDocs = existingSnap.docs.filter(
        (d) => (d.data() as { itemId?: string }).itemId === itemId
      );

      // Validate branch pool availability when branchStockId is provided
      const stockIdForCheck =
        branchStockId ||
        (existingDocs[0]?.data() as { branchStockId?: string | null } | undefined)
          ?.branchStockId ||
        null;
      if (stockIdForCheck) {
        const stockSnap = await db.collection(BRANCH_STOCK).doc(stockIdForCheck).get();
        if (!stockSnap.exists) {
          res.status(404).json({ error: "Branch stock record not found." });
          return;
        }
        const stock = stockSnap.data() as {
          agencyId?: string;
          allocatedStock?: number;
          assignedStock?: number;
        };
        if (stock.agencyId !== agencyId) {
          res.status(403).json({ error: "Access denied." });
          return;
        }
        const available =
          Number(stock.allocatedStock ?? 0) - Number(stock.assignedStock ?? 0);
        if (qty > available) {
          res.status(400).json({
            error: `Only ${available} available in this branch pool.`,
          });
          return;
        }
      }

      if (existingDocs.length > 0) {
        const primary = existingDocs[0];
        const primaryData = primary.data() as {
          quantity?: number;
          branchStockId?: string | null;
          branchId?: string | null;
          itemName?: string;
          category?: string;
          unit?: string;
        };
        const extras = existingDocs.slice(1);
        let extrasQty = 0;
        for (const extra of extras) {
          extrasQty += Number((extra.data() as { quantity?: number }).quantity ?? 0);
          // Stock for extras was already counted — delete without adjusting stock
          await extra.ref.delete();
        }
        const newQty =
          Number(primaryData.quantity ?? 0) + extrasQty + qty;
        const resolvedBranchStockId =
          branchStockId ?? primaryData.branchStockId ?? null;
        const resolvedBranchId = branchId ?? primaryData.branchId ?? null;

        await primary.ref.update({
          quantity: newQty,
          itemName: itemName?.trim() || primaryData.itemName || "",
          category: category?.trim() || primaryData.category || "",
          unit: unit?.trim() || primaryData.unit || "pcs",
          branchId: resolvedBranchId,
          branchStockId: resolvedBranchStockId,
          updatedAt: FieldValue.serverTimestamp(),
        });

        // Only the newly requested qty affects stock counters
        await adjustMasterAssigned(db, itemId, qty);
        if (resolvedBranchStockId) {
          await adjustBranchAssigned(db, resolvedBranchStockId, qty);
        }

        res.json({
          id: primary.id,
          agencyId,
          guardId,
          itemId,
          itemName: itemName?.trim() || primaryData.itemName || "",
          category: category?.trim() || primaryData.category || "",
          unit: unit?.trim() || primaryData.unit || "pcs",
          quantity: newQty,
          branchId: resolvedBranchId,
          branchStockId: resolvedBranchStockId,
          merged: true,
        });
        return;
      }

      const ref = db.collection(ASSIGNMENTS).doc();
      const data = {
        agencyId,
        guardId,
        itemId,
        itemName: itemName?.trim() ?? "",
        category: category?.trim() ?? "",
        unit: unit?.trim() ?? "pcs",
        quantity: qty,
        branchId: branchId ?? null,
        branchStockId: branchStockId ?? null,
        assignedAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      };
      await ref.set(data);

      await adjustMasterAssigned(db, itemId, qty);
      if (branchStockId) {
        await adjustBranchAssigned(db, branchStockId, qty);
      }

      res.status(201).json({ id: ref.id, ...data, merged: false });
    } catch (err: unknown) {
      const e = err as { message?: string };
      res.status(500).json({ error: e.message ?? "Failed to assign item." });
    }
  });

  // PUT /api/guard-inventory/:assignmentId
  router.put("/:assignmentId", async (req: AgencyAuthRequest, res: Response) => {
    try {
      const agencyId = req.agencyId!;
      const assignmentId = String(req.params.assignmentId);
      const { quantity } = req.body as { quantity?: number };
      const newQty = Number(quantity);
      if (!Number.isFinite(newQty) || newQty < 0) {
        res.status(400).json({ error: "quantity must be a non-negative number." });
        return;
      }

      const db = getFirestore();
      const ref = db.collection(ASSIGNMENTS).doc(assignmentId);
      const snap = await ref.get();
      if (!snap.exists) {
        res.status(404).json({ error: "Assignment not found." });
        return;
      }
      const current = snap.data() as {
        agencyId?: string;
        itemId?: string;
        quantity?: number;
        branchStockId?: string | null;
      };
      if (current.agencyId !== agencyId) {
        res.status(403).json({ error: "Access denied." });
        return;
      }

      const oldQty = Number(current.quantity ?? 0);
      const delta = newQty - oldQty;

      if (newQty === 0) {
        await ref.delete();
        if (current.itemId) await adjustMasterAssigned(db, current.itemId, -oldQty);
        if (current.branchStockId) {
          await adjustBranchAssigned(db, current.branchStockId, -oldQty);
        }
        res.json({ success: true, deleted: true });
        return;
      }

      if (delta !== 0 && current.branchStockId && delta > 0) {
        const stockSnap = await db.collection(BRANCH_STOCK).doc(current.branchStockId).get();
        if (stockSnap.exists) {
          const stock = stockSnap.data() as {
            allocatedStock?: number;
            assignedStock?: number;
          };
          const available =
            Number(stock.allocatedStock ?? 0) - Number(stock.assignedStock ?? 0);
          if (delta > available) {
            res.status(400).json({
              error: `Only ${available} more available in this branch pool.`,
            });
            return;
          }
        }
      }

      await ref.update({
        quantity: newQty,
        updatedAt: FieldValue.serverTimestamp(),
      });
      if (delta !== 0 && current.itemId) {
        await adjustMasterAssigned(db, current.itemId, delta);
        if (current.branchStockId) {
          await adjustBranchAssigned(db, current.branchStockId, delta);
        }
      }
      res.json({ id: assignmentId, quantity: newQty });
    } catch (err: unknown) {
      const e = err as { message?: string };
      res.status(500).json({ error: e.message ?? "Failed to update assignment." });
    }
  });

  // DELETE /api/guard-inventory/:assignmentId
  router.delete("/:assignmentId", async (req: AgencyAuthRequest, res: Response) => {
    try {
      const agencyId = req.agencyId!;
      const assignmentId = String(req.params.assignmentId);
      const db = getFirestore();
      const ref = db.collection(ASSIGNMENTS).doc(assignmentId);
      const snap = await ref.get();
      if (!snap.exists) {
        res.status(404).json({ error: "Assignment not found." });
        return;
      }
      const current = snap.data() as {
        agencyId?: string;
        itemId?: string;
        quantity?: number;
        branchStockId?: string | null;
      };
      if (current.agencyId !== agencyId) {
        res.status(403).json({ error: "Access denied." });
        return;
      }

      const qty = Number(current.quantity ?? 0);
      await ref.delete();
      if (current.itemId && qty) await adjustMasterAssigned(db, current.itemId, -qty);
      if (current.branchStockId && qty) {
        await adjustBranchAssigned(db, current.branchStockId, -qty);
      }
      res.json({ success: true });
    } catch (err: unknown) {
      const e = err as { message?: string };
      res.status(500).json({ error: e.message ?? "Failed to remove assignment." });
    }
  });

  return router;
}
