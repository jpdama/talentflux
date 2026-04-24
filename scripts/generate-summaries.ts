import { eq } from "drizzle-orm";

import { closeDb, getDb } from "@/db/client";
import { companies } from "@/db/schema";
import { runIngest } from "@/lib/ingest/run-ingest";

async function main() {
  const db = getDb();
  const companyRows = await db.select().from(companies).where(eq(companies.isActive, true));
  await closeDb();

  if (!companyRows.length) {
    throw new Error("No seeded companies found. Run npm run seed:companies first.");
  }

  await runIngest();
  console.log("Summaries regenerated through the ingest pipeline.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
