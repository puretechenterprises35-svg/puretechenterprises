import { Link } from "@tanstack/react-router";
import { Download, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InvoiceStatusBadge } from "./InvoiceStatusBadge";
import { formatCurrency, type Invoice } from "@/lib/invoices/queries";
import { generateInvoicePDF } from "@/lib/invoices/pdf";

export function InvoiceTable({
  invoices,
  adminHref = false,
  showClient = false,
}: {
  invoices: Invoice[];
  adminHref?: boolean;
  showClient?: boolean;
}) {
  if (invoices.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card/50 p-10 text-center text-sm text-muted-foreground">
        No invoices to display.
      </div>
    );
  }
  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-soft">
      <table className="w-full text-sm">
        <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
          <tr>
            <th className="px-4 py-3 text-left">Invoice #</th>
            {showClient && <th className="px-4 py-3 text-left">Client</th>}
            <th className="px-4 py-3 text-left">Project</th>
            <th className="px-4 py-3 text-left">Issued</th>
            <th className="px-4 py-3 text-left">Due</th>
            <th className="px-4 py-3 text-right">Amount</th>
            <th className="px-4 py-3 text-left">Status</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {invoices.map((inv) => (
            <tr key={inv.id} className="hover:bg-muted/30">
              <td className="px-4 py-3 font-mono text-xs">{inv.invoice_number}</td>
              {showClient && (
                <td className="px-4 py-3">
                  {inv.client?.company_name || inv.client?.contact_person || "—"}
                </td>
              )}
              <td className="px-4 py-3">{inv.project?.project_name ?? "—"}</td>
              <td className="px-4 py-3">{inv.issue_date ?? "—"}</td>
              <td className="px-4 py-3">{inv.due_date ?? "—"}</td>
              <td className="px-4 py-3 text-right font-medium">{formatCurrency(inv.total_amount, inv.currency)}</td>
              <td className="px-4 py-3"><InvoiceStatusBadge status={inv.status} /></td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-1">
                  <Button size="sm" variant="ghost" onClick={() => generateInvoicePDF(inv)} title="Download">
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button asChild size="sm" variant="ghost" title="View">
                    <Link
                      to={adminHref ? "/admin/invoices/$invoiceId" : "/portal/invoices/$invoiceId"}
                      params={{ invoiceId: inv.id }}
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
