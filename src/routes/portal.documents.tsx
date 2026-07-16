import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/portal/ComingSoon";

export const Route = createFileRoute("/portal/documents")({
  ssr: false,
  head: () => ({ meta: [{ title: "Documents | Puretech Client Portal" }, { name: "robots", content: "noindex" }] }),
  component: () => <ComingSoon feature="Documents" />,
});
