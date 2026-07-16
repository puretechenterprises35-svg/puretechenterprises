import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DOCUMENT_CATEGORIES } from "@/lib/documents/constants";

export interface DocFilterState {
  search: string;
  category: string;
  project: string;
  fileType: string;
  sort: "newest" | "oldest" | "name" | "category";
}

export function DocumentFilters({
  value,
  onChange,
  projects,
  fileTypes,
}: {
  value: DocFilterState;
  onChange: (next: DocFilterState) => void;
  projects: { id: string; name: string }[];
  fileTypes: string[];
}) {
  const set = <K extends keyof DocFilterState>(k: K, v: DocFilterState[K]) =>
    onChange({ ...value, [k]: v });

  return (
    <div className="grid gap-3 rounded-xl border border-border bg-card p-3 sm:grid-cols-2 lg:grid-cols-5">
      <div className="relative sm:col-span-2 lg:col-span-2">
        <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          value={value.search}
          onChange={(e) => set("search", e.target.value)}
          placeholder="Search documents…"
          className="pl-8"
        />
      </div>
      <Select value={value.project} onValueChange={(v) => set("project", v)}>
        <SelectTrigger><SelectValue placeholder="Project" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All projects</SelectItem>
          {projects.map((p) => (
            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={value.category} onValueChange={(v) => set("category", v)}>
        <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All categories</SelectItem>
          {DOCUMENT_CATEGORIES.map((c) => (
            <SelectItem key={c} value={c}>{c}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={value.fileType} onValueChange={(v) => set("fileType", v)}>
        <SelectTrigger><SelectValue placeholder="File type" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All types</SelectItem>
          {fileTypes.map((t) => (
            <SelectItem key={t} value={t}>{t.toUpperCase()}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={value.sort} onValueChange={(v) => set("sort", v as DocFilterState["sort"])}>
        <SelectTrigger><SelectValue placeholder="Sort" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="newest">Newest</SelectItem>
          <SelectItem value="oldest">Oldest</SelectItem>
          <SelectItem value="name">Name (A–Z)</SelectItem>
          <SelectItem value="category">Category</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
