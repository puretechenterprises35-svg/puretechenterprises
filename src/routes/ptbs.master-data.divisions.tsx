import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/ptbs/PlaceholderPage";

export const Route = createFileRoute("/ptbs/master-data/divisions")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Divisions | PTBS Master Data" },
      { name: "description", content: "Divisions — PTBS Master Data module." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => <PlaceholderPage title="Divisions" />,
});
