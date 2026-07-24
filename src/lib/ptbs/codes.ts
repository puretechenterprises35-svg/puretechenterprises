import { supabase } from "@/integrations/supabase/client";

/**
 * Central Code Generation Service.
 * Requests the next sequential business code from the shared
 * `generate_next_code` Postgres function. Handles atomic increments and
 * yearly resets on the server side.
 *
 * Usage:
 *   const code = await generateCode("DIVISION"); // "DIV-0001"
 *   const code = await generateCode("QUOTATION"); // "QUO-2026-0001"
 */
export type SequenceName =
  | "DIVISION"
  | "CATEGORY"
  | "SERVICE"
  | "PACKAGE"
  | "CLIENT"
  | "QUOTATION"
  | "PROJECT"
  | "INVOICE"
  | "PAYMENT"
  | "RECEIPT"
  | "SERVICE_REQUEST";

export async function generateCode(sequence: SequenceName): Promise<string> {
  const { data, error } = await supabase.rpc("generate_next_code", {
    _sequence_name: sequence,
  });
  if (error) throw error;
  if (!data) throw new Error(`No code returned for sequence ${sequence}`);
  return data as string;
}
