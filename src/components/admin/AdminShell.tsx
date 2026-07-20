import type { ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Users, FolderKanban, Bell, Settings, PlusCircle, FileText, Receipt, CreditCard, Inbox, FileSignature } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/clients", label: "Clients", icon: Users },
  { to: "/admin/projects", label: "Projects", icon: FolderKanban },
  { to: "/admin/projects/new", label: "New Project", icon: PlusCircle },
  { to: "/admin/enquiries", label: "Enquiries", icon: Inbox },
  { to: "/admin/quotations", label: "Quotations", icon: FileSignature },
  { to: "/admin/documents", label: "Documents", icon: FileText },
  { to: "/admin/invoices", label: "Invoices", icon: Receipt },
  { to: "/admin/payments", label: "Payments", icon: CreditCard },
  { to: "/admin/project-updates", label: "Updates", icon: Bell },
  { to: "/admin/settings", label: "Settings", icon: Settings },
] as const;

export function AdminShell({ children, title }: { children: ReactNode; title?: string }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-card p-4 shadow-soft">
        <div className="mb-2 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Admin Portal</p>
            {title && <h1 className="text-xl font-bold text-foreground">{title}</h1>}
          </div>
        </div>
        <nav className="flex flex-wrap gap-1 overflow-x-auto">
          {NAV.map((n) => {
            const active = pathname === n.to || (n.to !== "/admin/dashboard" && pathname.startsWith(n.to));
            const Icon = n.icon;
            return (
              <Link
                key={n.to}
                to={n.to}
                className={cn(
                  "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground/70 hover:bg-accent hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {n.label}
              </Link>
            );
          })}
        </nav>
      </div>
      {children}
    </div>
  );
}
