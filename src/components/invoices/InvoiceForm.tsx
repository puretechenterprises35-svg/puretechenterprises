import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { adminClientsQuery, adminProjectsQuery } from "@/lib/admin/queries";
import {
  INVOICE_STATUSES,
  useCreateInvoice,
  useUpdateInvoice,
  type Invoice,
  type InvoiceInput,
  type InvoiceStatus,
} from "@/lib/invoices/queries";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export function InvoiceForm({
  open,
  onOpenChange,
  existing,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  existing?: Invoice | null;
  onSaved?: (id: string) => void;
}) {
  const clientsQ = useQuery(adminClientsQuery());
  const projectsQ = useQuery(adminProjectsQuery());
  const createMut = useCreateInvoice();
  const updateMut = useUpdateInvoice();

  const [clientId, setClientId] = useState(existing?.client_id ?? "");
  const [projectId, setProjectId] = useState<string>(existing?.project_id ?? "");
  const [title, setTitle] = useState(existing?.title ?? "");
  const [description, setDescription] = useState(existing?.description ?? "");
  const [subtotal, setSubtotal] = useState(String(existing?.subtotal ?? "0"));
  const [tax, setTax] = useState(String(existing?.tax_amount ?? "0"));
  const [discount, setDiscount] = useState(String(existing?.discount_amount ?? "0"));
  const [currency, setCurrency] = useState(existing?.currency ?? "ZMW");
  const [status, setStatus] = useState<InvoiceStatus>(existing?.status ?? "Draft");
  const [issueDate, setIssueDate] = useState(existing?.issue_date ?? new Date().toISOString().slice(0, 10));
  const [dueDate, setDueDate] = useState(
    existing?.due_date ?? new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10)
  );

  const total = useMemo(
    () => Math.max(0, Number(subtotal || 0) + Number(tax || 0) - Number(discount || 0)),
    [subtotal, tax, discount]
  );

  const projectsForClient = useMemo(
    () => (projectsQ.data ?? []).filter((p) => p.client_id === clientId),
    [projectsQ.data, clientId]
  );

  const submit = async () => {
    if (!clientId) return toast.error("Select a client");
    if (!title.trim()) return toast.error("Title is required");
    const input: InvoiceInput = {
      client_id: clientId,
      project_id: projectId || null,
      title: title.trim(),
      description: description || null,
      subtotal: Number(subtotal || 0),
      tax_amount: Number(tax || 0),
      discount_amount: Number(discount || 0),
      total_amount: total,
      currency,
      status,
      issue_date: status === "Draft" ? null : issueDate,
      due_date: dueDate,
    };
    try {
      if (existing) {
        await updateMut.mutateAsync({ id: existing.id, patch: input });
        toast.success("Invoice updated");
        onSaved?.(existing.id);
      } else {
        const id = await createMut.mutateAsync(input);
        toast.success("Invoice created");
        onSaved?.(id);
      }
      onOpenChange(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    }
  };

  const busy = createMut.isPending || updateMut.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{existing ? `Edit invoice ${existing.invoice_number}` : "Create invoice"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <Label>Client</Label>
              <Select value={clientId} onValueChange={setClientId}>
                <SelectTrigger><SelectValue placeholder="Select client" /></SelectTrigger>
                <SelectContent>
                  {(clientsQ.data ?? []).map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.company_name || c.contact_person || c.email}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Project (optional)</Label>
              <Select value={projectId || "__none"} onValueChange={(v) => setProjectId(v === "__none" ? "" : v)}>
                <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none">— None —</SelectItem>
                  {projectsForClient.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.project_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Website design – May deliverable" />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea value={description ?? ""} onChange={(e) => setDescription(e.target.value)} rows={3} />
          </div>
          <div className="grid gap-3 md:grid-cols-4">
            <div>
              <Label>Subtotal</Label>
              <Input type="number" step="0.01" value={subtotal} onChange={(e) => setSubtotal(e.target.value)} />
            </div>
            <div>
              <Label>Tax</Label>
              <Input type="number" step="0.01" value={tax} onChange={(e) => setTax(e.target.value)} />
            </div>
            <div>
              <Label>Discount</Label>
              <Input type="number" step="0.01" value={discount} onChange={(e) => setDiscount(e.target.value)} />
            </div>
            <div>
              <Label>Currency</Label>
              <Input value={currency} onChange={(e) => setCurrency(e.target.value.toUpperCase())} maxLength={4} />
            </div>
          </div>
          <div className="rounded-md bg-muted/40 px-3 py-2 text-right text-sm">
            <span className="text-muted-foreground">Total: </span>
            <span className="font-bold">{currency} {total.toFixed(2)}</span>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <div>
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as InvoiceStatus)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {INVOICE_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Issue date</Label>
              <Input type="date" value={issueDate ?? ""} onChange={(e) => setIssueDate(e.target.value)} />
            </div>
            <div>
              <Label>Due date</Label>
              <Input type="date" value={dueDate ?? ""} onChange={(e) => setDueDate(e.target.value)} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>Cancel</Button>
          <Button onClick={submit} disabled={busy}>
            {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {existing ? "Save" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
