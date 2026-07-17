import { queryOptions, useMutation, useQueryClient, type QueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type InvoiceStatus = "Draft" | "Issued" | "Partially Paid" | "Paid" | "Overdue" | "Cancelled";
export type VerificationStatus = "Pending" | "Verified" | "Rejected";

export const INVOICE_STATUSES: InvoiceStatus[] = [
  "Draft",
  "Issued",
  "Partially Paid",
  "Paid",
  "Overdue",
  "Cancelled",
];

export const PAYMENT_METHODS = [
  "Bank Transfer",
  "Mobile Money",
  "Cash",
  "Cheque",
  "Card",
  "Other",
] as const;

export interface Invoice {
  id: string;
  invoice_number: string;
  client_id: string;
  project_id: string | null;
  title: string;
  description: string | null;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  currency: string;
  status: InvoiceStatus;
  issue_date: string | null;
  due_date: string | null;
  paid_date: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  client?: { id: string; company_name: string | null; contact_person: string | null; email: string | null } | null;
  project?: { id: string; project_name: string } | null;
}

export interface Payment {
  id: string;
  invoice_id: string;
  client_id: string;
  amount: number;
  payment_method: string;
  payment_reference: string | null;
  payment_date: string;
  proof_document_id: string | null;
  verification_status: VerificationStatus;
  verified_by: string | null;
  notes: string | null;
  created_at: string;
  invoice?: { invoice_number: string; total_amount: number } | null;
  client?: { company_name: string | null; contact_person: string | null } | null;
}

const INVOICE_SELECT =
  "id,invoice_number,client_id,project_id,title,description,subtotal,tax_amount,discount_amount,total_amount,currency,status,issue_date,due_date,paid_date,created_by,created_at,updated_at,client:clients(id,company_name,contact_person,email),project:projects(id,project_name)";

const PAYMENT_SELECT =
  "id,invoice_id,client_id,amount,payment_method,payment_reference,payment_date,proof_document_id,verification_status,verified_by,notes,created_at,invoice:invoices(invoice_number,total_amount),client:clients(company_name,contact_person)";

// ============ Client-scoped ============

async function getMyClientId(): Promise<string | null> {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return null;
  const { data } = await supabase.from("clients").select("id").eq("auth_user_id", user.user.id).maybeSingle();
  return data?.id ?? null;
}

export const myInvoicesQuery = () =>
  queryOptions({
    queryKey: ["portal", "invoices"],
    queryFn: async (): Promise<Invoice[]> => {
      const { data, error } = await supabase
        .from("invoices")
        .select(INVOICE_SELECT)
        .neq("status", "Draft")
        .order("issue_date", { ascending: false, nullsFirst: false });
      if (error) throw error;
      return (data ?? []) as unknown as Invoice[];
    },
    staleTime: 15_000,
  });

export const myPaymentsQuery = () =>
  queryOptions({
    queryKey: ["portal", "payments"],
    queryFn: async (): Promise<Payment[]> => {
      const { data, error } = await supabase
        .from("payments")
        .select(PAYMENT_SELECT)
        .order("payment_date", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as Payment[];
    },
    staleTime: 15_000,
  });

export const invoiceByIdQuery = (id: string) =>
  queryOptions({
    queryKey: ["portal", "invoice", id],
    queryFn: async (): Promise<Invoice | null> => {
      const { data, error } = await supabase.from("invoices").select(INVOICE_SELECT).eq("id", id).maybeSingle();
      if (error) throw error;
      return (data as unknown as Invoice) ?? null;
    },
  });

export const paymentsByInvoiceQuery = (invoiceId: string) =>
  queryOptions({
    queryKey: ["portal", "invoice-payments", invoiceId],
    queryFn: async (): Promise<Payment[]> => {
      const { data, error } = await supabase
        .from("payments")
        .select(PAYMENT_SELECT)
        .eq("invoice_id", invoiceId)
        .order("payment_date", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as Payment[];
    },
  });

// ============ Admin ============

export const adminInvoicesQuery = () =>
  queryOptions({
    queryKey: ["admin", "invoices"],
    queryFn: async (): Promise<Invoice[]> => {
      const { data, error } = await supabase
        .from("invoices")
        .select(INVOICE_SELECT)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as Invoice[];
    },
    staleTime: 15_000,
  });

export const adminPaymentsQuery = () =>
  queryOptions({
    queryKey: ["admin", "payments"],
    queryFn: async (): Promise<Payment[]> => {
      const { data, error } = await supabase
        .from("payments")
        .select(PAYMENT_SELECT)
        .order("payment_date", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as Payment[];
    },
    staleTime: 15_000,
  });

export const invoiceStatsQuery = () =>
  queryOptions({
    queryKey: ["admin", "invoice-stats"],
    queryFn: async () => {
      const [all, outstanding, pending, overdue, recent] = await Promise.all([
        supabase.from("invoices").select("total_amount,status"),
        supabase.from("invoices").select("total_amount").in("status", ["Issued", "Partially Paid", "Overdue"]),
        supabase.from("payments").select("id", { count: "exact", head: true }).eq("verification_status", "Pending"),
        supabase.from("invoices").select("id", { count: "exact", head: true }).eq("status", "Overdue"),
        supabase
          .from("payments")
          .select("amount,payment_date,verification_status")
          .eq("verification_status", "Verified")
          .order("payment_date", { ascending: false })
          .limit(5),
      ]);
      const revenue = (all.data ?? [])
        .filter((r) => r.status === "Paid")
        .reduce((s, r) => s + Number(r.total_amount), 0);
      const outstandingAmt = (outstanding.data ?? []).reduce((s, r) => s + Number(r.total_amount), 0);
      return {
        revenue,
        outstandingAmount: outstandingAmt,
        pendingVerifications: pending.count ?? 0,
        overdueCount: overdue.count ?? 0,
        recentPayments: recent.data ?? [],
      };
    },
    staleTime: 30_000,
  });

export const clientInvoiceSummaryQuery = () =>
  queryOptions({
    queryKey: ["portal", "invoice-summary"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invoices")
        .select("total_amount,status,due_date")
        .neq("status", "Draft");
      if (error) throw error;
      const rows = data ?? [];
      const today = new Date().toISOString().slice(0, 10);
      const outstanding = rows
        .filter((r) => r.status === "Issued" || r.status === "Partially Paid" || r.status === "Overdue")
        .reduce((s, r) => s + Number(r.total_amount), 0);
      const paid = rows.filter((r) => r.status === "Paid").reduce((s, r) => s + Number(r.total_amount), 0);
      const overdue = rows
        .filter((r) => r.status === "Overdue" || (r.due_date && r.due_date < today && r.status !== "Paid" && r.status !== "Cancelled"))
        .reduce((s, r) => s + Number(r.total_amount), 0);
      return { outstanding, paid, overdue, count: rows.length };
    },
    staleTime: 15_000,
  });

// ============ Mutations ============

function invalidate(qc: QueryClient) {
  void qc.invalidateQueries({ queryKey: ["admin", "invoices"] });
  void qc.invalidateQueries({ queryKey: ["admin", "payments"] });
  void qc.invalidateQueries({ queryKey: ["admin", "invoice-stats"] });
  void qc.invalidateQueries({ queryKey: ["portal", "invoices"] });
  void qc.invalidateQueries({ queryKey: ["portal", "payments"] });
  void qc.invalidateQueries({ queryKey: ["portal", "invoice-summary"] });
  void qc.invalidateQueries({ queryKey: ["portal", "invoice"] });
  void qc.invalidateQueries({ queryKey: ["portal", "invoice-payments"] });
}

export interface InvoiceInput {
  client_id: string;
  project_id: string | null;
  title: string;
  description: string | null;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  currency: string;
  status: InvoiceStatus;
  issue_date: string | null;
  due_date: string | null;
}

export function useCreateInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: InvoiceInput) => {
      const { data: user } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("invoices")
        .insert({ ...input, created_by: user.user?.id ?? null })
        .select("id")
        .single();
      if (error) throw error;
      return data.id as string;
    },
    onSuccess: () => invalidate(qc),
  });
}

