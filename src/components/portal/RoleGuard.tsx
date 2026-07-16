import type { ReactNode } from "react";
import { usePortalSession, type PortalRole } from "@/hooks/use-portal-session";

/**
 * Renders children only if the current user has one of the required roles.
 * Used to gate admin/staff-only UI. Route-level guarding lives in portal.tsx.
 */
export function RoleGuard({
  roles,
  fallback = null,
  children,
}: {
  roles: PortalRole[];
  fallback?: ReactNode;
  children: ReactNode;
}) {
  const { roles: userRoles, loading } = usePortalSession();
  if (loading) return null;
  const allowed = userRoles.some((r) => roles.includes(r));
  return allowed ? <>{children}</> : <>{fallback}</>;
}
