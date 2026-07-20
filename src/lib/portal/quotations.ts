import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type QuotationStatus =
  | "Draft"
  | "Sent"
  | "Accepted"
  | "Rejected"
  | "Expired"
  | "Revised";

export type QuotationItem = {
  id?: string;
  quotation_id?: string;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
  sort_order: number;
};

export type Quotation = {
  id: string;
  quote_number: string;
  enquiry_id: string | null;
  client_id: string;
  title: string;
  description: string | null;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total_amount: number;
  currency: string;
  status: QuotationStatus;
  valid_until: string | null;
  notes: string | null;
  terms: string | null;
  pdf_path: string | null;
  revision: number;
  accepted_at: string | null;
  accepted_by: string | null;
  rejected_at: string | null;
  rejection_reason: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type QuotationWithItems = Quotation & { items: QuotationItem[] };

export type QuotationClient = {
  id: string;
  company_name: string | null;
  contact_person: string | null;
  email: string | null;
  phone: string | null;
};

// ---------- Queries ----------

export const adminQuotationsQuery = () =>
  queryOptions({
    queryKey: ["admin", "quotations"],
    queryFn: async (): Promise<(Quotation & { client: QuotationClient | null })[]> => {
      const { data, error } = await supabase
        .from("quotations" as never)
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      const rows = (data ?? []) as unknown as Quotation[];
      const ids = Array.from(new Set(rows.map((r) => r.client_id)));
      let clients: Record<string, QuotationClient> = {};
      if (ids.length) {
        const { data: cs, error: cerr } = await supabase
          .from("clients")
          .select("id, company_name, contact_person, email, phone")
          .in("id", ids);
        if (cerr) throw cerr;
        clients = Object.fromEntries((cs ?? []).map((c) => [c.id, c as QuotationClient]));
      }
      return rows.map((r) => ({ ...r, client: clients[r.client_id] ?? null }));
    },
  });

export const quotationDetailQuery = (id: string) =>
  queryOptions({
    queryKey: ["quotations", "detail", id],
    queryFn: async (): Promise<QuotationWithItems & { client: QuotationClient | null }> => {
      const { data, error } = await supabase
        .from("quotations" as never)
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      if (!data) throw new Error("Quotation not found");
      const q = data as unknown as Quotation;

      const [{ data: items, error: iErr }, { data: client, error: cErr }] = await Promise.all([
        supabase
          .from("quotation_items" as never)
          .select("*")
          .eq("quotation_id", id)
          .order("sort_order", { ascending: true }),
        supabase
          .from("clients")
          .select("id, company_name, contact_person, email, phone")
          .eq("id", q.client_id)
          .maybeSingle(),
      ]);
      if (iErr) throw iErr;
      if (cErr) throw cErr;
      return {
        ...q,
        items: ((items ?? []) as unknown as QuotationItem[]),
        client: (client as QuotationClient | null) ?? null,
      };
    },
  });

export const clientQuotationsQuery = () =>
  queryOptions({
    queryKey: ["portal", "quotations"],
    queryFn: async (): Promise<Quotation[]> => {
      const { data, error } = await supabase
        .from("quotations" as never)
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as Quotation[];
    },
  });

export const quotationsByEnquiryQuery = (enquiryId: string) =>
  queryOptions({
    queryKey: ["quotations", "by-enquiry", enquiryId],
    queryFn: async (): Promise<Quotation[]> => {
      const { data, error } = await supabase
        .from("quotations" as never)
        .select("*")
        .eq("enquiry_id", enquiryId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as Quotation[];
    },
  });

// ---------- Mutations ----------

export type QuotationInput = {
  enquiry_id?: string | null;
  client_id: string;
  title: string;
  description?: string | null;
  tax_rate: number;
  currency: string;
  status: QuotationStatus;
  valid_until: string | null;
  notes: string | null;
  terms: string | null;
  items: QuotationItem[];
};

function totals(items: QuotationItem[], taxRate: number) {
  const subtotal = items.reduce(
    (s, i) => s + Number(i.quantity || 0) * Number(i.unit_price || 0),
    0
  );
  const tax_amount = +(subtotal * (Number(taxRate) || 0) / 100).toFixed(2);
  const total_amount = +(subtotal + tax_amount).toFixed(2);
  return { subtotal: +subtotal.toFixed(2), tax_amount, total_amount };
}

export async function createQuotation(
  input: QuotationInput,
  createdBy: string
): Promise<Quotation> {
  const items = input.items.map((it, idx) => ({
    ...it,
    sort_order: idx,
    total: +(Number(it.quantity || 0) * Number(it.unit_price || 0)).toFixed(2),
  }));
  const { subtotal, tax_amount, total_amount } = totals(items, input.tax_rate);

  const { data, error } = await supabase
    .from("quotations" as never)
    .insert({
      enquiry_id: input.enquiry_id ?? null,
      client_id: input.client_id,
      title: input.title,
      description: input.description ?? null,
      tax_rate: input.tax_rate,
      currency: input.currency,
      status: input.status,
      valid_until: input.valid_until,
      notes: input.notes,
      terms: input.terms,
      subtotal,
      tax_amount,
      total_amount,
      created_by: createdBy,
    } as never)
    .select("*")
    .single();
  if (error) throw error;
  const q = data as unknown as Quotation;

  if (items.length) {
    const { error: iErr } = await supabase
      .from("quotation_items" as never)
      .insert(items.map((it) => ({ ...it, quotation_id: q.id })) as never);
    if (iErr) throw iErr;
  }
  return q;
}

export async function updateQuotation(
  id: string,
  input: QuotationInput
): Promise<Quotation> {
  const items = input.items.map((it, idx) => ({
    ...it,
    sort_order: idx,
    total: +(Number(it.quantity || 0) * Number(it.unit_price || 0)).toFixed(2),
  }));
  const { subtotal, tax_amount, total_amount } = totals(items, input.tax_rate);

  const { data, error } = await supabase
    .from("quotations" as never)
    .update({
      title: input.title,
      description: input.description ?? null,
      tax_rate: input.tax_rate,
      currency: input.currency,
      status: input.status,
      valid_until: input.valid_until,
      notes: input.notes,
      terms: input.terms,
      subtotal,
      tax_amount,
      total_amount,
    } as never)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;

  // Replace items
  const { error: delErr } = await supabase
    .from("quotation_items" as never)
    .delete()
    .eq("quotation_id", id);
  if (delErr) throw delErr;
  if (items.length) {
    const { error: iErr } = await supabase
      .from("quotation_items" as never)
      .insert(items.map((it) => ({ ...it, quotation_id: id })) as never);
    if (iErr) throw iErr;
  }
  return data as unknown as Quotation;
}

export async function updateQuotationStatus(
  id: string,
  status: QuotationStatus
): Promise<void> {
  const { error } = await supabase
    .from("quotations" as never)
    .update({ status } as never)
    .eq("id", id);
  if (error) throw error;
}

export async function acceptQuotation(id: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from("quotations" as never)
    .update({
      status: "Accepted",
      accepted_at: new Date().toISOString(),
      accepted_by: userId,
    } as never)
    .eq("id", id);
  if (error) throw error;
}

export async function rejectQuotation(
  id: string,
  reason: string | null
): Promise<void> {
  const { error } = await supabase
    .from("quotations" as never)
    .update({
      status: "Rejected",
      rejected_at: new Date().toISOString(),
      rejection_reason: reason,
    } as never)
    .eq("id", id);
  if (error) throw error;
}

export async function deleteQuotation(id: string): Promise<void> {
  const { error } = await supabase.from("quotations" as never).delete().eq("id", id);
  if (error) throw error;
}

export function formatMoney(amount: number, currency = "KES") {
  return `${currency} ${Number(amount).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export const QUOTATION_STATUSES: QuotationStatus[] = [
  "Draft",
  "Sent",
  "Accepted",
  "Rejected",
  "Expired",
  "Revised",
];
