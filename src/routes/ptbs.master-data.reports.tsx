import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/ptbs/PlaceholderPage";

export const Route = createFileRoute("/ptbs/master-data/reports")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Reports | PTBS Master Data" },
      { name: "description", content: "Reports — PTBS Master Data module." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => <PlaceholderPage title="Reports" />,
});
