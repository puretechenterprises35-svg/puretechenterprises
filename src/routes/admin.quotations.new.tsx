import { createFileRoute, useNavigate, useSearch, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { QuotationEditor } from "@/components/admin/QuotationEditor";
import { LoadingScreen } from "@/components/portal/LoadingScreen";
import { supabase } from "@/integrations/supabase/client";
import { adminEnquiryDetailQuery } from "@/lib/portal/enquiries";
import { createQuotation } from "@/lib/portal/quotations";
import { usePortalSession } from "@/hooks/use-portal-session";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const searchSchema = z.object({
  enquiryId: z.string().optional(),
  clientId: z.string().optional(),
});

export const Route = createFileRoute("/admin/quotations/new")({
  ssr: false,
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "New Quotation | Puretech Admin" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: NewQuotationPage,
});

type ClientRow = { id: string; company_name: string | null; contact_person: string | null };

function NewQuotationPage() {
  const { enquiryId, clientId: clientIdFromUrl } = useSearch({ from: "/admin/quotations/new" });
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { session } = usePortalSession();

  const enquiry = useQuery({
    ...adminEnquiryDetailQuery(enquiryId ?? ""),
    enabled: !!enquiryId,
  });

  const clients = useQuery({
    queryKey: ["admin", "clients-lite"],
    queryFn: async (): Promise<ClientRow[]> => {
      const { data, error } = await supabase
        .from("clients")
        .select("id, company_name, contact_person")
        .order("company_name", { ascending: true });
      if (error) throw error;
      return (data ?? []) as ClientRow[];
    },
  });

  const [clientId, setClientId] = useState<string>(clientIdFromUrl ?? "");

  // Resolve client from enquiry (enquiry.client_id is auth user id → map to clients.id)
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

  const mutation = useMutation({
    mutationFn: async (values: Parameters<typeof createQuotation>[0]) => {
      if (!session?.user?.id) throw new Error("Not authenticated");
      return createQuotation(values, session.user.id);
    },
    onSuccess: (q) => {
      toast.success(`Quotation ${q.quote_number} created`);
      qc.invalidateQueries({ queryKey: ["admin", "quotations"] });
      qc.invalidateQueries({ queryKey: ["quotations"] });
      navigate({ to: "/admin/quotations/$quotationId", params: { quotationId: q.id } });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const loading = (enquiryId && enquiry.isLoading) || clients.isLoading;

  return (
    <AdminShell title="New Quotation">
      <div className="mb-4">
        <Button asChild variant="ghost" size="sm">
          <Link to="/admin/quotations">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Link>
        </Button>
      </div>

      {loading ? (
        <LoadingScreen />
      ) : (
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-6 shadow-soft">
            <Label>Client *</Label>
            <Select value={clientId} onValueChange={setClientId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a client" />
              </SelectTrigger>
              <SelectContent>
                {(clients.data ?? []).map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.company_name || c.contact_person || c.id.slice(0, 8)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {enquiry.data && (
              <p className="mt-2 text-xs text-muted-foreground">
                Linked to enquiry: <strong>{enquiry.data.title}</strong>
              </p>
            )}
          </div>

          <QuotationEditor
            initial={
              enquiry.data
                ? {
                    title: enquiry.data.title,
                    description: enquiry.data.description,
                    currency: "KES",
                    tax_rate: 16,
                    status: "Draft",
                    valid_until: null,
                    notes: null,
                    terms:
                      "50% deposit required to commence work. Balance on delivery.",
                    items: [
                      {
                        description: enquiry.data.service_category,
                        quantity: 1,
                        unit_price: enquiry.data.estimated_budget ?? 0,
                        total: enquiry.data.estimated_budget ?? 0,
                        sort_order: 0,
                      },
                    ],
                  }
                : undefined
            }
            submitting={mutation.isPending}
            submitLabel="Create Quotation"
            onSubmit={(v) => {
              if (!clientId) {
                toast.error("Please select a client");
                return;
              }
              mutation.mutate({
                ...v,
                client_id: clientId,
                enquiry_id: enquiryId ?? null,
              });
            }}
          />
        </div>
      )}
    </AdminShell>
  );
}
