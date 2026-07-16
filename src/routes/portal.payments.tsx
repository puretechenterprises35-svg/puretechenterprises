import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/portal/ComingSoon";

export const Route = createFileRoute("/portal/payments")({
  ssr: false,
  head: () => ({ meta: [{ title: "Payments | Puretech Client Portal" }, { name: "robots", content: "noindex" }] }),
  component: () => <ComingSoon feature="Payments" />,
});
