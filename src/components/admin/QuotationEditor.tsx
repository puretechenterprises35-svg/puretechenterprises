import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  QUOTATION_STATUSES,
  formatMoney,
  type QuotationInput,
  type QuotationItem,
  type QuotationStatus,
} from "@/lib/portal/quotations";

export type EditorValue = Omit<QuotationInput, "client_id" | "enquiry_id">;

const emptyItem: QuotationItem = {
  description: "",
  quantity: 1,
  unit_price: 0,
  total: 0,
  sort_order: 0,
};

export function QuotationEditor({
  initial,
  onSubmit,
  submitting,
  submitLabel = "Save Quotation",
}: {
  initial?: Partial<EditorValue>;
  onSubmit: (v: EditorValue) => void;
  submitting?: boolean;
  submitLabel?: string;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [currency, setCurrency] = useState(initial?.currency ?? "KES");
  const [taxRate, setTaxRate] = useState<number>(initial?.tax_rate ?? 16);
  const [status, setStatus] = useState<QuotationStatus>(initial?.status ?? "Draft");
  const [validUntil, setValidUntil] = useState(initial?.valid_until ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [terms, setTerms] = useState(
    initial?.terms ?? "50% deposit required to commence work. Balance on delivery."
  );
  const [items, setItems] = useState<QuotationItem[]>(
    initial?.items && initial.items.length ? initial.items : [{ ...emptyItem }]
  );

  const totals = useMemo(() => {
    const subtotal = items.reduce(
      (s, i) => s + Number(i.quantity || 0) * Number(i.unit_price || 0),
      0
    );
    const tax = subtotal * (Number(taxRate) || 0) / 100;
    return { subtotal, tax, total: subtotal + tax };
  }, [items, taxRate]);

  const updateItem = (idx: number, patch: Partial<QuotationItem>) => {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  };

  const submit = () => {
    if (!title.trim()) return;
    const cleanItems = items
      .filter((i) => i.description.trim())
      .map((i, idx) => ({
        ...i,
        sort_order: idx,
        quantity: Number(i.quantity) || 0,
        unit_price: Number(i.unit_price) || 0,
        total: (Number(i.quantity) || 0) * (Number(i.unit_price) || 0),
      }));
    onSubmit({
      title: title.trim(),
      description: description || null,
      currency,
      tax_rate: Number(taxRate) || 0,
      status,
      valid_until: validUntil || null,
      notes: notes || null,
      terms: terms || null,
      items: cleanItems,
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 rounded-xl border border-border bg-card p-6 shadow-soft sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label htmlFor="q-title">Title *</Label>
          <Input
            id="q-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Corporate Website Redesign"
          />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="q-desc">Description</Label>
          <Textarea
            id="q-desc"
            rows={3}
            value={description ?? ""}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="q-currency">Currency</Label>
          <Input
            id="q-currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value.toUpperCase())}
          />
        </div>
        <div>
          <Label htmlFor="q-tax">Tax rate (%)</Label>
          <Input
            id="q-tax"
            type="number"
            step="0.01"
            value={taxRate}
            onChange={(e) => setTaxRate(Number(e.target.value))}
          />
        </div>
        <div>
          <Label htmlFor="q-valid">Valid until</Label>
          <Input
            id="q-valid"
            type="date"
            value={validUntil ?? ""}
            onChange={(e) => setValidUntil(e.target.value)}
          />
        </div>
        <div>
          <Label>Status</Label>
          <Select value={status} onValueChange={(v) => setStatus(v as QuotationStatus)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {QUOTATION_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 shadow-soft">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold">Line Items</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setItems((p) => [...p, { ...emptyItem }])}
          >
            <Plus className="mr-1 h-4 w-4" /> Add item
          </Button>
        </div>
        <div className="space-y-2">
          {items.map((it, i) => (
            <div
              key={i}
              className="grid grid-cols-12 gap-2 rounded-md border border-border bg-background p-2"
            >
              <Input
                className="col-span-12 sm:col-span-6"
                placeholder="Description"
                value={it.description}
                onChange={(e) => updateItem(i, { description: e.target.value })}
              />
              <Input
                className="col-span-4 sm:col-span-2"
                type="number"
                step="0.01"
                placeholder="Qty"
                value={it.quantity}
                onChange={(e) => updateItem(i, { quantity: Number(e.target.value) })}
              />
              <Input
                className="col-span-4 sm:col-span-2"
                type="number"
                step="0.01"
                placeholder="Unit price"
                value={it.unit_price}
                onChange={(e) => updateItem(i, { unit_price: Number(e.target.value) })}
              />
              <div className="col-span-3 sm:col-span-1 flex items-center justify-end text-sm font-medium">
                {(Number(it.quantity) || 0) * (Number(it.unit_price) || 0)}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="col-span-1"
                onClick={() => setItems((p) => p.filter((_, idx) => idx !== i))}
                aria-label="Remove item"
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>

        <div className="mt-4 flex justify-end">
          <div className="w-full max-w-xs space-y-1 text-sm">
            <Row label="Subtotal" value={formatMoney(totals.subtotal, currency)} />
            <Row label={`Tax (${taxRate}%)`} value={formatMoney(totals.tax, currency)} />
            <Row label="Total" value={formatMoney(totals.total, currency)} bold />
          </div>
        </div>
      </div>

      <div className="grid gap-4 rounded-xl border border-border bg-card p-6 shadow-soft sm:grid-cols-2">
        <div>
          <Label htmlFor="q-notes">Notes (visible to client)</Label>
          <Textarea
            id="q-notes"
            rows={4}
            value={notes ?? ""}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="q-terms">Terms &amp; Conditions</Label>
          <Textarea
            id="q-terms"
            rows={4}
            value={terms ?? ""}
            onChange={(e) => setTerms(e.target.value)}
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={submit} disabled={submitting || !title.trim()}>
          {submitting ? "Saving…" : submitLabel}
        </Button>
      </div>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between ${bold ? "border-t border-border pt-1 font-semibold" : ""}`}>
      <span className="text-muted-foreground">{label}</span>
      <span>{value}</span>
    </div>
  );
}
