import { PhoneCall, ClipboardList, FileText, CreditCard, Cog, PackageCheck } from "lucide-react";

const steps = [
  { n: "01", icon: PhoneCall, title: "Consultation", body: "Free initial discussion to understand your needs." },
  { n: "02", icon: ClipboardList, title: "Requirements Gathering", body: "We clarify scope, documents and expectations." },
  { n: "03", icon: FileText, title: "Quotation", body: "Clear, itemised quotation with turnaround time." },
  { n: "04", icon: CreditCard, title: "Payment & Approval", body: "Simple payment options and written approval." },
  { n: "05", icon: Cog, title: "Service Delivery", body: "We execute the work professionally end-to-end." },
  { n: "06", icon: PackageCheck, title: "Completion & Support", body: "Handover, follow-up and continued support." },
];

export function ProcessTimeline() {
  return (
    <section className="bg-secondary py-20 text-secondary-foreground">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-3 inline-flex items-center rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary-glow">
            Our Process
          </div>
          <h2 className="text-3xl font-bold sm:text-4xl">A simple, transparent journey</h2>
          <p className="mt-4 text-secondary-foreground/80">Six clear steps from first contact to project completion.</p>
        </div>

        {/* Desktop horizontal timeline */}
        <div className="relative mt-14 hidden lg:block">
          <div className="absolute left-0 right-0 top-6 h-px bg-white/15" />
          <ol className="relative grid grid-cols-6 gap-4">
            {steps.map((s) => (
              <li key={s.n} className="flex flex-col items-center text-center">
                <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-brand text-primary-foreground shadow-elevated">
                  <s.icon className="h-5 w-5" />
                </div>
                <div className="mt-4 text-xs font-bold tracking-wider text-primary-glow">{s.n}</div>
                <h3 className="mt-1 font-semibold">{s.title}</h3>
                <p className="mt-2 text-xs text-secondary-foreground/75">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>

        {/* Mobile / tablet vertical timeline */}
        <ol className="relative mt-12 space-y-6 lg:hidden">
          <div className="absolute left-6 top-2 bottom-2 w-px bg-white/15" aria-hidden />
          {steps.map((s) => (
            <li key={s.n} className="relative flex gap-4 pl-2">
              <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-brand text-primary-foreground shadow-elevated">
                <s.icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                <div className="text-[11px] font-bold tracking-wider text-primary-glow">{s.n}</div>
                <h3 className="mt-0.5 font-semibold">{s.title}</h3>
                <p className="mt-1 text-sm text-secondary-foreground/80">{s.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
