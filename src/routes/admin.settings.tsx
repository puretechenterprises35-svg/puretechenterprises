import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  fetchSystemSettings,
  updateSystemSettings,
  uploadBrandingAsset,
  getBrandingSignedUrl,
  type SystemSettings,
  type SystemSettingsUpdate,
} from "@/lib/settings/queries";
import { SUPPORTED_CURRENCIES } from "@/lib/currency";

export const Route = createFileRoute("/admin/settings")({
  component: AdminSettings,
});

type FormState = Partial<SystemSettings>;

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-border bg-card p-6 shadow-soft">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}

function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <Label className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function AdminSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [initial, setInitial] = useState<SystemSettings | null>(null);
  const [form, setForm] = useState<FormState>({});
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [faviconPreview, setFaviconPreview] = useState<string | null>(null);
  const [stampPreview, setStampPreview] = useState<string | null>(null);
  const logoInput = useRef<HTMLInputElement>(null);
  const faviconInput = useRef<HTMLInputElement>(null);
  const stampInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchSystemSettings();
        if (data) {
          setInitial(data);
          setForm(data);
          if (data.logo_url) setLogoPreview(await getBrandingSignedUrl(data.logo_url));
          if (data.favicon_url) setFaviconPreview(await getBrandingSignedUrl(data.favicon_url));
          if (data.stamp_url) setStampPreview(await getBrandingSignedUrl(data.stamp_url));
        }
      } catch (err) {
        toast.error("Failed to load settings", { description: (err as Error).message });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const dirty = useMemo(() => JSON.stringify(form) !== JSON.stringify(initial ?? {}), [form, initial]);

  const set = <K extends keyof SystemSettings>(key: K, value: SystemSettings[K] | null) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleUpload = async (kind: "logo" | "favicon" | "stamp", file: File | undefined) => {
    if (!file) return;
    try {
      const path = await uploadBrandingAsset(kind, file);
      const url = await getBrandingSignedUrl(path);
      if (kind === "logo") {
        set("logo_url", path);
        setLogoPreview(url);
      } else if (kind === "favicon") {
        set("favicon_url", path);
        setFaviconPreview(url);
      } else {
        set("stamp_url", path);
        setStampPreview(url);
      }
      toast.success(`${kind} uploaded`);
    } catch (err) {
      toast.error("Upload failed", { description: (err as Error).message });
    }
  };

  const handleSave = async () => {
    if (!form.company_name?.trim()) {
      toast.error("Company Name is required");
      return;
    }
    setSaving(true);
    try {
      const patch: SystemSettingsUpdate = { ...form };
      delete (patch as { id?: number }).id;
      delete (patch as { created_at?: string }).created_at;
      delete (patch as { updated_at?: string }).updated_at;
      const updated = await updateSystemSettings(patch);
      setInitial(updated);
      setForm(updated);
      toast.success("Settings saved");
    } catch (err) {
      toast.error("Failed to save settings", { description: (err as Error).message });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (initial) setForm(initial);
  };

  if (loading) {
    return (
      <AdminShell title="Settings">
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell title="System Settings">
      <div className="space-y-6 pb-24">
        <Section title="Company Information" description="Legal and identifying details for your organisation.">
          <Field label="Company Name *">
            <Input value={form.company_name ?? ""} onChange={(e) => set("company_name", e.target.value)} />
          </Field>
          <Field label="Trading Name">
            <Input value={form.trading_name ?? ""} onChange={(e) => set("trading_name", e.target.value)} />
          </Field>
          <Field label="Registration Number">
            <Input value={form.registration_number ?? ""} onChange={(e) => set("registration_number", e.target.value)} />
          </Field>
          <Field label="TPIN">
            <Input value={form.tpin ?? ""} onChange={(e) => set("tpin", e.target.value)} />
          </Field>
          <Field label="Company Email">
            <Input type="email" value={form.company_email ?? ""} onChange={(e) => set("company_email", e.target.value)} />
          </Field>
          <Field label="Company Phone">
            <Input value={form.company_phone ?? ""} onChange={(e) => set("company_phone", e.target.value)} />
          </Field>
          <Field label="Alternative Phone">
            <Input value={form.alternative_phone ?? ""} onChange={(e) => set("alternative_phone", e.target.value)} />
          </Field>
          <Field label="Website">
            <Input value={form.website ?? ""} onChange={(e) => set("website", e.target.value)} />
          </Field>
          <Field label="Physical Address" full>
            <Textarea rows={2} value={form.physical_address ?? ""} onChange={(e) => set("physical_address", e.target.value)} />
          </Field>
          <Field label="Postal Address" full>
            <Textarea rows={2} value={form.postal_address ?? ""} onChange={(e) => set("postal_address", e.target.value)} />
          </Field>
          <Field label="City">
            <Input value={form.city ?? ""} onChange={(e) => set("city", e.target.value)} />
          </Field>
          <Field label="Country">
            <Input value={form.country ?? ""} onChange={(e) => set("country", e.target.value)} />
          </Field>
        </Section>

        <Section title="Branding" description="Logos and marks used across the portal and PDFs.">
          {(
            [
              { key: "logo", label: "Company Logo", preview: logoPreview, ref: logoInput },
              { key: "favicon", label: "Favicon", preview: faviconPreview, ref: faviconInput },
              { key: "stamp", label: "Company Stamp", preview: stampPreview, ref: stampInput },
            ] as const
          ).map(({ key, label, preview, ref }) => (
            <div key={key} className="sm:col-span-2 flex flex-col gap-3 rounded-lg border border-border p-4 sm:flex-row sm:items-center">
              <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-muted">
                {preview ? (
                  <img src={preview} alt={label} className="max-h-full max-w-full object-contain" />
                ) : (
                  <span className="text-xs text-muted-foreground">No image</span>
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{label}</p>
                <p className="text-xs text-muted-foreground">PNG, JPG or SVG. Recommended square for favicon.</p>
              </div>
              <input
                ref={ref}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleUpload(key, e.target.files?.[0])}
              />
              <Button type="button" variant="outline" size="sm" onClick={() => ref.current?.click()}>
                <Upload className="mr-2 h-4 w-4" /> Upload
              </Button>
            </div>
          ))}
        </Section>

        <Section title="Regional Settings" description="Locale, currency and formatting defaults.">
          <Field label="Default Country">
            <Input value={form.country ?? ""} onChange={(e) => set("country", e.target.value)} />
          </Field>
          <Field label="Default Currency">
            <Select value={form.default_currency ?? "ZMW"} onValueChange={(v) => set("default_currency", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.values(SUPPORTED_CURRENCIES).map((c) => (
                  <SelectItem key={c.code} value={c.code}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Timezone">
            <Input value={form.timezone ?? ""} onChange={(e) => set("timezone", e.target.value)} />
          </Field>
          <Field label="Date Format">
            <Select value={form.date_format ?? "DD/MM/YYYY"} onValueChange={(v) => set("date_format", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Number Format">
            <Select value={form.number_format ?? "1,234.56"} onValueChange={(v) => set("number_format", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="1,234.56">1,234.56</SelectItem>
                <SelectItem value="1.234,56">1.234,56</SelectItem>
                <SelectItem value="1 234.56">1 234.56</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </Section>

        <Section title="Business Settings" description="Defaults used when creating new quotations, invoices and projects.">
          <Field label="Default VAT Rate (%)">
            <Input type="number" min={0} max={100} step={0.01}
              value={form.default_vat_rate ?? 0}
              onChange={(e) => set("default_vat_rate", Number(e.target.value))} />
          </Field>
          <Field label="Default Quotation Validity (Days)">
            <Input type="number" min={1}
              value={form.default_quotation_validity_days ?? 30}
              onChange={(e) => set("default_quotation_validity_days", Number(e.target.value))} />
          </Field>
          <Field label="Default Invoice Due (Days)">
            <Input type="number" min={0}
              value={form.default_invoice_due_days ?? 14}
              onChange={(e) => set("default_invoice_due_days", Number(e.target.value))} />
          </Field>
          <Field label="Default Project Status">
            <Input value={form.default_project_status ?? ""} onChange={(e) => set("default_project_status", e.target.value)} />
          </Field>
          <Field label="Default Payment Terms" full>
            <Textarea rows={2} value={form.default_payment_terms ?? ""} onChange={(e) => set("default_payment_terms", e.target.value)} />
          </Field>
        </Section>

        <Section title="Document Settings" description="Prefixes used to auto-generate quotation, invoice and project numbers.">
          <Field label="Quotation Prefix">
            <Input value={form.quotation_prefix ?? ""} onChange={(e) => set("quotation_prefix", e.target.value.toUpperCase())} />
          </Field>
          <Field label="Invoice Prefix">
            <Input value={form.invoice_prefix ?? ""} onChange={(e) => set("invoice_prefix", e.target.value.toUpperCase())} />
          </Field>
          <Field label="Project Prefix">
            <Input value={form.project_prefix ?? ""} onChange={(e) => set("project_prefix", e.target.value.toUpperCase())} />
          </Field>
          <div className="sm:col-span-2 rounded-md bg-muted p-3 text-xs text-muted-foreground">
            Preview: <span className="font-mono">{form.quotation_prefix || "PTQ"}-{new Date().getFullYear()}-0001</span>,{" "}
            <span className="font-mono">{form.invoice_prefix || "INV"}-{new Date().getFullYear()}-0001</span>,{" "}
            <span className="font-mono">{form.project_prefix || "PRJ"}-{new Date().getFullYear()}-0001</span>
          </div>
        </Section>

        <Section title="Contact Details" description="Public-facing contact channels.">
          <Field label="Support Email">
            <Input type="email" value={form.support_email ?? ""} onChange={(e) => set("support_email", e.target.value)} />
          </Field>
          <Field label="Sales Email">
            <Input type="email" value={form.sales_email ?? ""} onChange={(e) => set("sales_email", e.target.value)} />
          </Field>
          <Field label="Accounts Email">
            <Input type="email" value={form.accounts_email ?? ""} onChange={(e) => set("accounts_email", e.target.value)} />
          </Field>
          <Field label="Support Phone">
            <Input value={form.support_phone ?? ""} onChange={(e) => set("support_phone", e.target.value)} />
          </Field>
          <Field label="WhatsApp Number (digits only, incl. country code)">
            <Input value={form.whatsapp_number ?? ""} onChange={(e) => set("whatsapp_number", e.target.value.replace(/\D/g, ""))} />
          </Field>
        </Section>

        <Section title="Social Media" description="Links displayed in the footer and public pages.">
          <Field label="Facebook">
            <Input value={form.facebook_url ?? ""} onChange={(e) => set("facebook_url", e.target.value)} placeholder="https://facebook.com/..." />
          </Field>
          <Field label="LinkedIn">
            <Input value={form.linkedin_url ?? ""} onChange={(e) => set("linkedin_url", e.target.value)} placeholder="https://linkedin.com/..." />
          </Field>
          <Field label="Instagram">
            <Input value={form.instagram_url ?? ""} onChange={(e) => set("instagram_url", e.target.value)} placeholder="https://instagram.com/..." />
          </Field>
          <Field label="X (Twitter)">
            <Input value={form.twitter_url ?? ""} onChange={(e) => set("twitter_url", e.target.value)} placeholder="https://x.com/..." />
          </Field>
          <Field label="YouTube">
            <Input value={form.youtube_url ?? ""} onChange={(e) => set("youtube_url", e.target.value)} placeholder="https://youtube.com/..." />
          </Field>
        </Section>
      </div>

      <div className="sticky bottom-0 -mx-4 flex items-center justify-end gap-2 border-t border-border bg-background/95 px-4 py-3 backdrop-blur">
        <span className="mr-auto text-xs text-muted-foreground">
          {dirty ? "Unsaved changes" : "All changes saved"}
        </span>
        <Button variant="outline" onClick={handleReset} disabled={!dirty || saving}>
          Reset Changes
        </Button>
        <Button onClick={handleSave} disabled={!dirty || saving}>
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Settings
        </Button>
      </div>
    </AdminShell>
  );
}
