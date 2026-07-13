import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { SectionHeading } from "@/components/site/SectionHeading";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us | Puretech Enterprises" },
      { name: "description", content: "Puretech Enterprises is a Zambian business solutions partner delivering compliance, ICT, printing, branding and financial consultancy." },
      { property: "og:title", content: "About Puretech Enterprises" },
      { property: "og:url", content: "/about" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: About,
});

function About() {
  return (
    <div className="bg-background">
      <section className="border-b border-border bg-surface py-16">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <div className="mb-3 inline-flex rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">About Puretech</div>
          <h1 className="text-4xl font-extrabold sm:text-5xl">Your reliable business solutions partner</h1>
          <p className="mt-5 text-lg text-muted-foreground">
            Puretech Enterprises provides professional business support, compliance, financial consultancy, ICT, printing and branding solutions to businesses, entrepreneurs and organisations in Zambia.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 sm:px-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-8 shadow-card">
            <div className="text-xs font-semibold uppercase tracking-wider text-primary">Mission</div>
            <p className="mt-3 text-foreground/90">To provide quality, innovative and reliable business solutions that simplify operations and support sustainable business growth.</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-8 shadow-card">
            <div className="text-xs font-semibold uppercase tracking-wider text-primary">Vision</div>
            <p className="mt-3 text-foreground/90">To become a trusted and leading provider of integrated business, technology and professional support solutions in Zambia.</p>
          </div>
        </div>
      </section>

      <section className="bg-surface py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionHeading eyebrow="What we stand for" title="Our Core Values" />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {["Quality", "Integrity", "Reliability", "Innovation", "Professionalism", "Customer Focus"].map((v) => (
              <div key={v} className="flex items-center gap-3 rounded-xl border border-border bg-card p-5 hover-lift">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span className="font-medium">{v}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
