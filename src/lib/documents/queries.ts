import {
  queryOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { STORAGE_BUCKET, type DocumentCategory } from "./constants";

export interface DocumentRow {
  id: string;
  project_id: string;
  client_id: string;
  uploaded_by: string | null;
  title: string;
  description: string | null;
  category: string;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  version: number;
  visible_to_client: boolean;
  download_count: number;
  replaces_document_id: string | null;
  uploaded_at: string;
  updated_at: string;
  project?: { id: string; project_name: string } | null;
  client?: { id: string; company_name: string | null; contact_person: string | null } | null;
}

export interface DocumentActivity {
  id: string;
  document_id: string;
  action: string;
  performed_by: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

// ---------------- Queries ----------------

export const documentsQuery = () =>
  queryOptions({
    queryKey: ["documents", "list"],
    queryFn: async (): Promise<DocumentRow[]> => {
      const { data, error } = await supabase
        .from("documents")
        .select(
          "*, project:projects(id,project_name), client:clients(id,company_name,contact_person)"
        )
        .order("uploaded_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as DocumentRow[];
    },
    staleTime: 15_000,
  });

export const documentQuery = (id: string) =>
  queryOptions({
    queryKey: ["documents", "detail", id],
    queryFn: async (): Promise<DocumentRow | null> => {
      const { data, error } = await supabase
        .from("documents")
        .select(
          "*, project:projects(id,project_name), client:clients(id,company_name,contact_person)"
        )
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return (data as DocumentRow) ?? null;
    },
  });

export const documentActivityQuery = (documentId: string) =>
  queryOptions({
    queryKey: ["documents", "activity", documentId],
    queryFn: async (): Promise<DocumentActivity[]> => {
      const { data, error } = await supabase
        .from("document_activity")
        .select("*")
        .eq("document_id", documentId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as DocumentActivity[];
    },
  });

export const documentVersionsQuery = (documentId: string) =>
  queryOptions({
    queryKey: ["documents", "versions", documentId],
    queryFn: async (): Promise<DocumentRow[]> => {
      // Walk backwards through replaces_document_id chain.
      const chain: DocumentRow[] = [];
      let cursor: string | null = documentId;
      while (cursor) {
        const { data, error } = await supabase
          .from("documents")
          .select("*")
          .eq("id", cursor)
          .maybeSingle();
        if (error) throw error;
        if (!data) break;
        chain.push(data as DocumentRow);
        cursor = (data as DocumentRow).replaces_document_id;
      }
      return chain;
    },
  });

export const storageStatsQuery = () =>
  queryOptions({
    queryKey: ["documents", "storage-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("documents")
        .select("file_size,uploaded_at,download_count,title");
      if (error) throw error;
      const rows = (data ?? []) as {
        file_size: number;
        uploaded_at: string;
        download_count: number;
        title: string;
      }[];
      const totalBytes = rows.reduce((s, r) => s + (r.file_size ?? 0), 0);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const uploadedToday = rows.filter(
        (r) => new Date(r.uploaded_at) >= today
      ).length;
      const mostDownloaded = [...rows]
        .sort((a, b) => (b.download_count ?? 0) - (a.download_count ?? 0))
        .slice(0, 5);
      return {
        totalBytes,
        totalDocs: rows.length,
        uploadedToday,
        mostDownloaded,
      };
    },
    staleTime: 30_000,
  });

// ---------------- Storage helpers ----------------

export async function createSignedUrl(path: string, expiresIn = 300): Promise<string> {
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .createSignedUrl(path, expiresIn);
  if (error) throw error;
  return data.signedUrl;
}

async function logActivity(
  documentId: string,
  action: string,
  metadata?: Record<string, unknown>
) {
  const { data: userData } = await supabase.auth.getUser();
  await supabase.from("document_activity").insert({
    document_id: documentId,
    action,
    performed_by: userData.user?.id ?? null,
    metadata: metadata ?? null,
  });
}

export async function downloadDocument(doc: DocumentRow): Promise<void> {
  const url = await createSignedUrl(doc.file_path, 300);
  // Increment counter and log activity (best-effort).
  await Promise.all([
    supabase
      .from("documents")
      .update({ download_count: (doc.download_count ?? 0) + 1 })
      .eq("id", doc.id),
    logActivity(doc.id, "Downloaded", { file_name: doc.file_name }),
  ]);
  // Trigger browser download.
  const a = document.createElement("a");
  a.href = url;
  a.download = doc.file_name;
  a.rel = "noopener";
  a.target = "_blank";
  document.body.appendChild(a);
  a.click();
  a.remove();
}

// ---------------- Mutations ----------------

export interface UploadInput {
  file: File;
  projectId: string;
  clientId: string;
  title: string;
  description?: string;
  category: DocumentCategory | string;
  visibleToClient: boolean;
  replacesDocumentId?: string;
  previousVersion?: number;
}

async function uploadOne(input: UploadInput): Promise<DocumentRow> {
  const { data: userData } = await supabase.auth.getUser();
  const uid = userData.user?.id ?? null;
  const safeName = input.file.name.replace(/[^\w.\-]+/g, "_");
  const version = input.replacesDocumentId ? (input.previousVersion ?? 1) + 1 : 1;
  const filePath = `${input.projectId}/${crypto.randomUUID()}-v${version}-${safeName}`;

  const { error: upErr } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(filePath, input.file, {
      cacheControl: "3600",
      upsert: false,
      contentType: input.file.type || "application/octet-stream",
    });
  if (upErr) throw upErr;

  const { data: inserted, error: insErr } = await supabase
    .from("documents")
    .insert({
      project_id: input.projectId,
      client_id: input.clientId,
      uploaded_by: uid,
      title: input.title || input.file.name,
      description: input.description ?? null,
      category: input.category,
      file_name: input.file.name,
      file_path: filePath,
      file_size: input.file.size,
      file_type: input.file.type || "application/octet-stream",
      version,
      visible_to_client: input.visibleToClient,
      replaces_document_id: input.replacesDocumentId ?? null,
    })
    .select("*")
    .single();
  if (insErr) throw insErr;

  await logActivity(inserted.id, input.replacesDocumentId ? "Updated" : "Uploaded", {
    file_name: input.file.name,
    version,
  });

  return inserted as DocumentRow;
}

export function useUploadDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: uploadOne,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["documents"] });
    },
  });
}

