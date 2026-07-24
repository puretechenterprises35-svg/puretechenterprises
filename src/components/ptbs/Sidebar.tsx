import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  Home,
  FolderTree,
  Users,
  Briefcase,
  ClipboardList,
  Wallet,
  BarChart3,
  Settings,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Layers,
  Boxes,
  Package,
  FileText,
  FileBarChart,
} from "lucide-react";
import { cn } from "@/lib/utils";

const MASTER_DATA_CHILDREN = [
  { to: "/ptbs/master-data/dashboard", label: "Dashboard", icon: LayoutDashboard, enabled: true },
  { to: "/ptbs/master-data/divisions", label: "Divisions", icon: Layers, enabled: true },
  { to: "/ptbs/master-data/categories", label: "Categories", icon: FolderTree, enabled: false },
  { to: "/ptbs/master-data/services", label: "Services", icon: Boxes, enabled: false },
  { to: "/ptbs/master-data/packages", label: "Packages", icon: Package, enabled: false },
  { to: "/ptbs/master-data/price-lists", label: "Price Lists", icon: FileBarChart, enabled: false },
  { to: "/ptbs/master-data/templates", label: "Templates", icon: FileText, enabled: false },
  { to: "/ptbs/master-data/document-types", label: "Document Types", icon: FileText, enabled: false },
] as const;

const TOP_LINKS = [
  { to: "/ptbs", label: "Dashboard", icon: Home, exact: true },
] as const;

const COMING_SOON = [
  { label: "Clients", icon: Users },
  { label: "Sales", icon: Briefcase },
  { label: "Projects", icon: ClipboardList },
  { label: "Finance", icon: Wallet },
  { label: "Reports", icon: BarChart3 },
  { label: "Administration", icon: Settings },
] as const;

export function PtbsSidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [openMaster, setOpenMaster] = useState(true);

  return (
    <aside
      className={cn(
        "sticky top-0 flex h-screen shrink-0 flex-col border-r border-border bg-card transition-[width] duration-200",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex h-16 items-center justify-between border-b border-border px-3">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold">P</span>
            <span className="text-sm font-semibold">PTBS</span>
          </div>
        )}
        <button
          onClick={onToggle}
          className="ml-auto inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
          aria-label="Toggle sidebar"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-2">
        {TOP_LINKS.map((item) => {
          const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active ? "bg-primary/10 text-primary" : "text-foreground/70 hover:bg-accent hover:text-foreground",
                collapsed && "justify-center px-0"
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}

        {/* Master Data group */}
        <div>
          <button
            onClick={() => setOpenMaster((v) => !v)}
            className={cn(
              "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              pathname.startsWith("/ptbs/master-data")
                ? "bg-primary/10 text-primary"
                : "text-foreground/70 hover:bg-accent hover:text-foreground",
              collapsed && "justify-center px-0"
            )}
            title={collapsed ? "Master Data" : undefined}
          >
            <FolderTree className="h-4 w-4 shrink-0" />
            {!collapsed && (
              <>
                <span className="flex-1 text-left">Master Data</span>
                <ChevronDown className={cn("h-4 w-4 transition-transform", openMaster ? "rotate-0" : "-rotate-90")} />
              </>
            )}
          </button>
          {!collapsed && openMaster && (
            <div className="mt-1 space-y-0.5 pl-4">
              {MASTER_DATA_CHILDREN.map((c) => {
                const active = pathname === c.to;
                const Icon = c.icon;
                return (
                  <Link
                    key={c.to}
                    to={c.to}
                    className={cn(
                      "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors",
                      active ? "bg-primary text-primary-foreground" : "text-foreground/70 hover:bg-accent hover:text-foreground"
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {c.label}
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        <div className={cn("mt-4 border-t border-border pt-3", collapsed && "text-center")}>
          {!collapsed && (
            <p className="mb-1 px-3 text-xs uppercase tracking-wide text-muted-foreground">Modules</p>
          )}
          {COMING_SOON.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className={cn(
                  "flex cursor-not-allowed items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground/70",
                  collapsed && "justify-center px-0"
                )}
                title={collapsed ? `${item.label} — Coming soon` : undefined}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {!collapsed && (
                  <>
                    <span className="flex-1">{item.label}</span>
                    <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium uppercase">Soon</span>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}
