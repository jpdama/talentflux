import { z } from "zod";

export const summarySchema = z.object({
  headline: z.string().min(1),
  bullets: z.array(z.string().min(1)).length(3),
  watchItem: z.string().min(1),
  evidence: z.array(z.string().min(1)).min(2).max(4)
});

export type ParsedSummary = z.infer<typeof summarySchema>;