export function useUpdateDocumentMeta() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      id: string;
      patch: Partial<Pick<DocumentRow, "title" | "description" | "category" | "visible_to_client" | "project_id" | "client_id">>;
      previous?: DocumentRow;
    }) => {
      const { data, error } = await supabase
        .from("documents")
        .update(input.patch)
        .eq("id", input.id)
        .select("*")
        .single();
      if (error) throw error;
      if (
        input.previous &&
        typeof input.patch.visible_to_client === "boolean" &&
        input.patch.visible_to_client !== input.previous.visible_to_client
      ) {
        await logActivity(input.id, "Visibility Changed", {
          from: input.previous.visible_to_client,
          to: input.patch.visible_to_client,
        });
      } else {
        await logActivity(input.id, "Updated", input.patch as Record<string, unknown>);
      }
      return data as DocumentRow;
    },
    onSuccess: (_data, vars) => {
      void qc.invalidateQueries({ queryKey: ["documents"] });
      void qc.invalidateQueries({ queryKey: ["documents", "detail", vars.id] });
    },
  });
}

export function useDeleteDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (doc: DocumentRow) => {
      await logActivity(doc.id, "Deleted", { file_name: doc.file_name });
      await supabase.storage.from(STORAGE_BUCKET).remove([doc.file_path]);
      const { error } = await supabase.from("documents").delete().eq("id", doc.id);
      if (error) throw error;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["documents"] });
    },
  });
}
