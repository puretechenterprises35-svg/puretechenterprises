import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Subscribes to realtime changes on projects and project_updates
 * and invalidates the relevant TanStack Query caches.
 */
export function usePortalRealtime() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel("portal-live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "projects" },
        () => {
          void queryClient.invalidateQueries({ queryKey: ["portal", "projects"] });
          void queryClient.invalidateQueries({ queryKey: ["portal", "project"] });
          void queryClient.invalidateQueries({ queryKey: ["portal", "notifications"] });
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "project_updates" },
        () => {
          void queryClient.invalidateQueries({ queryKey: ["portal", "project-updates"] });
          void queryClient.invalidateQueries({ queryKey: ["portal", "recent-updates"] });
          void queryClient.invalidateQueries({ queryKey: ["portal", "notifications"] });
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [queryClient]);
}
