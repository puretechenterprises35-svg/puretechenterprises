import { FileText, BookOpen, ClipboardList, ShieldCheck, Laptop, Download } from "lucide-react";
import { SectionHeading } from "@/components/site/SectionHeading";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const resources = [
  { icon: FileText, title: "Company Profile", desc: "Overview of Puretech Enterprises and our capabilities." },
  { icon: BookOpen, title: "Service Catalogue", desc: "Full list of services and package inclusions." },
  { icon: ClipboardList, title: "Business Registration Guide", desc: "Step-by-step PACRA registration walkthrough." },
  { icon: ShieldCheck, title: "Tax Compliance Guide", desc: "ZRA, VAT, PAYE and turnover tax essentials." },
  { icon: Laptop, title: "ICT Maintenance Guide", desc: "Practical tips to keep your office ICT healthy." },
];

export function Resources() {
  return (
    <section className="bg-background py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="Resources" title="Guides & downloads" description="Helpful documents to support your business decisions. New resources published regularly." />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {resources.map((r) => (
            <article key={r.title} className="hover-lift flex flex-col rounded-2xl border border-border bg-card p-6 shadow-soft">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <r.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-semibold text-foreground">{r.title}</h3>
              <p className="mt-2 flex-1 text-sm text-muted-foreground">{r.desc}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-5 w-fit"
                onClick={() => toast.info("This resource will be available soon.")}
              >
                <Download className="mr-1.5 h-4 w-4" /> Download
              </Button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
