import { Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CategoryPage({
  eyebrow,
  title,
  intro,
  Icon,
  categories,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  Icon: LucideIcon;
  categories: { title: string; short?: string; items: string[] }[];
}) {
  return (
    <div className="bg-background">
      <section className="border-b border-border bg-secondary py-16 text-secondary-foreground">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="flex items-start gap-5">
            <div className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-brand text-primary-foreground shadow-elevated sm:flex">
              <Icon className="h-7 w-7" />
            </div>
            <div>
              <div className="mb-2 inline-flex rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary-glow">{eyebrow}</div>
              <h1 className="text-4xl font-extrabold sm:text-5xl">{title}</h1>
              <p className="mt-4 max-w-2xl text-secondary-foreground/85">{intro}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid gap-6 md:grid-cols-2">
            {categories.map((c) => (
              <div key={c.title} className="rounded-2xl border border-border bg-card p-6 shadow-card hover-lift">
                <h2 className="text-xl font-semibold">{c.title}</h2>
                {c.short && <p className="mt-2 text-sm text-muted-foreground">{c.short}</p>}
                <ul className="mt-4 grid gap-2 text-sm text-foreground/90">
                  {c.items.map((it) => (
                    <li key={it} className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" /> {it}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-12 flex flex-wrap justify-center gap-3">
            <Link to="/quote"><Button size="lg" className="bg-gradient-brand text-primary-foreground">Get a Quote <ArrowRight className="ml-1 h-4 w-4" /></Button></Link>
            <Link to="/contact"><Button size="lg" variant="outline">Contact Us</Button></Link>
          </div>
        </div>
      </section>
    </div>
  );
}
