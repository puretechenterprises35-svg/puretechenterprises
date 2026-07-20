import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  QUOTATION_STATUSES,
  computeTotals,
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
  discount: 0,
  total: 0,
  sort_order: 0,
};

export function QuotationEditor({
  initial,
  onSubmit,
  submitting,
  submitLabel = "Save Quotation",
  onSaveDraft,
  onSend,
  onPreview,
  onGeneratePdf,
  onCancel,
}: {
  initial?: Partial<EditorValue>;
  onSubmit: (v: EditorValue) => void;
  submitting?: boolean;
  submitLabel?: string;
  onSaveDraft?: (v: EditorValue) => void;
  onSend?: (v: EditorValue) => void;
  onPreview?: (v: EditorValue) => void;
  onGeneratePdf?: (v: EditorValue) => void;
  onCancel?: () => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [currency, setCurrency] = useState(initial?.currency ?? "KES");
  const [taxRate, setTaxRate] = useState<number>(initial?.tax_rate ?? 16);
  const [vatEnabled, setVatEnabled] = useState<boolean>(initial?.vat_enabled ?? true);
  const [status, setStatus] = useState<QuotationStatus>(initial?.status ?? "Draft");
  const [validUntil, setValidUntil] = useState(initial?.valid_until ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [terms, setTerms] = useState(
    initial?.terms ?? "50% deposit required to commence work. Balance on delivery."
  );
  const [deliveryTimeline, setDeliveryTimeline] = useState(initial?.delivery_timeline ?? "");
  const [paymentTerms, setPaymentTerms] = useState(initial?.payment_terms ?? "");
  const [items, setItems] = useState<QuotationItem[]>(
    initial?.items && initial.items.length
      ? initial.items.map((i) => ({ ...emptyItem, ...i }))
      : [{ ...emptyItem }]
  );

  const totals = useMemo(
    () => computeTotals(items, Number(taxRate) || 0, vatEnabled),
    [items, taxRate, vatEnabled]
  );

  const updateItem = (idx: number, patch: Partial<QuotationItem>) => {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  };

  const build = (overrideStatus?: QuotationStatus): EditorValue => {
    const cleanItems = items
      .filter((i) => i.description.trim())
      .map((i, idx) => ({
        ...i,
        sort_order: idx,
        quantity: Number(i.quantity) || 0,
        unit_price: Number(i.unit_price) || 0,
        discount: Number(i.discount) || 0,
        total:
          (Number(i.quantity) || 0) * (Number(i.unit_price) || 0) -
          (Number(i.discount) || 0),
      }));
    return {
      title: title.trim(),
      description: description || null,
      currency,
      tax_rate: Number(taxRate) || 0,
      vat_enabled: vatEnabled,
      status: overrideStatus ?? status,
      valid_until: validUntil || null,
      notes: notes || null,
      terms: terms || null,
      delivery_timeline: deliveryTimeline || null,
      payment_terms: paymentTerms || null,
      items: cleanItems,
    };
  };

  const submit = () => {
    if (!title.trim()) return;
    onSubmit(build());
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
            disabled={!vatEnabled}
          />
        </div>
        <div className="flex items-end gap-3">
          <div className="flex items-center gap-2">
            <Switch
              id="q-vat"
              checked={vatEnabled}
              onCheckedChange={(v) => setVatEnabled(!!v)}
            />
            <Label htmlFor="q-vat" className="cursor-pointer">
              Charge VAT
            </Label>
          </div>
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
          {items.map((it, i) => {
            const line =
              (Number(it.quantity) || 0) * (Number(it.unit_price) || 0) -
              (Number(it.discount) || 0);
            return (
              <div
                key={i}
                className="grid grid-cols-12 gap-2 rounded-md border border-border bg-background p-2"
              >
                <Input
                  className="col-span-12 sm:col-span-5"
                  placeholder="Description"
                  value={it.description}
                  onChange={(e) => updateItem(i, { description: e.target.value })}
                />
                <Input
                  className="col-span-3 sm:col-span-1"
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
                <Input
                  className="col-span-4 sm:col-span-2"
                  type="number"
                  step="0.01"
                  placeholder="Discount"
                  value={it.discount}
                  onChange={(e) => updateItem(i, { discount: Number(e.target.value) })}
                />
                <div className="col-span-11 sm:col-span-1 flex items-center justify-end text-sm font-medium">
                  {line.toFixed(2)}
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
            );
          })}
        </div>

        <div className="mt-4 flex justify-end">
          <div className="w-full max-w-xs space-y-1 text-sm">
            <Row
              label="Subtotal"
              value={formatMoney(totals.subtotal + totals.discount_total, currency)}
            />
            <Row
              label="Discount"
              value={`- ${formatMoney(totals.discount_total, currency)}`}
            />
            <Row label="Net" value={formatMoney(totals.subtotal, currency)} />
            {vatEnabled && (
              <Row
                label={`VAT (${taxRate}%)`}
                value={formatMoney(totals.tax_amount, currency)}
              />
            )}
            <Row label="Grand Total" value={formatMoney(totals.total_amount, currency)} bold />
          </div>
        </div>
      </div>

      <div className="grid gap-4 rounded-xl border border-border bg-card p-6 shadow-soft sm:grid-cols-2">
        <div>
          <Label htmlFor="q-notes">Additional Notes (visible to client)</Label>
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
        <div>
          <Label htmlFor="q-payment">Payment Terms</Label>
          <Textarea
            id="q-payment"
            rows={3}
            value={paymentTerms ?? ""}
            onChange={(e) => setPaymentTerms(e.target.value)}
            placeholder="e.g. 50% deposit, balance on delivery"
          />
        </div>
        <div>
          <Label htmlFor="q-delivery">Delivery Timeline</Label>
          <Textarea
            id="q-delivery"
            rows={3}
            value={deliveryTimeline ?? ""}
            onChange={(e) => setDeliveryTimeline(e.target.value)}
            placeholder="e.g. 4 weeks from acceptance"
          />
        </div>
      </div>

      <div className="flex flex-wrap justify-end gap-2">
        {onCancel && (
          <Button variant="ghost" onClick={onCancel} disabled={submitting}>
            Cancel
          </Button>
        )}
        {onPreview && (
          <Button
            variant="outline"
            onClick={() => onPreview(build())}
            disabled={!title.trim()}
          >
            Preview
          </Button>
        )}
        {onGeneratePdf && (
          <Button
            variant="outline"
            onClick={() => onGeneratePdf(build())}
            disabled={!title.trim()}
          >
            Generate PDF
          </Button>
        )}
        {onSaveDraft && (
          <Button
            variant="outline"
            onClick={() => onSaveDraft(build("Draft"))}
            disabled={submitting || !title.trim()}
          >
            Save Draft
          </Button>
        )}
        {onSend && (
          <Button
            onClick={() => onSend(build("Sent"))}
            disabled={submitting || !title.trim()}
          >
            {submitting ? "Sending…" : "Send to Client"}
          </Button>
        )}
        {!onSaveDraft && !onSend && (
          <Button onClick={submit} disabled={submitting || !title.trim()}>
            {submitting ? "Saving…" : submitLabel}
          </Button>
        )}
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
