import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { SectionHeading } from "@/components/site/SectionHeading";
import { faqs, type FaqCategory } from "@/lib/site";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const categories: (FaqCategory | "All")[] = [
  "All",
  "Business Registration",
  "Tax Services",
  "ICT Services",
  "Branding",
  "Consultancy",
  "Payments",
  "Turnaround Times",
];

export function Faq() {
  const [active, setActive] = useState<(typeof categories)[number]>("All");
  const filtered = active === "All" ? faqs : faqs.filter((f) => f.category === active);

  return (
    <section className="bg-surface py-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="FAQ" title="Frequently Asked Questions" description="Quick answers to common enquiries from clients." />
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
        <Accordion type="single" collapsible className="mt-8 rounded-2xl border border-border bg-card px-6 shadow-soft">
          {filtered.map((f, i) => (
            <AccordionItem key={`${f.category}-${i}`} value={`item-${i}`}>
              <AccordionTrigger className="text-left text-base font-semibold">{f.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
