import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { UpdateInput } from "@/lib/admin/queries";

const schema = z.object({
  project_id: z.string().uuid("Select a project"),
  update_title: z.string().trim().min(2).max(160),
  update_message: z.string().max(2000).nullable(),
  progress_percentage: z.number().int().min(0).max(100).nullable(),
  visible_to_client: z.boolean(),
});

export function UpdateEditor({
  projects,
  defaultProjectId,
  onSubmit,
  submitting,
}: {
  projects: { id: string; project_name: string }[];
  defaultProjectId?: string;
  onSubmit: (v: UpdateInput) => void;
  submitting?: boolean;
}) {
  const [values, setValues] = useState<UpdateInput>({
    project_id: defaultProjectId ?? "",
    update_title: "",
    update_message: null,
    progress_percentage: null,
    visible_to_client: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

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
    setValues({ ...values, update_title: "", update_message: null, progress_percentage: null });
  };

  return (
    <form onSubmit={handle} className="grid gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <Label>Project *</Label>
        <Select value={values.project_id} onValueChange={(v) => setValues((s) => ({ ...s, project_id: v }))}>
          <SelectTrigger><SelectValue placeholder="Select project" /></SelectTrigger>
          <SelectContent>
            {projects.map((p) => <SelectItem key={p.id} value={p.id}>{p.project_name}</SelectItem>)}
          </SelectContent>
        </Select>
        {errors.project_id && <p className="mt-1 text-xs text-destructive">{errors.project_id}</p>}
      </div>

      <div className="sm:col-span-2">
        <Label>Title *</Label>
        <Input
          value={values.update_title}
          onChange={(e) => setValues((s) => ({ ...s, update_title: e.target.value }))}
          maxLength={160}
        />
        {errors.update_title && <p className="mt-1 text-xs text-destructive">{errors.update_title}</p>}
      </div>

      <div className="sm:col-span-2">
        <Label>Message</Label>
        <Textarea
          rows={4}
          value={values.update_message ?? ""}
          onChange={(e) => setValues((s) => ({ ...s, update_message: e.target.value || null }))}
          maxLength={2000}
        />
      </div>

      <div>
        <Label>Progress (%) — optional</Label>
        <Input
          type="number" min={0} max={100}
          value={values.progress_percentage ?? ""}
          onChange={(e) =>
            setValues((s) => ({
              ...s,
              progress_percentage: e.target.value === "" ? null : Math.max(0, Math.min(100, Number(e.target.value))),
            }))
          }
        />
      </div>

      <div className="flex items-end gap-3">
        <Switch
          checked={values.visible_to_client}
          onCheckedChange={(v) => setValues((s) => ({ ...s, visible_to_client: v }))}
          id="vtc"
        />
        <Label htmlFor="vtc">Visible to client</Label>
      </div>

      <div className="sm:col-span-2 flex justify-end">
        <Button type="submit" disabled={submitting}>{submitting ? "Publishing…" : "Publish update"}</Button>
      </div>
    </form>
  );
}
