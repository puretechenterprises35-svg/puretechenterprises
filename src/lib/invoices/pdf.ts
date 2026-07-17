import jsPDF from "jspdf";
import type { Invoice } from "./queries";
import { formatCurrency } from "./queries";

export function generateInvoicePDF(invoice: Invoice, options?: { open?: boolean }) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const marginX = 40;
  let y = 50;

  // Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(15, 23, 42);
  doc.text("PureTech Enterprises", marginX, y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100);
  y += 16;
  doc.text("ICT · Printing & Branding · Tax Compliance · Business Registration", marginX, y);
  y += 12;
  doc.text("Lusaka, Zambia  ·  info@puretech.co.zm  ·  +260 XXX XXX XXX", marginX, y);

  // Invoice title box
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(15, 23, 42);
  doc.text("INVOICE", pageW - marginX, 55, { align: "right" });
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(invoice.invoice_number, pageW - marginX, 72, { align: "right" });
  doc.setTextColor(100);
  doc.text(`Status: ${invoice.status}`, pageW - marginX, 86, { align: "right" });

  y = 130;
  // Bill to / meta
  doc.setDrawColor(226, 232, 240);
  doc.line(marginX, y - 10, pageW - marginX, y - 10);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text("BILL TO", marginX, y);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(51);
  y += 14;
  doc.text(invoice.client?.company_name || invoice.client?.contact_person || "Client", marginX, y);
  if (invoice.client?.contact_person && invoice.client?.company_name) {
    y += 12;
    doc.text(invoice.client.contact_person, marginX, y);
  }
  if (invoice.client?.email) {
    y += 12;
    doc.text(invoice.client.email, marginX, y);
  }

  // Meta right
  const metaX = pageW - marginX;
  let my = 130;
  const metaRow = (label: string, value: string) => {
    doc.setFont("helvetica", "bold");
    doc.setTextColor(100);
    doc.text(label, metaX - 130, my);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(15, 23, 42);
    doc.text(value, metaX, my, { align: "right" });
    my += 14;
  };
  metaRow("Issue date", invoice.issue_date ?? "—");
  metaRow("Due date", invoice.due_date ?? "—");
  if (invoice.project) metaRow("Project", invoice.project.project_name);
  metaRow("Currency", invoice.currency);

  y = Math.max(y, my) + 30;

  // Description / line item block
  doc.setFillColor(241, 245, 249);
  doc.rect(marginX, y, pageW - marginX * 2, 24, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text("DESCRIPTION", marginX + 10, y + 16);
  doc.text("AMOUNT", pageW - marginX - 10, y + 16, { align: "right" });
  y += 40;

  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text(invoice.title, marginX + 10, y);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80);
  y += 14;
  if (invoice.description) {
    const lines = doc.splitTextToSize(invoice.description, pageW - marginX * 2 - 100);
    doc.text(lines, marginX + 10, y);
    y += lines.length * 12;
  }
  doc.setTextColor(15, 23, 42);
  doc.text(formatCurrency(invoice.subtotal, invoice.currency), pageW - marginX - 10, y - 14, { align: "right" });

  y += 30;
  doc.setDrawColor(226, 232, 240);
  doc.line(marginX, y, pageW - marginX, y);
  y += 20;

  // Totals block
  const totalsX = pageW - marginX - 200;
  const totalRow = (label: string, value: string, bold = false) => {
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setTextColor(bold ? 15 : 100, bold ? 23 : 100, bold ? 42 : 100);
    doc.text(label, totalsX, y);
    doc.setTextColor(15, 23, 42);
    doc.text(value, pageW - marginX, y, { align: "right" });
    y += 16;
  };
  totalRow("Subtotal", formatCurrency(invoice.subtotal, invoice.currency));
  totalRow("Tax", formatCurrency(invoice.tax_amount, invoice.currency));
  totalRow("Discount", `- ${formatCurrency(invoice.discount_amount, invoice.currency)}`);
  y += 4;
  doc.setDrawColor(15, 23, 42);
  doc.line(totalsX, y - 4, pageW - marginX, y - 4);
  totalRow("TOTAL DUE", formatCurrency(invoice.total_amount, invoice.currency), true);

  // Payment instructions
  y += 30;
  doc.setFillColor(248, 250, 252);
  doc.rect(marginX, y, pageW - marginX * 2, 80, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text("PAYMENT INSTRUCTIONS", marginX + 12, y + 18);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(60);
  doc.text(
    [
      "Bank: Please contact PureTech Enterprises for current banking details.",
      "Reference: Include the invoice number as your payment reference.",
      "Proof of payment: Upload via the PureTech Client Portal after settlement.",
    ],
    marginX + 12,
    y + 34
  );

  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 40;
  doc.setDrawColor(226, 232, 240);
  doc.line(marginX, footerY - 12, pageW - marginX, footerY - 12);
  doc.setFontSize(8);
  doc.setTextColor(120);
  doc.text("Thank you for your business — PureTech Enterprises", marginX, footerY);
  doc.text(`Generated ${new Date().toLocaleDateString()}`, pageW - marginX, footerY, { align: "right" });

  const filename = `${invoice.invoice_number}.pdf`;
  if (options?.open) {
    doc.output("dataurlnewwindow");
  } else {
    doc.save(filename);
  }
}
