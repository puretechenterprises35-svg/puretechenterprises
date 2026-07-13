import { Link } from "@tanstack/react-router";
import { Mail, MapPin, Phone, MessageCircle } from "lucide-react";
import logoAsset from "@/assets/logo.png.asset.json";
import { site, whatsappLink } from "@/lib/site";

export function Footer() {
  return (
    <footer className="border-t border-border bg-secondary text-secondary-foreground">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="rounded-lg bg-white p-3 inline-block">
              <img src={logo} alt={`${site.name} logo`} className="h-10 w-auto" width={200} height={100} />
            </div>
            <p className="mt-4 text-sm text-secondary-foreground/80">{site.slogan}</p>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-secondary-foreground/70">Quick Links</h4>
            <ul className="mt-4 space-y-2 text-sm">
              {[
                { to: "/", label: "Home" },
                { to: "/about", label: "About" },
                { to: "/services", label: "Services" },
                { to: "/quote", label: "Get a Quote" },
                { to: "/contact", label: "Contact" },
              ].map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-secondary-foreground/85 hover:text-primary-glow">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-secondary-foreground/70">Services</h4>
            <ul className="mt-4 space-y-2 text-sm">
              {[
                { to: "/business-registration", label: "Business Registration" },
                { to: "/tax-compliance", label: "Tax & Compliance" },
                { to: "/services", label: "Financial Consultancy" },
                { to: "/printing-branding", label: "Printing & Branding" },
                { to: "/ict-services", label: "ICT Services" },
              ].map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-secondary-foreground/85 hover:text-primary-glow">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-secondary-foreground/70">Contact</h4>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="flex items-start gap-2"><Phone className="mt-0.5 h-4 w-4 text-primary-glow" /> {site.phone}</li>
              <li className="flex items-start gap-2">
                <MessageCircle className="mt-0.5 h-4 w-4 text-primary-glow" />
                <a href={whatsappLink()} target="_blank" rel="noopener" className="hover:text-primary-glow">WhatsApp us</a>
              </li>
              <li className="flex items-start gap-2"><Mail className="mt-0.5 h-4 w-4 text-primary-glow" /> {site.email}</li>
              <li className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 text-primary-glow" /> {site.location}</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 text-center text-xs text-secondary-foreground/70">
          © 2026 {site.name}. All Rights Reserved.
        </div>
      </div>
    </footer>
  );
}
