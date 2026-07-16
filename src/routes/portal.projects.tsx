import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/portal/ComingSoon";

export const Route = createFileRoute("/portal/projects")({
  ssr: false,
  head: () => ({ meta: [{ title: "Projects | Puretech Client Portal" }, { name: "robots", content: "noindex" }] }),
  component: () => <ComingSoon feature="Projects" />,
});
