import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import logoAsset from "@/assets/logo-white.png.asset.json";
import { site } from "@/lib/site";

export function AuthLayout({
  title,
  subtitle,
  children,
  wide = false,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <section className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-background to-muted/40 px-4 py-12">
      <div className={`mx-auto w-full ${wide ? "max-w-2xl" : "max-w-md"}`}>
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <Link to="/" className="inline-flex items-center gap-2">
            <img
              src={logoAsset.url}
              alt={`${site.name} logo`}
              className="h-10 w-auto"
              width={200}
              height={100}
            />
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-foreground">{title}</h1>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
        <div className="rounded-xl border border-border bg-card p-6 shadow-soft sm:p-8">
          {children}
        </div>
      </div>
    </section>
  );
}
