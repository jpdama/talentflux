import fs from "node:fs/promises";
import path from "node:path";

import { closeDb, getDb } from "@/db/client";

async function main() {
  const db = getDb();
  const migrationPath = path.join(process.cwd(), "db", "migrations", "0000_talentflux.sql");
  const migrationSql = await fs.readFile(migrationPath, "utf8");
  const statements = migrationSql
    .split(/;\s*\n/g)
    .map((statement) => statement.trim())
    .filter(Boolean);

  for (const statement of statements) {
    await db.execute(`${statement};`);
  }

  await closeDb();
  console.log("Database migrations applied.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
