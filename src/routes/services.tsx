import { createFileRoute, Link } from "@tanstack/react-router";
import { Building2, Receipt, ShieldCheck, FileCheck2, LineChart, Printer, Package, Laptop, CheckCircle2, Sparkles, ArrowRight } from "lucide-react";
import { services } from "@/lib/site";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/site/SectionHeading";

const iconMap = { Building2, Receipt, ShieldCheck, FileCheck2, LineChart, Printer, Package, Laptop } as const;

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services | Puretech Enterprises" },
      { name: "description", content: "Explore Puretech's full range of services: PACRA, ZRA, NAPSA, NHIMA, financial consultancy, printing, branding and ICT support." },
      { property: "og:title", content: "Services | Puretech Enterprises" },
      { property: "og:url", content: "/services" },
    ],
    links: [{ rel: "canonical", href: "/services" }],
  }),
  component: Services,
});

function Services() {
  return (
    <div className="bg-background">
      <section className="border-b border-border bg-surface py-14">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <div className="mb-3 inline-flex rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">Our Services</div>
          <h1 className="text-4xl font-extrabold sm:text-5xl">Complete solutions for your business</h1>
          <p className="mt-4 text-muted-foreground">One reliable partner across compliance, finance, branding and technology.</p>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s) => {
              const Icon = iconMap[s.icon as keyof typeof iconMap] ?? Sparkles;
              return (
                <article key={s.slug} className="hover-lift rounded-2xl border border-border bg-card p-6 shadow-soft">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-brand text-primary-foreground"><Icon className="h-6 w-6" /></div>
                  <h3 className="mt-5 text-lg font-semibold">{s.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{s.short}</p>
                  <ul className="mt-4 space-y-1.5 text-sm text-foreground/80">
                    {s.items.map((it) => (
                      <li key={it} className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" /> {it}</li>
                    ))}
                  </ul>
                </article>
              );
            })}
          </div>
          <div className="mt-12 text-center">
            <Link to="/quote">
              <Button size="lg" className="bg-gradient-brand text-primary-foreground shadow-soft">Request a Quote <ArrowRight className="ml-1 h-4 w-4" /></Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
