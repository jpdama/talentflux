import { z } from "zod";

const optionalString = z.preprocess((value) => {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
}, z.string().min(1).optional());

const envSchema = z.object({
  DATABASE_URL: optionalString,
  NEXT_PUBLIC_SITE_URL: z.string().url().default("http://localhost:3000"),
  OPENAI_API_KEY: optionalString,
  OPENAI_MODEL: z.string().default("gpt-4.1-mini"),
  LIVE_REFRESH_WINDOW_MINUTES: z.coerce.number().int().positive().default(30),
  INGEST_COHORT: z.string().default("default")
});

export const env = envSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  OPENAI_MODEL: process.env.OPENAI_MODEL,
  LIVE_REFRESH_WINDOW_MINUTES: process.env.LIVE_REFRESH_WINDOW_MINUTES,
  INGEST_COHORT: process.env.INGEST_COHORT
});
