import { createFileRoute, Navigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { usePortalSession } from "@/hooks/use-portal-session";

export const Route = createFileRoute("/portal/")({
  ssr: false,
  component: PortalIndex,
});

function PortalIndex() {
  const { loading, rolesLoaded, isAdmin } = usePortalSession();
  if (loading || !rolesLoaded) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }
  return <Navigate to={isAdmin ? "/admin/dashboard" : "/portal/dashboard"} replace />;
}
