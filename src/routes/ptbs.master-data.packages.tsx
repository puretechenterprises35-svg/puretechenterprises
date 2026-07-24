import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/ptbs/PlaceholderPage";

export const Route = createFileRoute("/ptbs/master-data/packages")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Packages | PTBS Master Data" },
      { name: "description", content: "Packages — PTBS Master Data module." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => <PlaceholderPage title="Packages" />,
});
