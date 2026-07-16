import { createFileRoute } from "@tanstack/react-router";
import { usePortalSession } from "@/hooks/use-portal-session";
import { LoadingScreen } from "@/components/portal/LoadingScreen";

export const Route = createFileRoute("/portal/profile")({
  ssr: false,
  head: () => ({ meta: [{ title: "Profile | Puretech Client Portal" }, { name: "robots", content: "noindex" }] }),
  component: PortalProfile,
});

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-foreground">{value || "—"}</dd>
    </div>
  );
}

function PortalProfile() {
  const { profile, roles, loading } = usePortalSession();
  if (loading) return <LoadingScreen />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Profile</h1>
        <p className="text-sm text-muted-foreground">Your account details.</p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 shadow-soft">
        <dl className="grid gap-4 sm:grid-cols-2">
          <Field label="Company Name" value={profile?.company_name} />
          <Field label="Contact Person" value={profile?.contact_person || profile?.full_name} />
          <Field label="Email" value={profile?.email} />
          <Field label="Phone Number" value={profile?.phone_number} />
          <div className="sm:col-span-2">
            <Field label="Business Address" value={profile?.business_address} />
          </div>
          <Field label="Account Status" value={profile?.approval_status} />
          <Field label="Role" value={roles.join(", ") || "client"} />
        </dl>
      </div>
    </div>
  );
}
