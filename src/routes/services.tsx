import { createFileRoute, Link } from "@tanstack/react-router";
import { Building2, Receipt, ShieldCheck, FileCheck2, LineChart, Printer, Package, Laptop, CheckCircle2, Sparkles, ArrowRight, MessageCircle, Info, Star } from "lucide-react";
import { services, servicePackages, whatsappServiceLink, type PackageTier } from "@/lib/site";
import { Button } from "@/components/ui/button";

const iconMap = { Building2, Receipt, ShieldCheck, FileCheck2, LineChart, Printer, Package, Laptop } as const;

const tierAccent: Record<PackageTier["name"], { dot: string; label: string; ring: string }> = {
  Basic: { dot: "bg-emerald-500", label: "text-emerald-600 dark:text-emerald-400", ring: "border-border" },
  Standard: { dot: "bg-sky-500", label: "text-sky-600 dark:text-sky-400", ring: "border-primary/60 ring-1 ring-primary/30" },
  Premium: { dot: "bg-violet-500", label: "text-violet-600 dark:text-violet-400", ring: "border-border" },
};

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Business Services & Pricing in Zambia | Puretech Enterprises" },
      { name: "description", content: "Transparent pricing packages for PACRA registration, ZRA returns, NAPSA, NHIMA, business plans, tender support, printing, branding and ICT services in Zambia." },
      { name: "keywords", content: "Business Registration Zambia, ZRA Returns Support, Business Plans Zambia, Tender Support Zambia, Printing and Branding Zambia, ICT Services Zambia, Pricing Zambia" },
      { property: "og:title", content: "Services & Pricing | Puretech Enterprises" },
      { property: "og:description", content: "Basic, Standard and Premium packages across registration, tax, finance, branding and ICT services." },
      { property: "og:url", content: "/services" },
    ],
    links: [{ rel: "canonical", href: "/services" }],
  }),
  component: Services,
});

function PackageCard({ tier, serviceTitle }: { tier: PackageTier; serviceTitle: string }) {
  const accent = tierAccent[tier.name];
  const isStandard = tier.name === "Standard";
  return (
    <div className={`relative flex flex-col rounded-xl border bg-background p-5 shadow-soft ${accent.ring}`}>
      {isStandard && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-brand px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground shadow-elevated">
          <Star className="mr-1 inline h-3 w-3" /> Most Popular
        </span>
      )}
      <div className="flex items-center gap-2">
        <span className={`h-2.5 w-2.5 rounded-full ${accent.dot}`} />
        <span className={`text-xs font-semibold uppercase tracking-wider ${accent.label}`}>{tier.name}</span>
      </div>
      <div className="mt-2">
        <div className="text-lg font-bold text-foreground">{tier.price}</div>
        <div className="text-xs text-muted-foreground">{tier.tagline}</div>
      </div>
      <ul className="mt-4 flex-1 space-y-1.5 text-sm text-foreground/80">
        {tier.items.map((it) => (
          <li key={it} className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> {it}
          </li>
        ))}
      </ul>
      <a href={whatsappServiceLink(`${serviceTitle} — ${tier.name} package`)} target="_blank" rel="noopener" className="mt-5 block">
        <Button size="sm" variant={isStandard ? "default" : "outline"} className={`w-full ${isStandard ? "bg-gradient-brand text-primary-foreground" : ""}`}>
          <MessageCircle className="mr-1.5 h-4 w-4" /> Enquire
        </Button>
      </a>
    </div>
  );
}

function Services() {
  return (
    <div className="bg-background">
      <section className="border-b border-border bg-surface py-14">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <div className="mb-3 inline-flex rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">Our Services & Pricing</div>
          <h1 className="text-4xl font-extrabold sm:text-5xl">Complete solutions for your business</h1>
          <p className="mt-4 text-muted-foreground">One reliable partner across compliance, finance, branding and technology — with transparent Basic, Standard and Premium packages.</p>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-12">
            {services.map((s) => {
              const Icon = iconMap[s.icon as keyof typeof iconMap] ?? Sparkles;
              const tiers = servicePackages[s.slug] ?? [];
              return (
                <article key={s.slug} className="rounded-2xl border border-border bg-card p-6 shadow-soft sm:p-8">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-brand text-primary-foreground">
                        <Icon className="h-6 w-6" />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold sm:text-2xl">{s.title}</h2>
                        <p className="mt-1 text-sm text-muted-foreground">{s.short}</p>
                      </div>
                    </div>
                    <Link to="/quote" className="shrink-0">
                      <Button size="sm" className="bg-gradient-brand text-primary-foreground">
                        Request a Quote <ArrowRight className="ml-1 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>

                  {tiers.length > 0 && (
                    <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                      {tiers.map((t) => (
                        <PackageCard key={t.name} tier={t} serviceTitle={s.title} />
                      ))}
                    </div>
                  )}
                </article>
              );
            })}
          </div>

          <div className="mt-12 rounded-2xl border border-primary/20 bg-primary/5 p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Info className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-foreground sm:text-lg">Pricing information</h3>
                <p className="mt-1 text-sm text-muted-foreground sm:text-base">
                  Final pricing depends on project scope, statutory fees, third-party charges, and specific client requirements. Contact us for a personalised quotation.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-10 text-center">
            <Link to="/quote">
              <Button size="lg" className="bg-gradient-brand text-primary-foreground shadow-soft">
                Request a Quote <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
