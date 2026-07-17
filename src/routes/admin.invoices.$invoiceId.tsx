import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Download, Edit, Loader2, Send, XCircle, CheckCircle2, Trash2 } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { InvoiceStatusBadge } from "@/components/invoices/InvoiceStatusBadge";
import { PaymentTable } from "@/components/invoices/PaymentTable";
import { InvoiceForm } from "@/components/invoices/InvoiceForm";
import { VerificationBadge } from "@/components/invoices/VerificationBadge";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import {
  invoiceByIdQuery,
  paymentsByInvoiceQuery,
  formatCurrency,
  useSetInvoiceStatus,
  useDeleteInvoice,
  useSetPaymentVerification,
  useDeletePayment,
} from "@/lib/invoices/queries";
import { generateInvoicePDF } from "@/lib/invoices/pdf";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/invoices/$invoiceId")({
  component: AdminInvoiceDetail,
});

function AdminInvoiceDetail() {
  const { invoiceId } = Route.useParams();
  const navigate = useNavigate();
  const invQ = useQuery(invoiceByIdQuery(invoiceId));
  const payQ = useQuery(paymentsByInvoiceQuery(invoiceId));
  const setStatus = useSetInvoiceStatus();
  const del = useDeleteInvoice();
  const verify = useSetPaymentVerification();
  const delPay = useDeletePayment();
  const [editOpen, setEditOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (invQ.isLoading) {
    return (
      <AdminShell title="Invoice">
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </AdminShell>
    );
  }
  if (!invQ.data) {
    return (
      <AdminShell title="Invoice">
        <p className="text-muted-foreground">Not found.</p>
      </AdminShell>
    );
  }
  const invoice = invQ.data;

  return (
    <AdminShell title={`Invoice ${invoice.invoice_number}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/admin/invoices" })}>
            <ArrowLeft className="mr-1 h-4 w-4" /> All invoices
          </Button>
          <h2 className="mt-1 text-xl font-bold">{invoice.title}</h2>
          <p className="text-sm text-muted-foreground">
            {invoice.client?.company_name ?? "—"} · {invoice.project?.project_name ?? "No project"}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <InvoiceStatusBadge status={invoice.status} />
          <Button variant="outline" size="sm" onClick={() => generateInvoicePDF(invoice)}>
            <Download className="mr-1 h-4 w-4" /> PDF
          </Button>
          <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
            <Edit className="mr-1 h-4 w-4" /> Edit
          </Button>
          {invoice.status === "Draft" && (
            <Button
              size="sm"
              onClick={async () => {
                await setStatus.mutateAsync({ id: invoice.id, status: "Issued" });
                toast.success("Invoice issued");
              }}
            >
              <Send className="mr-1 h-4 w-4" /> Issue
            </Button>
          )}
          {invoice.status !== "Paid" && invoice.status !== "Cancelled" && (
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                await setStatus.mutateAsync({ id: invoice.id, status: "Paid" });
                toast.success("Marked as paid");
              }}
            >
              <CheckCircle2 className="mr-1 h-4 w-4" /> Mark paid
            </Button>
          )}
          {invoice.status !== "Cancelled" && (
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                await setStatus.mutateAsync({ id: invoice.id, status: "Cancelled" });
                toast.success("Cancelled");
              }}
            >
              <XCircle className="mr-1 h-4 w-4" /> Cancel
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(true)}>
            <Trash2 className="mr-1 h-4 w-4 text-destructive" />
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <section className="md:col-span-2 rounded-xl border border-border bg-card p-5 shadow-soft">
          <h3 className="text-sm font-semibold uppercase text-muted-foreground">Details</h3>
          <p className="mt-2 whitespace-pre-wrap text-sm">{invoice.description || "—"}</p>
          <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div><dt className="text-muted-foreground">Subtotal</dt><dd>{formatCurrency(invoice.subtotal, invoice.currency)}</dd></div>
            <div><dt className="text-muted-foreground">Tax</dt><dd>{formatCurrency(invoice.tax_amount, invoice.currency)}</dd></div>
            <div><dt className="text-muted-foreground">Discount</dt><dd>- {formatCurrency(invoice.discount_amount, invoice.currency)}</dd></div>
            <div><dt className="text-muted-foreground">Total</dt><dd className="text-lg font-bold">{formatCurrency(invoice.total_amount, invoice.currency)}</dd></div>
          </dl>
        </section>
        <aside className="rounded-xl border border-border bg-card p-5 shadow-soft">
          <h3 className="mb-3 text-sm font-semibold uppercase text-muted-foreground">Meta</h3>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-muted-foreground">Client</dt><dd>{invoice.client?.company_name ?? "—"}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Issued</dt><dd>{invoice.issue_date ?? "—"}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Due</dt><dd>{invoice.due_date ?? "—"}</dd></div>
            {invoice.paid_date && <div className="flex justify-between"><dt className="text-muted-foreground">Paid</dt><dd>{invoice.paid_date}</dd></div>}
          </dl>
        </aside>
      </div>

      <section className="space-y-2">
        <h3 className="text-sm font-semibold">Payments</h3>
        <PaymentTable
          payments={payQ.data ?? []}
          actions={(p) => (
            <div className="flex items-center justify-end gap-1">
              <VerificationBadge status={p.verification_status} />
              {p.verification_status !== "Verified" && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={async () => {
                    await verify.mutateAsync({ id: p.id, status: "Verified" });
                    toast.success("Verified");
                  }}
                >
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                </Button>
              )}
              {p.verification_status !== "Rejected" && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={async () => {
                    await verify.mutateAsync({ id: p.id, status: "Rejected" });
                    toast.success("Rejected");
                  }}
                >
                  <XCircle className="h-4 w-4 text-destructive" />
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                onClick={async () => {
                  await delPay.mutateAsync(p.id);
                  toast.success("Payment removed");
                }}
              >
                <Trash2 className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>
          )}
        />
      </section>

      <InvoiceForm open={editOpen} onOpenChange={setEditOpen} existing={invoice} />
      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Delete invoice?"
        description="This permanently removes the invoice and its payments."
        confirmLabel="Delete"
        destructive
        onConfirm={async () => {
          await del.mutateAsync(invoice.id);
          toast.success("Deleted");
          navigate({ to: "/admin/invoices" });
        }}
      />
    </AdminShell>
  );
}
