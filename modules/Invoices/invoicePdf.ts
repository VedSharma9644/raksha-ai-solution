import PDFDocument from "pdfkit";

import type { SiteInvoice } from "./invoiceTypes";

function money(n: number): string {
  return `Rs ${Number(n || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
}

/** Build a PDF buffer for a site invoice. */
export async function renderSiteInvoicePdf(
  invoice: SiteInvoice
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margin: 48,
      info: {
        Title: invoice.invoiceNumber,
        Author: invoice.billFrom.legalName || "Raskha",
      },
    });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const left = doc.page.margins.left;
    const right = doc.page.width - doc.page.margins.right;
    const width = right - left;

    doc
      .fontSize(18)
      .fillColor("#0b6e4f")
      .text(invoice.billFrom.legalName || "Security Agency", left, 48, {
        width: width * 0.62,
      });
    doc
      .fontSize(10)
      .fillColor("#334155")
      .text(invoice.billFrom.address || "", { width: width * 0.62 });
    if (invoice.billFrom.gstin) {
      doc.text(`GSTIN: ${invoice.billFrom.gstin}`);
    }
    if (invoice.billFrom.phone || invoice.billFrom.email) {
      doc.text(
        [invoice.billFrom.phone, invoice.billFrom.email]
          .filter(Boolean)
          .join(" · ")
      );
    }

    const metaTop = 48;
    doc
      .fontSize(20)
      .fillColor("#111827")
      .text("INVOICE", left + width * 0.55, metaTop, {
        width: width * 0.45,
        align: "right",
      });
    doc
      .fontSize(10)
      .fillColor("#334155")
      .text(invoice.invoiceNumber, {
        width: width * 0.45,
        align: "right",
      })
      .text(`Status: ${invoice.status}`, {
        width: width * 0.45,
        align: "right",
      })
      .text(`Issue: ${invoice.issueDate || "—"}`, {
        width: width * 0.45,
        align: "right",
      });
    if (invoice.dueDate) {
      doc.text(`Due: ${invoice.dueDate}`, {
        width: width * 0.45,
        align: "right",
      });
    }

    let y = Math.max(doc.y, 130) + 12;
    doc
      .moveTo(left, y)
      .lineTo(right, y)
      .strokeColor("#e5e7eb")
      .stroke();
    y += 16;

    doc
      .fontSize(9)
      .fillColor("#6b7280")
      .text("BILL TO", left, y);
    doc
      .fontSize(11)
      .fillColor("#111827")
      .text(invoice.billTo.name || invoice.clientName || "Client", left, y + 14);
    doc
      .fontSize(10)
      .fillColor("#334155")
      .text(
        [invoice.billTo.address, invoice.billTo.city].filter(Boolean).join(", "),
        left,
        y + 30,
        { width: width * 0.55 }
      );

    doc
      .fontSize(9)
      .fillColor("#6b7280")
      .text("PERIOD", left + width * 0.58, y);
    doc
      .fontSize(11)
      .fillColor("#111827")
      .text(invoice.period.label, left + width * 0.58, y + 14);
    doc
      .fontSize(10)
      .fillColor("#334155")
      .text(
        `${invoice.period.daysInMonth} calendar days · ${invoice.siteName}`,
        left + width * 0.58,
        y + 30,
        { width: width * 0.42 }
      );

    y = Math.max(doc.y, y + 70) + 8;

    // Table header
    doc.rect(left, y, width, 22).fill("#0b6e4f");
    doc.fillColor("#ffffff").fontSize(9);
    doc.text("Description", left + 8, y + 6, { width: width * 0.42 });
    doc.text("Qty", left + width * 0.48, y + 6, {
      width: width * 0.1,
      align: "right",
    });
    doc.text("Rate", left + width * 0.6, y + 6, {
      width: width * 0.16,
      align: "right",
    });
    doc.text("Amount", left + width * 0.78, y + 6, {
      width: width * 0.2,
      align: "right",
    });
    y += 28;

    doc.fillColor("#111827").fontSize(9);
    for (const line of invoice.lineItems) {
      const descHeight = doc.heightOfString(line.description, {
        width: width * 0.42,
      });
      const noteHeight = line.note
        ? doc.heightOfString(line.note, { width: width * 0.42 })
        : 0;
      const rowH = Math.max(22, descHeight + noteHeight + 10);
      if (y + rowH > doc.page.height - 120) {
        doc.addPage();
        y = doc.page.margins.top;
      }
      doc.text(line.description, left + 8, y, { width: width * 0.42 });
      if (line.note) {
        doc
          .fillColor("#6b7280")
          .fontSize(8)
          .text(line.note, left + 8, y + descHeight + 2, {
            width: width * 0.42,
          });
        doc.fillColor("#111827").fontSize(9);
      }
      doc.text(String(line.quantity), left + width * 0.48, y, {
        width: width * 0.1,
        align: "right",
      });
      doc.text(money(line.unitRate), left + width * 0.6, y, {
        width: width * 0.16,
        align: "right",
      });
      doc.text(money(line.amount), left + width * 0.78, y, {
        width: width * 0.2,
        align: "right",
      });
      y += rowH;
      doc
        .moveTo(left, y - 4)
        .lineTo(right, y - 4)
        .strokeColor("#f1f5f9")
        .stroke();
    }

    y += 12;
    const boxX = left + width * 0.55;
    const boxW = width * 0.45;
    doc.fontSize(10).fillColor("#334155");
    doc.text("Subtotal", boxX, y, { width: boxW * 0.5 });
    doc.text(money(invoice.subtotal), boxX + boxW * 0.4, y, {
      width: boxW * 0.6,
      align: "right",
    });
    y += 16;
    doc.text(`Tax (${invoice.taxPercent}%)`, boxX, y, { width: boxW * 0.5 });
    doc.text(money(invoice.taxAmount), boxX + boxW * 0.4, y, {
      width: boxW * 0.6,
      align: "right",
    });
    y += 18;
    doc.fontSize(12).fillColor("#0b6e4f").font("Helvetica-Bold");
    doc.text("Total", boxX, y, { width: boxW * 0.5 });
    doc.text(money(invoice.total), boxX + boxW * 0.4, y, {
      width: boxW * 0.6,
      align: "right",
    });
    doc.font("Helvetica");

    y += 36;
    if (invoice.notes) {
      doc
        .fontSize(9)
        .fillColor("#6b7280")
        .text("Notes", left, y);
      doc
        .fontSize(10)
        .fillColor("#334155")
        .text(invoice.notes, left, y + 14, { width: width * 0.55 });
      y = doc.y + 20;
    }

    const sigY = Math.max(y + 24, doc.page.height - 140);
    doc
      .fontSize(9)
      .fillColor("#6b7280")
      .text(invoice.signature.label || "Authorized Signatory", left, sigY);
    doc
      .moveTo(left, sigY + 48)
      .lineTo(left + 180, sigY + 48)
      .strokeColor("#94a3b8")
      .stroke();
    doc
      .fontSize(8)
      .fillColor("#94a3b8")
      .text(
        invoice.signature.mode === "external_key"
          ? "Digitally signed (external key)"
          : "External digital signature — reserved for hardware key",
        left,
        sigY + 54,
        { width: 220 }
      );

    if (invoice.billFrom.footerText) {
      doc
        .fontSize(8)
        .fillColor("#94a3b8")
        .text(invoice.billFrom.footerText, left, doc.page.height - 56, {
          width,
          align: "center",
        });
    }

    doc.end();
  });
}
