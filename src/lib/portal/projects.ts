import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type ProjectStatus =
  | "Pending"
  | "In Progress"
  | "Waiting for Client"
  | "Completed"
  | "Cancelled";

export type ProjectPriority = "Low" | "Medium" | "High" | "Urgent";

export interface Project {
  id: string;
  client_id: string;
  project_number: string | null;
  project_name: string;
  service_category: string | null;
  description: string | null;
  status: ProjectStatus;
  progress_percentage: number;
  priority: ProjectPriority;
  start_date: string | null;
  due_date: string | null;
  completion_date: string | null;
  enquiry_id: string | null;
  quotation_id: string | null;
  contract_value: number | null;
  currency: string | null;
  vat_amount: number | null;
  grand_total: number | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectUpdate {
  id: string;
  project_id: string;
  update_title: string;
  update_message: string | null;
  progress_percentage: number | null;
  visible_to_client: boolean;
  created_by: string | null;
  created_at: string;
}

export const projectsQueryOptions = () =>
  queryOptions({
    queryKey: ["portal", "projects"],
    queryFn: async (): Promise<Project[]> => {
      const { data, error } = await supabase
        .from("projects")
        .select(
          "id,client_id,project_number,project_name,service_category,description,status,progress_percentage,priority,start_date,due_date,completion_date,enquiry_id,quotation_id,contract_value,currency,vat_amount,grand_total,created_at,updated_at"
        )
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Project[];
    },
    staleTime: 30_000,
  });

export const projectQueryOptions = (id: string) =>
  queryOptions({
    queryKey: ["portal", "project", id],
    queryFn: async (): Promise<Project | null> => {
      const { data, error } = await supabase
        .from("projects")
        .select(
          "id,client_id,project_number,project_name,service_category,description,status,progress_percentage,priority,start_date,due_date,completion_date,enquiry_id,quotation_id,contract_value,currency,vat_amount,grand_total,created_at,updated_at"
        )
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return (data as Project) ?? null;
    },
  });

export const projectUpdatesQueryOptions = (projectId: string) =>
  queryOptions({
    queryKey: ["portal", "project-updates", projectId],
    queryFn: async (): Promise<ProjectUpdate[]> => {
      const { data, error } = await supabase
        .from("project_updates")
        .select(
          "id,project_id,update_title,update_message,progress_percentage,visible_to_client,created_by,created_at"
        )
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as ProjectUpdate[];
    },
  });

export const recentUpdatesQueryOptions = (limit = 5) =>
  queryOptions({
    queryKey: ["portal", "recent-updates", limit],
    queryFn: async (): Promise<ProjectUpdate[]> => {
      const { data, error } = await supabase
        .from("project_updates")
        .select(
          "id,project_id,update_title,update_message,progress_percentage,visible_to_client,created_by,created_at"
        )
        .order("created_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data ?? []) as ProjectUpdate[];
    },
  });
