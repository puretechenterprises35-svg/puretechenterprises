import { createFileRoute, Link } from "@tanstack/react-router";
import { Building2, Receipt, ShieldCheck, FileCheck2, LineChart, Printer, Package, Laptop, CheckCircle2, Sparkles, ArrowRight, MessageCircle } from "lucide-react";
import { services, whatsappServiceLink } from "@/lib/site";
import { Button } from "@/components/ui/button";

const iconMap = { Building2, Receipt, ShieldCheck, FileCheck2, LineChart, Printer, Package, Laptop } as const;

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Business Services in Zambia | Puretech Enterprises" },
      { name: "description", content: "Full range of Puretech services: PACRA business registration, ZRA returns, NAPSA, NHIMA, business plans, tender support, printing, branding and ICT in Zambia." },
      { name: "keywords", content: "Business Registration Zambia, ZRA Returns Support, Business Plans Zambia, Tender Support Zambia, Printing and Branding Zambia, ICT Services Zambia" },
      { property: "og:title", content: "Services | Puretech Enterprises" },
      { property: "og:description", content: "Registration, tax, business plans, tender support, printing, branding and ICT services in Zambia." },
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
                <article key={s.slug} className="flex flex-col hover-lift rounded-2xl border border-border bg-card p-6 shadow-soft">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-brand text-primary-foreground"><Icon className="h-6 w-6" /></div>
                  <h3 className="mt-5 text-lg font-semibold">{s.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{s.short}</p>
                  <ul className="mt-4 flex-1 space-y-1.5 text-sm text-foreground/80">
                    {s.items.map((it) => (
                      <li key={it} className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" /> {it}</li>
                    ))}
                  </ul>
                  <a href={whatsappServiceLink(s.title)} target="_blank" rel="noopener" className="mt-5 block">
                    <Button size="sm" className="w-full bg-gradient-brand text-primary-foreground">
                      <MessageCircle className="mr-1.5 h-4 w-4" /> Enquire About This Service
                    </Button>
                  </a>
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
