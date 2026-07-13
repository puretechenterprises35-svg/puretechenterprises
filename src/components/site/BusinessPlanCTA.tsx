import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { LineChart, MessageCircle } from "lucide-react";
import { whatsappServiceLink } from "@/lib/site";

export function BusinessPlanCTA() {
  return (
    <section className="bg-background py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 rounded-3xl border border-border bg-card p-8 shadow-card sm:p-12 lg:grid-cols-[1.4fr_1fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
              <LineChart className="h-3.5 w-3.5" /> Business Plans
            </div>
            <h2 className="mt-4 text-3xl font-bold sm:text-4xl">Need a professional business plan?</h2>
            <p className="mt-4 text-muted-foreground">
              Get a professionally prepared business plan with financial projections, cash flow forecasts and profitability analysis suitable for business planning, funding applications and investment proposals.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/quote">
                <Button size="lg" className="bg-gradient-brand text-primary-foreground shadow-soft">
                  Request a Business Plan
                </Button>
              </Link>
              <a href={whatsappServiceLink("Business Plan preparation")} target="_blank" rel="noopener">
                <Button size="lg" variant="outline">
                  <MessageCircle className="mr-1.5 h-4 w-4" /> Chat on WhatsApp
                </Button>
              </a>
            </div>
          </div>
          <ul className="grid gap-3 rounded-2xl bg-surface p-6 text-sm text-foreground/80">
            {["Financial Projections", "Cash Flow Forecasts", "Profitability Analysis", "Funding & Investment Ready"].map((it) => (
              <li key={it} className="flex items-center gap-2">
                <span className="inline-block h-2 w-2 rounded-full bg-primary" /> {it}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
