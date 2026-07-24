import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type Division = Database["public"]["Tables"]["divisions"]["Row"];
export type DivisionStatus = "Active" | "Inactive";

export interface DivisionInput {
  division_name: string;
  description?: string | null;
  display_order: number;
  status: DivisionStatus;
}

export async function listDivisions(): Promise<Division[]> {
  const { data, error } = await supabase
    .from("divisions")
    .select("*")
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createDivision(input: DivisionInput): Promise<Division> {
  const { data: userData } = await supabase.auth.getUser();
  const uid = userData.user?.id ?? null;
  const { data, error } = await supabase
    .from("divisions")
    .insert({
      division_name: input.division_name.trim(),
      description: input.description?.trim() || null,
      display_order: input.display_order,
      status: input.status,
      created_by: uid,
      updated_by: uid,
    })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function updateDivision(
  id: string,
  input: DivisionInput,
): Promise<Division> {
  const { data: userData } = await supabase.auth.getUser();
  const uid = userData.user?.id ?? null;
  const { data, error } = await supabase
    .from("divisions")
    .update({
      division_name: input.division_name.trim(),
      description: input.description?.trim() || null,
      display_order: input.display_order,
      status: input.status,
      updated_by: uid,
    })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function archiveDivision(id: string): Promise<void> {
  const { data: userData } = await supabase.auth.getUser();
  const uid = userData.user?.id ?? null;
  const { error } = await supabase
    .from("divisions")
    .update({ status: "Inactive", updated_by: uid })
    .eq("id", id);
  if (error) throw error;
}

export async function countDivisions(): Promise<number> {
  const { count, error } = await supabase
    .from("divisions")
    .select("*", { count: "exact", head: true });
  if (error) throw error;
  return count ?? 0;
}
