import { Router, type Response } from "express";
import { getFirestore, type Firestore, type QuerySnapshot } from "firebase-admin/firestore";
import { requireAgencyCaller, type AgencyAuthRequest } from "../middleware/requireAgencyCaller";

const INVENTORY_COLLECTION = "inventoryItems";
const BRANCH_STOCK_COLLECTION = "branchStock";
const ASSIGNMENTS_COLLECTION = "guardInventoryAssignments";

async function deleteMatchingDocs(
  db: Firestore,
  snap: QuerySnapshot,
  agencyId: string
): Promise<void> {
  const docs = snap.docs.filter((d) => {
    const data = d.data() as { agencyId?: string };
    return data.agencyId === agencyId;
  });
  for (let i = 0; i < docs.length; i += 400) {
    const batch = db.batch();
    for (const doc of docs.slice(i, i + 400)) {
      batch.delete(doc.ref);
    }
    await batch.commit();
  }
}

export function createInventoryRoutes(): Router {
  const router = Router();

  // DELETE /api/inventory/:id — agency admin only
  router.delete("/:id", requireAgencyCaller, async (req: AgencyAuthRequest, res: Response) => {
    try {
      if (req.callerRole !== "agency") {
        res.status(403).json({ error: "Only the agency admin can delete an inventory item." });
        return;
      }

      const db = getFirestore();
      const { id } = req.params as { id: string };
      const snap = await db.collection(INVENTORY_COLLECTION).doc(id).get();
      if (!snap.exists) {
        res.status(404).json({ error: "Inventory item not found." });
        return;
      }

      const data = snap.data() as { agencyId?: string };
      if (data.agencyId !== req.agencyId) {
        res.status(403).json({ error: "Access denied." });
        return;
      }

      const agencyId = req.agencyId!;
      const [assignments, branchStocks] = await Promise.all([
        db.collection(ASSIGNMENTS_COLLECTION).where("itemId", "==", id).get(),
        db.collection(BRANCH_STOCK_COLLECTION).where("itemId", "==", id).get(),
      ]);

      await deleteMatchingDocs(db, assignments, agencyId);
      await deleteMatchingDocs(db, branchStocks, agencyId);
      await db.collection(INVENTORY_COLLECTION).doc(id).delete();

      res.json({ success: true });
    } catch (error: unknown) {
      const err = error as { message?: string };
      res.status(500).json({ error: err.message ?? "Failed to delete inventory item." });
    }
  });

  return router;
}
