import { Rocket, Building2, HeartHandshake, GraduationCap, Church, Landmark, UtensilsCrossed, Factory, Stethoscope, ShoppingBag } from "lucide-react";
import { SectionHeading } from "@/components/site/SectionHeading";

const industries = [
  { icon: Rocket, label: "Startups" },
  { icon: Building2, label: "SMEs" },
  { icon: HeartHandshake, label: "NGOs" },
  { icon: GraduationCap, label: "Schools" },
  { icon: Church, label: "Churches" },
  { icon: Landmark, label: "Government" },
  { icon: UtensilsCrossed, label: "Hospitality" },
  { icon: Factory, label: "Manufacturing" },
  { icon: Stethoscope, label: "Healthcare" },
  { icon: ShoppingBag, label: "Retail" },
];

export function Industries() {
  return (
    <section className="bg-background py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="Industries We Serve" title="Trusted across sectors in Zambia" description="Practical support for organisations of every size and shape." />
        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {industries.map((i) => (
            <div key={i.label} className="hover-lift group flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-5 text-center shadow-soft">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-gradient-brand group-hover:text-primary-foreground">
                <i.icon className="h-6 w-6" />
              </div>
              <div className="text-sm font-semibold text-foreground">{i.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
