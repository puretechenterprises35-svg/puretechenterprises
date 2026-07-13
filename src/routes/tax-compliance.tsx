import { createFileRoute } from "@tanstack/react-router";
import { Receipt } from "lucide-react";
import { CategoryPage } from "@/components/site/CategoryPage";
import { services } from "@/lib/site";

const tax = services.find((s) => s.slug === "tax-zra")!;
const napsa = services.find((s) => s.slug === "napsa-nhima")!;
const tender = services.find((s) => s.slug === "tender-professional")!;

export const Route = createFileRoute("/tax-compliance")({
  head: () => ({
    meta: [
      { title: "Tax, ZRA, NAPSA & NHIMA Compliance in Zambia | Puretech" },
      { name: "description", content: "ZRA registration, TPIN, VAT, PAYE and Turnover tax returns plus NAPSA, NHIMA and ZPPA/NCC registration support." },
      { property: "og:title", content: "Tax & Compliance | Puretech Enterprises" },
      { property: "og:url", content: "/tax-compliance" },
    ],
    links: [{ rel: "canonical", href: "/tax-compliance" }],
  }),
  component: () => (
    <CategoryPage
      eyebrow="Tax & Compliance"
      title="Stay compliant with ZRA, NAPSA, NHIMA and beyond"
      intro="End-to-end tax, statutory and tender-readiness support for Zambian businesses of every size."
      Icon={Receipt}
      whatsappService="Tax, ZRA, NAPSA and NHIMA compliance"
      categories={[
        { title: tax.title, short: tax.short, items: tax.items },
        { title: napsa.title, short: napsa.short, items: napsa.items },
        { title: tender.title, short: tender.short, items: tender.items },
      ]}
    />
  ),
});
