import { useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Upload } from "lucide-react";
import { PAYMENT_METHODS, useCreatePayment, type Invoice } from "@/lib/invoices/queries";

const ACCEPTED = ["application/pdf", "image/png", "image/jpeg", "image/jpg"];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export function PaymentUploader({
  invoice,
  open,
  onOpenChange,
}: {
  invoice: Invoice;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [amount, setAmount] = useState<string>(String(invoice.total_amount));
  const [method, setMethod] = useState<string>("Bank Transfer");
  const [reference, setReference] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const createPayment = useCreatePayment();

  const submit = async () => {
    if (!file) {
      toast.error("Please attach proof of payment");
      return;
    }
    if (!ACCEPTED.includes(file.type)) {
      toast.error("Only PDF, PNG, or JPEG accepted");
      return;
    }
    if (file.size > MAX_SIZE) {
      toast.error("File exceeds 10 MB");
      return;
    }
    const amt = Number(amount);
    if (!isFinite(amt) || amt <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    setBusy(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("Not authenticated");
      const ext = file.name.split(".").pop() || "bin";
      const path = `${invoice.client_id}/${invoice.id}/${Date.now()}-proof.${ext}`;
      const { error: upErr } = await supabase.storage.from("project-documents").upload(path, file, {
        contentType: file.type,
        upsert: false,
      });
      if (upErr) throw upErr;

      const { data: doc, error: docErr } = await supabase
        .from("documents")
        .insert({
          project_id: invoice.project_id ?? invoice.id,
          client_id: invoice.client_id,
          uploaded_by: user.user.id,
          title: `Proof of payment · ${invoice.invoice_number}`,
          description: `Payment reference: ${reference || "—"}`,
          category: "Invoice",
          file_name: file.name,
          file_path: path,
          file_size: file.size,
          file_type: file.type,
          visible_to_client: true,
        })
        .select("id")
        .single();
      if (docErr) throw docErr;

      await createPayment.mutateAsync({
        invoice_id: invoice.id,
        client_id: invoice.client_id,
        amount: amt,
        payment_method: method,
        payment_reference: reference || null,
        payment_date: date,
        proof_document_id: doc.id,
        notes: notes || null,
      });
      toast.success("Proof of payment submitted for verification");
      onOpenChange(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Upload proof of payment</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Amount ({invoice.currency})</Label>
              <Input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} />
            </div>
            <div>
              <Label>Payment date</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Method</Label>
              <Select value={method} onValueChange={setMethod}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Reference</Label>
              <Input value={reference} onChange={(e) => setReference(e.target.value)} placeholder="e.g. TXN-12345" />
            </div>
          </div>
          <div>
            <Label>Notes (optional)</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
          </div>
          <div>
            <Label>Proof file (PDF / PNG / JPEG, max 10MB)</Label>
            <label className="mt-1 flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-border bg-muted/30 p-6 text-sm text-muted-foreground hover:bg-muted/50">
              <Upload className="h-4 w-4" />
              <span>{file ? file.name : "Click to select file"}</span>
              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>Cancel</Button>
          <Button onClick={submit} disabled={busy}>
            {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
