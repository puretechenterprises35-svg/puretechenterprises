import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { services, site, whatsappLink } from "@/lib/site";
import { toast } from "sonner";

export function QuoteForm() {
  const [submitting, setSubmitting] = useState(false);

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
      "",
      `${fd.get("message")}`,
    ].join("\n");
    window.open(whatsappLink(message), "_blank", "noopener");
    toast.success("Opening WhatsApp with your enquiry…");
    setSubmitting(false);
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

      <div className="grid gap-2">
        <Label htmlFor="service">Select Service</Label>
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
        <Label htmlFor="message">Message</Label>
        <Textarea id="message" name="message" required rows={5} placeholder="Tell us what you need…" />
      </div>

      <Button
        type="submit"
        disabled={submitting}
        className="bg-gradient-brand text-primary-foreground shadow-soft hover:opacity-95"
        size="lg"
      >
        {submitting ? "Sending…" : "Send via WhatsApp"}
      </Button>
      <p className="text-xs text-muted-foreground">
        Your enquiry opens in WhatsApp so we can reply quickly.
      </p>
    </form>
  );
}
