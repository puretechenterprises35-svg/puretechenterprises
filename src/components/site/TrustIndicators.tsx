import { ShieldCheck, Clock, Users, Award } from "lucide-react";

const items = [
  { icon: ShieldCheck, label: "Registered & Compliant" },
  { icon: Clock, label: "Fast Turnaround" },
  { icon: Users, label: "Client Focused" },
  { icon: Award, label: "Quality Guaranteed" },
];

export function TrustIndicators() {
  return (
    <section aria-label="Trust indicators" className="border-b border-border bg-surface">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-4 py-6 sm:grid-cols-4 sm:px-6 lg:px-8">
        {items.map((i) => (
          <div key={i.label} className="flex items-center justify-center gap-2 text-sm font-medium text-foreground/80">
            <i.icon className="h-5 w-5 text-primary" />
            <span>{i.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
