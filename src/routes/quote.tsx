import { createFileRoute } from "@tanstack/react-router";
import { QuoteForm } from "@/components/site/QuoteForm";

export const Route = createFileRoute("/quote")({
  head: () => ({
    meta: [
      { title: "Request a Quote | Puretech Enterprises" },
      { name: "description", content: "Request a fast, no-obligation quote from Puretech Enterprises for business, compliance, ICT, printing and branding services." },
      { property: "og:title", content: "Request a Quote | Puretech Enterprises" },
      { property: "og:url", content: "/quote" },
    ],
    links: [{ rel: "canonical", href: "/quote" }],
  }),
  component: Quote,
});

function Quote() {
  return (
    <div className="bg-background">
      <section className="border-b border-border bg-surface py-14">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <div className="mb-3 inline-flex rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">Get a Quote</div>
          <h1 className="text-4xl font-extrabold sm:text-5xl">Tell us what you need</h1>
          <p className="mt-4 text-muted-foreground">Share a few details and we'll come back with a clear, tailored quotation.</p>
        </div>
      </section>
      <section className="py-14">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-card sm:p-8">
            <QuoteForm />
          </div>
        </div>
      </section>
    </div>
  );
}
