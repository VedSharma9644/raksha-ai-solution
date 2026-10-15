import { Router, type Response } from "express";
import {
  createSiteInvoiceDraft,
  deleteSiteInvoiceDraft,
  getAgencyInvoiceSettings,
  getSiteInvoice,
  listSiteInvoices,
  renderSiteInvoicePdf,
  saveAgencyInvoiceSettings,
  updateSiteInvoice,
  type InvoiceStatus,
} from "@raskha/invoices";
import {
  requireAgencyCaller,
  type AgencyAuthRequest,
} from "../middleware/requireAgencyCaller.js";

function statusCodeOf(error: unknown): number {
  const err = error as { statusCode?: number };
  return typeof err.statusCode === "number" ? err.statusCode : 500;
}

function messageOf(error: unknown, fallback: string): string {
  const err = error as { message?: string };
  return err.message ?? fallback;
}

function requireAdmin(req: AgencyAuthRequest, res: Response): boolean {
  if (req.callerRole !== "agency") {
    res.status(403).json({
      error: "Only agency admins can manage invoices.",
    });
    return false;
  }
  return true;
}

export function createInvoiceRoutes(): Router {
  const router = Router();
  router.use(requireAgencyCaller);

  router.get("/settings", async (req: AgencyAuthRequest, res: Response) => {
    try {
      if (!requireAdmin(req, res)) return;
      const settings = await getAgencyInvoiceSettings(req.agencyId!);
      res.json({ settings });
    } catch (error: unknown) {
      res.status(statusCodeOf(error)).json({
        error: messageOf(error, "Failed to load invoice settings."),
      });
    }
  });

  router.put("/settings", async (req: AgencyAuthRequest, res: Response) => {
    try {
      if (!requireAdmin(req, res)) return;
      const settings = await saveAgencyInvoiceSettings(
        req.agencyId!,
        req.body
      );
      res.json({ settings });
    } catch (error: unknown) {
      res.status(statusCodeOf(error)).json({
        error: messageOf(error, "Failed to save invoice settings."),
      });
    }
  });

  router.get("/", async (req: AgencyAuthRequest, res: Response) => {
    try {
      if (!requireAdmin(req, res)) return;
      const year =
        req.query.year != null ? Number(req.query.year) : undefined;
      const month =
        req.query.month != null ? Number(req.query.month) : undefined;
      const siteId =
        typeof req.query.siteId === "string" ? req.query.siteId : undefined;
      const invoices = await listSiteInvoices({
        agencyId: req.agencyId!,
        year: Number.isInteger(year) ? year : undefined,
        month: Number.isInteger(month) ? month : undefined,
        siteId,
      });
      res.json({ invoices });
    } catch (error: unknown) {
      res.status(statusCodeOf(error)).json({
        error: messageOf(error, "Failed to list invoices."),
      });
    }
  });

  router.post("/draft", async (req: AgencyAuthRequest, res: Response) => {
    try {
      if (!requireAdmin(req, res)) return;
      const body = (req.body ?? {}) as {
        siteId?: string;
        year?: number;
        month?: number;
      };
      const invoice = await createSiteInvoiceDraft({
        agencyId: req.agencyId!,
        siteId: String(body.siteId ?? ""),
        year: Number(body.year),
        month: Number(body.month),
        createdByUid: req.callerUid || req.agencyId || "",
      });
      res.status(201).json({ invoice });
    } catch (error: unknown) {
      console.error("[invoices] draft failed", error);
      res.status(statusCodeOf(error)).json({
        error: messageOf(error, "Failed to create invoice draft."),
      });
    }
  });

  router.get("/:invoiceId", async (req: AgencyAuthRequest, res: Response) => {
    try {
      if (!requireAdmin(req, res)) return;
      const invoice = await getSiteInvoice({
        agencyId: req.agencyId!,
        invoiceId: String(req.params.invoiceId ?? ""),
      });
      res.json({ invoice });
    } catch (error: unknown) {
      res.status(statusCodeOf(error)).json({
        error: messageOf(error, "Failed to load invoice."),
      });
    }
  });

  router.patch(
    "/:invoiceId",
    async (req: AgencyAuthRequest, res: Response) => {
      try {
        if (!requireAdmin(req, res)) return;
        const body = (req.body ?? {}) as {
          status?: InvoiceStatus;
          issueDate?: string;
          dueDate?: string;
          billFrom?: Record<string, string>;
          billTo?: Record<string, string>;
          lineItems?: unknown[];
          taxPercent?: number;
          notes?: string;
          signature?: Record<string, unknown>;
        };
        const invoice = await updateSiteInvoice({
          agencyId: req.agencyId!,
          invoiceId: String(req.params.invoiceId ?? ""),
          patch: body as Parameters<typeof updateSiteInvoice>[0]["patch"],
        });
        res.json({ invoice });
      } catch (error: unknown) {
        res.status(statusCodeOf(error)).json({
          error: messageOf(error, "Failed to update invoice."),
        });
      }
    }
  );

  router.delete(
    "/:invoiceId",
    async (req: AgencyAuthRequest, res: Response) => {
      try {
        if (!requireAdmin(req, res)) return;
        await deleteSiteInvoiceDraft({
          agencyId: req.agencyId!,
          invoiceId: String(req.params.invoiceId ?? ""),
        });
        res.status(204).send();
      } catch (error: unknown) {
        res.status(statusCodeOf(error)).json({
          error: messageOf(error, "Failed to delete invoice."),
        });
      }
    }
  );

  router.get(
    "/:invoiceId/pdf",
    async (req: AgencyAuthRequest, res: Response) => {
      try {
        if (!requireAdmin(req, res)) return;
        const invoice = await getSiteInvoice({
          agencyId: req.agencyId!,
          invoiceId: String(req.params.invoiceId ?? ""),
        });
        const pdf = await renderSiteInvoicePdf(invoice);
        const filename = `${invoice.invoiceNumber}.pdf`.replace(
          /[^\w.\-]+/g,
          "_"
        );
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="${filename}"`
        );
        res.send(pdf);
      } catch (error: unknown) {
        console.error("[invoices] pdf failed", error);
        res.status(statusCodeOf(error)).json({
          error: messageOf(error, "Failed to generate invoice PDF."),
        });
      }
    }
  );

  return router;
}
