import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const TONES: Record<string, string> = {
  Contract: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  Invoice: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  Quotation: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  "Company Registration": "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  "PACRA Documents": "bg-teal-500/10 text-teal-600 border-teal-500/20",
  "ZRA Documents": "bg-orange-500/10 text-orange-600 border-orange-500/20",
  "Tax Clearance": "bg-lime-500/10 text-lime-600 border-lime-500/20",
  Report: "bg-slate-500/10 text-slate-600 border-slate-500/20",
  Certificate: "bg-pink-500/10 text-pink-600 border-pink-500/20",
  "Technical Documentation": "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
  "Design Files": "bg-fuchsia-500/10 text-fuchsia-600 border-fuchsia-500/20",
  "Source Code": "bg-cyan-500/10 text-cyan-600 border-cyan-500/20",
  Backup: "bg-neutral-500/10 text-neutral-600 border-neutral-500/20",
  Other: "bg-muted text-muted-foreground border-border",
};

export function CategoryBadge({ category }: { category: string }) {
  return (
    <Badge
      variant="outline"
      className={cn("border", TONES[category] ?? TONES.Other)}
    >
      {category}
    </Badge>
  );
}
