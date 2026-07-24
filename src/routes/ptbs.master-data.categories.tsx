import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/ptbs/PlaceholderPage";

export const Route = createFileRoute("/ptbs/master-data/categories")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Categories | PTBS Master Data" },
      { name: "description", content: "Categories — PTBS Master Data module." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => <PlaceholderPage title="Categories" />,
});
