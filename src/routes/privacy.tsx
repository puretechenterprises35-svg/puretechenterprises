import { createFileRoute } from "@tanstack/react-router";
import { site } from "@/lib/site";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy | Puretech Enterprises" },
      { name: "description", content: "How Puretech Enterprises collects, uses and protects your information." },
      { property: "og:title", content: "Privacy Policy | Puretech Enterprises" },
      { property: "og:description", content: "How we handle your data at Puretech Enterprises." },
    ],
    links: [{ rel: "canonical", href: "/privacy" }],
  }),
  component: Privacy,
});

function Privacy() {
  return (
    <div className="bg-background">
      <section className="border-b border-border bg-surface py-14">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <div className="mb-3 inline-flex rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">Legal</div>
          <h1 className="text-4xl font-extrabold sm:text-5xl">Privacy Policy</h1>
          <p className="mt-4 text-muted-foreground">Last updated: {new Date().toLocaleDateString("en-GB", { year: "numeric", month: "long" })}</p>
        </div>
      </section>
      <section className="py-14">
        <div className="mx-auto max-w-3xl space-y-6 px-4 text-sm leading-relaxed text-foreground/85 sm:px-6">
          <p>This Privacy Policy is maintained by {site.name} to explain how we collect, use and protect information you share with us through this website and our services.</p>
          <h2 className="text-xl font-semibold text-foreground">Information we collect</h2>
          <p>We collect information you provide when you contact us, request a quote or engage our services — for example your name, company, phone number, email address and details of your enquiry.</p>
          <h2 className="text-xl font-semibold text-foreground">How we use your information</h2>
          <p>We use your information to respond to enquiries, provide quotations, deliver services you have requested and communicate with you about your engagement.</p>
          <h2 className="text-xl font-semibold text-foreground">Sharing of information</h2>
          <p>We do not sell your personal information. We may share information with statutory bodies (such as PACRA, ZRA, NAPSA, NHIMA) strictly as required to deliver the services you have engaged us for.</p>
          <h2 className="text-xl font-semibold text-foreground">Data retention</h2>
          <p>We retain client information for as long as necessary to provide services and comply with legal, regulatory and accounting obligations.</p>
          <h2 className="text-xl font-semibold text-foreground">Your rights</h2>
          <p>You may request access to, correction of, or deletion of your personal information by contacting us at {site.email}.</p>
          <h2 className="text-xl font-semibold text-foreground">Contact us</h2>
          <p>For any privacy questions, contact {site.name} at {site.email} or {site.phone}.</p>
        </div>
      </section>
    </div>
  );
}
