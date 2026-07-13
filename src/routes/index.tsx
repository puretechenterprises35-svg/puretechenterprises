import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, Sparkles, Users, Zap, ShieldCheck, HeartHandshake, PhoneCall, FileText, Upload, Cog, PackageCheck, Building2, Receipt, FileCheck2, LineChart, Printer, Package, Laptop, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { services, site, whatsappLink } from "@/lib/site";
import { SectionHeading } from "@/components/site/SectionHeading";
import { QuickEnquiry } from "@/components/site/QuickEnquiry";
import { BusinessPlanCTA } from "@/components/site/BusinessPlanCTA";
import { TenderCTA } from "@/components/site/TenderCTA";
import { Faq } from "@/components/site/Faq";
import { Testimonials } from "@/components/site/Testimonials";
import hero from "@/assets/hero.jpg";

const iconMap = { Building2, Receipt, ShieldCheck, FileCheck2, LineChart, Printer, Package, Laptop } as const;

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Puretech Enterprises | Business Registration, Tax & ICT Services in Zambia" },
      { name: "description", content: "Puretech Enterprises in Kapiri Mposhi, Zambia offers business registration, ZRA tax returns, NAPSA & NHIMA, business plans, tender support, printing, branding and ICT services." },
      { name: "keywords", content: "Puretech Enterprises, Business Registration Zambia, Business Registration Kapiri Mposhi, Tax Consultancy Zambia, ZRA Returns Support, Business Plans Zambia, Tender Support Zambia, Printing and Branding Zambia, ICT Services Zambia" },
      { property: "og:title", content: "Puretech Enterprises | Smart Business Solutions in Zambia" },
      { property: "og:description", content: "Business registration, tax, business plans, tender support, printing, branding and ICT services in Kapiri Mposhi, Zambia." },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Home,
});

