import { useState } from "react";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Bell, LogOut } from "lucide-react";
import { PtbsSidebar } from "@/components/ptbs/Sidebar";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/ptbs")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "PTBS | PureTech Business Management System" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PtbsLayout,
});

function PtbsLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-muted/30">
      <PtbsSidebar collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-border bg-background/85 px-4 backdrop-blur sm:px-6">
          <div className="min-w-0">
            <h1 className="truncate text-sm font-semibold text-foreground sm:text-base">
              PureTech Business Management System
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="relative inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary" />
            </button>
            <div className="flex items-center gap-2 rounded-md border border-border bg-card px-2 py-1">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                A
              </span>
              <div className="hidden text-left sm:block">
                <p className="text-xs text-muted-foreground leading-none">Signed in</p>
                <p className="text-sm font-medium leading-tight">Administrator</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="gap-2" disabled>
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </header>
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
