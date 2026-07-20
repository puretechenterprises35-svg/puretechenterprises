import jsPDF from "jspdf";
import { formatMoney, type QuotationWithItems, type QuotationClient } from "@/lib/portal/quotations";

export function generateQuotationPDF(
  q: QuotationWithItems & { client: QuotationClient | null },
  options?: { open?: boolean }
) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const marginX = 40;
  let y = 50;

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
  doc.text("puretechenterprises35@gmail.com", marginX, y);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(15, 23, 42);
  doc.text("QUOTATION", pageW - marginX, 55, { align: "right" });
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(q.quote_number, pageW - marginX, 72, { align: "right" });
  doc.setTextColor(100);
  doc.text(`Status: ${q.status}`, pageW - marginX, 86, { align: "right" });

  y = 130;
  doc.setDrawColor(226, 232, 240);
  doc.line(marginX, y - 10, pageW - marginX, y - 10);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text("PREPARED FOR", marginX, y);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(51);
  y += 14;
  doc.text(q.client?.company_name || q.client?.contact_person || "Client", marginX, y);
  if (q.client?.contact_person && q.client?.company_name) {
    y += 12;
    doc.text(q.client.contact_person, marginX, y);
  }
  if (q.client?.email) {
    y += 12;
    doc.text(q.client.email, marginX, y);
  }
  if (q.client?.phone) {
    y += 12;
    doc.text(q.client.phone, marginX, y);
  }

  const metaX = pageW - marginX;
  let my = 130;
  const metaRow = (label: string, value: string) => {
    doc.setFont("helvetica", "bold");
    doc.setTextColor(100);
    doc.text(label, metaX - 150, my);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(15, 23, 42);
    doc.text(value, metaX, my, { align: "right" });
    my += 14;
  };
  metaRow("Date", new Date(q.created_at).toLocaleDateString());
  metaRow("Valid until", q.valid_until ? new Date(q.valid_until).toLocaleDateString() : "—");
  metaRow("Currency", q.currency);

  y = Math.max(y, my) + 30;

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text(q.title, marginX, y);
  y += 8;
  if (q.description) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(80);
    y += 8;
    const lines = doc.splitTextToSize(q.description, pageW - marginX * 2);
    doc.text(lines, marginX, y);
    y += lines.length * 12;
  }

  y += 12;

  // Items header
  doc.setFillColor(241, 245, 249);
  doc.rect(marginX, y, pageW - marginX * 2, 22, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  const colDesc = marginX + 8;
  const colQty = pageW - marginX - 260;
  const colPrice = pageW - marginX - 180;
  const colDisc = pageW - marginX - 100;
  const colTotal = pageW - marginX - 8;
  doc.text("DESCRIPTION", colDesc, y + 15);
  doc.text("QTY", colQty, y + 15, { align: "right" });
  doc.text("UNIT PRICE", colPrice, y + 15, { align: "right" });
  doc.text("DISCOUNT", colDisc, y + 15, { align: "right" });
  doc.text("TOTAL", colTotal, y + 15, { align: "right" });
  y += 30;

  doc.setFont("helvetica", "normal");
  doc.setTextColor(40);
  for (const it of q.items) {
    const descLines = doc.splitTextToSize(it.description || "—", 220);
    doc.text(descLines, colDesc, y);
    doc.text(String(Number(it.quantity)), colQty, y, { align: "right" });
    doc.text(formatMoney(Number(it.unit_price), q.currency), colPrice, y, { align: "right" });
    doc.text(formatMoney(Number(it.discount || 0), q.currency), colDisc, y, { align: "right" });
    doc.text(formatMoney(Number(it.total), q.currency), colTotal, y, { align: "right" });
    y += Math.max(14, descLines.length * 12) + 2;
    if (y > 700) {
      doc.addPage();
      y = 60;
    }
  }

  y += 10;
  doc.setDrawColor(226, 232, 240);
  doc.line(marginX, y, pageW - marginX, y);
  y += 16;

  const totalsX = pageW - marginX - 200;
  const totalRow = (label: string, value: string, bold = false) => {
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setTextColor(bold ? 15 : 100, bold ? 23 : 100, bold ? 42 : 100);
    doc.text(label, totalsX, y);
    doc.setTextColor(15, 23, 42);
    doc.text(value, pageW - marginX, y, { align: "right" });
    y += 16;
  };
  totalRow("Subtotal", formatMoney(q.subtotal + q.discount_total, q.currency));
  if (q.discount_total > 0) totalRow("Discount", `- ${formatMoney(q.discount_total, q.currency)}`);
  if (q.vat_enabled) totalRow(`VAT (${Number(q.tax_rate)}%)`, formatMoney(q.tax_amount, q.currency));
  y += 4;
  doc.setDrawColor(15, 23, 42);
  doc.line(totalsX, y - 4, pageW - marginX, y - 4);
  totalRow("GRAND TOTAL", formatMoney(q.total_amount, q.currency), true);

  y += 20;
  const section = (label: string, body: string | null | undefined) => {
    if (!body) return;
    if (y > 720) {
      doc.addPage();
      y = 60;
    }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text(label.toUpperCase(), marginX, y);
    y += 12;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(60);
    const lines = doc.splitTextToSize(body, pageW - marginX * 2);
    doc.text(lines, marginX, y);
    y += lines.length * 12 + 10;
  };
  section("Payment Terms", q.payment_terms);
  section("Delivery Timeline", q.delivery_timeline);
  section("Terms & Conditions", q.terms);
  section("Notes", q.notes);

  const footerY = doc.internal.pageSize.getHeight() - 40;
  doc.setDrawColor(226, 232, 240);
  doc.line(marginX, footerY - 12, pageW - marginX, footerY - 12);
  doc.setFontSize(8);
  doc.setTextColor(120);
  doc.text("Thank you for the opportunity — PureTech Enterprises", marginX, footerY);
  doc.text(`Generated ${new Date().toLocaleDateString()}`, pageW - marginX, footerY, {
    align: "right",
  });

  const filename = `${q.quote_number}.pdf`;
  if (options?.open) {
    doc.output("dataurlnewwindow");
  } else {
    doc.save(filename);
  }
}
