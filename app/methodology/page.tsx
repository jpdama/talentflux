import type { Metadata } from "next";
import { AlertTriangle, Brain, Calculator, Database, Scale } from "lucide-react";

import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/ui/section-heading";

export const metadata: Metadata = {
  title: "Methodology"
};

const SECTIONS = [
  {
    icon: Database,
    title: "Data sources",
    body: "Public Greenhouse Job Board and Lever Postings APIs. No gated or paid data. Historical context is built by repeated snapshot ingestion into Postgres."
  },
  {
    icon: Scale,
    title: "Normalization",
    body: "Each role is normalized into a canonical schema — role family, seniority, workplace type, location, skills. Consistent comparison across uneven metadata."
  },
  {
    icon: Calculator,
    title: "Momentum score",
    body: "Blends net-new hiring, AI-share change, GTM-share change, location expansion, and leadership share. Normalized 0–100, penalizing over-concentration."
  },
  {
    icon: AlertTriangle,
    title: "Alerts",
    body: "Fire only when computed thresholds are crossed. Examples: AI Buildout, GTM Expansion, Geo Expansion, Leadership Hiring, Hiring Cooldown, Concentration Risk."
  },
  {
    icon: Brain,
    title: "AI summaries",
    body: "The AI layer only receives computed metrics and alert evidence. The UI validates output against a schema and falls back to deterministic summaries on failure."
  }
];

export default function MethodologyPage() {
  return (
    <div className="shell space-y-10 py-10">
      <div className="max-w-2xl space-y-3">
        <div className="eyebrow">Methodology</div>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
          Public jobs, turned into explainable intelligence.
        </h1>
        <p className="text-base leading-7 text-muted-strong">
          The goal isn't to mirror a job board. It's to convert public hiring activity into an operating readout that a
          strategy, GTM, or investment team can actually use.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {SECTIONS.map(({ icon: Icon, title, body }) => (
          <Card key={title} className="space-y-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Icon className="h-4 w-4" />
            </div>
            <h2 className="text-base font-semibold text-foreground">{title}</h2>
            <p className="text-sm leading-6 text-muted-strong">{body}</p>
          </Card>
        ))}
      </div>

      <Card className="space-y-4">
        <SectionHeading
          eyebrow="Formula"
          title="Momentum scoring"
          description="Every component traces back to computed metrics — no black boxes."
          size="md"
        />
        <pre className="overflow-x-auto rounded-lg border border-border bg-surface-raised/80 p-4 font-mono text-xs leading-6 text-muted-strong">
{`Momentum Score =
  0.35 × net_new_z
+ 0.20 × ai_share_delta
+ 0.15 × gtm_share_delta
+ 0.15 × new_location_z
+ 0.15 × leadership_share_delta
− concentration_penalty`}
        </pre>
        <p className="text-sm leading-6 text-muted-strong">
          Forecasting uses a simple linear regression over the most recent visible history. When a company lacks enough
          points, precision is suppressed and the system falls back to a conservative estimate.
        </p>
      </Card>
    </div>
  );
}
