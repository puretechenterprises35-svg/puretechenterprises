import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const SERVICE_CATEGORIES = [
  "Website Development",
  "Software Development",
  "Mobile App Development",
  "CCTV Installation",
  "Networking",
  "ICT Consultancy",
  "Hardware Supply",
  "Maintenance & Support",
  "Graphic Design",
  "Other",
] as const;

export type EnquiryPriority = "Low" | "Medium" | "High";
export type EnquiryStatus =
  | "Pending Review"
  | "Needs More Information"
  | "Approved"
  | "Rejected"
  | "Converted to Project";

export type EnquiryAttachment = {
  path: string;
  name: string;
  size: number;
  type: string;
};

export type EnquiryRow = {
  id: string;
  client_id: string;
  title: string;
  service_category: string;
  description: string;
  preferred_completion_date: string | null;
  estimated_budget: number | null;
  priority: EnquiryPriority;
  status: EnquiryStatus;
  admin_notes: string | null;
  attachments: EnquiryAttachment[];
  created_at: string;
  updated_at: string;
};

const BUCKET = "project-documents";

export const enquiriesQuery = () =>
  queryOptions({
    queryKey: ["portal", "enquiries"],
    queryFn: async (): Promise<EnquiryRow[]> => {
      const { data, error } = await supabase
        .from("enquiries" as never)
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return ((data ?? []) as unknown as EnquiryRow[]).map((r) => ({
        ...r,
        attachments: Array.isArray(r.attachments) ? r.attachments : [],
      }));
    },
  });

export const enquiryDetailQuery = (id: string) =>
  queryOptions({
    queryKey: ["portal", "enquiries", id],
    queryFn: async (): Promise<EnquiryRow> => {
      const { data, error } = await supabase
        .from("enquiries" as never)
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      if (!data) throw new Error("Enquiry not found");
      const row = data as unknown as EnquiryRow;
      return { ...row, attachments: Array.isArray(row.attachments) ? row.attachments : [] };
    },
  });

export async function uploadEnquiryAttachments(
  userId: string,
  files: File[]
): Promise<EnquiryAttachment[]> {
  const results: EnquiryAttachment[] = [];
  for (const file of files) {
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `enquiries/${userId}/${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}-${safeName}`;
    const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });
    if (error) throw error;
    results.push({ path, name: file.name, size: file.size, type: file.type });
  }
  return results;
}

export async function getAttachmentUrl(path: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, 60 * 10);
  if (error) throw error;
  return data.signedUrl;
}

export type NewEnquiryInput = {
  client_id: string;
  title: string;
  service_category: string;
  description: string;
  preferred_completion_date: string | null;
  estimated_budget: number | null;
  priority: EnquiryPriority;
  attachments: EnquiryAttachment[];
};

export async function createEnquiry(input: NewEnquiryInput): Promise<EnquiryRow> {
  const { data, error } = await supabase
    .from("enquiries" as never)
    .insert(input as never)
    .select("*")
    .single();
  if (error) throw error;
  return data as unknown as EnquiryRow;

// ---------- Admin ----------

export type EnquiryClientProfile = {
  id: string;
  full_name: string | null;
  contact_person: string | null;
  company_name: string | null;
  email: string | null;
  phone_number: string | null;
  business_address: string | null;
};

export type AdminEnquiryRow = EnquiryRow & {
  client: EnquiryClientProfile | null;
};

async function attachProfiles(rows: EnquiryRow[]): Promise<AdminEnquiryRow[]> {
  const ids = Array.from(new Set(rows.map((r) => r.client_id)));
  if (ids.length === 0) return rows.map((r) => ({ ...r, client: null }));
  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id, full_name, contact_person, company_name, email, phone_number, business_address"
    )
    .in("id", ids);
  if (error) throw error;
  const map = new Map<string, EnquiryClientProfile>();
  for (const p of (data ?? []) as EnquiryClientProfile[]) map.set(p.id, p);
  return rows.map((r) => ({ ...r, client: map.get(r.client_id) ?? null }));
}

export const adminEnquiriesQuery = () =>
  queryOptions({
    queryKey: ["admin", "enquiries"],
    queryFn: async (): Promise<AdminEnquiryRow[]> => {
      const { data, error } = await supabase
        .from("enquiries" as never)
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      const rows = ((data ?? []) as unknown as EnquiryRow[]).map((r) => ({
        ...r,
        attachments: Array.isArray(r.attachments) ? r.attachments : [],
      }));
      return attachProfiles(rows);
    },
  });

export const adminEnquiryDetailQuery = (id: string) =>
  queryOptions({
    queryKey: ["admin", "enquiries", id],
    queryFn: async (): Promise<AdminEnquiryRow> => {
      const { data, error } = await supabase
        .from("enquiries" as never)
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      if (!data) throw new Error("Enquiry not found");
      const row = data as unknown as EnquiryRow;
      const normalised = {
        ...row,
        attachments: Array.isArray(row.attachments) ? row.attachments : [],
      };
      const [withProfile] = await attachProfiles([normalised]);
      return withProfile;
    },
  });

export async function updateEnquiryAdmin(
  id: string,
  patch: { status?: EnquiryStatus; admin_notes?: string | null }
): Promise<EnquiryRow> {
  const { data, error } = await supabase
    .from("enquiries" as never)
    .update(patch as never)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data as unknown as EnquiryRow;
}

