import { createFileRoute } from "@tanstack/react-router";
import { FolderKanban, CheckCircle2, CreditCard, MessageSquare, FileText, Activity } from "lucide-react";
import { StatCard } from "@/components/portal/StatCard";

export const Route = createFileRoute("/portal/dashboard")({
  ssr: false,
  head: () => ({ meta: [{ title: "Dashboard | Puretech Client Portal" }, { name: "robots", content: "noindex" }] }),
  component: PortalDashboard,
});

// Placeholder data — replace with real Supabase queries in a later phase.
const RECENT_ACTIVITY = [
  { id: 1, text: "Welcome to the Puretech Client Portal", when: "Just now" },
  { id: 2, text: "Your account is being reviewed by our team", when: "Today" },
];

const LATEST_DOCS = [
  { id: 1, name: "Sample Quotation.pdf", when: "Pending upload" },
  { id: 2, name: "Service Agreement.pdf", when: "Pending upload" },
];

function PortalDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Overview of your account activity.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Active Projects" value={0} icon={FolderKanban} tone="default" />
        <StatCard label="Completed Projects" value={0} icon={CheckCircle2} tone="success" />
        <StatCard label="Outstanding Payments" value="ZMW 0" icon={CreditCard} tone="warning" />
        <StatCard label="Unread Messages" value={0} icon={MessageSquare} tone="danger" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-border bg-card p-5 shadow-soft">
          <header className="mb-4 flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold">Recent Activity</h2>
          </header>
          <ul className="divide-y divide-border">
            {RECENT_ACTIVITY.map((a) => (
              <li key={a.id} className="flex items-center justify-between py-3 text-sm">
                <span className="text-foreground">{a.text}</span>
                <span className="text-xs text-muted-foreground">{a.when}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-xl border border-border bg-card p-5 shadow-soft">
          <header className="mb-4 flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold">Latest Documents</h2>
          </header>
          <ul className="divide-y divide-border">
            {LATEST_DOCS.map((d) => (
              <li key={d.id} className="flex items-center justify-between py-3 text-sm">
                <span className="truncate text-foreground">{d.name}</span>
                <span className="text-xs text-muted-foreground">{d.when}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
