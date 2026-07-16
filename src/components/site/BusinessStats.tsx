import { Users, Briefcase, Building2, Star } from "lucide-react";

const stats = [
  { icon: Briefcase, value: "8+", label: "Service lines" },
  { icon: Users, value: "100+", label: "Clients supported" },
  { icon: Building2, value: "10", label: "Industries served" },
  { icon: Star, value: "5★", label: "Service standard" },
];

export function BusinessStats() {
  return (
    <section className="bg-surface py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-2xl border border-border bg-card p-6 text-center shadow-soft">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <s.icon className="h-6 w-6" />
              </div>
              <div className="mt-4 text-3xl font-extrabold text-foreground">{s.value}</div>
              <div className="mt-1 text-sm text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
