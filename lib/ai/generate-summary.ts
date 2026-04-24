import OpenAI from "openai";

import { summarySchema } from "@/lib/ai/schemas";
import { env } from "@/lib/validations/env";

export interface SummaryPayload {
  label: string;
  metrics: Record<string, number | string>;
  alerts: string[];
  topSkills: string[];
  functionMix: Array<{ roleFamily: string; share: number }>;
}

function buildPrompt(payload: SummaryPayload) {
  return [
    "You are writing a grounded business intelligence summary.",
    "Only use the facts provided. Do not invent external context.",
    "Return strict JSON with keys: headline, bullets, watchItem, evidence.",
    JSON.stringify(payload)
  ].join("\n\n");
}

export async function generateAiSummary(payload: SummaryPayload) {
  if (!env.OPENAI_API_KEY) {
    return null;
  }

  const client = new OpenAI({ apiKey: env.OPENAI_API_KEY });
  const response = await client.responses.create({
    model: env.OPENAI_MODEL,
    input: buildPrompt(payload),
    max_output_tokens: 500
  });

  const parsed = summarySchema.safeParse(JSON.parse(response.output_text));
  if (!parsed.success) {
    return null;
  }

  return parsed.data;
}
