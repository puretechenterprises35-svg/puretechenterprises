import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
  Bell,
  Activity,
  FileText,
  MessageSquare,
  Receipt,
  CreditCard,
  CheckCheck,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NotificationBadge } from "./NotificationBadge";
import {
  getLastReadAt,
  markAllNotificationsRead,
  notificationsQueryOptions,
  type NotificationCategory,
  type PortalNotification,
} from "@/lib/portal/notifications";
import { cn } from "@/lib/utils";

const ICONS: Record<NotificationCategory, typeof Activity> = {
  project_update: Activity,
  project_status: Activity,
  message: MessageSquare,
  document: FileText,
  invoice: Receipt,
  payment: CreditCard,
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const { data: notifications = [], isLoading } = useQuery(
    notificationsQueryOptions(20)
  );

  const [lastReadAt, setLastReadAt] = useState<string | null>(() =>
    getLastReadAt()
  );

  useEffect(() => {
    const onRead = () => setLastReadAt(getLastReadAt());
    window.addEventListener("portal:notifications:read", onRead);
    window.addEventListener("storage", onRead);
    return () => {
      window.removeEventListener("portal:notifications:read", onRead);
      window.removeEventListener("storage", onRead);
    };
  }, []);

  const unreadCount = useMemo(() => {
    if (!lastReadAt) return notifications.length;
    const cutoff = new Date(lastReadAt).getTime();
    return notifications.filter(
      (n) => new Date(n.createdAt).getTime() > cutoff
    ).length;
  }, [notifications, lastReadAt]);

  const handleMarkAll = () => {
    markAllNotificationsRead();
    setLastReadAt(getLastReadAt());
    void queryClient.invalidateQueries({ queryKey: ["portal", "notifications"] });
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="relative inline-flex h-10 w-10 items-center justify-center rounded-md border border-border hover:bg-accent"
          aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`}
        >
          <Bell className="h-4 w-4" />
          <NotificationBadge count={unreadCount} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-[calc(100vw-1rem)] max-w-sm p-0 sm:w-96"
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div>
            <p className="text-sm font-semibold">Notifications</p>
            <p className="text-xs text-muted-foreground">
              {unreadCount > 0 ? `${unreadCount} unread` : "You're all caught up"}
            </p>
          </div>
          {notifications.length > 0 && (
            <button
              type="button"
              onClick={handleMarkAll}
              className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              <CheckCheck className="h-3.5 w-3.5" /> Mark all read
            </button>
          )}
        </div>

        <div className="max-h-[70vh] overflow-y-auto">
          {isLoading ? (
            <div className="space-y-2 p-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-14 animate-pulse rounded bg-muted" />
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <p className="p-8 text-center text-sm text-muted-foreground">
              No notifications yet.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {notifications.map((n) => (
                <NotificationRow
                  key={n.id}
                  notification={n}
                  isUnread={
                    !lastReadAt ||
                    new Date(n.createdAt).getTime() > new Date(lastReadAt).getTime()
                  }
                  onNavigate={() => setOpen(false)}
                />
              ))}
            </ul>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function NotificationRow({
  notification,
  isUnread,
  onNavigate,
}: {
  notification: PortalNotification;
  isUnread: boolean;
  onNavigate: () => void;
}) {
  const Icon = ICONS[notification.category] ?? Activity;
  const content = (
    <div
      className={cn(
        "flex items-start gap-3 px-4 py-3 transition-colors hover:bg-accent/60",
        isUnread && "bg-primary/5"
      )}
    >
      <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="truncate text-sm font-medium text-foreground">
            {notification.title}
          </p>
          {isUnread && (
            <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
          )}
        </div>
        {notification.description && (
          <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
            {notification.description}
          </p>
        )}
        <p className="mt-1 text-[11px] text-muted-foreground">
          {timeAgo(notification.createdAt)}
        </p>
      </div>
    </div>
  );

  if (notification.href) {
    return (
      <li>
        <Link to={notification.href} onClick={onNavigate} className="block">
          {content}
        </Link>
      </li>
    );
  }
  return <li>{content}</li>;
}
