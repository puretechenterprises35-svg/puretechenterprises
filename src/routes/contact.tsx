import { createFileRoute } from "@tanstack/react-router";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { site, whatsappLink } from "@/lib/site";
import { QuoteForm } from "@/components/site/QuoteForm";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Puretech Enterprises | Zambia Business Solutions" },
      { name: "description", content: "Get in touch with Puretech Enterprises for business registration, tax, compliance, ICT, printing and branding services in Zambia." },
      { property: "og:title", content: "Contact Puretech Enterprises" },
      { property: "og:url", content: "/contact" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  component: Contact,
});

function Contact() {
  const cards = [
    { icon: Phone, label: "Phone", value: site.phone, href: `tel:${site.phone.replace(/\s/g, "")}` },
    { icon: MessageCircle, label: "WhatsApp", value: "Chat on WhatsApp", href: whatsappLink() },
    { icon: Mail, label: "Email", value: site.email, href: `mailto:${site.email}` },
    { icon: MapPin, label: "Location", value: site.location },
  ];
  return (
    <div className="bg-background">
      <section className="border-b border-border bg-surface py-14">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <div className="mb-3 inline-flex rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">Contact Us</div>
          <h1 className="text-4xl font-extrabold sm:text-5xl">Let's talk about your business</h1>
          <p className="mt-4 text-muted-foreground">Send us a message or reach us directly — we're happy to help.</p>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-card sm:p-8">
              <h2 className="text-xl font-semibold">Send us a message</h2>
              <p className="mt-1 text-sm text-muted-foreground">Fill in your details and we'll get back to you.</p>
              <div className="mt-6"><QuoteForm /></div>
            </div>
          </div>
          <div className="lg:col-span-2">
            <div className="grid gap-4">
              {cards.map((c) => (
                <a
                  key={c.label}
                  href={c.href}
                  target={c.href?.startsWith("http") ? "_blank" : undefined}
                  rel="noopener"
                  className="group flex items-start gap-4 rounded-2xl border border-border bg-card p-5 shadow-soft hover-lift"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground">
                    <c.icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{c.label}</div>
                    <div className="truncate text-sm font-medium">{c.value}</div>
                  </div>
                </a>
              ))}
              <a href={whatsappLink()} target="_blank" rel="noopener">
                <Button size="lg" className="w-full bg-[oklch(0.7_0.17_152)] text-white hover:opacity-95">
                  <MessageCircle className="mr-2 h-5 w-5" /> Chat on WhatsApp
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
