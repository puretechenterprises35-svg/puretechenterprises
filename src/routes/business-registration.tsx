import { createFileRoute } from "@tanstack/react-router";
import { Building2 } from "lucide-react";
import { CategoryPage } from "@/components/site/CategoryPage";
import { services } from "@/lib/site";

const reg = services.find((s) => s.slug === "business-registration")!;

export const Route = createFileRoute("/business-registration")({
  head: () => ({
    meta: [
      { title: "Business Registration & Compliance in Zambia | Puretech" },
      { name: "description", content: "PACRA company registration, business name registration, amendments and ongoing compliance support in Zambia." },
      { property: "og:title", content: "Business Registration & Compliance | Puretech Enterprises" },
      { property: "og:url", content: "/business-registration" },
    ],
    links: [{ rel: "canonical", href: "/business-registration" }],
  }),
  component: () => (
    <CategoryPage
      eyebrow="Business Registration"
      title="Register and stay compliant with confidence"
      intro="From PACRA registration to ongoing compliance, Puretech handles the paperwork so you can focus on running your business."
      Icon={Building2}
      whatsappService="Business Registration"
      categories={[{ title: reg.title, short: reg.short, items: reg.items }]}
    />
  ),
});
