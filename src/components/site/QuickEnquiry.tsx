import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/site/SectionHeading";
import { quickEnquiries, whatsappServiceLink } from "@/lib/site";
import { Building2, Receipt, ShieldCheck, FileCheck2, LineChart, Wallet, Printer, Laptop, MessageCircle } from "lucide-react";

const iconMap = { Building2, Receipt, ShieldCheck, FileCheck2, LineChart, Wallet, Printer, Laptop } as const;

export function QuickEnquiry() {
  return (
    <section className="bg-surface py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Need a Business Service?"
          title="Quick enquiry — pick a service"
          description="Select the service you need and contact Puretech Enterprises for professional assistance."
        />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickEnquiries.map((q) => {
            const Icon = iconMap[q.icon as keyof typeof iconMap] ?? Building2;
            return (
              <div key={q.label} className="flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-soft hover-lift">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm font-semibold leading-tight">{q.label}</h3>
                </div>
                <a href={whatsappServiceLink(q.label)} target="_blank" rel="noopener" className="mt-4 block">
                  <Button size="sm" className="w-full bg-gradient-brand text-primary-foreground hover:opacity-95">
                    <MessageCircle className="mr-1.5 h-4 w-4" /> Enquire Now
                  </Button>
                </a>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
