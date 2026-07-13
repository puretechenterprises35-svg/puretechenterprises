import { Quote } from "lucide-react";
import { SectionHeading } from "@/components/site/SectionHeading";

export function Testimonials() {
  return (
    <section className="bg-background py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="Testimonials" title="What our clients say" />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <article key={i} className="rounded-2xl border border-border bg-card p-6 shadow-soft hover-lift">
              <Quote className="h-6 w-6 text-primary" />
              <p className="mt-4 text-sm italic text-muted-foreground">
                "Client testimonial will be added here."
              </p>
              <div className="mt-6 flex items-center gap-3 border-t border-border pt-4">
                <div className="h-10 w-10 rounded-full bg-primary/10" />
                <div>
                  <div className="text-sm font-semibold text-foreground">Client Name</div>
                  <div className="text-xs text-muted-foreground">Company / Role</div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
