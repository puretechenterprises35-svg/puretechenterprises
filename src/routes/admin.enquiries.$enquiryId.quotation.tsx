import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { QuotationEditor, type EditorValue } from "@/components/admin/QuotationEditor";
import { LoadingScreen } from "@/components/portal/LoadingScreen";
import { supabase } from "@/integrations/supabase/client";
import { adminEnquiryDetailQuery } from "@/lib/portal/enquiries";
import {
  createQuotation,
  updateQuotation,
  quotationsByEnquiryQuery,
  quotationDetailQuery,
} from "@/lib/portal/quotations";
import { generateQuotationPDF } from "@/lib/quotations/pdf";
import { usePortalSession } from "@/hooks/use-portal-session";

export const Route = createFileRoute("/admin/enquiries/$enquiryId/quotation")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Quotation | Puretech Admin" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: EnquiryQuotationEditorPage,
});

function EnquiryQuotationEditorPage() {
  const { enquiryId } = Route.useParams();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { session } = usePortalSession();

  const enquiry = useQuery(adminEnquiryDetailQuery(enquiryId));
  const existing = useQuery(quotationsByEnquiryQuery(enquiryId));
  const first = existing.data?.[0] ?? null;
  const detail = useQuery({
    ...quotationDetailQuery(first?.id ?? ""),
    enabled: !!first?.id,
  });

  const [clientId, setClientId] = useState<string>("");

  useEffect(() => {
    (async () => {
      if (!enquiry.data || clientId) return;
      const { data } = await supabase
        .from("clients")
        .select("id")
        .eq("auth_user_id", enquiry.data.client_id)
        .maybeSingle();
      if (data?.id) setClientId(data.id);
    })();
  }, [enquiry.data, clientId]);

  const create = useMutation({
    mutationFn: async (values: EditorValue) => {
      if (!session?.user?.id) throw new Error("Not authenticated");
      if (!clientId) throw new Error("Client not resolved for this enquiry");
      return createQuotation(
        { ...values, client_id: clientId, enquiry_id: enquiryId },
        session.user.id
      );
    },
    onSuccess: (q) => {
      toast.success(`Quotation ${q.quote_number} saved`);
      qc.invalidateQueries({ queryKey: ["quotations"] });
      qc.invalidateQueries({ queryKey: ["admin", "quotations"] });
      qc.invalidateQueries({ queryKey: ["quotations", "by-enquiry", enquiryId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const update = useMutation({
    mutationFn: async (values: EditorValue) => {
      if (!first) throw new Error("No quotation to update");
      return updateQuotation(
        first.id,
        { ...values, client_id: first.client_id, enquiry_id: first.enquiry_id },
        session?.user?.id
      );
    },
    onSuccess: () => {
      toast.success("Quotation updated");
      qc.invalidateQueries({ queryKey: ["quotations"] });
      qc.invalidateQueries({ queryKey: ["admin", "quotations"] });
      qc.invalidateQueries({ queryKey: ["quotations", "by-enquiry", enquiryId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const loading = enquiry.isLoading || existing.isLoading || (!!first && detail.isLoading);

  const initial: Partial<EditorValue> | undefined = first && detail.data
    ? {
        title: detail.data.title,
        description: detail.data.description,
        currency: detail.data.currency,
        tax_rate: Number(detail.data.tax_rate),
        vat_enabled: detail.data.vat_enabled,
        status: detail.data.status,
        valid_until: detail.data.valid_until,
        notes: detail.data.notes,
        terms: detail.data.terms,
        delivery_timeline: detail.data.delivery_timeline,
        payment_terms: detail.data.payment_terms,
        items: detail.data.items,
      }
    : enquiry.data
    ? {
        title: enquiry.data.title,
        description: enquiry.data.description,
        currency: "KES",
        tax_rate: 16,
        vat_enabled: true,
        status: "Draft",
        valid_until: null,
        notes: null,
        terms: "50% deposit required to commence work. Balance on delivery.",
        delivery_timeline: null,
        payment_terms: null,
        items: [
          {
            description: enquiry.data.service_category,
            quantity: 1,
            unit_price: enquiry.data.estimated_budget ?? 0,
            discount: 0,
            total: enquiry.data.estimated_budget ?? 0,
            sort_order: 0,
          },
        ],
      }
    : undefined;

  const save = async (v: EditorValue) => {
    if (first) await update.mutateAsync(v);
    else await create.mutateAsync(v);
  };

  const previewPdf = (v: EditorValue) => {
    const stub = {
      ...(detail.data ?? {}),
      ...v,
      id: first?.id ?? "preview",
      quote_number: first?.quote_number ?? "PTQ-PREVIEW",
      subtotal: 0,
      discount_total: 0,
      tax_amount: 0,
      total_amount: 0,
      pdf_path: null,
      revision: 1,
      sent_at: null,
      accepted_at: null,
      accepted_by: null,
      acceptance_method: null,
      acceptance_notes: null,
      rejected_at: null,
      rejection_reason: null,
      clarification_note: null,
      clarification_requested_at: null,
      created_by: session?.user?.id ?? null,
      updated_by: session?.user?.id ?? null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      client_id: clientId,
      enquiry_id: enquiryId,
      client: {
        id: clientId,
        company_name: enquiry.data?.client?.company_name ?? null,
        contact_person: enquiry.data?.client?.contact_person ?? enquiry.data?.client?.full_name ?? null,
        email: enquiry.data?.client?.email ?? null,
        phone: enquiry.data?.client?.phone_number ?? null,
      },
    };
    // Compute totals for preview
    let gross = 0;
    let disc = 0;
    for (const it of v.items) {
      gross += Number(it.quantity || 0) * Number(it.unit_price || 0);
      disc += Number(it.discount || 0);
    }
    stub.subtotal = +(gross - disc).toFixed(2);
    stub.discount_total = +disc.toFixed(2);
    stub.tax_amount = v.vat_enabled ? +(stub.subtotal * v.tax_rate / 100).toFixed(2) : 0;
    stub.total_amount = +(stub.subtotal + stub.tax_amount).toFixed(2);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    generateQuotationPDF(stub as any, { open: true });
  };

  return (
    <AdminShell title={first ? `Edit Quotation ${first.quote_number}` : "New Quotation"}>
      <div className="mb-4">
        <Button asChild variant="ghost" size="sm">
          <Link
            to="/admin/enquiries/$enquiryId"
            params={{ enquiryId }}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to enquiry
          </Link>
        </Button>
      </div>

      {loading ? (
        <LoadingScreen />
      ) : !enquiry.data ? (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          Enquiry not found.
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-4 text-sm shadow-soft">
            <p>
              <span className="font-semibold">Enquiry:</span> {enquiry.data.title}
            </p>
            <p className="text-muted-foreground">
              Client: {enquiry.data.client?.company_name || enquiry.data.client?.contact_person || "—"} ·
              Service: {enquiry.data.service_category}
            </p>
          </div>

          <QuotationEditor
            initial={initial}
            submitting={create.isPending || update.isPending}
            onSubmit={save}
            onSaveDraft={save}
            onSend={async (v) => {
              await save(v);
              toast.success("Quotation sent to client");
            }}
            onPreview={previewPdf}
            onGeneratePdf={(v) => {
              // Generate download version — save first if we can
              previewPdf(v);
            }}
            onCancel={() =>
              navigate({
                to: "/admin/enquiries/$enquiryId",
                params: { enquiryId },
              })
            }
          />
        </div>
      )}
    </AdminShell>
  );
}
