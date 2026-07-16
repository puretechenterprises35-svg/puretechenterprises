import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type PortalRole = "admin" | "staff" | "client";

export type PortalProfile = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone_number: string | null;
  company_name: string | null;
  contact_person: string | null;
  business_address: string | null;
  approval_status: "pending" | "approved" | "rejected";
};

export function usePortalSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<PortalProfile | null>(null);
  const [roles, setRoles] = useState<PortalRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadUserData = async (s: Session | null) => {
      if (!s) {
        if (mounted) {
          setProfile(null);
          setRoles([]);
        }
        return;
      }
      const [{ data: p }, { data: r }] = await Promise.all([
        supabase
          .from("profiles")
          .select(
            "id,full_name,email,phone_number,company_name,contact_person,business_address,approval_status"
          )
          .eq("id", s.user.id)
          .maybeSingle(),
        supabase.from("user_roles").select("role").eq("user_id", s.user.id),
      ]);
      if (!mounted) return;
      setProfile((p as PortalProfile) ?? null);
      setRoles(((r ?? []) as { role: PortalRole }[]).map((x) => x.role));
    };

    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      void loadUserData(s);
    });

    supabase.auth.getSession().then(async ({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      await loadUserData(data.session);
      if (mounted) setLoading(false);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return { session, profile, roles, loading };
}
