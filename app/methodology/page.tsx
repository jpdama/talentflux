import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/ui/section-heading";

const sections = [
  {
    title: "Data sources",
    body: "TalentFlux uses public Greenhouse Job Board and Lever Postings APIs. No gated or paid enterprise data is required for the core product. Historical context is created through repeated snapshot ingestion into Postgres."
  },
  {
    title: "Normalization",
    body: "Each role is normalized into a canonical schema, including role family, seniority, workplace type, location, and extracted skills. This lets the dashboard compare companies consistently even when job-board metadata is uneven."
  },
  {
    title: "Momentum score",
    body: "Momentum blends recent net-new hiring, AI-share change, GTM-share change, location expansion, and leadership-share change. The score is normalized to 0-100 and penalizes over-concentration in a single function."
  },
  {
    title: "Alerts",
    body: "Alert cards fire only when computed thresholds are crossed. Examples include AI Buildout, GTM Expansion, Geo Expansion, Leadership Hiring, Hiring Cooldown, and Concentration Risk."
  },
  {
    title: "AI summaries",
    body: "The AI layer only receives computed metrics and alert evidence. The UI validates the response against a schema and falls back to deterministic summaries if the model or network is unavailable."
  }
];

export default function MethodologyPage() {
  return (
    <div className="shell space-y-10 py-10">
      <SectionHeading
        eyebrow="Methodology"
        title="How TalentFlux turns public jobs into business intelligence"
        description="The point of the product is not to mirror a job board. It is to convert public hiring activity into an explainable strategy readout."
      />
      <div className="grid gap-6 lg:grid-cols-2">
        {sections.map((section) => (
          <Card key={section.title} className="space-y-3">
            <h2 className="text-xl font-semibold text-white">{section.title}</h2>
            <p className="text-sm leading-7 text-slate-300">{section.body}</p>
          </Card>
        ))}
      </div>
      <Card className="space-y-4">
        <h2 className="text-xl font-semibold text-white">Scoring formula</h2>
        <pre className="overflow-x-auto rounded-2xl border border-white/10 bg-slate-950/70 p-5 text-sm text-slate-200">
{`Momentum Score =
0.35 * net_new_z
+ 0.20 * ai_share_delta
+ 0.15 * gtm_share_delta
+ 0.15 * new_location_z
+ 0.15 * leadership_share_delta
- concentration_penalty`}
        </pre>
        <p className="text-sm leading-7 text-slate-300">
          Forecasting uses a simple linear regression over the most recent visible history. When a company lacks enough
          historical points, TalentFlux suppresses precision claims and falls back to a conservative estimate.
        </p>
      </Card>
    </div>
  );
}
