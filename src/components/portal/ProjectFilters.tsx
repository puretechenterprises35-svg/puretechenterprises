import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ProjectStatus, ProjectPriority } from "@/lib/portal/projects";

export type SortKey = "due_date" | "project_name" | "status";

export interface FilterState {
  search: string;
  status: "all" | ProjectStatus;
  service: string; // "all" or specific
  priority: "all" | ProjectPriority;
  sort: SortKey;
}

const STATUSES: ProjectStatus[] = [
  "Pending",
  "In Progress",
  "Waiting for Client",
  "Completed",
  "Cancelled",
];
const PRIORITIES: ProjectPriority[] = ["Low", "Medium", "High", "Urgent"];

export function ProjectFilters({
  value,
  onChange,
  services,
}: {
  value: FilterState;
  onChange: (next: FilterState) => void;
  services: string[];
}) {
  const set = <K extends keyof FilterState>(key: K, v: FilterState[K]) =>
    onChange({ ...value, [key]: v });

  return (
    <div className="grid gap-3 rounded-xl border border-border bg-card p-4 shadow-soft sm:grid-cols-2 lg:grid-cols-5">
      <div className="relative sm:col-span-2 lg:col-span-2">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Search projects…"
          value={value.search}
          onChange={(e) => set("search", e.target.value)}
        />
      </div>

      <Select value={value.status} onValueChange={(v) => set("status", v as FilterState["status"])}>
        <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All statuses</SelectItem>
          {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
        </SelectContent>
      </Select>

      <Select value={value.service} onValueChange={(v) => set("service", v)}>
        <SelectTrigger><SelectValue placeholder="Service" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All services</SelectItem>
          {services.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
        </SelectContent>
      </Select>

      <Select value={value.priority} onValueChange={(v) => set("priority", v as FilterState["priority"])}>
        <SelectTrigger><SelectValue placeholder="Priority" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All priorities</SelectItem>
          {PRIORITIES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
        </SelectContent>
      </Select>

      <Select value={value.sort} onValueChange={(v) => set("sort", v as SortKey)}>
        <SelectTrigger><SelectValue placeholder="Sort by" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="due_date">Sort: Due date</SelectItem>
          <SelectItem value="project_name">Sort: Project name</SelectItem>
          <SelectItem value="status">Sort: Status</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
