import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { env } from "@/lib/validations/env";
import * as schema from "@/db/schema";

let queryClient: postgres.Sql | undefined;

export function hasDatabase() {
  return Boolean(env.DATABASE_URL);
}

export function getDb() {
  if (!env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured.");
  }

  if (!queryClient) {
    queryClient = postgres(env.DATABASE_URL, {
      max: 1,
      idle_timeout: 20,
      connect_timeout: 20
    });
  }

  return drizzle(queryClient, { schema });
}

export async function closeDb() {
  if (queryClient) {
    await queryClient.end({ timeout: 5 });
    queryClient = undefined;
  }
}
