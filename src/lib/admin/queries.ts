import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Project, ProjectUpdate } from "@/lib/portal/projects";

export type ApprovalStatus = "pending" | "approved" | "rejected" | "suspended";

export interface AdminClientRow {
  id: string;
  auth_user_id: string;
  company_name: string | null;
  contact_person: string | null;
  email: string | null;
  phone: string | null;
  status: string;
  created_at: string;
  approval_status: ApprovalStatus;
  full_name: string | null;
}

export interface AdminProject extends Project {
  archived_at: string | null;
  client?: { id: string; company_name: string | null; contact_person: string | null } | null;
}

// ---------- Queries ----------

export const adminStatsQuery = () =>
  queryOptions({
    queryKey: ["admin", "stats"],
    queryFn: async () => {
      const soon = new Date();
      soon.setDate(soon.getDate() + 7);
      const [clientsCount, activeClients, pendingClients, projectsAll, projectsActive, projectsCompleted, projectsDueSoon] =
        await Promise.all([
          supabase.from("clients").select("id", { count: "exact", head: true }),
          supabase.from("clients").select("id", { count: "exact", head: true }).eq("status", "Active"),
          supabase.from("profiles").select("id", { count: "exact", head: true }).eq("approval_status", "pending"),
          supabase.from("projects").select("id", { count: "exact", head: true }),
          supabase.from("projects").select("id", { count: "exact", head: true }).in("status", ["Pending", "In Progress", "Waiting for Client"]),
          supabase.from("projects").select("id", { count: "exact", head: true }).eq("status", "Completed"),
          supabase
            .from("projects")
            .select("id", { count: "exact", head: true })
            .lte("due_date", soon.toISOString())
            .not("status", "eq", "Completed"),
        ]);
      return {
        totalClients: clientsCount.count ?? 0,
        activeClients: activeClients.count ?? 0,
        pendingApprovals: pendingClients.count ?? 0,
        totalProjects: projectsAll.count ?? 0,
        activeProjects: projectsActive.count ?? 0,
        completedProjects: projectsCompleted.count ?? 0,
        projectsDueSoon: projectsDueSoon.count ?? 0,
        monthlyRevenue: 0,
        outstandingPayments: 0,
      };
    },
    staleTime: 30_000,
  });

export const adminClientsQuery = () =>
  queryOptions({
    queryKey: ["admin", "clients"],
    queryFn: async (): Promise<AdminClientRow[]> => {
      const { data: clients, error } = await supabase
        .from("clients")
        .select("id,auth_user_id,company_name,contact_person,email,phone,status,created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      const authIds = (clients ?? []).map((c) => c.auth_user_id);
      const { data: profs } = authIds.length
        ? await supabase
            .from("profiles")
            .select("id,approval_status,full_name")
            .in("id", authIds)
        : { data: [] as { id: string; approval_status: string; full_name: string | null }[] };
      const map = new Map((profs ?? []).map((p) => [p.id, p]));
      return (clients ?? []).map((c) => {
        const p = map.get(c.auth_user_id);
        return {
          ...c,
          approval_status: (p?.approval_status as ApprovalStatus) ?? "pending",
          full_name: p?.full_name ?? null,
        };
      });
    },
    staleTime: 30_000,
  });

export const adminProjectsQuery = () =>
  queryOptions({
    queryKey: ["admin", "projects"],
    queryFn: async (): Promise<AdminProject[]> => {
      const { data, error } = await supabase
        .from("projects")
        .select(
          "id,client_id,project_name,service_category,description,status,progress_percentage,priority,start_date,due_date,completion_date,created_at,updated_at,archived_at,client:clients(id,company_name,contact_person)"
        )
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as AdminProject[];
    },
    staleTime: 15_000,
  });

export const adminProjectQuery = (id: string) =>
  queryOptions({
    queryKey: ["admin", "project", id],
    queryFn: async (): Promise<AdminProject | null> => {
      const { data, error } = await supabase
        .from("projects")
        .select(
          "id,client_id,project_name,service_category,description,status,progress_percentage,priority,start_date,due_date,completion_date,created_at,updated_at,archived_at,client:clients(id,company_name,contact_person)"
        )
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return (data as unknown as AdminProject) ?? null;
    },
  });

export const adminAllUpdatesQuery = () =>
  queryOptions({
    queryKey: ["admin", "project-updates"],
    queryFn: async (): Promise<(ProjectUpdate & { project?: { project_name: string } | null })[]> => {
      const { data, error } = await supabase
        .from("project_updates")
        .select(
          "id,project_id,update_title,update_message,progress_percentage,visible_to_client,created_by,created_at,project:projects(project_name)"
        )
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return (data ?? []) as unknown as (ProjectUpdate & { project?: { project_name: string } | null })[];
    },
    staleTime: 15_000,
  });

// ---------- Mutations ----------

function invalidateAll(qc: ReturnType<typeof useQueryClient>) {
  void qc.invalidateQueries({ queryKey: ["admin"] });
  void qc.invalidateQueries({ queryKey: ["portal"] });
}

export function useUpdateClientApproval() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ authUserId, status }: { authUserId: string; status: ApprovalStatus }) => {
      const { error } = await supabase
        .from("profiles")
        .update({ approval_status: status })
        .eq("id", authUserId);
      if (error) throw error;
    },
    onSuccess: () => invalidateAll(qc),
  });
}

export function useUpdateClientStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ clientId, status }: { clientId: string; status: string }) => {
      const { error } = await supabase.from("clients").update({ status }).eq("id", clientId);
      if (error) throw error;
    },
    onSuccess: () => invalidateAll(qc),
  });
}

export interface ProjectInput {
  client_id: string;
  project_name: string;
  service_category: string | null;
  description: string | null;
  priority: string;
  status: string;
  progress_percentage: number;
  start_date: string | null;
  due_date: string | null;
}

export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: ProjectInput) => {
      const { data, error } = await supabase.from("projects").insert(input).select("id").single();
      if (error) throw error;
      return data.id as string;
    },
    onSuccess: () => invalidateAll(qc),
  });
}

export function useUpdateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<ProjectInput> & { completion_date?: string | null } }) => {
      const { error } = await supabase.from("projects").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => invalidateAll(qc),
  });
}

export function useArchiveProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, archive }: { id: string; archive: boolean }) => {
      const { error } = await supabase
        .from("projects")
        .update({ archived_at: archive ? new Date().toISOString() : null })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => invalidateAll(qc),
  });
}

export function useDeleteProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("projects").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => invalidateAll(qc),
  });
}

export interface UpdateInput {
  project_id: string;
  update_title: string;
  update_message: string | null;
  progress_percentage: number | null;
  visible_to_client: boolean;
}

export function useCreateProjectUpdate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: UpdateInput) => {
      const { data: sessionData } = await supabase.auth.getUser();
      const { error } = await supabase.from("project_updates").insert({
        ...input,
        created_by: sessionData.user?.id ?? null,
      });
      if (error) throw error;
      if (input.progress_percentage != null) {
        await supabase
          .from("projects")
          .update({ progress_percentage: input.progress_percentage })
          .eq("id", input.project_id);
      }
    },
    onSuccess: () => invalidateAll(qc),
  });
}

export function useDeleteProjectUpdate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("project_updates").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => invalidateAll(qc),
  });
}
