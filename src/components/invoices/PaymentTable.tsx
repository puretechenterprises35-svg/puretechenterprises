import { VerificationBadge } from "./VerificationBadge";
import { formatCurrency, type Payment } from "@/lib/invoices/queries";

export function PaymentTable({
  payments,
  showClient = false,
  actions,
}: {
  payments: Payment[];
  showClient?: boolean;
  actions?: (p: Payment) => React.ReactNode;
}) {
  if (payments.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card/50 p-8 text-center text-sm text-muted-foreground">
        No payments recorded yet.
      </div>
    );
  }
  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-soft">
      <table className="w-full text-sm">
        <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
          <tr>
            <th className="px-4 py-3 text-left">Date</th>
            <th className="px-4 py-3 text-left">Invoice</th>
            {showClient && <th className="px-4 py-3 text-left">Client</th>}
            <th className="px-4 py-3 text-left">Method</th>
            <th className="px-4 py-3 text-left">Reference</th>
            <th className="px-4 py-3 text-right">Amount</th>
            <th className="px-4 py-3 text-left">Status</th>
            {actions && <th className="px-4 py-3 text-right">Actions</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {payments.map((p) => (
            <tr key={p.id} className="hover:bg-muted/30">
              <td className="px-4 py-3">{p.payment_date}</td>
              <td className="px-4 py-3 font-mono text-xs">{p.invoice?.invoice_number ?? "—"}</td>
              {showClient && <td className="px-4 py-3">{p.client?.company_name || p.client?.contact_person || "—"}</td>}
              <td className="px-4 py-3">{p.payment_method}</td>
              <td className="px-4 py-3 text-muted-foreground">{p.payment_reference || "—"}</td>
              <td className="px-4 py-3 text-right font-medium">{formatCurrency(p.amount)}</td>
              <td className="px-4 py-3"><VerificationBadge status={p.verification_status} /></td>
              {actions && <td className="px-4 py-3 text-right">{actions(p)}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
