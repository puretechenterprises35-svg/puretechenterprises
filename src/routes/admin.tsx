import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { usePortalSession } from "@/hooks/use-portal-session";
import { DashboardLayout } from "@/components/portal/DashboardLayout";

export const Route = createFileRoute("/admin")({
  ssr: false,
  component: AdminLayout,
});

function AdminLayout() {
  const { session, profile, roles, loading } = usePortalSession();
  const navigate = useNavigate();
  const isAdmin = roles.includes("admin");

  useEffect(() => {
    if (loading) return;
    if (!session) navigate({ to: "/portal/login", replace: true });
    else if (!isAdmin) navigate({ to: "/portal/dashboard", replace: true });
  }, [loading, session, isAdmin, navigate]);

  if (loading || !session || !isAdmin) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <DashboardLayout profile={profile}>
      <Outlet />
    </DashboardLayout>
  );
}
