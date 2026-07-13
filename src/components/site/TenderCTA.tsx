import { Button } from "@/components/ui/button";
import { FileCheck2, MessageCircle } from "lucide-react";
import { whatsappServiceLink } from "@/lib/site";

export function TenderCTA() {
  return (
    <section className="bg-secondary py-20 text-secondary-foreground">
      <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
        <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary-glow">
          <FileCheck2 className="h-3.5 w-3.5" /> Tender Support
        </div>
        <h2 className="mt-4 text-3xl font-bold sm:text-4xl">Need help with tender documents?</h2>
        <p className="mx-auto mt-4 max-w-2xl text-secondary-foreground/85">
          Puretech Enterprises provides tender support, document preparation and business compliance assistance to help businesses prepare professional submissions.
        </p>
        <div className="mt-8">
          <a href={whatsappServiceLink("Tender Support and document preparation")} target="_blank" rel="noopener">
            <Button size="lg" className="bg-gradient-brand text-primary-foreground shadow-elevated">
              <MessageCircle className="mr-1.5 h-4 w-4" /> Get Tender Support
            </Button>
          </a>
        </div>
      </div>
    </section>
  );
}
