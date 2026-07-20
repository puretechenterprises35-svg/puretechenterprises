import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Send,
  Trash2,
  FileDown,
  MessageSquareWarning,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LoadingScreen } from "@/components/portal/LoadingScreen";
import { QuotationStatusBadge } from "@/components/portal/QuotationStatusBadge";
import { QuotationEditor } from "@/components/admin/QuotationEditor";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import {
  ACCEPTANCE_METHODS,
  acceptQuotation,
  deleteQuotation,
  formatMoney,
  quotationDetailQuery,
  rejectQuotation,
  sendQuotation,
  updateQuotation,
  type AcceptanceMethod,
} from "@/lib/portal/quotations";
import { generateQuotationPDF } from "@/lib/quotations/pdf";
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
  const [acceptOpen, setAcceptOpen] = useState(false);
  const [acceptMethod, setAcceptMethod] = useState<AcceptanceMethod>("Portal");
  const [acceptNotes, setAcceptNotes] = useState("");

  const save = useMutation({
    mutationFn: (v: Parameters<typeof updateQuotation>[1]) =>
      updateQuotation(quotationId, v, session?.user?.id),
    onSuccess: () => {
      toast.success("Quotation updated");
      qc.invalidateQueries({ queryKey: ["quotations"] });
      qc.invalidateQueries({ queryKey: ["admin", "quotations"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const send = useMutation({
    mutationFn: () => sendQuotation(quotationId),
    onSuccess: () => {
      toast.success("Quotation sent to client");
      qc.invalidateQueries({ queryKey: ["quotations"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const accept = useMutation({
    mutationFn: () =>
      acceptQuotation(
        quotationId,
        session?.user?.id ?? "",
        acceptMethod,
        acceptNotes.trim() || null
      ),
    onSuccess: () => {
      toast.success("Quotation marked as Accepted");
      qc.invalidateQueries({ queryKey: ["quotations"] });
      setAcceptOpen(false);
      setAcceptNotes("");
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
          <Button
            size="sm"
            variant="outline"
            onClick={() => generateQuotationPDF(data)}
          >
            <FileDown className="mr-1 h-4 w-4" /> PDF
          </Button>
          {data.status === "Draft" && (
            <Button size="sm" variant="outline" onClick={() => send.mutate()}>
              <Send className="mr-1 h-4 w-4" /> Send to Client
            </Button>
          )}
          {(data.status === "Sent" || data.status === "Viewed") && (
            <>
              <Button size="sm" variant="outline" onClick={() => setAcceptOpen(true)}>
                <CheckCircle2 className="mr-1 h-4 w-4" /> Mark Accepted
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const r = window.prompt("Reason for rejection (optional):");
                  if (r !== null) reject.mutate(r);
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

      {data.enquiry && (
        <div className="mb-4 rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm shadow-soft">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                Linked Enquiry
              </p>
              <p className="mt-1 font-mono text-xs text-muted-foreground">
                #{data.enquiry.reference_number}
              </p>
              <p className="mt-1 font-medium">{data.enquiry.title}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Client: {data.client?.company_name || data.client?.contact_person || "—"} ·
                Service: {data.enquiry.service_category} · Status: {data.enquiry.status}
              </p>
            </div>
            <Button asChild size="sm" variant="outline">
              <Link
                to="/admin/enquiries/$enquiryId"
                params={{ enquiryId: data.enquiry.id }}
              >
                View Enquiry
              </Link>
            </Button>
          </div>
        </div>
      )}

      <div className="mb-4 grid gap-2 rounded-xl border border-border bg-card p-4 text-sm shadow-soft sm:grid-cols-3">
        <Info
          label="Client"
          value={data.client?.company_name || data.client?.contact_person || "—"}
        />
        <Info label="Total" value={formatMoney(data.total_amount, data.currency)} />
        <Info
          label="Valid until"
          value={data.valid_until ? format(new Date(data.valid_until), "PP") : "—"}
        />
        {data.sent_at && (
          <Info label="Sent" value={format(new Date(data.sent_at), "PPp")} />
        )}
        {data.accepted_at && (
          <Info
            label="Accepted"
            value={`${format(new Date(data.accepted_at), "PPp")}${
              data.acceptance_method ? ` · ${data.acceptance_method}` : ""
            }`}
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
      </div>


      {data.clarification_note && (
        <div className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm shadow-soft">
          <div className="flex items-center gap-2 font-semibold text-amber-700 dark:text-amber-400">
            <MessageSquareWarning className="h-4 w-4" /> Clarification requested by client
          </div>
          {data.clarification_requested_at && (
            <p className="mt-1 text-xs text-muted-foreground">
              {format(new Date(data.clarification_requested_at), "PPp")}
            </p>
          )}
          <p className="mt-2 whitespace-pre-wrap">{data.clarification_note}</p>
        </div>
      )}

      {data.acceptance_notes && (
        <div className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm shadow-soft">
          <p className="font-semibold text-emerald-700 dark:text-emerald-400">
            Acceptance notes
          </p>
          <p className="mt-1 whitespace-pre-wrap">{data.acceptance_notes}</p>
        </div>
      )}

      <QuotationEditor
        initial={{
          title: data.title,
          description: data.description,
          currency: data.currency,
          tax_rate: Number(data.tax_rate),
          vat_enabled: data.vat_enabled,
          status: data.status,
          valid_until: data.valid_until,
          notes: data.notes,
          terms: data.terms,
          delivery_timeline: data.delivery_timeline,
          payment_terms: data.payment_terms,
          items: data.items,
        }}
        submitting={save.isPending}
        submitLabel="Save Changes"
        onSubmit={(v) => {
          if (!data.enquiry_id) {
            toast.error("Quotation missing enquiry link");
            return;
          }
          save.mutate({
            ...v,
            client_id: data.client_id,
            enquiry_id: data.enquiry_id,
          });
        }}

      />

      <Dialog open={acceptOpen} onOpenChange={setAcceptOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark quotation as Accepted</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Acceptance method</Label>
              <Select
                value={acceptMethod}
                onValueChange={(v) => setAcceptMethod(v as AcceptanceMethod)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ACCEPTANCE_METHODS.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Notes (optional)</Label>
              <Textarea
                rows={3}
                value={acceptNotes}
                onChange={(e) => setAcceptNotes(e.target.value)}
                placeholder="e.g. Confirmed via WhatsApp message on 20 Jul"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setAcceptOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => accept.mutate()}
              disabled={accept.isPending}
            >
              {accept.isPending ? "Saving…" : "Confirm Acceptance"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
