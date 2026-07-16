import { cn } from "@/lib/utils";

export interface NotificationBadgeProps {
  count: number;
  className?: string;
  max?: number;
  /** Absolute positioning relative to a parent (e.g. a bell button). Default true. */
  floating?: boolean;
}

/**
 * Small unread-count badge. Reusable anywhere: bell icon, nav item, tab, etc.
 * Pass `floating={false}` to render inline instead of absolutely positioned.
 */
export function NotificationBadge({
  count,
  className,
  max = 9,
  floating = true,
}: NotificationBadgeProps) {
  if (!count || count <= 0) return null;
  const display = count > max ? `${max}+` : String(count);
  return (
    <span
      aria-label={`${count} unread`}
      className={cn(
        "flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold leading-none text-destructive-foreground",
        floating && "absolute -right-1 -top-1",
        className
      )}
    >
      {display}
    </span>
  );
}
