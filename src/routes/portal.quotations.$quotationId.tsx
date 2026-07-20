import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { ArrowLeft, CheckCircle2, XCircle, FileDown, HelpCircle } from "lucide-react";
import { toast } from "sonner";
import { LoadingScreen } from "@/components/portal/LoadingScreen";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { QuotationStatusBadge } from "@/components/portal/QuotationStatusBadge";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import {
  acceptQuotation,
  formatMoney,
  markQuotationViewed,
  quotationDetailQuery,
  rejectQuotation,
  requestClarification,
} from "@/lib/portal/quotations";
import { generateQuotationPDF } from "@/lib/quotations/pdf";
import { usePortalSession } from "@/hooks/use-portal-session";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/portal/quotations/$quotationId")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Quotation | Puretech Client Portal" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ClientQuotationDetail,
});

function ClientQuotationDetail() {
  const { quotationId } = Route.useParams();
  const qc = useQueryClient();
  const { session, isAdmin } = usePortalSession();
  const { data, isLoading, error } = useQuery(quotationDetailQuery(quotationId));
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [clarifyOpen, setClarifyOpen] = useState(false);
  const [clarifyNote, setClarifyNote] = useState("");
  const [acceptOpen, setAcceptOpen] = useState(false);
  const viewedRef = useRef(false);

  useEffect(() => {
    if (viewedRef.current) return;
    if (!data || !session?.user?.id) return;
    if (isAdmin) return;
    if (data.status !== "Sent") return;
    viewedRef.current = true;
    markQuotationViewed(quotationId, session.user.id)
      .then(() => qc.invalidateQueries({ queryKey: ["quotations"] }))
      .catch(() => { viewedRef.current = false; });
  }, [data, session?.user?.id, quotationId, qc, isAdmin]);

  const accept = useMutation({
    mutationFn: () =>
      acceptQuotation(quotationId, session?.user?.id ?? "", "Portal", null),
    onSuccess: () => {
      toast.success("Quotation accepted — we'll get in touch shortly.");
      qc.invalidateQueries({ queryKey: ["quotations"] });
      setAcceptOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const reject = useMutation({
    mutationFn: () => rejectQuotation(quotationId, reason || null),
    onSuccess: () => {
      toast.success("Quotation rejected");
      qc.invalidateQueries({ queryKey: ["quotations"] });
      setRejectOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const clarify = useMutation({
    mutationFn: () => requestClarification(quotationId, clarifyNote.trim()),
    onSuccess: () => {
      toast.success("Clarification requested — we'll reach out shortly.");
      qc.invalidateQueries({ queryKey: ["quotations"] });
      setClarifyOpen(false);
      setClarifyNote("");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) return <LoadingScreen />;
  if (error || !data) {
    return (
      <div className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
        {(error as Error)?.message ?? "Not found"}
      </div>
    );
  }

  const canDecide = data.status === "Sent" || data.status === "Viewed";


  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Button asChild variant="ghost" size="sm">
        <Link to="/portal/quotations">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to quotations
        </Link>
      </Button>

      <div className="rounded-xl border border-border bg-card p-6 shadow-soft">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
          <div>
            <p className="font-mono text-xs text-muted-foreground">
              {data.quote_number}
            </p>
            <h1 className="mt-1 text-2xl font-bold">{data.title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Received {format(new Date(data.created_at), "PPP")}
            </p>
          </div>
          <QuotationStatusBadge status={data.status} />
        </div>

        {data.description && (
          <p className="mt-4 whitespace-pre-wrap text-sm text-muted-foreground">
            {data.description}
          </p>
        )}

        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="py-2">Description</th>
                <th className="py-2 text-right">Qty</th>
                <th className="py-2 text-right">Unit Price</th>
                <th className="py-2 text-right">Discount</th>
                <th className="py-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((it, i) => (
                <tr key={i} className="border-t border-border">
                  <td className="py-2">{it.description}</td>
                  <td className="py-2 text-right">{Number(it.quantity)}</td>
                  <td className="py-2 text-right">
                    {formatMoney(Number(it.unit_price), data.currency)}
                  </td>
                  <td className="py-2 text-right">
                    {formatMoney(Number(it.discount || 0), data.currency)}
                  </td>
                  <td className="py-2 text-right">
                    {formatMoney(Number(it.total), data.currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex justify-end">
          <div className="w-full max-w-xs space-y-1 text-sm">
            <Row
              label="Subtotal"
              value={formatMoney(data.subtotal + data.discount_total, data.currency)}
            />
            {data.discount_total > 0 && (
              <Row
                label="Discount"
                value={`- ${formatMoney(data.discount_total, data.currency)}`}
              />
            )}
            {data.vat_enabled && (
              <Row
                label={`VAT (${Number(data.tax_rate)}%)`}
                value={formatMoney(data.tax_amount, data.currency)}
              />
            )}
            <Row
              label="Grand Total"
              value={formatMoney(data.total_amount, data.currency)}
              bold
            />
          </div>
        </div>

        {(data.payment_terms || data.delivery_timeline) && (
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {data.payment_terms && (
              <div className="rounded-md border border-border bg-background p-3 text-sm">
                <p className="font-semibold">Payment Terms</p>
                <p className="mt-1 whitespace-pre-wrap text-muted-foreground">
                  {data.payment_terms}
                </p>
              </div>
            )}
            {data.delivery_timeline && (
              <div className="rounded-md border border-border bg-background p-3 text-sm">
                <p className="font-semibold">Delivery Timeline</p>
                <p className="mt-1 whitespace-pre-wrap text-muted-foreground">
                  {data.delivery_timeline}
                </p>
              </div>
            )}
          </div>
        )}

        {data.notes && (
          <div className="mt-3 rounded-md border border-border bg-background p-3 text-sm">
            <p className="font-semibold">Notes</p>
            <p className="mt-1 whitespace-pre-wrap text-muted-foreground">{data.notes}</p>
          </div>
        )}
        {data.terms && (
          <div className="mt-3 rounded-md border border-border bg-background p-3 text-xs text-muted-foreground">
            <p className="font-semibold text-foreground">Terms &amp; Conditions</p>
            <p className="mt-1 whitespace-pre-wrap">{data.terms}</p>
          </div>
        )}

        {data.valid_until && (
          <p className="mt-4 text-xs text-muted-foreground">
            Valid until {format(new Date(data.valid_until), "PPP")}
          </p>
        )}

        {data.clarification_note && (
          <div className="mt-4 rounded-md border border-amber-500/30 bg-amber-500/10 p-3 text-sm">
            <p className="font-semibold text-amber-700 dark:text-amber-400">
              Clarification requested
            </p>
            <p className="mt-1 whitespace-pre-wrap">{data.clarification_note}</p>
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => generateQuotationPDF(data)}
          >
            <FileDown className="mr-2 h-4 w-4" /> Download PDF
          </Button>
          {canDecide && (
            <>
              <Button onClick={() => setAcceptOpen(true)} disabled={accept.isPending}>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                {accept.isPending ? "Accepting…" : "Accept Quotation"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setClarifyOpen(true)}
                disabled={clarify.isPending}
              >
                <HelpCircle className="mr-2 h-4 w-4" /> Request Clarification
              </Button>
              <Button
                variant="outline"
                onClick={() => setRejectOpen(true)}
                disabled={reject.isPending}
              >
                <XCircle className="mr-2 h-4 w-4" /> Reject
              </Button>
            </>
          )}
        </div>

        {data.status === "Accepted" && (
          <p className="mt-6 rounded-md border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-700 dark:text-emerald-400">
            You accepted this quotation on{" "}
            {data.accepted_at ? format(new Date(data.accepted_at), "PPP") : "—"}.
          </p>
        )}
        {data.status === "Rejected" && (
          <p className="mt-6 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            You rejected this quotation
            {data.rejection_reason ? ` — "${data.rejection_reason}"` : ""}.
          </p>
        )}
      </div>

      <Dialog open={clarifyOpen} onOpenChange={setClarifyOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Clarification</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            What would you like us to clarify or revise on this quotation?
          </p>
          <Textarea
            rows={5}
            value={clarifyNote}
            onChange={(e) => setClarifyNote(e.target.value)}
            placeholder="Describe what needs clarification…"
          />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setClarifyOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => clarify.mutate()}
              disabled={!clarifyNote.trim() || clarify.isPending}
            >
              {clarify.isPending ? "Sending…" : "Send Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject this quotation?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Please let us know why so we can improve or send you a revised quote.
          </p>
          <Textarea
            rows={4}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Optional reason…"
          />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setRejectOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => reject.mutate()}>
              Reject Quotation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={acceptOpen}
        onOpenChange={setAcceptOpen}
        title="Accept this quotation?"
        description="Confirming will notify Puretech Enterprises that you accept the terms and total as quoted."
        confirmLabel={accept.isPending ? "Accepting…" : "Accept"}
        onConfirm={() => accept.mutate()}
      />
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div
      className={`flex justify-between ${
        bold ? "border-t border-border pt-1 font-semibold" : ""
      }`}
    >
      <span className="text-muted-foreground">{label}</span>
      <span>{value}</span>
    </div>
  );
}
