import { PackageCheck, Laptop, Zap, Wallet, ShieldCheck, HeartHandshake } from "lucide-react";
import { SectionHeading } from "@/components/site/SectionHeading";

const items = [
  { icon: PackageCheck, title: "Reliable Business Solutions", body: "Dependable end-to-end support across compliance, finance and operations." },
  { icon: Laptop, title: "ICT & Technology Expertise", body: "Practical technology solutions to keep your business running smoothly." },
  { icon: Zap, title: "Fast Turnaround", body: "Timely delivery with clear timelines and proactive communication." },
  { icon: Wallet, title: "Affordable Pricing", body: "Transparent packages designed for startups, SMEs and organisations." },
  { icon: ShieldCheck, title: "Compliance & Regulatory Support", body: "Stay compliant with PACRA, ZRA, NAPSA and NHIMA obligations." },
  { icon: HeartHandshake, title: "Customer Satisfaction", body: "Personalised support and long-term partnerships with every client." },
];

export function WhyChoose() {
  return (
    <section className="bg-background py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Why Puretech"
          title="Why choose Puretech Enterprises"
          description="A dependable partner for growing businesses in Zambia."
        />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((f) => (
            <div key={f.title} className="hover-lift rounded-2xl border border-border bg-card p-6 shadow-soft">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-gradient-brand text-primary-foreground">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-semibold text-foreground">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
