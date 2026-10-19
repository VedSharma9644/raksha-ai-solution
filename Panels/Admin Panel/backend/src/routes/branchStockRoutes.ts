import { Router } from "express";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import {
  requireAgencyCaller,
  type AgencyAuthRequest,
} from "../middleware/requireAgencyCaller";
import type { Response } from "express";

const BRANCH_STOCK_COLLECTION = "branchStock";
const INVENTORY_COLLECTION = "inventoryItems";

type BranchStockStatus = "in_stock" | "low_stock" | "out_of_stock";

function computeStatus(available: number, threshold: number): BranchStockStatus {
  if (available <= 0) return "out_of_stock";
  if (available <= threshold) return "low_stock";
  return "in_stock";
}

function stockDocId(agencyId: string, branchId: string, itemId: string): string {
  return `${agencyId}_${branchId}_${itemId}`;
}

export function createBranchStockRoutes(): Router {
  const router = Router();
  router.use(requireAgencyCaller);

  // GET /api/branch-stock — all branch allocations for the agency (catalog summary)
  router.get("/", async (req: AgencyAuthRequest, res: Response) => {
    try {
      const agencyId = req.agencyId!;
      const db = getFirestore();
      const snap = await db
        .collection(BRANCH_STOCK_COLLECTION)
        .where("agencyId", "==", agencyId)
        .get();
      res.json(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (err: unknown) {
      const e = err as { message?: string };
      res.status(500).json({ error: e.message ?? "Failed to load branch stock." });
    }
  });

  // GET /api/branch-stock/by-item/:itemId
  router.get("/by-item/:itemId", async (req: AgencyAuthRequest, res: Response) => {
    try {
      const agencyId = req.agencyId!;
      const itemId = String(req.params.itemId);
      const db = getFirestore();
      const snap = await db
        .collection(BRANCH_STOCK_COLLECTION)
        .where("agencyId", "==", agencyId)
        .where("itemId", "==", itemId)
        .get();
      const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      res.json(rows);
    } catch (err: unknown) {
      const e = err as { message?: string };
      res.status(500).json({ error: e.message ?? "Failed to load branch stock." });
    }
  });

  // GET /api/branch-stock/by-branch/:branchId — HR reads their branch pool
  router.get("/by-branch/:branchId", async (req: AgencyAuthRequest, res: Response) => {
    try {
      const agencyId = req.agencyId!;
      const branchId = String(req.params.branchId);
      const db = getFirestore();
      const snap = await db
        .collection(BRANCH_STOCK_COLLECTION)
        .where("agencyId", "==", agencyId)
        .where("branchId", "==", branchId)
        .get();
      const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      res.json(rows);
    } catch (err: unknown) {
      const e = err as { message?: string };
      res.status(500).json({ error: e.message ?? "Failed to load branch stock." });
    }
  });

  // PUT /api/branch-stock/allocate — Admin only: set allocation for a branch+item
  router.put("/allocate", async (req: AgencyAuthRequest, res: Response) => {
    try {
      if (req.callerRole !== "agency") {
        res.status(403).json({
          error: "Only agency admins can allocate stock to branches. HR assigns items to guards from the branch pool.",
        });
        return;
      }

      const agencyId = req.agencyId!;
      const {
        branchId,
        itemId,
        itemName,
        category,
        unit,
        allocatedStock,
        thresholdStock,
      } = req.body as {
        branchId?: string;
        itemId?: string;
        itemName?: string;
        category?: string;
        unit?: string;
        allocatedStock?: number;
        thresholdStock?: number;
      };

      if (!branchId?.trim() || !itemId?.trim()) {
        res.status(400).json({ error: "branchId and itemId are required." });
        return;
      }

      const allocated = Number(allocatedStock) || 0;
      const threshold = Number(thresholdStock) || 0;
      if (allocated < 0 || threshold < 0) {
        res.status(400).json({ error: "Stock values cannot be negative." });
        return;
      }

      const db = getFirestore();

      // Load master item for totalStock cap
      const itemSnap = await db.collection(INVENTORY_COLLECTION).doc(itemId).get();
      if (!itemSnap.exists) {
        res.status(404).json({ error: "Inventory item not found." });
        return;
      }
      const itemData = itemSnap.data() as { agencyId?: string; totalStock?: number };
      if (itemData.agencyId !== agencyId) {
        res.status(403).json({ error: "Access denied." });
        return;
      }
      const totalStock = Number(itemData.totalStock ?? 0);

      const id = stockDocId(agencyId, branchId, itemId);
      const ref = db.collection(BRANCH_STOCK_COLLECTION).doc(id);
      const snap = await ref.get();
      const existingAssigned = snap.exists
        ? Number((snap.data() as { assignedStock?: number }).assignedStock ?? 0)
        : 0;
      const previousAllocated = snap.exists
        ? Number((snap.data() as { allocatedStock?: number }).allocatedStock ?? 0)
        : 0;

      if (allocated < existingAssigned) {
        res.status(400).json({
          error: `Allocated stock cannot be less than already assigned (${existingAssigned}).`,
        });
        return;
      }

      // Cap: sum of allocations across branches must not exceed totalStock
      const othersSnap = await db
        .collection(BRANCH_STOCK_COLLECTION)
        .where("agencyId", "==", agencyId)
        .where("itemId", "==", itemId)
        .get();
      const othersAllocated = othersSnap.docs
        .filter((d) => d.id !== id)
        .reduce(
          (sum, d) => sum + Number((d.data() as { allocatedStock?: number }).allocatedStock ?? 0),
          0
        );
      const newTotalAllocated = othersAllocated + allocated;
      if (newTotalAllocated > totalStock) {
        const remaining = Math.max(0, totalStock - othersAllocated);
        res.status(400).json({
          error: `Cannot allocate ${allocated}. Only ${remaining} left unallocated (agency stock: ${totalStock}, already on other branches: ${othersAllocated}).`,
        });
        return;
      }

      const available = allocated - existingAssigned;
      const status = computeStatus(available, threshold);
      const now = FieldValue.serverTimestamp();

      const data = {
        agencyId,
        branchId,
        itemId,
        itemName: itemName?.trim() ?? "",
        category: category?.trim() ?? "",
        unit: unit?.trim() ?? "pcs",
        allocatedStock: allocated,
        assignedStock: existingAssigned,
        thresholdStock: threshold,
        status,
        updatedAt: now,
        ...(snap.exists ? {} : { createdAt: now }),
      };

      await ref.set(data, { merge: true });
      res.json({
        id,
        ...data,
        assignedStock: existingAssigned,
        status,
        previousAllocated,
        remainingUnallocated: totalStock - newTotalAllocated,
      });
    } catch (err: unknown) {
      const e = err as { message?: string };
      res.status(500).json({ error: e.message ?? "Failed to allocate stock." });
    }
  });

  return router;
}
