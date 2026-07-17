import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X, LogOut, User } from "lucide-react";
import logoAsset from "@/assets/logo-white.png.asset.json";
import { nav, site } from "@/lib/site";
import { Button } from "@/components/ui/button";
import { usePortalSession } from "@/hooks/use-portal-session";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function Header() {
  const [open, setOpen] = useState(false);
  const { session, loading, rolesLoaded, isAdmin } = usePortalSession();
  const navigate = useNavigate();
  const portalHref = isAdmin ? "/admin/dashboard" : "/portal/dashboard";
  const portalLabel = isAdmin ? "Admin Portal" : "Client Portal";

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate({ to: "/auth", replace: true });
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" className="flex min-w-0 items-center gap-2">
          <img src={logoAsset.url} alt={`${site.name} logo`} className="h-10 w-auto shrink-0" width={200} height={100} />
          <span className="sr-only">{site.name}</span>
        </Link>

        <nav className="hidden items-center gap-1 xl:flex">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="rounded-md px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-accent hover:text-primary"
              activeProps={{ className: "text-primary bg-accent" }}
              activeOptions={{ exact: n.to === "/" }}
            >
              {n.label}
            </Link>
          ))}
          <Link to={session && rolesLoaded ? portalHref : "/portal/login"} className="ml-2">
            <Button variant="outline" size="sm">
              {session && rolesLoaded ? portalLabel : "Client Portal"}
            </Button>
          </Link>
          <Link to="/quote" className="ml-2">
            <Button className="bg-gradient-brand text-primary-foreground shadow-soft hover:opacity-95">
              Get a Quote
            </Button>
          </Link>
          {!loading && session ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="ml-1"
              aria-label="Sign out"
            >
              <LogOut className="h-4 w-4" />
              <span className="ml-1">Sign out</span>
            </Button>
          ) : (
            <Link to="/auth" className="ml-1">
              <Button variant="ghost" size="sm">
                <User className="h-4 w-4" />
                <span className="ml-1">Sign in</span>
              </Button>
            </Link>
          )}
        </nav>

        <button
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border xl:hidden"
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border bg-background xl:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3 sm:px-6">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium text-foreground/80 hover:bg-accent hover:text-primary"
                activeProps={{ className: "text-primary bg-accent" }}
                activeOptions={{ exact: n.to === "/" }}
              >
                {n.label}
              </Link>
            ))}
            <Link to={session && rolesLoaded ? portalHref : "/portal/login"} onClick={() => setOpen(false)}>
              <Button variant="outline" className="mt-2 w-full">
                {session && rolesLoaded ? portalLabel : "Client Portal"}
              </Button>
            </Link>
            <Link to="/quote" onClick={() => setOpen(false)}>
              <Button className="mt-2 w-full bg-gradient-brand text-primary-foreground">
                Get a Quote
              </Button>
            </Link>
            {!loading && session ? (
              <Button
                variant="outline"
                onClick={() => { setOpen(false); handleSignOut(); }}
                className="mt-2 w-full"
              >
                <LogOut className="h-4 w-4 mr-2" /> Sign out
              </Button>
            ) : (
              <Link to="/auth" onClick={() => setOpen(false)}>
                <Button variant="outline" className="mt-2 w-full">
                  <User className="h-4 w-4 mr-2" /> Sign in
                </Button>
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
