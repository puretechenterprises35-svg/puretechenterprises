import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Download, Upload, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  invoiceByIdQuery,
  paymentsByInvoiceQuery,
  formatCurrency,
} from "@/lib/invoices/queries";
import { InvoiceStatusBadge } from "@/components/invoices/InvoiceStatusBadge";
import { PaymentTable } from "@/components/invoices/PaymentTable";
import { PaymentUploader } from "@/components/invoices/PaymentUploader";
import { generateInvoicePDF } from "@/lib/invoices/pdf";

export const Route = createFileRoute("/portal/invoices/$invoiceId")({
  ssr: false,
  head: () => ({ meta: [{ title: "Invoice | Puretech Client Portal" }, { name: "robots", content: "noindex" }] }),
  component: PortalInvoiceDetail,
});

function PortalInvoiceDetail() {
  const { invoiceId } = Route.useParams();
  const navigate = useNavigate();
  const invQ = useQuery(invoiceByIdQuery(invoiceId));
  const payQ = useQuery(paymentsByInvoiceQuery(invoiceId));
  const [uploaderOpen, setUploaderOpen] = useState(false);

  if (invQ.isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }
  if (!invQ.data) {
    return (
      <div className="rounded-xl border border-dashed p-10 text-center">
        <p className="text-muted-foreground">Invoice not found.</p>
        <Button variant="link" onClick={() => navigate({ to: "/portal/payments" })}>Back to payments</Button>
      </div>
    );
  }
  const invoice = invQ.data;
  const canPay = invoice.status !== "Paid" && invoice.status !== "Cancelled" && invoice.status !== "Draft";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/portal/payments" })}>
            <ArrowLeft className="mr-1 h-4 w-4" /> Back
          </Button>
          <h1 className="mt-2 text-2xl font-bold">Invoice {invoice.invoice_number}</h1>
          <p className="text-sm text-muted-foreground">{invoice.title}</p>
        </div>
        <div className="flex items-center gap-2">
          <InvoiceStatusBadge status={invoice.status} />
          <Button variant="outline" size="sm" onClick={() => generateInvoicePDF(invoice)}>
            <Download className="mr-1 h-4 w-4" /> Download PDF
          </Button>
          {canPay && (
            <Button size="sm" onClick={() => setUploaderOpen(true)}>
              <Upload className="mr-1 h-4 w-4" /> Upload proof
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="md:col-span-2 space-y-4">
          <section className="rounded-xl border border-border bg-card p-5 shadow-soft">
            <h2 className="text-sm font-semibold uppercase text-muted-foreground">Description</h2>
            <p className="mt-2 whitespace-pre-wrap text-sm">{invoice.description || "—"}</p>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div><dt className="text-muted-foreground">Subtotal</dt><dd className="font-medium">{formatCurrency(invoice.subtotal, invoice.currency)}</dd></div>
              <div><dt className="text-muted-foreground">Tax</dt><dd className="font-medium">{formatCurrency(invoice.tax_amount, invoice.currency)}</dd></div>
              <div><dt className="text-muted-foreground">Discount</dt><dd className="font-medium">- {formatCurrency(invoice.discount_amount, invoice.currency)}</dd></div>
              <div><dt className="text-muted-foreground">Total due</dt><dd className="text-lg font-bold">{formatCurrency(invoice.total_amount, invoice.currency)}</dd></div>
            </dl>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-semibold">Payment history</h2>
            {payQ.isLoading ? (
              <div className="h-20 animate-pulse rounded-xl border border-border bg-card" />
            ) : (
              <PaymentTable payments={payQ.data ?? []} />
            )}
          </section>
        </div>

        <aside className="space-y-3">
          <div className="rounded-xl border border-border bg-card p-5 shadow-soft">
            <h3 className="mb-3 text-sm font-semibold uppercase text-muted-foreground">Invoice info</h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-muted-foreground">Issued</dt><dd>{invoice.issue_date ?? "—"}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Due</dt><dd>{invoice.due_date ?? "—"}</dd></div>
              {invoice.paid_date && <div className="flex justify-between"><dt className="text-muted-foreground">Paid</dt><dd>{invoice.paid_date}</dd></div>}
              <div className="flex justify-between"><dt className="text-muted-foreground">Currency</dt><dd>{invoice.currency}</dd></div>
            </dl>
          </div>
          {invoice.project && (
            <div className="rounded-xl border border-border bg-card p-5 shadow-soft">
              <h3 className="mb-2 text-sm font-semibold uppercase text-muted-foreground">Project</h3>
              <Link
                to="/portal/projects/$projectId"
                params={{ projectId: invoice.project.id }}
                className="flex items-center gap-2 text-sm font-medium text-primary hover:underline"
              >
                <FileText className="h-4 w-4" /> {invoice.project.project_name}
              </Link>
            </div>
          )}
        </aside>
      </div>

      <PaymentUploader invoice={invoice} open={uploaderOpen} onOpenChange={setUploaderOpen} />
    </div>
  );
}
