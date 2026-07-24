import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/ptbs/PlaceholderPage";

export const Route = createFileRoute("/ptbs/master-data/services")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Services | PTBS Master Data" },
      { name: "description", content: "Services — PTBS Master Data module." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => <PlaceholderPage title="Services" />,
});
