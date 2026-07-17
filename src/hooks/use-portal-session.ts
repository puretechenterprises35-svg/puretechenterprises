import { createContext, createElement, useContext, useEffect, useRef, useState, type ReactNode } from "react";
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

type PortalSessionState = {
  session: Session | null;
  profile: PortalProfile | null;
  roles: PortalRole[];
  loading: boolean;
  rolesLoaded: boolean;
  isAdmin: boolean;
};

const PortalSessionContext = createContext<PortalSessionState | null>(null);

const PORTAL_ROLES: PortalRole[] = ["admin", "staff", "client"];

function normalizePortalRole(role: unknown): PortalRole | null {
  const normalized = String(role ?? "")
    .trim()
    .toLowerCase();
  return PORTAL_ROLES.includes(normalized as PortalRole)
    ? (normalized as PortalRole)
    : null;
}

function usePortalSessionSource(): PortalSessionState {
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
      const isCurrentRequest = () => mounted && reqId === reqIdRef.current;

      if (mounted) {
        setLoading(true);
        setRolesLoaded(false);
      }

      try {
        if (!s) {
          console.info("[usePortalSession] auth.uid()", null);
          if (!isCurrentRequest()) return;
          setSession(null);
          setProfile(null);
          setRoles([]);
          setRolesLoaded(true);
          setLoading(false);
          return;
        }

        const authUserRes = await supabase.auth.getUser();
        const uid = authUserRes.data.user?.id ?? null;

        console.info("[usePortalSession] auth.uid()", uid);

        if (authUserRes.error || !uid) {
          console.error("[usePortalSession] getUser failed:", authUserRes.error);
          if (!isCurrentRequest()) return;
          setSession(null);
          setProfile(null);
          setRoles([]);
          setRolesLoaded(true);
          setLoading(false);
          return;
        }

        if (uid !== s.user.id) {
          console.warn("[usePortalSession] Session user id differs from auth.uid()", {
            sessionUserId: s.user.id,
            authUid: uid,
          });
        }

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

        if (!isCurrentRequest()) return;

        console.info("[usePortalSession] user_roles query result", {
          data: rolesRes.data,
          error: rolesRes.error,
        });
        console.info("[usePortalSession] public.has_role(auth.uid(),'admin') RPC result", {
          data: hasAdminRes.data,
          error: hasAdminRes.error,
        });

        if (profileRes.error) {
          console.error("[usePortalSession] profiles query failed:", profileRes.error);
        }
        if (rolesRes.error) {
          console.error("[usePortalSession] user_roles query failed:", rolesRes.error);
        }
        if (hasAdminRes.error) {
          console.error("[usePortalSession] has_role RPC failed:", hasAdminRes.error);
        }

        const rowRoles = ((rolesRes.data ?? []) as { role: unknown }[])
          .map((x) => normalizePortalRole(x.role))
          .filter((role): role is PortalRole => role !== null);
        const merged = new Set<PortalRole>(rowRoles);
        if (hasAdminRes.data === true) merged.add("admin");
        const finalRoles = Array.from(merged);

        console.info("[usePortalSession] final roles array", finalRoles);

        setProfile((profileRes.data as PortalProfile) ?? null);
        setRoles(finalRoles);
        setRolesLoaded(true);
        setLoading(false);
      } catch (error) {
        console.error("[usePortalSession] role loading failed:", error);
        if (!isCurrentRequest()) return;
        setRoles([]);
        setRolesLoaded(true);
        setLoading(false);
      }
    };

    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      console.info("[usePortalSession] auth state changed", event);
      setLoading(true);
      setRolesLoaded(false);
      setSession(s);
      window.setTimeout(() => {
        void loadUserData(s);
      }, 0);
    });

    supabase.auth
      .getSession()
      .then(async ({ data }) => {
        if (!mounted) return;
        setSession(data.session);
        await loadUserData(data.session);
      })
      .catch((error) => {
        console.error("[usePortalSession] getSession failed:", error);
        if (!mounted) return;
        setSession(null);
        setProfile(null);
        setRoles([]);
        setRolesLoaded(true);
        setLoading(false);
      });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const isAdmin = roles.includes("admin");

  return { session, profile, roles, loading, rolesLoaded, isAdmin };
}

export function PortalSessionProvider({ children }: { children: ReactNode }) {
  const value = usePortalSessionSource();
  return createElement(PortalSessionContext.Provider, { value }, children);
}

export function usePortalSession() {
  const context = useContext(PortalSessionContext);
  if (!context) {
    throw new Error("usePortalSession must be used within PortalSessionProvider");
  }
  return context;
}