export function useUpdateInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<InvoiceInput> & { paid_date?: string | null } }) => {
      const { error } = await supabase.from("invoices").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => invalidate(qc),
  });
}

export function useSetInvoiceStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: InvoiceStatus }) => {
      const patch: Partial<Invoice> = { status };
      if (status === "Paid") patch.paid_date = new Date().toISOString().slice(0, 10);
      if (status === "Issued") patch.issue_date = new Date().toISOString().slice(0, 10);
      const { error } = await supabase.from("invoices").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => invalidate(qc),
  });
}

export function useDeleteInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("invoices").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => invalidate(qc),
  });
}

export interface PaymentInput {
  invoice_id: string;
  client_id: string;
  amount: number;
  payment_method: string;
  payment_reference: string | null;
  payment_date: string;
  proof_document_id: string | null;
  notes: string | null;
}

export function useCreatePayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: PaymentInput) => {
      const { data, error } = await supabase.from("payments").insert(input).select("id").single();
      if (error) throw error;
      return data.id as string;
    },
    onSuccess: () => invalidate(qc),
  });
}

export function useSetPaymentVerification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: VerificationStatus; notes?: string }) => {
      const { data: user } = await supabase.auth.getUser();
      const patch: Record<string, unknown> = {
        verification_status: status,
        verified_by: user.user?.id ?? null,
      };
      if (notes !== undefined) patch.notes = notes;
      const { error } = await supabase.from("payments").update(patch).eq("id", id);
      if (error) throw error;

      if (status === "Verified") {
        // Recompute invoice status based on verified payment totals
        const { data: pay } = await supabase.from("payments").select("invoice_id").eq("id", id).single();
        if (pay) {
          const [{ data: inv }, { data: verified }] = await Promise.all([
            supabase.from("invoices").select("total_amount").eq("id", pay.invoice_id).single(),
            supabase
              .from("payments")
              .select("amount")
              .eq("invoice_id", pay.invoice_id)
              .eq("verification_status", "Verified"),
          ]);
          if (inv) {
            const total = (verified ?? []).reduce((s, p) => s + Number(p.amount), 0);
            const newStatus: InvoiceStatus =
              total >= Number(inv.total_amount) ? "Paid" : total > 0 ? "Partially Paid" : "Issued";
            const patchInv: Record<string, unknown> = { status: newStatus };
            if (newStatus === "Paid") patchInv.paid_date = new Date().toISOString().slice(0, 10);
            await supabase.from("invoices").update(patchInv).eq("id", pay.invoice_id);
          }
        }
      }
    },
    onSuccess: () => invalidate(qc),
  });
}

export function useDeletePayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("payments").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => invalidate(qc),
  });
}

export function formatCurrency(amount: number, currency = "ZMW") {
  return `${currency} ${Number(amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
