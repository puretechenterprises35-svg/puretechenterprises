import { useEffect, useRef, useState } from "react";
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
  const [rolesLoaded, setRolesLoaded] = useState(false);
  const reqIdRef = useRef(0);

  useEffect(() => {
    let mounted = true;

    const loadUserData = async (s: Session | null) => {
      const reqId = ++reqIdRef.current;
      if (!s) {
        if (!mounted || reqId !== reqIdRef.current) return;
        setProfile(null);
        setRoles([]);
        setRolesLoaded(true);
        return;
      }

      const uid = s.user.id;
      const [profileRes, rolesRes, hasAdminRes] = await Promise.all([
        supabase
          .from("profiles")
          .select(
            "id,full_name,email,phone_number,company_name,contact_person,business_address,approval_status"
          )
          .eq("id", uid)
          .maybeSingle(),
        supabase.from("user_roles").select("role").eq("user_id", uid),
        // Authoritative admin check via SECURITY DEFINER function — bypasses any
        // RLS visibility issues on user_roles.
        supabase.rpc("has_role", { _user_id: uid, _role: "admin" }),
      ]);

      if (!mounted || reqId !== reqIdRef.current) return;

      if (rolesRes.error) {
        console.error("[usePortalSession] user_roles query failed:", rolesRes.error);
      }
      if (hasAdminRes.error) {
        console.error("[usePortalSession] has_role RPC failed:", hasAdminRes.error);
      }

      const rowRoles = ((rolesRes.data ?? []) as { role: PortalRole }[]).map(
        (x) => x.role
      );
      const merged = new Set<PortalRole>(rowRoles);
      if (hasAdminRes.data === true) merged.add("admin");

      setProfile((profileRes.data as PortalProfile) ?? null);
      setRoles(Array.from(merged));
      setRolesLoaded(true);
    };

    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      // Skip noisy events that don't change identity.
      if (event === "TOKEN_REFRESHED") {
        setSession(s);
        return;
      }
      setSession(s);
      setRolesLoaded(false);
      void loadUserData(s).finally(() => {
        if (mounted) setLoading(false);
      });
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

  const isAdmin = roles.includes("admin");

  return { session, profile, roles, loading, rolesLoaded, isAdmin };
}