function Home() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-secondary text-secondary-foreground">
        <div className="absolute inset-0 opacity-40" style={{ backgroundImage: "radial-gradient(ellipse at top right, oklch(0.52 0.24 262 / 0.6), transparent 60%)" }} />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:gap-8 lg:py-28 lg:px-8">
          <div className="flex flex-col justify-center">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium uppercase tracking-wider text-primary-glow">
              <Sparkles className="h-3.5 w-3.5" /> {site.slogan}
            </div>
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.05] sm:text-5xl lg:text-6xl">
              Smart business solutions <span className="text-gradient-brand">you can rely on</span>
            </h1>
            <p className="mt-5 max-w-xl text-base text-secondary-foreground/80 sm:text-lg">
              From business registration and tax compliance to ICT, printing and branding, Puretech Enterprises provides smart and reliable solutions designed to help your business grow.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/quote">
                <Button size="lg" className="bg-gradient-brand text-primary-foreground shadow-elevated hover:opacity-95">
                  Request a Quote <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
              <a href={whatsappLink()} target="_blank" rel="noopener">
                <Button size="lg" variant="outline" className="border-white/20 bg-white/5 text-secondary-foreground hover:bg-white/10">
                  <MessageCircle className="mr-1.5 h-4 w-4" /> Chat With Us on WhatsApp
                </Button>
              </a>
            </div>
            <div className="mt-10 grid grid-cols-3 gap-6 border-t border-white/10 pt-6 text-sm">
              {[["8+", "Service lines"], ["100%", "Zambian focus"], ["1-Stop", "Business partner"]].map(([k, v]) => (
                <div key={v}><div className="text-2xl font-bold text-primary-glow">{k}</div><div className="text-secondary-foreground/70">{v}</div></div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 rounded-3xl bg-gradient-brand opacity-30 blur-2xl" />
            <img
              src={hero}
              alt="Professional business consultant working in a modern office"
              className="relative w-full rounded-2xl object-cover shadow-elevated"
              width={1600}
              height={1200}
            />
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="bg-background py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <div className="mb-3 inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">About Puretech</div>
              <h2 className="text-3xl font-bold sm:text-4xl">Your reliable business solutions partner</h2>
              <p className="mt-4 text-muted-foreground">
                Puretech Enterprises provides professional business support, compliance, financial consultancy, ICT, printing and branding solutions to businesses, entrepreneurs and organisations in Zambia.
              </p>
              <p className="mt-3 text-muted-foreground">
                Our goal is to simplify business processes and provide quality, smart and reliable solutions that help our clients operate efficiently and grow.
              </p>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-border bg-surface p-5">
                  <div className="text-xs font-semibold uppercase tracking-wider text-primary">Mission</div>
                  <p className="mt-2 text-sm text-foreground/80">To provide quality, innovative and reliable business solutions that simplify operations and support sustainable business growth.</p>
                </div>
                <div className="rounded-xl border border-border bg-surface p-5">
                  <div className="text-xs font-semibold uppercase tracking-wider text-primary">Vision</div>
                  <p className="mt-2 text-sm text-foreground/80">To become a trusted and leading provider of integrated business, technology and professional support solutions in Zambia.</p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-surface p-8 shadow-card">
              <h3 className="text-lg font-semibold">Core Values</h3>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {["Quality","Integrity","Reliability","Innovation","Professionalism","Customer Focus"].map((v) => (
                  <li key={v} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-primary" /> {v}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="bg-surface py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Our Services" title="Everything your business needs, in one place" description="Practical, professional services delivered by one reliable partner." />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s) => {
              const Icon = iconMap[s.icon as keyof typeof iconMap] ?? Sparkles;
              return (
                <article key={s.slug} className="hover-lift group rounded-2xl border border-border bg-card p-6 shadow-soft">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-brand text-primary-foreground shadow-soft">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold">{s.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{s.short}</p>
                  <ul className="mt-4 space-y-1.5 text-sm text-foreground/80">
                    {s.items.slice(0, 4).map((it) => (
                      <li key={it} className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" /> {it}</li>
                    ))}
                    {s.items.length > 4 && <li className="text-xs text-muted-foreground">+ {s.items.length - 4} more</li>}
                  </ul>
                </article>
              );
            })}
          </div>
          <div className="mt-10 text-center">
            <Link to="/services"><Button variant="outline">View all services <ArrowRight className="ml-1 h-4 w-4" /></Button></Link>
          </div>
        </div>
      </section>

      {/* QUICK ENQUIRY */}
      <QuickEnquiry />

      {/* WHY CHOOSE */}
      <section className="bg-background py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Why Puretech" title="A dependable partner for growing businesses" />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: PackageCheck, title: "One-Stop Business Solutions", body: "Access multiple professional business services from one reliable provider." },
              { icon: HeartHandshake, title: "Professional Support", body: "Practical and professional support tailored to client needs." },
              { icon: ShieldCheck, title: "Reliable Service", body: "We focus on timely and dependable service delivery." },
              { icon: Zap, title: "Smart Solutions", body: "Modern approaches that simplify business processes." },
              { icon: Users, title: "Customer Focused", body: "Every client receives personalised support." },
              { icon: Sparkles, title: "Quality First", body: "Consistent standards across every service we deliver." },
            ].map((f) => (
              <div key={f.title} className="rounded-2xl border border-border bg-card p-6 hover-lift">
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary"><f.icon className="h-5 w-5" /></div>
                <h3 className="mt-4 font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-secondary py-20 text-secondary-foreground">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-3 inline-flex items-center rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary-glow">How It Works</div>
            <h2 className="text-3xl font-bold sm:text-4xl">A simple, transparent process</h2>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {[
              { n: "01", icon: PhoneCall, title: "Contact Us", body: "Tell us the service you need." },
              { n: "02", icon: FileText, title: "Get a Quotation", body: "Receive a clear quotation and requirements." },
              { n: "03", icon: Upload, title: "Submit Documents", body: "Provide the required information or documents." },
              { n: "04", icon: Cog, title: "We Handle It", body: "Puretech processes the service professionally." },
              { n: "05", icon: PackageCheck, title: "Service Completed", body: "Receive your completed service or documentation." },
            ].map((s) => (
              <div key={s.n} className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
                <div className="flex items-center justify-between text-primary-glow">
                  <span className="text-xs font-bold tracking-wider">{s.n}</span>
                  <s.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm text-secondary-foreground/80">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BUSINESS PLAN CTA */}
      <BusinessPlanCTA />

      {/* TENDER CTA */}
      <TenderCTA />

      {/* TESTIMONIALS */}
      <Testimonials />

      {/* FAQ */}
      <Faq />

      {/* CTA */}
      <section className="bg-background py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-brand p-10 text-center text-primary-foreground shadow-elevated sm:p-14">
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(ellipse at bottom left, white, transparent 60%)" }} />
            <div className="relative">
              <h2 className="text-3xl font-bold sm:text-4xl">Ready to grow and simplify your business?</h2>
              <p className="mx-auto mt-4 max-w-2xl text-primary-foreground/90">
                Let Puretech Enterprises handle your business support, compliance, ICT, printing and branding needs.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Link to="/contact"><Button size="lg" variant="secondary">Contact Puretech</Button></Link>
                <Link to="/quote"><Button size="lg" className="bg-white text-primary hover:bg-white/90">Get a Quote</Button></Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
