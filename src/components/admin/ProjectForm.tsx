import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { AdminClientRow, ProjectInput } from "@/lib/admin/queries";

const STATUSES = ["Pending", "In Progress", "Waiting for Client", "Completed", "Cancelled"] as const;
const PRIORITIES = ["Low", "Medium", "High", "Urgent"] as const;
const SERVICES = ["ICT Services", "Printing & Branding", "Tax Compliance", "Business Registration", "Other"];

const schema = z.object({
  client_id: z.string().uuid("Select a client"),
  project_name: z.string().trim().min(2).max(120),
  service_category: z.string().nullable(),
  description: z.string().max(2000).nullable(),
  priority: z.enum(PRIORITIES),
  status: z.enum(STATUSES),
  progress_percentage: z.number().int().min(0).max(100),
  start_date: z.string().nullable(),
  due_date: z.string().nullable(),
});

export function ProjectForm({
  clients,
  initial,
  submitLabel = "Save",
  onSubmit,
  submitting,
}: {
  clients: AdminClientRow[];
  initial?: Partial<ProjectInput>;
  submitLabel?: string;
  onSubmit: (v: ProjectInput) => void;
  submitting?: boolean;
}) {
  const [values, setValues] = useState<ProjectInput>({
    client_id: initial?.client_id ?? "",
    project_name: initial?.project_name ?? "",
    service_category: initial?.service_category ?? null,
    description: initial?.description ?? null,
    priority: initial?.priority ?? "Medium",
    status: initial?.status ?? "Pending",
    progress_percentage: initial?.progress_percentage ?? 0,
    start_date: initial?.start_date ?? null,
    due_date: initial?.due_date ?? null,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = <K extends keyof ProjectInput>(k: K, v: ProjectInput[K]) =>
    setValues((s) => ({ ...s, [k]: v }));

  const handle = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.issues.forEach((i) => (errs[i.path.join(".")] = i.message));
      setErrors(errs);
      return;
    }
    setErrors({});
    onSubmit(parsed.data);
  };

  return (
    <form onSubmit={handle} className="grid gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <Label>Client *</Label>
        <Select value={values.client_id} onValueChange={(v) => set("client_id", v)}>
          <SelectTrigger><SelectValue placeholder="Select client" /></SelectTrigger>
          <SelectContent>
            {clients.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.company_name || c.contact_person || c.email || "Unnamed"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.client_id && <p className="mt-1 text-xs text-destructive">{errors.client_id}</p>}
      </div>

      <div className="sm:col-span-2">
        <Label>Project name *</Label>
        <Input value={values.project_name} onChange={(e) => set("project_name", e.target.value)} maxLength={120} />
        {errors.project_name && <p className="mt-1 text-xs text-destructive">{errors.project_name}</p>}
      </div>

      <div>
        <Label>Service category</Label>
        <Select value={values.service_category ?? ""} onValueChange={(v) => set("service_category", v || null)}>
          <SelectTrigger><SelectValue placeholder="Select service" /></SelectTrigger>
          <SelectContent>
            {SERVICES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Priority</Label>
        <Select value={values.priority} onValueChange={(v) => set("priority", v)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {PRIORITIES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Status</Label>
        <Select value={values.status} onValueChange={(v) => set("status", v)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Progress (%)</Label>
        <Input
          type="number" min={0} max={100}
          value={values.progress_percentage}
          onChange={(e) => set("progress_percentage", Math.max(0, Math.min(100, Number(e.target.value) || 0)))}
        />
      </div>

      <div>
        <Label>Start date</Label>
        <Input type="date" value={values.start_date ?? ""} onChange={(e) => set("start_date", e.target.value || null)} />
      </div>

      <div>
        <Label>Due date</Label>
        <Input type="date" value={values.due_date ?? ""} onChange={(e) => set("due_date", e.target.value || null)} />
      </div>

      <div className="sm:col-span-2">
        <Label>Description</Label>
        <Textarea rows={4} value={values.description ?? ""} onChange={(e) => set("description", e.target.value || null)} maxLength={2000} />
      </div>

      <div className="sm:col-span-2 flex justify-end">
        <Button type="submit" disabled={submitting}>{submitting ? "Saving…" : submitLabel}</Button>
      </div>
    </form>
  );
}
