/**
 * Full invoices module for backends (firebase-admin + pdfkit).
 * Frontends must use ./client.ts via the Vite alias.
 */
export * from "./client";

export {
  getAgencyInvoiceSettings,
  saveAgencyInvoiceSettings,
} from "./invoiceSettings";

export {
  listSiteInvoices,
  getSiteInvoice,
  createSiteInvoiceDraft,
  updateSiteInvoice,
  deleteSiteInvoiceDraft,
} from "./invoiceService";

export { renderSiteInvoicePdf } from "./invoicePdf";
