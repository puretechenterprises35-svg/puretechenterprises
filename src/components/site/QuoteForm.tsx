import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { services, site, whatsappLink } from "@/lib/site";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";

const budgetOptions = [
  "Under ZMW 1,000",
  "ZMW 1,000 – 5,000",
  "ZMW 5,000 – 15,000",
  "ZMW 15,000 – 50,000",
  "Above ZMW 50,000",
  "Not sure yet",
];

export function QuoteForm() {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    const message = [
      `Hello ${site.name},`,
      "",
      `Name: ${fd.get("name")}`,
      `Company: ${fd.get("company") || "-"}`,
      `Phone: ${fd.get("phone")}`,
      `Email: ${fd.get("email")}`,
      `Service: ${fd.get("service")}`,
      `Budget: ${fd.get("budget") || "-"}`,
      `Preferred completion date: ${fd.get("preferred_date") || "-"}`,
      "",
      "Requirements:",
      `${fd.get("message")}`,
    ].join("\n");
    window.open(whatsappLink(message), "_blank", "noopener");
    toast.success("Opening WhatsApp with your enquiry…");
    setSubmitting(false);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-primary/20 bg-primary/5 p-8 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-brand text-primary-foreground shadow-elevated">
          <CheckCircle2 className="h-7 w-7" />
        </div>
        <h3 className="text-xl font-semibold">Thank you — your enquiry is on its way!</h3>
        <p className="max-w-md text-sm text-muted-foreground">
          We've opened WhatsApp so you can send your details directly to our team. We'll respond as soon as possible with a tailored quotation.
        </p>
        <Button variant="outline" onClick={() => setSubmitted(false)}>Send another enquiry</Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="name">Full Name</Label>
          <Input id="name" name="name" required placeholder="Your full name" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="company">Company Name</Label>
          <Input id="company" name="company" placeholder="Optional" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input id="phone" name="phone" required type="tel" placeholder="+260 …" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email">Email Address</Label>
          <Input id="email" name="email" required type="email" placeholder="you@example.com" />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="service">Service Required</Label>
          <select
            id="service"
            name="service"
            required
            defaultValue=""
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="" disabled>Choose a service…</option>
            {services.map((s) => (
              <option key={s.slug} value={s.title}>{s.title}</option>
            ))}
            <option value="Other">Other</option>
          </select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="budget">Budget Range</Label>
          <select
            id="budget"
            name="budget"
            defaultValue=""
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">Select a range (optional)</option>
            {budgetOptions.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="preferred_date">Preferred Completion Date</Label>
        <Input id="preferred_date" name="preferred_date" type="date" />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="message">Detailed Requirements</Label>
        <Textarea id="message" name="message" required rows={5} placeholder="Tell us what you need — scope, quantities, deadlines, etc." />
      </div>

      <Button
        type="submit"
        disabled={submitting}
        className="bg-gradient-brand text-primary-foreground shadow-soft hover:opacity-95"
        size="lg"
      >
        {submitting ? "Sending…" : "Send Enquiry via WhatsApp"}
      </Button>
      <p className="text-xs text-muted-foreground">
        Your enquiry opens in WhatsApp so we can reply quickly. To attach files, please share them directly in the WhatsApp chat after sending.
      </p>
    </form>
  );
}
