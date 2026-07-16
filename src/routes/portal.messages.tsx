import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/portal/ComingSoon";

export const Route = createFileRoute("/portal/messages")({
  ssr: false,
  head: () => ({ meta: [{ title: "Messages | Puretech Client Portal" }, { name: "robots", content: "noindex" }] }),
  component: () => <ComingSoon feature="Messages" />,
});
