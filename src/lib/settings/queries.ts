import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type SystemSettings = Database["public"]["Tables"]["system_settings"]["Row"];
export type SystemSettingsUpdate = Database["public"]["Tables"]["system_settings"]["Update"];

export const SETTINGS_ID = 1;
export const BRANDING_BUCKET = "branding";

export async function fetchSystemSettings(): Promise<SystemSettings | null> {
  const { data, error } = await supabase
    .from("system_settings")
    .select("*")
    .eq("id", SETTINGS_ID)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function updateSystemSettings(
  patch: SystemSettingsUpdate
): Promise<SystemSettings> {
  const { data, error } = await supabase
    .from("system_settings")
    .update(patch)
    .eq("id", SETTINGS_ID)
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function uploadBrandingAsset(
  kind: "logo" | "favicon" | "stamp",
  file: File
): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "png";
  const path = `${kind}-${Date.now()}.${ext}`;
  const { error } = await supabase.storage
    .from(BRANDING_BUCKET)
    .upload(path, file, { upsert: true, contentType: file.type });
  if (error) throw error;
  return path;
}

export async function getBrandingSignedUrl(path: string): Promise<string | null> {
  if (!path) return null;
  const { data, error } = await supabase.storage
    .from(BRANDING_BUCKET)
    .createSignedUrl(path, 60 * 60);
  if (error) return null;
  return data?.signedUrl ?? null;
}
