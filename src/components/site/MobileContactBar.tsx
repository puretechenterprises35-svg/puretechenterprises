import { Link } from "@tanstack/react-router";
import { Phone, MessageCircle, FileText } from "lucide-react";
import { site, telLink, whatsappLink } from "@/lib/site";

export function MobileContactBar() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/95 backdrop-blur shadow-[0_-6px_20px_-10px_rgba(0,0,0,0.25)] md:hidden">
      <div className="grid grid-cols-3 text-center">
        <a
          href={telLink}
          aria-label={`Call ${site.name}`}
          className="flex flex-col items-center gap-1 py-2.5 text-xs font-semibold text-foreground hover:bg-accent"
        >
          <Phone className="h-4 w-4 text-primary" /> Call Us
        </a>
        <a
          href={whatsappLink()}
          target="_blank"
          rel="noopener"
          aria-label={`WhatsApp ${site.name}`}
          className="flex flex-col items-center gap-1 border-x border-border py-2.5 text-xs font-semibold text-foreground hover:bg-accent"
        >
          <MessageCircle className="h-4 w-4 text-[oklch(0.7_0.17_152)]" /> WhatsApp
        </a>
        <Link
          to="/quote"
          className="flex flex-col items-center gap-1 py-2.5 text-xs font-semibold text-primary hover:bg-accent"
        >
          <FileText className="h-4 w-4" /> Get a Quote
        </Link>
      </div>
    </div>
  );
}
