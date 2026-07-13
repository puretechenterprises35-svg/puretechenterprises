import { createFileRoute } from "@tanstack/react-router";
import { Laptop } from "lucide-react";
import { CategoryPage } from "@/components/site/CategoryPage";
import { services } from "@/lib/site";

const s = services.find((x) => x.slug === "ict-services")!;

export const Route = createFileRoute("/ict-services")({
  head: () => ({
    meta: [
      { title: "ICT Services & Computer Repairs in Zambia | Puretech" },
      { name: "description", content: "Computer and laptop repairs, software installation, ICT support and basic network support for Zambian businesses." },
      { property: "og:title", content: "ICT Services | Puretech Enterprises" },
      { property: "og:url", content: "/ict-services" },
    ],
    links: [{ rel: "canonical", href: "/ict-services" }],
  }),
  component: () => (
    <CategoryPage
      eyebrow="ICT Services"
      title="Reliable technology support that keeps you working"
      intro="Practical ICT support tailored for small teams, offices and organisations."
      Icon={Laptop}
      categories={[{ title: s.title, short: s.short, items: s.items }]}
    />
  ),
});
