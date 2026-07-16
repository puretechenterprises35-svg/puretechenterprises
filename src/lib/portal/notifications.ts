import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Unified notification type. New sources (messages, documents, invoices,
 * payments) just need to produce items of this shape and be merged into
 * `notificationsQueryOptions.queryFn`.
 */
export type NotificationCategory =
  | "project_update"
  | "project_status"
  | "message"
  | "document"
  | "invoice"
  | "payment";

export interface PortalNotification {
  id: string;
  category: NotificationCategory;
  title: string;
  description?: string | null;
  createdAt: string;
  /** In-app link to open when clicked. */
  href?: string;
  /** For grouping / future filtering. */
  entityId?: string;
}

const READ_KEY = "portal:notifications:lastReadAt";

export function getLastReadAt(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(READ_KEY);
}

export function markAllNotificationsRead() {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(READ_KEY, new Date().toISOString());
  window.dispatchEvent(new Event("portal:notifications:read"));
}

export const notificationsQueryOptions = (limit = 20) =>
  queryOptions({
    queryKey: ["portal", "notifications", limit],
    queryFn: async (): Promise<PortalNotification[]> => {
      const [updatesRes, projectsRes] = await Promise.all([
        supabase
          .from("project_updates")
          .select("id,project_id,update_title,update_message,created_at,visible_to_client")
          .order("created_at", { ascending: false })
          .limit(limit),
        supabase
          .from("projects")
          .select("id,project_name,status,updated_at,created_at")
          .order("updated_at", { ascending: false })
          .limit(limit),
      ]);

      if (updatesRes.error) throw updatesRes.error;
      if (projectsRes.error) throw projectsRes.error;

      const notifications: PortalNotification[] = [];

      for (const u of updatesRes.data ?? []) {
        if (u.visible_to_client === false) continue;
        notifications.push({
          id: `update:${u.id}`,
          category: "project_update",
          title: u.update_title,
          description: u.update_message,
          createdAt: u.created_at,
          href: `/portal/projects/${u.project_id}`,
          entityId: u.project_id,
        });
      }

      for (const p of projectsRes.data ?? []) {
        // Skip synthetic "status" notification when updated_at equals created_at
        if (!p.updated_at || p.updated_at === p.created_at) continue;
        notifications.push({
          id: `status:${p.id}:${p.updated_at}`,
          category: "project_status",
          title: `${p.project_name} · ${p.status}`,
          description: "Project status updated",
          createdAt: p.updated_at,
          href: `/portal/projects/${p.id}`,
          entityId: p.id,
        });
      }

      notifications.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      return notifications.slice(0, limit);
    },
    staleTime: 30_000,
  });
