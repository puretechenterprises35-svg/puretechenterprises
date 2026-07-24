import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/ptbs/PlaceholderPage";

export const Route = createFileRoute("/ptbs/master-data/templates")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Templates | PTBS Master Data" },
      { name: "description", content: "Templates — PTBS Master Data module." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => <PlaceholderPage title="Templates" />,
});
