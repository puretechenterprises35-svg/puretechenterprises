import { createFileRoute, Outlet, useNavigate, useRouterState, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { usePortalSession } from "@/hooks/use-portal-session";
import { DashboardLayout } from "@/components/portal/DashboardLayout";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const PUBLIC_PORTAL_PATHS = new Set([
  "/portal/login",
  "/portal/register",
  "/portal/forgot-password",
  "/portal/pending",
]);

export const Route = createFileRoute("/portal")({
  ssr: false,
  component: PortalLayout,
});

function PortalLayout() {
  const pathname = useRouterState({ select: (s: { location: { pathname: string } }) => s.location.pathname });
  const isPublic = PUBLIC_PORTAL_PATHS.has(pathname);
  const { session, profile, loading, rolesLoaded, isAdmin } = usePortalSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading || !rolesLoaded) return;
    if (!isPublic && !session) {
      navigate({ to: "/portal/login", replace: true });
    }
  }, [loading, rolesLoaded, session, isPublic, navigate]);

  if (isPublic) {
    return <Outlet />;
  }

  if (loading || !rolesLoaded || !session) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin && profile && profile.approval_status !== "approved") {

    return (
      <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 text-center">
        <div className="w-full rounded-xl border border-border bg-card p-8 shadow-soft">
          <h1 className="text-2xl font-bold">Account Pending Approval</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Your registration has been received. Your account will become active
            after administrator approval. We will notify you by email once
            approved.
          </p>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button asChild variant="outline">
              <Link to="/">Back to website</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout profile={profile}>
      <Outlet />
    </DashboardLayout>
  );
}
