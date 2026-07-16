import { useState } from "react";
import { Building2, Receipt, LineChart, Laptop, Printer, Globe, ImageIcon } from "lucide-react";
import { SectionHeading } from "@/components/site/SectionHeading";
import { Button } from "@/components/ui/button";

type Category = "All" | "Business Registration" | "Tax & Compliance" | "Financial Consultancy" | "ICT Services" | "Branding" | "Website Development";

const categories: Category[] = [
  "All",
  "Business Registration",
  "Tax & Compliance",
  "Financial Consultancy",
  "ICT Services",
  "Branding",
  "Website Development",
];

const iconByCat: Record<Exclude<Category, "All">, typeof Building2> = {
  "Business Registration": Building2,
  "Tax & Compliance": Receipt,
  "Financial Consultancy": LineChart,
  "ICT Services": Laptop,
  "Branding": Printer,
  "Website Development": Globe,
};

const projects: { title: string; category: Exclude<Category, "All">; blurb: string }[] = [
  { title: "SME Company Registration", category: "Business Registration", blurb: "End-to-end PACRA setup for a growing retail business." },
  { title: "NGO Compliance Setup", category: "Business Registration", blurb: "Registration and initial compliance for a community NGO." },
  { title: "Monthly Tax Management", category: "Tax & Compliance", blurb: "VAT, PAYE and turnover tax returns for an SME client." },
  { title: "ZRA Smart Invoice Rollout", category: "Tax & Compliance", blurb: "Smart Invoice onboarding and staff training." },
  { title: "Business Plan & Projections", category: "Financial Consultancy", blurb: "Bankable business plan with 5-year financial model." },
  { title: "Cash Flow Advisory", category: "Financial Consultancy", blurb: "Cash flow forecasts and cost control for a hospitality client." },
  { title: "Office Network Setup", category: "ICT Services", blurb: "LAN, Wi-Fi and workstation deployment for a school." },
  { title: "Managed ICT Support", category: "ICT Services", blurb: "Preventive maintenance contract for an SME." },
  { title: "Corporate Branding Suite", category: "Branding", blurb: "Business cards, banners and shop signage refresh." },
  { title: "Vehicle Branding", category: "Branding", blurb: "Full vehicle wrap for a logistics client." },
  { title: "Business Website", category: "Website Development", blurb: "Responsive marketing site with enquiry integration." },
  { title: "Landing Page & SEO", category: "Website Development", blurb: "Campaign landing page with basic SEO setup." },
];

export function Portfolio() {
  const [active, setActive] = useState<Category>("All");
  const filtered = active === "All" ? projects : projects.filter((p) => p.category === active);

  return (
    <section className="bg-surface py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="Portfolio" title="Selected work & case examples" description="A snapshot of the kind of engagements we deliver. Live case studies coming soon." />
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {categories.map((c) => (
            <Button
              key={c}
              size="sm"
              variant={active === c ? "default" : "outline"}
              onClick={() => setActive(c)}
              className={active === c ? "bg-gradient-brand text-primary-foreground" : ""}
            >
              {c}
            </Button>
          ))}
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => {
            const Icon = iconByCat[p.category];
            return (
              <article key={p.title} className="hover-lift overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
                <div className="relative flex h-40 items-center justify-center bg-gradient-brand text-primary-foreground">
                  <Icon className="h-14 w-14 opacity-90" />
                  <span className="absolute right-3 top-3 rounded-full bg-black/20 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider backdrop-blur">
                    {p.category}
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="font-semibold text-foreground">{p.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{p.blurb}</p>
                </div>
              </article>
            );
          })}
        </div>
        {filtered.length === 0 && (
          <div className="mt-10 flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border bg-background p-10 text-center">
            <ImageIcon className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No projects in this category yet.</p>
          </div>
        )}
      </div>
    </section>
  );
}
