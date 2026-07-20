import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle2, XCircle, Send, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { LoadingScreen } from "@/components/portal/LoadingScreen";
import { QuotationStatusBadge } from "@/components/portal/QuotationStatusBadge";
import { QuotationEditor } from "@/components/admin/QuotationEditor";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import {
  acceptQuotation,
  deleteQuotation,
  formatMoney,
  quotationDetailQuery,
  rejectQuotation,
  updateQuotation,
  updateQuotationStatus,
} from "@/lib/portal/quotations";
import { usePortalSession } from "@/hooks/use-portal-session";

export const Route = createFileRoute("/admin/quotations/$quotationId")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Quotation | Puretech Admin" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminQuotationDetailPage,
});

function AdminQuotationDetailPage() {
  const { quotationId } = Route.useParams();
  const qc = useQueryClient();
  const { session } = usePortalSession();
  const { data, isLoading, error } = useQuery(quotationDetailQuery(quotationId));
  const [confirmDelete, setConfirmDelete] = useState(false);

  const save = useMutation({
    mutationFn: (v: Parameters<typeof updateQuotation>[1]) => updateQuotation(quotationId, v),
    onSuccess: () => {
      toast.success("Quotation updated");
      qc.invalidateQueries({ queryKey: ["quotations"] });
      qc.invalidateQueries({ queryKey: ["admin", "quotations"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const changeStatus = useMutation({
    mutationFn: (status: "Sent") => updateQuotationStatus(quotationId, status),
    onSuccess: () => {
      toast.success("Quotation sent to client");
      qc.invalidateQueries({ queryKey: ["quotations"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const accept = useMutation({
    mutationFn: () => acceptQuotation(quotationId, session?.user?.id ?? ""),
    onSuccess: () => {
      toast.success("Quotation marked as Accepted");
      qc.invalidateQueries({ queryKey: ["quotations"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const reject = useMutation({
    mutationFn: (reason: string) => rejectQuotation(quotationId, reason),
    onSuccess: () => {
      toast.success("Quotation marked as Rejected");
      qc.invalidateQueries({ queryKey: ["quotations"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: () => deleteQuotation(quotationId),
    onSuccess: () => {
      toast.success("Quotation deleted");
      qc.invalidateQueries({ queryKey: ["quotations"] });
      window.history.back();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) return <LoadingScreen />;
  if (error || !data) {
    return (
      <AdminShell title="Quotation">
        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {(error as Error)?.message ?? "Not found"}
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell title={`Quotation ${data.quote_number}`}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <Button asChild variant="ghost" size="sm">
          <Link to="/admin/quotations">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Link>
        </Button>
        <div className="flex flex-wrap items-center gap-2">
          <QuotationStatusBadge status={data.status} />
          {data.status === "Draft" && (
            <Button size="sm" variant="outline" onClick={() => changeStatus.mutate("Sent")}>
              <Send className="mr-1 h-4 w-4" /> Send to Client
            </Button>
          )}
          {data.status === "Sent" && (
            <>
              <Button size="sm" variant="outline" onClick={() => accept.mutate()}>
                <CheckCircle2 className="mr-1 h-4 w-4" /> Mark Accepted
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const r = window.prompt("Reason for rejection (optional):");
                  reject.mutate(r ?? "");
                }}
              >
                <XCircle className="mr-1 h-4 w-4" /> Mark Rejected
              </Button>
            </>
          )}
          <Button size="sm" variant="ghost" onClick={() => setConfirmDelete(true)}>
            <Trash2 className="mr-1 h-4 w-4 text-destructive" /> Delete
          </Button>
        </div>
      </div>

      <div className="mb-4 grid gap-2 rounded-xl border border-border bg-card p-4 text-sm shadow-soft sm:grid-cols-3">
        <Info label="Client" value={data.client?.company_name || data.client?.contact_person || "—"} />
        <Info label="Total" value={formatMoney(data.total_amount, data.currency)} />
        <Info
          label="Valid until"
          value={data.valid_until ? format(new Date(data.valid_until), "PP") : "—"}
        />
        {data.accepted_at && (
          <Info
            label="Accepted"
            value={format(new Date(data.accepted_at), "PPp")}
          />
        )}
        {data.rejected_at && (
          <Info
            label="Rejected"
            value={`${format(new Date(data.rejected_at), "PPp")}${
              data.rejection_reason ? ` — ${data.rejection_reason}` : ""
            }`}
          />
        )}
        {data.enquiry_id && (
          <Info label="From enquiry" value="Linked" />
        )}
      </div>

      <QuotationEditor
        initial={{
          title: data.title,
          description: data.description,
          currency: data.currency,
          tax_rate: Number(data.tax_rate),
          status: data.status,
          valid_until: data.valid_until,
          notes: data.notes,
          terms: data.terms,
          items: data.items,
        }}
        submitting={save.isPending}
        submitLabel="Save Changes"
        onSubmit={(v) => save.mutate({ ...v, client_id: data.client_id, enquiry_id: data.enquiry_id })}
      />

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Delete this quotation?"
        description="This will permanently delete the quotation and all its line items."
        confirmLabel="Delete"
        destructive
        onConfirm={() => {
          setConfirmDelete(false);
          del.mutate();
        }}
      />
    </AdminShell>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="font-medium text-foreground">{value}</p>
    </div>
  );
}
