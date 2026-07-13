import { createFileRoute } from "@tanstack/react-router";
import { Printer } from "lucide-react";
import { CategoryPage } from "@/components/site/CategoryPage";
import { services } from "@/lib/site";

const p = services.find((s) => s.slug === "printing-branding")!;
const st = services.find((s) => s.slug === "stationery-supplies")!;

export const Route = createFileRoute("/printing-branding")({
  head: () => ({
    meta: [
      { title: "Printing, Branding & Stationery in Zambia | Puretech" },
      { name: "description", content: "Business cards, flyers, banners, T-shirt, vehicle and shop branding plus corporate stationery supplies." },
      { property: "og:title", content: "Printing & Branding | Puretech Enterprises" },
      { property: "og:url", content: "/printing-branding" },
    ],
    links: [{ rel: "canonical", href: "/printing-branding" }],
  }),
  component: () => (
    <CategoryPage
      eyebrow="Printing & Branding"
      title="Look the part with premium printing and branding"
      intro="Sharp, professional branding across print, apparel, signage and vehicles."
      Icon={Printer}
      categories={[
        { title: p.title, short: p.short, items: p.items },
        { title: st.title, short: st.short, items: st.items },
      ]}
    />
  ),
});
