import { cn } from "@/lib/utils";

export function ProgressBar({
  value,
  size = "md",
  showLabel = true,
  className,
}: {
  value: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}) {
  const pct = Math.max(0, Math.min(100, value ?? 0));
  const heightClass = size === "sm" ? "h-1.5" : size === "lg" ? "h-3" : "h-2";
  const tone =
    pct >= 100
      ? "bg-emerald-500"
      : pct >= 60
      ? "bg-primary"
      : pct >= 30
      ? "bg-sky-500"
      : "bg-amber-500";

  return (
    <div className={cn("w-full", className)}>
      <div className={cn("w-full overflow-hidden rounded-full bg-muted", heightClass)}>
        <div
          className={cn("h-full rounded-full transition-all duration-700 ease-out", tone)}
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
      {showLabel && (
        <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
          <span>Progress</span>
          <span className="font-medium text-foreground">{pct}%</span>
        </div>
      )}
    </div>
  );
}
