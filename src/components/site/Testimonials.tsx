import { Quote, Star } from "lucide-react";
import { SectionHeading } from "@/components/site/SectionHeading";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

const testimonials = [
  { quote: "Puretech made our company registration effortless. Fast, professional and reliable.", name: "Client Name", role: "SME Founder" },
  { quote: "Their tax and compliance support has saved us hours every month.", name: "Client Name", role: "Operations Manager" },
  { quote: "Excellent branding work — our shop signage transformed the whole storefront.", name: "Client Name", role: "Retail Owner" },
  { quote: "Reliable ICT support whenever we need it. Highly recommended.", name: "Client Name", role: "School Administrator" },
  { quote: "Professional business plan that helped us secure funding.", name: "Client Name", role: "Entrepreneur" },
];

export function Testimonials() {
  return (
    <section className="bg-background py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="Testimonials" title="What our clients say" description="Placeholder reviews — real client feedback coming soon." />
        <div className="mt-12">
          <Carousel opts={{ align: "start", loop: true }} className="mx-auto max-w-6xl">
            <CarouselContent>
              {testimonials.map((t, i) => (
                <CarouselItem key={i} className="md:basis-1/2 lg:basis-1/3">
                  <article className="hover-lift h-full rounded-2xl border border-border bg-card p-6 shadow-soft">
                    <div className="flex items-center justify-between">
                      <Quote className="h-6 w-6 text-primary" />
                      <div className="flex gap-0.5 text-primary">
                        {Array.from({ length: 5 }).map((_, s) => (
                          <Star key={s} className="h-4 w-4 fill-current" />
                        ))}
                      </div>
                    </div>
                    <p className="mt-4 text-sm italic text-muted-foreground">"{t.quote}"</p>
                    <div className="mt-6 flex items-center gap-3 border-t border-border pt-4">
                      <div className="h-10 w-10 rounded-full bg-gradient-brand" />
                      <div>
                        <div className="text-sm font-semibold text-foreground">{t.name}</div>
                        <div className="text-xs text-muted-foreground">{t.role}</div>
                      </div>
                    </div>
                  </article>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden sm:flex" />
            <CarouselNext className="hidden sm:flex" />
          </Carousel>
        </div>
      </div>
    </section>
  );
}
