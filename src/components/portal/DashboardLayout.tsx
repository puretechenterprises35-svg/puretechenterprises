import { useState, type ReactNode } from "react";
import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard,
  FolderKanban,
  FileText,
  CreditCard,
  MessageSquare,
  User,
  LogOut,
  Menu,
  X,
  ChevronDown,
} from "lucide-react";
import { NotificationCenter } from "./NotificationCenter";
import { RoleGuard } from "./RoleGuard";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { site } from "@/lib/site";
import logoAsset from "@/assets/logo-white.png.asset.json";
import type { PortalProfile } from "@/hooks/use-portal-session";
import { Shield } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { to: "/portal/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/portal/projects", label: "Projects", icon: FolderKanban },
  { to: "/portal/documents", label: "Documents", icon: FileText },
  { to: "/portal/payments", label: "Payments", icon: CreditCard },
  { to: "/portal/messages", label: "Messages", icon: MessageSquare },
  { to: "/portal/profile", label: "Profile", icon: User },
] as const;

function buildCrumbs(pathname: string) {
  const parts = pathname.split("/").filter(Boolean);
  return parts.map((p, i) => ({
    label: p.charAt(0).toUpperCase() + p.slice(1).replace(/-/g, " "),
    to: "/" + parts.slice(0, i + 1).join("/"),
  }));
}

export function DashboardLayout({
  children,
  profile,
  title,
}: {
  children: ReactNode;
  profile: PortalProfile | null;
  title?: string;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s: { location: { pathname: string } }) => s.location.pathname });
  const crumbs = buildCrumbs(pathname);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate({ to: "/portal/login", replace: true });
  };

  const initials =
    (profile?.contact_person || profile?.full_name || profile?.email || "U")
      .split(" ")
      .map((s) => s[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Sidebar (desktop) */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-border bg-card lg:block">
        <SidebarInner onNavigate={() => {}} pathname={pathname} />
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 w-64 bg-card shadow-xl">
            <SidebarInner
              onNavigate={() => setMobileOpen(false)}
              pathname={pathname}
            />
          </aside>
        </div>
      )}

      {/* Main column */}
      <div className="lg:pl-64">
        {/* Top navigation */}
        <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur">
          <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6">
            <button
              onClick={() => setMobileOpen(true)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="min-w-0 flex-1">
              {crumbs.length > 0 && (
                <nav className="hidden text-xs text-muted-foreground sm:block">
                  {crumbs.map((c, i) => (
                    <span key={c.to}>
                      {i > 0 && <span className="mx-1">/</span>}
                      <span
                        className={
                          i === crumbs.length - 1 ? "text-foreground font-medium" : ""
                        }
                      >
                        {c.label}
                      </span>
                    </span>
                  ))}
                </nav>
              )}
              {title && (
                <h1 className="truncate text-base font-semibold text-foreground sm:text-lg">
                  {title}
                </h1>
              )}
            </div>

            <div className="flex items-center gap-2">
              <NotificationCenter />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-brand text-xs font-semibold text-primary-foreground">
                      {initials}
                    </span>
                    <span className="hidden max-w-[120px] truncate text-left sm:block">
                      <span className="block text-xs text-muted-foreground">
                        Signed in
                      </span>
                      <span className="block text-sm font-medium">
                        {profile?.contact_person || profile?.full_name || "Client"}
                      </span>
                    </span>
                    <ChevronDown className="h-4 w-4 opacity-60" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="truncate">
                    {profile?.email}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/portal/profile">
                      <User className="mr-2 h-4 w-4" /> Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" /> Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );

  function SidebarInner({
    onNavigate,
    pathname,
  }: {
    onNavigate: () => void;
    pathname: string;
  }) {
    return (
      <div className="flex h-full flex-col">
        <div className="flex h-16 items-center justify-between border-b border-border px-4">
          <Link to="/" className="flex items-center gap-2" onClick={onNavigate}>
            <img
              src={logoAsset.url}
              alt={`${site.name} logo`}
              className="h-8 w-auto"
              width={200}
              height={100}
            />
          </Link>
          <button
            onClick={onNavigate}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {NAV_ITEMS.map((item) => {
            const active =
              pathname === item.to || pathname.startsWith(item.to + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={onNavigate}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-foreground/70 hover:bg-accent hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-border p-3">
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-foreground/70 hover:bg-accent hover:text-foreground"
          >
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </div>
      </div>
    );
  }
}
