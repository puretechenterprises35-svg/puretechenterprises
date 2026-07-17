import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Paperclip, X } from "lucide-react";
import { usePortalSession } from "@/hooks/use-portal-session";
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
  SERVICE_CATEGORIES,
  createEnquiry,
  uploadEnquiryAttachments,
  type EnquiryPriority,
} from "@/lib/portal/enquiries";

export const Route = createFileRoute("/portal/enquiries/new")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "New Enquiry | Puretech Client Portal" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: NewEnquiryPage,
});

function NewEnquiryPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { session } = usePortalSession();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<string>("");
  const [description, setDescription] = useState("");
  const [completionDate, setCompletionDate] = useState("");
  const [budget, setBudget] = useState("");
  const [priority, setPriority] = useState<EnquiryPriority>("Medium");
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const handleFiles = (list: FileList | null) => {
    if (!list) return;
    setFiles((prev) => [...prev, ...Array.from(list)]);
  };

  const removeFile = (i: number) =>
    setFiles((prev) => prev.filter((_, idx) => idx !== i));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!session) {
      toast.error("You must be signed in.");
      return;
    }
    if (!title.trim() || !category || !description.trim()) {
      toast.error("Please fill in the required fields.");
      return;
    }
    setSubmitting(true);
    try {
      const attachments = files.length
        ? await uploadEnquiryAttachments(session.user.id, files)
        : [];
      await createEnquiry({
        client_id: session.user.id,
        title: title.trim(),
        service_category: category,
        description: description.trim(),
        preferred_completion_date: completionDate || null,
        estimated_budget: budget ? Number(budget) : null,
        priority,
        attachments,
      });
      await qc.invalidateQueries({ queryKey: ["portal", "enquiries"] });
      toast.success(
        "Your enquiry has been submitted successfully. Our team will review it shortly."
      );
      navigate({ to: "/portal/enquiries", replace: true });
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Failed to submit enquiry");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">New Enquiry</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Submit a request for new work. Our team will review your enquiry and
          respond shortly.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-xl border border-border bg-card p-6 shadow-soft"
      >
        <div className="space-y-2">
          <Label htmlFor="title">
            Enquiry Title <span className="text-destructive">*</span>
          </Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={150}
            required
            placeholder="e.g. Corporate website redesign"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>
              Service Category <span className="text-destructive">*</span>
            </Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select a service" />
              </SelectTrigger>
              <SelectContent>
                {SERVICE_CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Priority</Label>
            <Select
              value={priority}
              onValueChange={(v) => setPriority(v as EnquiryPriority)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Low">Low</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="High">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">
            Detailed Description <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={6}
            maxLength={4000}
            required
            placeholder="Describe your requirements in detail..."
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="date">Preferred Completion Date</Label>
            <Input
              id="date"
              type="date"
              value={completionDate}
              onChange={(e) => setCompletionDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="budget">Estimated Budget (KES)</Label>
            <Input
              id="budget"
              type="number"
              min="0"
              step="0.01"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="Optional"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="files">Attachments</Label>
          <label
            htmlFor="files"
            className="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-border bg-background p-4 text-sm text-muted-foreground hover:bg-accent"
          >
            <Paperclip className="h-4 w-4" />
            Click to add files (multiple allowed)
          </label>
          <input
            id="files"
            type="file"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
          {files.length > 0 && (
            <ul className="mt-2 space-y-1 text-sm">
              {files.map((f, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between rounded-md border border-border bg-background px-3 py-2"
                >
                  <span className="truncate">{f.name}</span>
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    className="text-muted-foreground hover:text-destructive"
                    aria-label="Remove file"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate({ to: "/portal/enquiries" })}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit Enquiry
          </Button>
        </div>
      </form>
    </div>
  );
}
