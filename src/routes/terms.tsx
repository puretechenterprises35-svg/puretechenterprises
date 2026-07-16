import { createFileRoute } from "@tanstack/react-router";
import { site } from "@/lib/site";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms & Conditions | Puretech Enterprises" },
      { name: "description", content: "Terms and conditions governing the use of Puretech Enterprises services and website." },
      { property: "og:title", content: "Terms & Conditions | Puretech Enterprises" },
      { property: "og:description", content: "Terms of service for Puretech Enterprises." },
    ],
    links: [{ rel: "canonical", href: "/terms" }],
  }),
  component: Terms,
});

function Terms() {
  return (
    <div className="bg-background">
      <section className="border-b border-border bg-surface py-14">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <div className="mb-3 inline-flex rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">Legal</div>
          <h1 className="text-4xl font-extrabold sm:text-5xl">Terms & Conditions</h1>
          <p className="mt-4 text-muted-foreground">Last updated: {new Date().toLocaleDateString("en-GB", { year: "numeric", month: "long" })}</p>
        </div>
      </section>
      <section className="py-14">
        <div className="mx-auto max-w-3xl space-y-6 px-4 text-sm leading-relaxed text-foreground/85 sm:px-6">
          <p>These Terms & Conditions govern your use of the {site.name} website and services. By using our website or engaging our services, you agree to these terms.</p>
          <h2 className="text-xl font-semibold text-foreground">Services</h2>
          <p>{site.name} provides business registration, tax, compliance, financial consultancy, printing, branding and ICT services. The specific scope of each engagement is confirmed in a written quotation.</p>
          <h2 className="text-xl font-semibold text-foreground">Quotations & pricing</h2>
          <p>Quotations are valid for the period stated. Final pricing depends on project scope, statutory fees, third-party charges, and specific client requirements. Payment terms are stated on the quotation.</p>
          <h2 className="text-xl font-semibold text-foreground">Client responsibilities</h2>
          <p>Clients agree to provide accurate information and any documents required to deliver the engaged services in a timely manner.</p>
          <h2 className="text-xl font-semibold text-foreground">Statutory bodies</h2>
          <p>Where a service involves a statutory body (e.g. PACRA, ZRA, NAPSA, NHIMA), turnaround times and outcomes are subject to that body's processes, which are outside our control.</p>
          <h2 className="text-xl font-semibold text-foreground">Confidentiality</h2>
          <p>We treat all client information as confidential and use it only to deliver the services engaged.</p>
          <h2 className="text-xl font-semibold text-foreground">Limitation of liability</h2>
          <p>To the extent permitted by law, {site.name} is not liable for indirect or consequential losses arising from use of our website or services.</p>
          <h2 className="text-xl font-semibold text-foreground">Contact</h2>
          <p>Questions about these terms can be sent to {site.email} or {site.phone}.</p>
        </div>
      </section>
    </div>
  );
}
