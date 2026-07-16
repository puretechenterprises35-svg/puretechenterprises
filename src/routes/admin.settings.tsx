import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";

export const Route = createFileRoute("/admin/settings")({
  component: AdminSettings,
});

function AdminSettings() {
  return (
    <AdminShell title="Settings">
      <div className="rounded-xl border border-border bg-card p-6 shadow-soft">
        <h2 className="text-sm font-semibold">Portal settings</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Configuration for staff permissions, email templates, and billing preferences will
          appear here as more of the portal comes online.
        </p>
      </div>
    </AdminShell>
  );
}
