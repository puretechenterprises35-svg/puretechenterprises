import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type QuotationStatus =
  | "Draft"
  | "Sent"
  | "Viewed"
  | "Accepted"
  | "Rejected"
  | "Expired"
  | "Revised";


export type AcceptanceMethod =
  | "Portal"
  | "Email"
  | "WhatsApp"
  | "Phone Call"
  | "In Person";

export const ACCEPTANCE_METHODS: AcceptanceMethod[] = [
  "Portal",
  "Email",
  "WhatsApp",
  "Phone Call",
  "In Person",
];

export type QuotationItem = {
  id?: string;
  quotation_id?: string;
  description: string;
  quantity: number;
  unit_price: number;
  discount: number;
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
  discount_total: number;
  vat_enabled: boolean;
  tax_rate: number;
  tax_amount: number;
  total_amount: number;
  currency: string;
  status: QuotationStatus;
  valid_until: string | null;
  notes: string | null;
  terms: string | null;
  delivery_timeline: string | null;
  payment_terms: string | null;
  pdf_path: string | null;
  revision: number;
  sent_at: string | null;
  accepted_at: string | null;
  accepted_by: string | null;
  acceptance_method: AcceptanceMethod | null;
  acceptance_notes: string | null;
  rejected_at: string | null;
  rejection_reason: string | null;
  clarification_note: string | null;
  clarification_requested_at: string | null;
  created_by: string | null;
  updated_by: string | null;
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

export type QuotationEnquirySummary = {
  id: string;
  title: string;
  service_category: string;
  status: string;
  reference_number: string | null;
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
    queryFn: async (): Promise<
      QuotationWithItems & {
        client: QuotationClient | null;
        enquiry: QuotationEnquirySummary | null;
      }
    > => {
      const { data, error } = await supabase
        .from("quotations" as never)
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      if (!data) throw new Error("Quotation not found");
      const q = data as unknown as Quotation;

      const [{ data: items, error: iErr }, { data: client, error: cErr }, enquiryRes] =
        await Promise.all([
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
          q.enquiry_id
            ? supabase
                .from("enquiries")
                .select("id, title, service_category, status")
                .eq("id", q.enquiry_id)
                .maybeSingle()
            : Promise.resolve({ data: null, error: null }),
        ]);
      if (iErr) throw iErr;
      if (cErr) throw cErr;
      if (enquiryRes.error) throw enquiryRes.error;
      const enq = enquiryRes.data as
        | { id: string; title: string; service_category: string; status: string }
        | null;
      return {
        ...q,
        items: ((items ?? []) as unknown as QuotationItem[]),
        client: (client as QuotationClient | null) ?? null,
        enquiry: enq
          ? {
              id: enq.id,
              title: enq.title,
              service_category: enq.service_category,
              status: enq.status,
              reference_number: enq.id.slice(0, 8).toUpperCase(),
            }
          : null,
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
  enquiry_id: string;
  client_id: string;
  title: string;
  description?: string | null;
  tax_rate: number;
  vat_enabled: boolean;
  currency: string;
  status: QuotationStatus;
  valid_until: string | null;
  notes: string | null;
  terms: string | null;
  delivery_timeline: string | null;
  payment_terms: string | null;
  items: QuotationItem[];
};


export function computeTotals(
  items: QuotationItem[],
  taxRate: number,
  vatEnabled: boolean
) {
  let gross = 0;
  let discount_total = 0;
  for (const it of items) {
    const line = Number(it.quantity || 0) * Number(it.unit_price || 0);
    gross += line;
    discount_total += Number(it.discount || 0);
  }
  const subtotal = +(gross - discount_total).toFixed(2);
  const tax_amount = vatEnabled
    ? +(subtotal * (Number(taxRate) || 0) / 100).toFixed(2)
    : 0;
  const total_amount = +(subtotal + tax_amount).toFixed(2);
  return {
    subtotal,
    discount_total: +discount_total.toFixed(2),
    tax_amount,
    total_amount,
  };
}

function normalizeItems(items: QuotationItem[]): QuotationItem[] {
  return items.map((it, idx) => {
    const qty = Number(it.quantity || 0);
    const price = Number(it.unit_price || 0);
    const disc = Number(it.discount || 0);
    const line = +(qty * price - disc).toFixed(2);
    return {
      ...it,
      sort_order: idx,
      quantity: qty,
      unit_price: price,
      discount: disc,
      total: line,
    };
  });
}

export async function createQuotation(
  input: QuotationInput,
  createdBy: string
): Promise<Quotation> {
  const items = normalizeItems(input.items);
  const { subtotal, discount_total, tax_amount, total_amount } = computeTotals(
    items,
    input.tax_rate,
    input.vat_enabled
  );

  const { data, error } = await supabase
    .from("quotations" as never)
    .insert({
      enquiry_id: input.enquiry_id ?? null,
      client_id: input.client_id,
      title: input.title,
      description: input.description ?? null,
      tax_rate: input.tax_rate,
      vat_enabled: input.vat_enabled,
      currency: input.currency,
      status: input.status,
      valid_until: input.valid_until,
      notes: input.notes,
      terms: input.terms,
      delivery_timeline: input.delivery_timeline,
      payment_terms: input.payment_terms,
      subtotal,
      discount_total,
      tax_amount,
      total_amount,
      created_by: createdBy,
      updated_by: createdBy,
      sent_at: input.status === "Sent" ? new Date().toISOString() : null,
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
  input: QuotationInput,
  updatedBy?: string
): Promise<Quotation> {
  const items = normalizeItems(input.items);
  const { subtotal, discount_total, tax_amount, total_amount } = computeTotals(
    items,
    input.tax_rate,
    input.vat_enabled
  );

  // Read existing sent_at so we don't clobber it when transitioning to/from Sent
  const { data: existing } = await supabase
    .from("quotations" as never)
    .select("sent_at, status")
    .eq("id", id)
    .maybeSingle();
  const prev = existing as unknown as { sent_at: string | null; status: QuotationStatus } | null;
  const sent_at =
    input.status === "Sent" && !prev?.sent_at
      ? new Date().toISOString()
      : prev?.sent_at ?? null;

  const { data, error } = await supabase
    .from("quotations" as never)
    .update({
      title: input.title,
      description: input.description ?? null,
      tax_rate: input.tax_rate,
      vat_enabled: input.vat_enabled,
      currency: input.currency,
      status: input.status,
      valid_until: input.valid_until,
      notes: input.notes,
      terms: input.terms,
      delivery_timeline: input.delivery_timeline,
      payment_terms: input.payment_terms,
      subtotal,
      discount_total,
      tax_amount,
      total_amount,
      updated_by: updatedBy ?? null,
      sent_at,
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
  const patch: Record<string, unknown> = { status };
  if (status === "Sent") patch.sent_at = new Date().toISOString();
  const { error } = await supabase
    .from("quotations" as never)
    .update(patch as never)
    .eq("id", id);
  if (error) throw error;
}

export async function sendQuotation(id: string): Promise<void> {
  const { error } = await supabase
    .from("quotations" as never)
    .update({
      status: "Sent",
      sent_at: new Date().toISOString(),
    } as never)
    .eq("id", id);
  if (error) throw error;
}

export async function acceptQuotation(
  id: string,
  userId: string,
  method: AcceptanceMethod = "Portal",
  notes: string | null = null
): Promise<void> {
  const { error } = await supabase
    .from("quotations" as never)
    .update({
      status: "Accepted",
      accepted_at: new Date().toISOString(),
      accepted_by: userId,
      acceptance_method: method,
      acceptance_notes: notes,
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

export async function requestClarification(
  id: string,
  note: string
): Promise<void> {
  const { error } = await supabase
    .from("quotations" as never)
    .update({
      clarification_note: note,
      clarification_requested_at: new Date().toISOString(),
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

export async function markQuotationViewed(
  id: string,
  userId: string
): Promise<void> {
  const { error } = await supabase
    .from("quotations" as never)
    .update({
      status: "Viewed",
      viewed_at: new Date().toISOString(),
      viewed_by: userId,
    } as never)
    .eq("id", id);
  if (error) throw error;
}

export const QUOTATION_STATUSES: QuotationStatus[] = [
  "Draft",
  "Sent",
  "Viewed",
  "Accepted",
  "Rejected",
  "Expired",
  "Revised",
];
